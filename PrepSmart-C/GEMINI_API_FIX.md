# Fixing Gemini Model Not Available Error

## Issue
When clicking "Generate Lesson Plan", you see: "Gemini model not available. Please check the model name or your API access."

## Solution

### 1. Verify Your API Key

Check your `.env` file in the `server` directory:
```env
GEMINI_API_KEY=your-api-key-here
```

**Important:** Make sure:
- The API key is correct (no extra spaces)
- The API key is valid and not expired
- The API key has access to Gemini models

### 2. Get a Valid API Key

If you don't have an API key or it's invalid:

1. Go to: https://aistudio.google.com/apikey
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the API key
5. Add it to `server/.env`:
   ```env
   GEMINI_API_KEY=your-new-api-key-here
   ```

### 3. Restart the Server

After updating the API key, restart your server:

```bash
# Stop the server (Ctrl+C)
# Then restart:
cd server
npm run dev
```

### 4. Check Server Logs

When you start the server, you should see:
```
Gemini API Key loaded: AIzaSyDEIG...
GoogleGenerativeAI initialized successfully
```

When you try to generate a lesson plan, you should see:
```
Successfully initialized model: gemini-1.5-flash (default mode)
```

### 5. Test the API Key

You can test your API key directly:

```bash
cd server
node -e "
const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'your-key-here');
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
model.generateContent('Hello').then(result => {
  console.log('✅ API Key is working!');
  console.log(result.response.text());
}).catch(err => {
  console.error('❌ API Key error:', err.message);
});
"
```

## Updated Model Names

The code now tries these models in order (most stable first):

1. `gemini-1.5-flash` - Most stable and widely available ⭐
2. `gemini-1.5-pro` - Stable pro version
3. `gemini-pro` - Original stable model
4. `gemini-1.5-flash-latest` - Latest flash
5. `gemini-1.5-pro-latest` - Latest pro
6. `gemini-2.0-flash-exp` - Experimental version
7. `gemini-2.0-flash` - Stable version
8. `gemini-flash-latest` - Fallback
9. `gemini-pro-latest` - Fallback

## Common Issues

### Issue: "API key not valid"
**Solution:** 
- Get a new API key from https://aistudio.google.com/apikey
- Make sure there are no extra spaces in the `.env` file
- Restart the server after updating

### Issue: "Model not found"
**Solution:**
- The API key might not have access to all models
- Try using a different API key
- Check if your Google account has billing enabled (some models require it)

### Issue: "Quota exceeded"
**Solution:**
- You've hit the free tier limit
- Wait a bit and try again
- Or enable billing in Google Cloud Console

### Issue: "Permission denied"
**Solution:**
- Your API key might not have the right permissions
- Create a new API key
- Make sure the Gemini API is enabled in your Google Cloud project

## Quick Fix Checklist

- [ ] API key is set in `server/.env`
- [ ] API key is valid (get new one from https://aistudio.google.com/apikey)
- [ ] Server has been restarted after updating API key
- [ ] Check server logs for model initialization messages
- [ ] Try generating a lesson plan again

## Still Not Working?

1. **Check server console** for detailed error messages
2. **Verify API key** by testing it directly (see step 5 above)
3. **Check Google AI Studio** to see if your API key is active
4. **Try a different API key** if the current one doesn't work

## Need Help?

Check the server logs when you try to generate a lesson plan. The logs will show:
- Which models were tried
- Which model succeeded (if any)
- The specific error message

This will help identify the exact issue.



