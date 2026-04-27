# Local Development Setup

Follow these steps to get Kairo AI running on your local machine.

## Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)
- A Chrome-based browser

## Step 1: Clone and Enter Directory
```bash
git clone <your-repo-url>
cd kairo-ai
```

## Step 2: Backend Setup
1. Navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file:
   ```bash
   cp .env.example .env
   ```
4. Open `.env` and add your **NVIDIA_API_KEY**. You can get one for free at [build.nvidia.com](https://build.nvidia.com).
5. Start the server:
   ```bash
   npm start
   ```
   The server will run at `http://localhost:3001`.

## Step 3: Extension Setup
1. Open Chrome and go to `chrome://extensions/`.
2. Enable **Developer mode** (toggle in the top right).
3. Click **Load unpacked**.
4. Select the `extension/` folder from this project.
5. You should see the Kairo AI icon in your extension list!
