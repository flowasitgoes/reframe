# SEO 與社群預覽素材清單

專案已在 `app/layout.tsx` 內設定完整的 `<head>` metadata，並使用 `public/` 內以下檔案（來自 `assets-to-add` 已匯入）：

- **`og.png`** ← `og-image-1200x630.png`（社群預覽 1200×630）
- **`icon-16x16.png`**、**`favicon-32x32.png`**、**`icon-32x32.png`**、**`icon.svg`**（favicon）
- **`icon-192x192.png`**、**`icon-512x512.png`**、**`icon-64x64.png`**（PWA / Apple 圖示）

以下為**環境變數**與之後若要更換圖檔時的對照。

---

## 一、環境變數

| 變數 | 說明 | 範例 |
|------|------|------|
| `NEXT_PUBLIC_SITE_URL` | 網站的完整網址（用於 OG、Twitter 的**絕對圖址**與 canonical，**必影響 Facebook/Threads 縮圖**） | `https://pray.ifunlove.com` |
| `NEXT_PUBLIC_FB_APP_ID` | 選填。Facebook App ID，設了可消除 Meta 偵錯工具的「缺少 fb:app_id」警告，並有助分享統計 | 從 [Meta for Developers](https://developers.facebook.com/apps/) 建立應用後取得 |

未設定 `NEXT_PUBLIC_SITE_URL` 時會使用 `https://pray.ifunlove.com`。部署到 Vercel 後，在 **Settings → Environment Variables** 新增即可。**縮圖抓不到時，請確認此網址與實際對外網址一致**（例如經 Cloudflare 指到 pray.ifunlove.com 時，就填 `https://pray.ifunlove.com`）。

---

## 二、目前使用的圖片（`public/`）

| 檔名 | 來源 | 用途 |
|------|------|------|
| `og.png` | og-image-1200x630.png | Facebook / LINE / Twitter 等連結預覽（1200×630） |
| `icon-16x16.png` | icon-16x16.png | 小尺寸 favicon |
| `favicon-32x32.png` | favicon-32x32-pray.png | 32×32 favicon |
| `icon-32x32.png` | icon-32x32.png | 32×32 圖示 |
| `icon.svg` | icon-32x32.svg | 向量 favicon / PWA |
| `icon-64x64.png` | image-64x64.png | 64×64 PWA |
| `icon-192x192.png` | image-192x192.png | Apple / PWA 192×192 |
| `icon-512x512.png` | image-512x512.png | PWA 512×512 |

若要更換圖檔，請覆蓋對應的 `public/` 檔案，或改檔名後同步修改 `app/layout.tsx` 與 `public/manifest.json`。

---

## 四、已寫入的 `<head>` 內容摘要

- **企業／產品識別**：`title`、`siteName`「為你禱告」、`creator` / `publisher`「iFunLove」
- **描述**：`description`、`openGraph.description`、`twitter.description`（同一段文案）
- **關鍵字**：`keywords` 含「禱告、基督教禱告、心情記錄、靈修、正向思考、重新框架、iFunLove、為你禱告」
- **語系**：`html lang="zh-TW"`、`openGraph.locale: "zh_TW"`
- **縮圖**：`og:image`、`twitter:image` 皆用**絕對網址** `{NEXT_PUBLIC_SITE_URL}/og.png`（1200×630），以便 Facebook / Threads 正確抓圖
- **Meta**：若有設 `NEXT_PUBLIC_FB_APP_ID`，會輸出 `<meta property="fb:app_id" content="...">`
- **圖示**：`icons`（含 light/dark）、`apple-touch-icon`、`manifest.json` 裡的 icon
- **PWA**：`public/manifest.json`（名稱、說明、theme_color、icons）
- **檢索**：`robots: { index: true, follow: true }`

若要改企業名稱、描述或預覽圖，可從 `app/layout.tsx` 的 `metadata` 與 `siteName` / `siteDescription` 修改。
