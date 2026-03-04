# photo-style

<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

這是一個基於 React + Vite 的照片風格化展示專案，利用 Google Gemini AI 進行圖像處理。

## 🚀 快速開始

### 前置作業

- Node.js (建議 v20 以上)
- npm

### 本地運行

1. **安裝對應套件**：
   ```bash
   npm install
   ```
2. **設定環境變數**：
   將 `.env.example` 複製並重新命名為 `.env.local`，填入你的 `GEMINI_API_KEY`。
3. **啟動開發伺服器**：
   ```bash
   npm run dev
   ```

## 📦 部署

本專案已設定 GitHub Actions 自動化部署到 GitHub Pages。

### 設定步驟

1. **GitHub Secrets 設定**：
   - 前往 GitHub 倉庫的 **Settings > Secrets and variables > Actions**。
   - 新增兩個 Repository secrets：
     - `GEMINI_API_KEY`: 填入你的 Gemini API 金鑰。
     - `APP_URL`: 填入部署後的 URL（例如 `https://<username>.github.io/photo-style/`）。
2. **啟用 GitHub Pages**：
   - 前往 **Settings > Pages**。
   - 在 **Build and deployment > Source** 選擇 `GitHub Actions`。
3. **手動部署（可選）**：
   - 前往 **Actions** 頁籤，選擇 `Deploy to GitHub Pages` 工作流並點擊 `Run workflow`。

## 🛠 專案架構

- `src/`: 核心程式碼 (React + Tailwind CSS)
- `.github/workflows/deploy.yml`: GitHub Actions 自動化部署設定
- `.gitignore`: 忽略不必要的檔案（如 `node_modules`, `.env` 等）
- `package.json`: 專案套件及腳本管理

## 📝 維護紀錄

- **GitHub Actions**: 已優化部署流程，支援自動化環境變數注入。
- **依賴管理**: 移除了未使用的伺服器端套件 (`express`, `better-sqlite3`)，專注於前端實現。
- **忽略清單**: 完善了 `.gitignore` 以防止敏感資訊外洩。
