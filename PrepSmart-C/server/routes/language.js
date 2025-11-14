import express from 'express';
import { body, validationResult } from 'express-validator';
import { PrismaClient } from '@prisma/client';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = express.Router();
const prisma = new PrismaClient();

// Middleware to get user from request (set by authenticateToken)
router.use((req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
});

const API_KEY = process.env.GEMINI_API_KEY || "AIzaSyDEIGf1uBs5sjn-zt0e3pBjgmBt5NrGM2s";
const genAI = new GoogleGenerativeAI(API_KEY);

if (!API_KEY || API_KEY === "AIzaSyDEIGf1uBs5sjn-zt0e3pBjgmBt5NrGM2s") {
  console.warn('⚠️  WARNING: Using default Gemini API key. Translation may fail. Set GEMINI_API_KEY in .env');
}

// Translate lesson plan
router.post('/translate/:planId', [
  body('targetLanguage').trim().notEmpty().withMessage('Target language is required'),
  body('sourceLanguage').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { planId } = req.params;
    const { targetLanguage, sourceLanguage = 'en' } = req.body;

    const plan = await prisma.lessonPlan.findUnique({
      where: { id: planId }
    });

    if (!plan) {
      return res.status(404).json({ error: 'Lesson plan not found' });
    }

    if (!plan.content) {
      console.error(`❌ Lesson plan has no content. Plan ID: ${planId}`);
      return res.status(400).json({
        error: 'Lesson plan has no content to translate',
        planId: planId,
        planContent: plan.content
      });
    }

    // Check permissions
    if (req.user.role === 'teacher' && plan.creatorId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    const planContent = typeof plan.content === 'object' 
      ? JSON.stringify(plan.content, null, 2)
      : plan.content?.toString() || '';

    console.log(`📥 Translation request: ${sourceLanguage} → ${targetLanguage}, Plan ID: ${planId}`);
    console.log(`📋 Content length: ${planContent.length} characters`);

    const languageNames = {
      'en': 'English',
      'hi': 'Hindi',
      'ta': 'Tamil',
      'te': 'Telugu',
      'kn': 'Kannada',
      'ml': 'Malayalam',
      'mr': 'Marathi',
      'gu': 'Gujarati',
      'bn': 'Bengali',
      'pa': 'Punjabi',
      'or': 'Odia',
      'as': 'Assamese'
    };

    const sourceLangName = languageNames[sourceLanguage] || sourceLanguage;
    const targetLangName = languageNames[targetLanguage] || targetLanguage;

    if (!languageNames[targetLanguage]) {
      console.error(`❌ Invalid target language: ${targetLanguage}`);
      return res.status(400).json({
        error: 'Invalid target language',
        supportedLanguages: Object.keys(languageNames),
        receivedLanguage: targetLanguage
      });
    }

    const prompt = `Translate this lesson plan from ${sourceLangName} to ${targetLangName}. Maintain the exact same JSON structure and format. Only translate the text content, keep all field names, structure, and formatting identical.

Original Lesson Plan:
${planContent}

Return the translated lesson plan as a valid JSON object with the same structure. Do not include any explanations or markdown formatting.`;

    console.log(`📤 Sending translation request to Gemini API...`);
    
    let result;
    try {
      result = await model.generateContent(prompt);
    } catch (apiError) {
      console.error(`❌ Gemini API Error:`, apiError.message);
      console.error(`Error details:`, apiError);
      return res.status(500).json({
        error: 'Gemini API error',
        message: apiError.message,
        status: apiError.status
      });
    }

    const response = await result.response;
    let text = response.text().trim();

    console.log('✅ Translation response received');
    console.log('Raw translation response:', text.substring(0, 100)); // Log first 100 chars

    // Clean up response
    text = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '');
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      text = jsonMatch[0];
    }

    let translatedContent;
    try {
      translatedContent = JSON.parse(text);
      console.log('✅ Translation JSON parsed successfully');
    } catch (parseError) {
      console.error('❌ JSON Parse Error:', parseError.message);
      console.error('Failed text:', text.substring(0, 200));
      
      // Try to fix common JSON issues
      try {
        const fixedText = text.replace(/:\s*undefined/g, ': null')
                             .replace(/:\s*NaN/g, ': null')
                             .replace(/,\s*}/g, '}')
                             .replace(/,\s*]/g, ']');
        translatedContent = JSON.parse(fixedText);
        console.log('✅ Translation JSON fixed and parsed successfully');
      } catch (secondError) {
        console.error('❌ JSON fix failed:', secondError.message);
        return res.status(500).json({
          error: 'Failed to parse translated content',
          message: `Parse error: ${parseError.message} | Fix error: ${secondError.message}`,
          rawText: text.substring(0, 100)
        });
      }
    }

    // Update plan with translated content and language
    const updatedPlan = await prisma.lessonPlan.update({
      where: { id: planId },
      data: {
        content: translatedContent,
        language: targetLanguage
      }
    });

    console.log(`✅ Lesson plan updated successfully. Language set to: ${targetLanguage}`);

    // Create activity log
    await prisma.activity.create({
      data: {
        userId: req.user.id,
        planId: plan.id,
        action: 'translated',
        description: `Translated lesson plan from ${sourceLangName} to ${targetLangName}`,
        metadata: { sourceLanguage, targetLanguage }
      }
    });

    res.json({
      success: true,
      translatedContent,
      language: targetLanguage,
      plan: updatedPlan
    });
  } catch (error) {
    console.error('Translation error:', error);
    res.status(500).json({
      error: 'Failed to translate lesson plan',
      message: error.message
    });
  }
});

// Speech-to-text (transcribe audio to text for lesson plan creation)
router.post('/speech-to-text', [
  body('audioUrl').optional().trim(),
  body('audioText').optional().trim(),
  body('language').optional().trim()
], async (req, res) => {
  try {
    const { audioUrl, audioText, language = 'en' } = req.body;

    // Note: For a full implementation, you would:
    // 1. Use Google Cloud Speech-to-Text API or similar
    // 2. Process audio file from audioUrl
    // 3. Return transcribed text
    
    // For now, we'll use Gemini to clean up and structure the text if provided
    if (audioText) {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      
      const prompt = `You are a teaching assistant. The following is transcribed audio from a teacher describing a lesson plan. Clean up the transcription, fix any errors, and structure it into a clear lesson plan description.

Transcribed Audio:
${audioText}

Provide a cleaned, well-structured description that could be used to generate a lesson plan. Focus on:
- Subject and topic
- Grade level
- Key learning objectives
- Main activities
- Assessment ideas

Return the cleaned text only, no JSON formatting.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const cleanedText = response.text();

      res.json({
        success: true,
        originalText: audioText,
        cleanedText: cleanedText,
        language
      });
    } else {
      res.status(400).json({
        error: 'Either audioUrl or audioText is required'
      });
    }
  } catch (error) {
    console.error('Speech-to-text error:', error);
    res.status(500).json({
      error: 'Failed to process speech-to-text',
      message: error.message
    });
  }
});

// Get supported languages
router.get('/supported-languages', (req, res) => {
  const languages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'Hindi' },
    { code: 'ta', name: 'Tamil' },
    { code: 'te', name: 'Telugu' },
    { code: 'kn', name: 'Kannada' },
    { code: 'ml', name: 'Malayalam' },
    { code: 'mr', name: 'Marathi' },
    { code: 'gu', name: 'Gujarati' },
    { code: 'bn', name: 'Bengali' },
    { code: 'pa', name: 'Punjabi' },
    { code: 'or', name: 'Odia' },
    { code: 'as', name: 'Assamese' }
  ];

  res.json({ languages });
});

export default router;

