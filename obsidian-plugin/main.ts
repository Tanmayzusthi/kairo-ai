import {
  App,
  Notice,
  Plugin,
  TFile,
  TFolder,
  normalizePath,
  moment,
} from 'obsidian';
import {
  KairoAIChatSettings,
  KairoAIChatSettingTab,
  DEFAULT_SETTINGS,
} from './settings';

// ─── Types ────────────────────────────────────────────────────────────────────

interface KairoConversation {
  id: string;
  timestamp: string;
  model: string;
  tokens: number;
  action: 'summarize' | 'explain' | 'default';
  sourceUrl?: string;
  sourceTitle?: string;
  selectedText: string;
  result: string;
}

// ─── Plugin ───────────────────────────────────────────────────────────────────

export default class KairoAIChatPlugin extends Plugin {
  settings: KairoAIChatSettings;

  // Tracks already-processed conversation IDs to avoid duplicate saves
  private processedIds: Set<string> = new Set();

  // Timer reference for polling
  private pollTimer: ReturnType<typeof setInterval> | null = null;

  async onload() {
    await this.loadSettings();
    this.addSettingTab(new KairoAIChatSettingTab(this.app, this));

    // Start polling for new conversations from the backend
    this.startPolling();

    // Command: Manually trigger a sync
    this.addCommand({
      id: 'kairo-sync-now',
      name: 'Sync Kairo AI conversations now',
      callback: () => this.syncConversations(),
    });

    // Command: Archive old chats
    this.addCommand({
      id: 'kairo-archive-old',
      name: 'Archive old Kairo AI conversations',
      callback: () => this.archiveOldChats(),
    });

    console.log('[Kairo AI] Plugin loaded.');
  }

  onunload() {
    this.stopPolling();
    console.log('[Kairo AI] Plugin unloaded.');
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
    // Restart polling with new interval if it changed
    this.stopPolling();
    this.startPolling();
  }

  // ─── Polling ──────────────────────────────────────────────────────────────

  private startPolling() {
    const intervalMs = this.settings.pollIntervalSeconds * 1000;
    this.pollTimer = setInterval(() => this.syncConversations(), intervalMs);
  }

  private stopPolling() {
    if (this.pollTimer !== null) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
  }

  // ─── Sync ─────────────────────────────────────────────────────────────────

  /**
   * Fetches recent conversations from the Kairo backend
   * and saves any new ones as Markdown files in the vault.
   */
  private async syncConversations() {
    const endpoint = `${this.settings.apiEndpoint}/api/ai/history`;

    try {
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(8000),
      });

      if (!response.ok) {
        // History endpoint may not exist in MVP — silently skip
        return;
      }

      const data: { conversations: KairoConversation[] } = await response.json();

      for (const conversation of data.conversations) {
        if (!this.processedIds.has(conversation.id)) {
          await this.saveConversation(conversation);
          this.processedIds.add(conversation.id);
        }
      }
    } catch {
      // Network errors during polling are expected and silent
    }
  }

  // ─── Markdown Generation ──────────────────────────────────────────────────

  /**
   * Converts a KairoConversation object into a full Markdown file
   * with YAML frontmatter and saves it in the configured chat folder.
   */
  private async saveConversation(conversation: KairoConversation) {
    const chatFolderPath = normalizePath(this.settings.chatFolder);
    await this.ensureFolderExists(chatFolderPath);

    const safeTitle = this.buildFileTitle(conversation);
    const filePath = normalizePath(`${chatFolderPath}/${safeTitle}.md`);

    // Resolve backlink if enabled
    const sourceNote = this.settings.enableBacklinkResolution
      ? this.resolveBacklink(conversation.sourceTitle, conversation.sourceUrl)
      : null;

    const markdown = this.buildMarkdown(conversation, sourceNote);

    // Avoid overwriting an existing file with the same name
    const exists = this.app.vault.getAbstractFileByPath(filePath);
    if (exists) return;

    try {
      await this.app.vault.create(filePath, markdown);
      new Notice(`[Kairo AI] Saved: ${safeTitle}`);
    } catch (error) {
      console.error('[Kairo AI] Failed to save conversation:', error);
      new Notice('[Kairo AI] Error saving conversation. Check the console.');
    }
  }

  /**
   * Builds a safe, descriptive filename from a conversation object.
   */
  private buildFileTitle(conversation: KairoConversation): string {
    const date = moment(conversation.timestamp).format('YYYY-MM-DD HH-mm');
    const action = conversation.action.charAt(0).toUpperCase() + conversation.action.slice(1);
    const snippet = conversation.selectedText
      .substring(0, 40)
      .replace(/[\\/:*?"<>|#^[\]]/g, '')
      .trim();
    return `${date} ${action} - ${snippet}`;
  }

  /**
   * Builds the full Markdown document with YAML frontmatter.
   */
  private buildMarkdown(
    conversation: KairoConversation,
    sourceNote: string | null
  ): string {
    const frontmatter = [
      '---',
      `date: ${conversation.timestamp}`,
      `model: ${conversation.model}`,
      `tokens: ${conversation.tokens}`,
      `action: ${conversation.action}`,
      conversation.sourceUrl ? `source-url: "${conversation.sourceUrl}"` : null,
      sourceNote ? `source-note: "[[${sourceNote}]]"` : null,
      '---',
    ]
      .filter(Boolean)
      .join('\n');

    return [
      frontmatter,
      '',
      `## Selected Text`,
      '',
      `> ${conversation.selectedText.replace(/\n/g, '\n> ')}`,
      '',
      `## AI Response`,
      '',
      conversation.result,
      '',
      sourceNote ? `---\n*Related: [[${sourceNote}]]*` : '',
    ]
      .filter(line => line !== null)
      .join('\n');
  }

  // ─── Backlink Resolution ──────────────────────────────────────────────────

  /**
   * Searches all files in the vault for a note whose title or
   * content URL matches the source of the conversation.
   * Returns the file basename (without .md) for [[wiki-linking]].
   */
  private resolveBacklink(
    sourceTitle?: string,
    sourceUrl?: string
  ): string | null {
    const allFiles = this.app.vault.getMarkdownFiles();

    for (const file of allFiles) {
      // Match by page title
      if (sourceTitle) {
        const normalizedTitle = sourceTitle.toLowerCase().trim();
        const normalizedBasename = file.basename.toLowerCase().trim();
        if (normalizedBasename.includes(normalizedTitle) || normalizedTitle.includes(normalizedBasename)) {
          return file.basename;
        }
      }

      // Match by URL in file metadata (frontmatter)
      if (sourceUrl) {
        const cache = this.app.metadataCache.getFileCache(file);
        const frontmatterUrl = cache?.frontmatter?.['source-url'] as string | undefined;
        if (frontmatterUrl && frontmatterUrl === sourceUrl) {
          return file.basename;
        }
      }
    }

    return null;
  }

  // ─── Archive ──────────────────────────────────────────────────────────────

  /**
   * Moves conversations older than `autoArchiveAgeDays` into an Archive subfolder.
   */
  private async archiveOldChats() {
    const chatFolderPath = normalizePath(this.settings.chatFolder);
    const archiveFolderPath = normalizePath(`${this.settings.chatFolder}/Archive`);
    await this.ensureFolderExists(archiveFolderPath);

    const chatFolder = this.app.vault.getAbstractFileByPath(chatFolderPath);
    if (!(chatFolder instanceof TFolder)) {
      new Notice('[Kairo AI] Chat folder not found.');
      return;
    }

    const cutoffDate = moment().subtract(this.settings.autoArchiveAgeDays, 'days');
    let archivedCount = 0;

    for (const child of chatFolder.children) {
      if (!(child instanceof TFile) || child.extension !== 'md') continue;

      const cache = this.app.metadataCache.getFileCache(child);
      const fileDateStr = cache?.frontmatter?.['date'] as string | undefined;
      if (!fileDateStr) continue;

      const fileDate = moment(fileDateStr);
      if (fileDate.isBefore(cutoffDate)) {
        const newPath = normalizePath(`${archiveFolderPath}/${child.name}`);
        await this.app.vault.rename(child, newPath);
        archivedCount++;
      }
    }

    new Notice(`[Kairo AI] Archived ${archivedCount} old conversation(s).`);
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  /**
   * Creates a folder (and any parent folders) if it doesn't already exist.
   */
  private async ensureFolderExists(folderPath: string) {
    const existing = this.app.vault.getAbstractFileByPath(folderPath);
    if (existing instanceof TFolder) return;

    try {
      await this.app.vault.createFolder(folderPath);
    } catch {
      // Folder may have been created by another call concurrently — safe to ignore
    }
  }
}
