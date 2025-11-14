# Fix: Gemini Model Not Available

## Issue
You're getting "Gemini model not available" error. This can be caused by:
1. Outdated `@google/generative-ai` package
2. API key doesn't have access to certain models
3. Model name is incorrect

## Solution Steps

### Step 1: Update the Google Generative AI Package

The package version is outdated. Update it:

```bash
cd server
npm install @google/generative-ai@latest
```

Or update package.json and reinstall:
```bash
npm install
```

### Step 2: Test Your API Key and Models

Run the test script to see which models work:

```bash
cd server
node test-gemini.js
```

This will test multiple models and show which ones are accessible.

### Step 3: Restart Your Server

After updating packages, restart your server:

```bash
# Stop the server (Ctrl+C)
npm run dev
```

### Step 4: Check Server Logs

When you try to generate a lesson plan, check the server console. You should see:
```
Successfully initialized model: gemini-pro (default mode)
```

Or similar messages showing which model is being used.

## What Changed

1. **Updated model selection**: The code now tries multiple model names in order:
   - `gemini-pro` (most compatible)
   - `gemini-1.5-pro`
   - `gemini-1.5-flash`
   - `gemini-1.5-flash-latest`

2. **Better error handling**: More detailed error messages to help diagnose issues

3. **Fallback mechanism**: If one model fails, it tries the next one

## If It Still Doesn't Work

1. **Verify API Key**: Make sure your API key is valid and active
   - Go to: https://aistudio.google.com/app/apikey
   - Check if the key is active

2. **Check API Access**: Some API keys may have limited model access
   - Free tier might only have access to `gemini-pro`
   - Paid accounts have access to newer models

3. **Update Package**: Make sure you've updated the package:
   ```bash
   npm install @google/generative-ai@latest
   ```

4. **Check Server Logs**: Look for specific error messages in the server console when generating a lesson plan

## Expected Behavior

After these fixes:
- The server will try different models automatically
- You'll see which model is being used in the server logs
- If one model fails, it will try the next one
- More detailed error messages will help diagnose issues

Try generating a lesson plan again after following these steps!






