# Multi-AI Model Integration Guide

## Overview
PrepSmart now supports multiple AI APIs for lesson plan generation. Teachers can select their preferred AI model:
- **Claude** (Anthropic) - Best quality, most intelligent responses
- **Groq** (Mixtral 8x7B) - Ultra-fast, unlimited requests
- **GPT** (OpenAI) - Most capable, excellent quality
- **Gemini** (Google) - Already integrated, good for education

## Architecture

### Frontend Changes
**File:** `/client/src/components/AIModelSelector.jsx` (NEW)
- Beautiful UI component for selecting AI models
- Shows model features, speed, and free tier info
- Expandable details for each provider
- Dark mode support

**File:** `/client/src/pages/LessonGenerator.jsx` (UPDATED)
- Added AI model selector in the form
- New state: `selectedAIModel` (default: 'gemini')
- Updated API call to new `/api/multiAI/generate-lesson-plan` endpoint
- Passes `aiModel` parameter in request body

### Backend Changes
**File:** `/server/utils/claudeService.js` (NEW)
- Anthropic Claude API integration
- Model: `claude-3-5-sonnet-20241022`
- Function: `generateLessonPlanWithClaude()`
- Max tokens: 2000

**File:** `/server/utils/groqService.js` (NEW)
- Groq API integration (OpenAI-compatible)
- Model: `mixtral-8x7b-32768`
- Function: `generateLessonPlanWithGroq()`
- Max tokens: 1500
- Ultra-fast inference

**File:** `/server/utils/gptService.js` (NEW)
- OpenAI ChatGPT API integration
- Model: `gpt-4o`
- Function: `generateLessonPlanWithGPT()`
- Max tokens: 2000
- Educational context in system prompt

**File:** `/server/utils/multiAIService.js` (NEW)
- Unified AI service manager
- Routes requests to correct API service
- Automatic fallback mechanism:
  - If Claude fails → fallback to Gemini
  - If Groq fails → fallback to Gemini
  - If GPT fails → fallback to Gemini
- Key functions:
  - `generateLessonPlanWithAI(aiModel, ...)` - Main generation function
  - `getAllAIModels()` - Returns all available models
  - `getAvailableProviders()` - Returns provider list for UI

**File:** `/server/routes/multiAI.js` (NEW)
- Express routes for multi-AI endpoints:
  1. `POST /api/multiAI/generate-lesson-plan`
     - Body: { aiModel, subject, gradeLevel, topic, objectives, duration }
     - Response: { success, aiModel, lessonPlan, generatedAt }
  2. `GET /api/multiAI/available-models`
     - Returns all models grouped by provider
  3. `GET /api/multiAI/providers`
     - Returns provider list for UI dropdown

**File:** `/server/index.js` (UPDATED)
- Added import: `import multiAIRoutes from './routes/multiAI.js'`
- Added route: `app.use('/api/multiAI', authenticateToken, multiAIRoutes)`

## Setup Instructions

### 1. Get API Keys

#### Claude (Anthropic)
1. Go to https://console.anthropic.com/account/keys
2. Create new API key
3. Copy to `.env` file as `CLAUDE_API_KEY`
4. Free tier: 5 API calls per day

#### Groq
1. Go to https://console.groq.com/keys
2. Create new API key
3. Copy to `.env` file as `GROQ_API_KEY`
4. Free tier: Unlimited requests (rate limited)

#### OpenAI (GPT)
1. Go to https://platform.openai.com/api-keys
2. Create new API key
3. Copy to `.env` file as `OPENAI_API_KEY`
4. Free tier: $5 trial credit (expires after 3 months)

#### Gemini (Already Integrated)
- Already configured in existing system
- Free tier: 60 requests per minute

### 2. Update Environment Variables

Add to `/server/.env`:
```
CLAUDE_API_KEY="sk-ant-v0-xxxxxxxxxxxxx"
GROQ_API_KEY="gsk_xxxxxxxxxxxxx"
OPENAI_API_KEY="sk-proj-xxxxxxxxxxxxx"
```

Reference `/server/.env.example` for all variables.

### 3. Restart Server

```bash
# From server directory
npm start
```

The server will now listen on `/api/multiAI` routes.

## Usage

### For Teachers (Frontend)
1. Go to "Generate Lesson Plan" page
2. New "Select AI Model" section appears at the top
3. Choose preferred model:
   - **Claude**: Best quality but limited (5/day)
   - **Groq**: Fastest, unlimited
   - **GPT**: Most capable but requires credit
   - **Gemini**: Default, balanced quality
4. Fill in lesson details as usual
5. Click "Generate"

### API Endpoint

**Request:**
```bash
POST /api/multiAI/generate-lesson-plan
Authorization: Bearer <token>
Content-Type: application/json

{
  "aiModel": "claude",
  "subject": "Mathematics",
  "gradeLevel": "Grade 10",
  "topic": "Quadratic Equations",
  "objectives": "interactive approach",
  "duration": 45
}
```

**Response:**
```json
{
  "success": true,
  "aiModel": "claude",
  "lessonPlan": {
    "lessonTitle": "...",
    "learningObjectives": [...],
    "content": "...",
    "assessmentMethods": [...]
  },
  "generatedAt": "2024-01-15T10:30:00.000Z"
}
```

### Available Models Endpoint

**Request:**
```bash
GET /api/multiAI/available-models
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "models": {
    "anthropic": ["claude-3-5-sonnet-20241022"],
    "groq": ["mixtral-8x7b-32768"],
    "openai": ["gpt-4o"],
    "google": ["gemini-2.0-flash"]
  }
}
```

### Providers List Endpoint

**Request:**
```bash
GET /api/multiAI/providers
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "providers": [
    {
      "id": "claude",
      "name": "Claude 3.5 Sonnet",
      "provider": "Anthropic",
      "description": "Best quality, most intelligent",
      "icon": "🧠",
      "speed": "Moderate",
      "free_tier": "5 calls/day"
    },
    {
      "id": "groq",
      "name": "Mixtral 8x7B",
      "provider": "Groq",
      "description": "Ultra-fast, unlimited",
      "icon": "⚡",
      "speed": "Extremely Fast",
      "free_tier": "Unlimited"
    },
    ...
  ]
}
```

## Error Handling

### Fallback Mechanism
If a model fails, the system automatically falls back to Gemini:
1. Teacher selects Claude
2. Claude API fails
3. System automatically uses Gemini instead
4. Response shows success: true with generated content

### Common Errors

**Missing API Key**
```
Error: Missing API key for model. Check .env file
```
Solution: Add missing API key to `.env` file

**API Rate Limited**
```
Error: Rate limit exceeded. Try another model or wait
```
Solution: Switch to Groq (unlimited) or Gemini

**Invalid Credentials**
```
Error: Unauthorized - Invalid API key
```
Solution: Verify API key in `.env` file

**Request Timeout**
```
Error: Request timeout - Model took too long
```
Solution: Try Groq (faster) or Gemini

## Performance Comparison

| Model | Speed | Quality | Free Tier | Best For |
|-------|-------|---------|-----------|----------|
| Claude | Moderate | Excellent | 5/day | Detailed, high-quality plans |
| Groq | ⚡ Fastest | Good | Unlimited | Quick iterations, high volume |
| GPT | Moderate | Excellent | $5 trial | Advanced requirements |
| Gemini | Fast | Good | 60 req/min | Balanced, educational content |

## Testing

### Manual Testing

1. **Test Claude:**
   ```bash
   curl -X POST http://localhost:5000/api/multiAI/generate-lesson-plan \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "aiModel": "claude",
       "subject": "Science",
       "gradeLevel": "Grade 9",
       "topic": "Photosynthesis",
       "objectives": "interactive",
       "duration": 45
     }'
   ```

2. **Test Groq:**
   ```bash
   # Change aiModel to "groq"
   ```

3. **Test Fallback:**
   - Set invalid Claude API key
   - Request with claude model
   - System should fallback to Gemini automatically

### Integration Testing

Run the frontend:
```bash
cd client
npm run dev
```

Test the AI Model Selector:
1. Navigate to "Generate Lesson Plan"
2. Verify all 4 models appear in selector
3. Click each model to select it
4. Generate lesson plan
5. Verify response comes from selected model

## Troubleshooting

### Model Selector Not Showing
- Check browser console for errors
- Ensure `/api/multiAI/providers` endpoint is accessible
- Verify authentication token is valid

### Generation Fails
- Check server logs for error messages
- Verify API key is set in `.env`
- Ensure model is supported (claude, groq, gpt, gemini)

### No Response
- Check network tab in browser DevTools
- Verify server is running
- Check `/api/multiAI/generate-lesson-plan` returns 200 status

### Slow Generation
- Try switching to Groq (fastest)
- Check server logs for performance issues
- Verify internet connection speed

## Files Changed Summary

**New Files (5):**
- `/client/src/components/AIModelSelector.jsx`
- `/server/utils/claudeService.js`
- `/server/utils/groqService.js`
- `/server/utils/gptService.js`
- `/server/utils/multiAIService.js`
- `/server/routes/multiAI.js`

**Modified Files (2):**
- `/client/src/pages/LessonGenerator.jsx`
- `/server/index.js`

**Documentation:**
- `/server/.env.example` (updated with new API keys)
- This file: `MULTI_AI_INTEGRATION.md`

## Next Steps

1. ✅ Backend services created
2. ✅ API routes created and integrated
3. ✅ Frontend component created
4. ✅ LessonGenerator updated
5. ⏳ Add environment variables with API keys
6. ⏳ Test all three new APIs
7. ⏳ Deploy to production
8. (Optional) Add usage analytics/tracking
9. (Optional) Add cost estimation UI

## Support

For issues or questions about specific AI APIs:
- Claude: https://support.anthropic.com
- Groq: https://console.groq.com/docs
- OpenAI: https://platform.openai.com/docs
- Gemini: https://ai.google.dev/docs
