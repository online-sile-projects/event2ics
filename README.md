# Event2ICS

將文字訊息或圖片轉換成日曆檔案的 PWA 應用程式。

## 功能說明

1. 使用者在手機端複製訊息或圖片
2. 分享到 Event2ICS
3. 將訊息或圖片顯示在網頁上
4. 使用 Google Gemini API 分析內容並整理成 ICS 格式
5. 提供 ICS 檔案下載功能

## 系統架構

### UI 層 (Presentation Layer)
- index.html：主要的使用者介面
- styles/：CSS 樣式檔案
- manifest.json：PWA 設定檔
- service-worker.js：PWA 的離線功能支援

### 應用層 (Application Layer)
- src/services/
  - ShareTargetService.js：處理分享功能
  - ClipboardService.js：處理剪貼簿操作
  - GeminiService.js：與 Google Gemini API 互動
  - ICSService.js：處理 ICS 檔案的生成和儲存

### 領域層 (Domain Layer)
- src/models/
  - Event.js：事件資料模型
  - ICSFormat.js：ICS 格式轉換器

### 基礎設施層 (Infrastructure Layer)
- src/utils/
  - ApiClient.js：API 請求處理
  - FileHandler.js：檔案處理工具
  - DateTimeUtils.js：日期時間處理工具

## 技術堆疊

- 前端框架：Alpine.js
- UI 框架：Tailwind CSS
- 建置工具：Vite
- PWA 工具：Workbox
- API：Google Gemini

## 安裝與執行

（待補充）

## 開發說明

（待補充）

## 授權

MIT License