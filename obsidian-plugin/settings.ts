import { App, PluginSettingTab, Setting } from 'obsidian';
import type KairoAIChatPlugin from './main';

export interface KairoAIChatSettings {
  apiEndpoint: string;
  chatFolder: string;
  watchFolder: string;
  autoArchiveAgeDays: number;
  pollIntervalSeconds: number;
  enableBacklinkResolution: boolean;
}

export const DEFAULT_SETTINGS: KairoAIChatSettings = {
  apiEndpoint: 'http://localhost:3001',
  chatFolder: 'Chats',
  watchFolder: '',
  autoArchiveAgeDays: 30,
  pollIntervalSeconds: 5,
  enableBacklinkResolution: true,
};

export class KairoAIChatSettingTab extends PluginSettingTab {
  plugin: KairoAIChatPlugin;

  constructor(app: App, plugin: KairoAIChatPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    containerEl.createEl('h2', { text: 'Kairo AI Chat Settings' });

    // --- Connection ---
    containerEl.createEl('h3', { text: 'Connection', cls: 'kairo-settings-section' });

    new Setting(containerEl)
      .setName('API Endpoint')
      .setDesc('The URL of your running Kairo AI backend server.')
      .addText(text =>
        text
          .setPlaceholder('http://localhost:3001')
          .setValue(this.plugin.settings.apiEndpoint)
          .onChange(async (value) => {
            this.plugin.settings.apiEndpoint = value.trim();
            await this.plugin.saveSettings();
          })
      );

    // --- File Management ---
    containerEl.createEl('h3', { text: 'File Management', cls: 'kairo-settings-section' });

    new Setting(containerEl)
      .setName('Chat Folder')
      .setDesc('Vault folder where conversations will be saved (e.g., "Chats" or "AI/Logs").')
      .addText(text =>
        text
          .setPlaceholder('Chats')
          .setValue(this.plugin.settings.chatFolder)
          .onChange(async (value) => {
            this.plugin.settings.chatFolder = value.trim();
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName('Watch Folder')
      .setDesc('Local folder path on disk that Kairo backend writes JSON files to. Leave blank to use the API endpoint polling.')
      .addText(text =>
        text
          .setPlaceholder('/Users/you/kairo-output')
          .setValue(this.plugin.settings.watchFolder)
          .onChange(async (value) => {
            this.plugin.settings.watchFolder = value.trim();
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName('Auto-Archive Age (days)')
      .setDesc('Conversations older than this many days will be moved to an "Archive" subfolder.')
      .addSlider(slider =>
        slider
          .setLimits(7, 365, 1)
          .setValue(this.plugin.settings.autoArchiveAgeDays)
          .setDynamicTooltip()
          .onChange(async (value) => {
            this.plugin.settings.autoArchiveAgeDays = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName('Poll Interval (seconds)')
      .setDesc('How often the plugin checks for new conversations from the API.')
      .addSlider(slider =>
        slider
          .setLimits(3, 60, 1)
          .setValue(this.plugin.settings.pollIntervalSeconds)
          .setDynamicTooltip()
          .onChange(async (value) => {
            this.plugin.settings.pollIntervalSeconds = value;
            await this.plugin.saveSettings();
          })
      );

    // --- Intelligence ---
    containerEl.createEl('h3', { text: 'Intelligence', cls: 'kairo-settings-section' });

    new Setting(containerEl)
      .setName('Enable Backlink Resolution')
      .setDesc('Automatically scan your vault for notes matching the source URL or title and create [[wiki-links]].')
      .addToggle(toggle =>
        toggle
          .setValue(this.plugin.settings.enableBacklinkResolution)
          .onChange(async (value) => {
            this.plugin.settings.enableBacklinkResolution = value;
            await this.plugin.saveSettings();
          })
      );
  }
}
