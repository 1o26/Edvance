# Multi-AI Integration - Quick Setup Checklist

## ✅ Completed Tasks

- [x] Backend service layer created (Claude, Groq, GPT, Gemini)
- [x] Unified multi-AI service with fallback mechanism
- [x] API routes created and integrated into Express server
- [x] Frontend AI Model Selector component created
- [x] LessonGenerator page updated with model selector
- [x] Environment variable documentation (.env.example)
- [x] Comprehensive integration guide

## 📋 Your Setup Checklist

### Step 1: Get API Keys
- [ ] **Claude API Key** from https://console.anthropic.com/account/keys
  - Copy to `.env`: `CLAUDE_API_KEY=sk-ant-...`
- [ ] **Groq API Key** from https://console.groq.com/keys
  - Copy to `.env`: `GROQ_API_KEY=gsk-...`
- [ ] **OpenAI API Key** from https://platform.openai.com/api-keys
  - Copy to `.env`: `OPENAI_API_KEY=sk-proj-...`

### Step 2: Update Environment Variables
```bash
# Navigate to server directory
cd server

# Update .env file with your API keys
# Required new variables:
CLAUDE_API_KEY=your-key-here
GROQ_API_KEY=your-key-here
OPENAI_API_KEY=your-key-here
```

### Step 3: Restart Servers
```bash
# Kill existing server if running
# Terminal 1 (Backend)
cd server
npm start

# Terminal 2 (Frontend) - in new terminal
cd client
npm run dev
```

### Step 4: Test the Feature
1. Open http://localhost:5173
2. Go to "Generate Lesson Plan"
3. Look for "Select AI Model" section at top of form
4. Try each model:
   - ✅ Claude (best quality)
   - ✅ Groq (fastest)
   - ✅ GPT (most capable)
   - ✅ Gemini (default)
5. Fill form and generate lesson plan
6. Verify response from selected model

## 📊 Model Selection Guide

| Use Case | Recommended | Reason |
|----------|-------------|--------|
| **Best Quality** | Claude | Most intelligent, detailed responses |
| **Speed** | Groq | Ultra-fast, no limits |
| **High Volume** | Groq | Unlimited requests |
| **Budget** | Gemini | Free, unlimited requests |
| **Advanced Features** | GPT | Most capable model |
| **First Time** | Gemini | No setup needed, already integrated |

## 🔍 Verification Checklist

After setup, verify:
- [ ] Server starts without errors
- [ ] No "Missing API key" errors in logs
- [ ] Frontend loads lesson generator
- [ ] AI Model selector appears with 4 options
- [ ] Each model can be selected
- [ ] Lesson generation works for selected model
- [ ] Fallback works (test with invalid key)

## 🚨 Common Issues

### "Cannot find module 'multiAI.js'"
- Solution: Ensure all new files are created:
  - `/server/utils/claudeService.js`
  - `/server/utils/groqService.js`
  - `/server/utils/gptService.js`
  - `/server/utils/multiAIService.js`
  - `/server/routes/multiAI.js`

### "Missing API key" Error
- Solution: Add API keys to `/server/.env`
  - Restart server after updating .env
  - Verify no typos in key names

### Model selector not showing
- Solution: Check browser console for errors
- Restart frontend dev server
- Verify all component files exist

### "Authentication failed"
- Solution: Ensure you're logged in before generating
- Check JWT token is valid
- Try logging out and back in

## 📚 Documentation Files

- `MULTI_AI_INTEGRATION.md` - Comprehensive integration guide
- `.env.example` - Environment variable template
- This file - Quick setup checklist

## 🎯 Next Steps (Optional)

1. **Usage Analytics**: Track which models teachers use most
2. **Cost Estimation**: Show estimated cost before generation
3. **Rate Limiting**: Implement daily/hourly limits per model
4. **Model Switching**: Allow switching mid-generation
5. **Response Caching**: Cache generated plans to reduce API calls

## 💬 Support Resources

- Claude API Docs: https://docs.anthropic.com
- Groq API Docs: https://console.groq.com/docs
- OpenAI API Docs: https://platform.openai.com/docs
- Gemini API Docs: https://ai.google.dev/docs

## 🎉 You're All Set!

Once you complete the checklist above, the multi-AI feature will be fully operational. Teachers can now:
1. Choose their preferred AI model
2. Generate lesson plans with that model
3. Enjoy automatic fallback if selected model fails
4. Save and edit generated plans

Questions? Refer to `MULTI_AI_INTEGRATION.md` for detailed information.
