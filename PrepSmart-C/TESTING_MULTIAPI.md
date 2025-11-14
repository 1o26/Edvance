# 🧪 Multi-AI Integration Testing Guide

Complete guide to verify that Gemini, OpenAI, and Groq are working correctly in Edvance.

---

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Method 1: Direct API Testing](#method-1-direct-api-testing)
3. [Method 2: Endpoint Testing](#method-2-endpoint-testing)
4. [Method 3: Browser UI Testing](#method-3-browser-ui-testing)
5. [Troubleshooting](#troubleshooting)

---

## 🚀 Quick Start

### Prerequisites
- ✅ Node.js installed
- ✅ Server running on port 5000
- ✅ All three API keys in `.env` (Gemini, OpenAI, Groq)
- ✅ Database connected

### Run All Tests at Once
```bash
# From server directory
cd server

# Test direct API calls (no auth needed)
node test-all-apis.js

# Test through server endpoints (requires auth)
# Make sure server is running first!
node test-endpoint-multiapi.js
```

---

## 🔧 Method 1: Direct API Testing

**Best for:** Quick verification that API keys are valid and services are accessible

### Command
```bash
cd server
node test-all-apis.js
```

### What It Tests
- ✅ Gemini API connectivity and key validity
- ✅ OpenAI API connectivity and key validity  
- ✅ Groq API connectivity and key validity
- ✅ JSON response parsing for each model
- ✅ Response times

### Expected Output

#### ✅ All Three Working
```
🔍 Testing Google Gemini API
📤 Initializing Gemini client...
📤 Sending request to Gemini API...
✅ Gemini API Response received!
✅ Response length: 456 characters
✅ Response is valid JSON
✅ Lesson Title: Understanding Photosynthesis

🔍 Testing OpenAI GPT-4 API
📤 Initializing OpenAI client...
✅ OpenAI API Response received!
✅ Response is valid JSON
✅ Lesson Title: Photosynthesis: Energy from Light

🔍 Testing Groq API
📤 Initializing Groq client...
✅ Groq API Response received!
✅ Response is valid JSON
✅ Lesson Title: Photosynthesis Explained

📊 Test Summary
✅ Gemini: WORKING
✅ OpenAI: WORKING
✅ Groq: WORKING

📈 Passed: 3/3 tests
🎉 All APIs are working!
```

#### ❌ API Key Missing
```
🔍 Testing OpenAI GPT-4 API
❌ OPENAI_API_KEY not found in .env
```

**Fix:** Add the missing API key to `.env` and restart server

#### ❌ Invalid API Key
```
🔍 Testing Gemini API
📤 Initializing Gemini client...
❌ Gemini API Error: Invalid API key
```

**Fix:** Check if API key is correct and has proper permissions

---

## 🌐 Method 2: Endpoint Testing

**Best for:** Testing the complete flow through Express endpoints

### Prerequisites
1. Start the server first:
```bash
cd server
npm run dev
```

2. In another terminal, run the test:
```bash
node test-endpoint-multiapi.js
```

### What It Tests
- ✅ Server health (is it running?)
- ✅ Available models endpoint
- ✅ Full lesson generation pipeline for each model
- ✅ Response times
- ✅ Error handling

### Expected Output

#### ✅ Server Running & All Models Available
```
🚀 Starting Endpoint Tests for Multi-AI Integration

📡 Checking if server is running...
✅ Server is running!

🔍 Fetching Available Models
📤 Requesting available models from server...
✅ Available models retrieved!
ℹ️  Google Gemini (gemini): ✅ Available
ℹ️  OpenAI GPT-4 (openai): ✅ Available
ℹ️  Groq Mixtral (groq): ✅ Available

🔍 Testing Lesson Generation with GEMINI
📤 Sending lesson generation request...
✅ GEMINI generated lesson plan successfully!
✅ Response time: 1234ms
ℹ️  Lesson Title: Understanding Photosynthesis
```

#### ❌ Server Not Running
```
❌ Server is not running!
❌ Please start the server first: cd server && npm run dev
```

**Fix:** Start the server in another terminal

#### ⚠️ Some Models Not Available
```
ℹ️  Google Gemini (gemini): ✅ Available
ℹ️  OpenAI GPT-4 (openai): ❌ Not Available
ℹ️  Groq Mixtral (groq): ✅ Available
```

**Fix:** Check if API key exists in `.env` for unavailable models

---

## 🎨 Method 3: Browser UI Testing

**Best for:** Full end-to-end testing with real user experience

### Step 1: Start Both Servers
```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm run dev
```

### Step 2: Access Application
- Open browser: `http://localhost:5173`
- Login or register as teacher

### Step 3: Navigate to Lesson Generator
- Click "Generate Lesson Plan" in navbar
- Or go to `/generate` route

### Step 4: Test Each AI Model

#### Test Gemini
1. Fill in form:
   - Subject: "Biology"
   - Topic: "Photosynthesis"
   - Level: "School"
   - Grade: "Grade 9"
   - Duration: "45" minutes
   - Approach: "Interactive"

2. Select **Google Gemini** from model selector

3. Click "Generate Lesson Plan"

4. ✅ Expected: Lesson plan appears in ~5-10 seconds

#### Test OpenAI
1. Repeat step 1

2. Select **OpenAI GPT-4** from model selector

3. Click "Generate Lesson Plan"

4. ✅ Expected: Lesson plan appears in ~10-15 seconds (usually slower than Gemini)

#### Test Groq
1. Repeat step 1

2. Select **Groq Mixtral** from model selector

3. Click "Generate Lesson Plan"

4. ✅ Expected: Lesson plan appears in ~3-5 seconds (fastest)

### What to Look For
- ✅ Model selector shows all 3 models
- ✅ Available models are clickable
- ✅ Selected model has blue highlight
- ✅ Response appears quickly
- ✅ Lesson plan content looks reasonable
- ✅ Can save the lesson plan

### Common Issues

#### Model showing "Not Available"
- Check `.env` for missing API key
- Restart server after updating `.env`

#### Generation takes too long (>30 seconds)
- Check internet connection
- API might be rate-limited
- Try again in a few seconds

#### Error: "Failed to generate lesson plan"
- Check browser console for error message
- Check server console for detailed error
- See Troubleshooting section below

---

## 🔍 Troubleshooting

### Issue: "API Key Not Found"
```
Error: GEMINI_API_KEY is not set
```

**Solution:**
1. Open `server/.env`
2. Check if `GEMINI_API_KEY=...` exists
3. If missing, add it from Google AI Studio
4. Restart server
5. Re-run tests

### Issue: "Invalid API Key"
```
Error: Invalid API key provided
```

**Solution:**
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create a new API key
3. Update `GEMINI_API_KEY` in `.env`
4. Restart server

### Issue: "Rate Limit Exceeded"
```
Error: 429 Too Many Requests
```

**Solution:**
- Wait 1-2 minutes before trying again
- Check API quota on respective dashboard:
  - Gemini: https://console.cloud.google.com/
  - OpenAI: https://platform.openai.com/account/usage/overview
  - Groq: https://console.groq.com/

### Issue: "Server Not Running"
```
Error: connect ECONNREFUSED 127.0.0.1:5000
```

**Solution:**
```bash
cd server
npm run dev
```

Then wait for message: `✅ Server running on port 5000`

### Issue: "No Available Models"
```
No available AI models found!
Check your API keys in .env file
```

**Solution:**
1. Check `server/.env` - all three keys should be present:
```env
GEMINI_API_KEY=AIzaSy...
OPENAI_API_KEY=sk-proj-...
GROQ_API_KEY=gsk_...
```

2. Restart server after updating `.env`

3. Run test again

### Issue: "Database Connection Error"
```
❌ Database connection failed
```

**Solution:**
1. Ensure PostgreSQL is running
2. Check `DATABASE_URL` in `.env`
3. Run migrations: `npx prisma migrate dev`
4. Restart server

---

## 📊 Verification Checklist

- [ ] `node test-all-apis.js` shows all 3 APIs working
- [ ] `node test-endpoint-multiapi.js` shows available models
- [ ] Browser can reach `/generate` page
- [ ] Model selector displays all 3 models
- [ ] Can generate with Gemini
- [ ] Can generate with OpenAI
- [ ] Can generate with Groq
- [ ] Each model produces valid lesson plans
- [ ] Can save generated lesson plans
- [ ] Response times are reasonable:
  - Gemini: 5-10 seconds
  - OpenAI: 10-15 seconds
  - Groq: 3-5 seconds

---

## 🎯 What Each Model is Best For

| Model | Speed | Quality | Cost | Best For |
|-------|-------|---------|------|----------|
| **Gemini** | ⚡ Fast | 🌟 Good | 💰 Free | Daily use, balanced approach |
| **OpenAI** | 🐢 Slower | 🌟🌟 Excellent | 💵💵 Paid | Complex lessons, detailed reasoning |
| **Groq** | 🚀 Fastest | 🌟 Good | 💰 Free | Quick iterations, cost-conscious |

---

## 📞 Support

If tests fail:

1. **Check API keys** - Are they all in `.env`?
2. **Check server logs** - What does `npm run dev` show?
3. **Check browser console** - Any JavaScript errors?
4. **Check network** - Is internet connection stable?
5. **Restart everything** - Sometimes a clean start helps

---

## 🎉 Success Criteria

All three models working when:
- ✅ All 3 show as "Available" in test
- ✅ All 3 can generate lesson plans via UI
- ✅ Response times are reasonable
- ✅ Lesson plans are properly formatted

**Next Step:** Teachers can now choose their preferred AI model when generating lesson plans!

