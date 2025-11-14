# Gemini API Key Setup Guide

## Issue: Invalid or Missing Gemini API Key

If you're getting an "Invalid or missing Gemini API key" error, follow these steps:

## Step 1: Get a Valid Gemini API Key

1. **Go to Google AI Studio:**
   - Visit: https://makersuite.google.com/app/apikey
   - Or: https://aistudio.google.com/app/apikey

2. **Sign in with your Google account**

3. **Create API Key:**
   - Click "Create API Key"
   - Select or create a Google Cloud project
   - Copy the API key (it will look like: `AIzaSy...`)

4. **Important Notes:**
   - Keep your API key secure and private
   - Don't share it publicly or commit it to version control
   - Free tier has usage limits

## Step 2: Update Your .env File

1. **Open `server/.env` file**

2. **Update the GEMINI_API_KEY:**
   ```env
   GEMINI_API_KEY=your_actual_api_key_here
   ```

3. **Save the file**

## Step 3: Restart Your Server

**IMPORTANT:** After updating the .env file, you MUST restart your server for changes to take effect.

```bash
# Stop the server (Ctrl+C)
# Then restart it
cd server
npm run dev
```

## Step 4: Verify the API Key is Loaded

Check the server console when it starts. You should see:
```
Gemini API Key loaded: AIzaSyDEIG...
GoogleGenerativeAI initialized successfully
```

If you see errors, the API key is invalid or not being read correctly.

## Troubleshooting

### Error: "Invalid API Key"
- Make sure you copied the entire API key correctly
- Check for any extra spaces or characters
- Verify the API key is active in Google AI Studio
- Make sure you restarted the server after updating .env

### Error: "API Key Not Found"
- Verify the .env file exists in the `server` directory
- Check that the line starts with `GEMINI_API_KEY=` (no spaces around =)
- Make sure there are no quotes around the API key in .env
- Restart the server after making changes

### Error: "Quota Exceeded"
- Free tier has rate limits
- Wait a few minutes and try again
- Consider upgrading to a paid plan if needed

### Testing Your API Key

You can test your API key manually using curl:

```bash
curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=YOUR_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{"contents":[{"parts":[{"text":"Say hello"}]}]}'
```

Replace `YOUR_API_KEY` with your actual API key. If it works, you'll get a JSON response.

## Alternative: Use Environment Variable Directly

Instead of .env file, you can set it as an environment variable:

**Windows PowerShell:**
```powershell
$env:GEMINI_API_KEY="your_api_key_here"
cd server
npm run dev
```

**Windows Command Prompt:**
```cmd
set GEMINI_API_KEY=your_api_key_here
cd server
npm run dev
```

**Mac/Linux:**
```bash
export GEMINI_API_KEY="your_api_key_here"
cd server
npm run dev
```

## Security Note

⚠️ **Important:** Never commit your API key to Git. The .env file should be in .gitignore (which it already is).

If you accidentally committed it:
1. Rotate your API key in Google AI Studio
2. Update the .env file with the new key
3. Remove the old key from Git history if needed

## Current Status

Check your server logs to see:
- If the API key is being loaded
- What error is occurring
- Whether the API connection is successful

After updating the API key and restarting, try generating a lesson plan again.






