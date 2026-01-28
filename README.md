# reframe

「為你禱告」— 將心情化為祝福的禱告生成服務。

## 本機開發

1. 複製 `.env.example` 為 `.env.local`
2. 填入你的 OpenRouter API Key（[申請連結](https://openrouter.ai/keys)）
3. `npm run dev` 或 `pnpm dev`

## 部署到 Vercel（給別人用）

1. 將專案推上 GitHub，在 [Vercel](https://vercel.com) 匯入此 repo
2. 在專案 **Settings → Environment Variables** 新增：
   - **Name**: `OPENROUTER_API_KEY`
   - **Value**: 你的 OpenRouter API Key（你已申請的那一支）
3. 重新部署後，訪客**無需輸入任何 Key**，會自動使用你在 Vercel 設定的額度與限流。
