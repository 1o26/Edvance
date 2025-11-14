import express from 'express';
import { PrismaClient } from '@prisma/client';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = express.Router();
const prisma = new PrismaClient();

// Middleware to get user from request
router.use((req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
});

const API_KEY = process.env.GEMINI_API_KEY || "AIzaSyDEIGf1uBs5sjn-zt0e3pBjgmBt5NrGM2s";
const genAI = new GoogleGenerativeAI(API_KEY);

// Analyze cognitive load of a lesson plan
router.post('/analyze/:planId', async (req, res) => {
  try {
    const { planId } = req.params;

    const plan = await prisma.lessonPlan.findUnique({
      where: { id: planId }
    });

    if (!plan) {
      return res.status(404).json({ error: 'Lesson plan not found' });
    }

    // Check permissions
    if (req.user.role === 'teacher' && plan.creatorId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (!genAI) {
      return res.status(500).json({ error: 'AI service not available' });
    }

    // Try multiple models
    let model;
    const modelNames = [
      'gemini-2.5-flash',
      'gemini-2.0-flash',
      'gemini-2.0-flash-exp',
      'gemini-flash-latest'
    ];
    
    let lastError = null;
    for (const modelName of modelNames) {
      try {
        model = genAI.getGenerativeModel({ 
          model: modelName,
          generationConfig: {
            temperature: 0.7,
            responseMimeType: 'application/json'
          }
        });
        break;
      } catch (error) {
        lastError = error;
        try {
          model = genAI.getGenerativeModel({ 
            model: modelName,
            generationConfig: { temperature: 0.7 }
          });
          break;
        } catch (e) {
          continue;
        }
      }
    }
    
    if (!model) {
      throw new Error(`Failed to initialize any model. Last error: ${lastError?.message || 'Unknown error'}`);
    }

    const planContent = typeof plan.content === 'object' 
      ? JSON.stringify(plan.content, null, 2)
      : plan.content?.toString() || '';

    const prompt = `You are an expert in cognitive load theory and educational psychology. Analyze this lesson plan to assess cognitive load and identify potential overload issues.

Lesson Plan Details:
Title: ${plan.title}
Subject: ${plan.subject}
Topic: ${plan.topic || 'N/A'}
Grade: ${plan.grade}
Duration: ${plan.duration || 45} minutes

Lesson Plan Content:
${planContent}

Analyze the cognitive load by examining:
1. **Intrinsic Load**: Complexity of the content itself
   - Number of new concepts introduced
   - Number of new terms/vocabulary
   - Conceptual difficulty level
   - Prerequisite knowledge required

2. **Extraneous Load**: How information is presented
   - Information organization
   - Clarity of instructions
   - Redundant information
   - Presentation format issues

3. **Germane Load**: Effective learning strategies
   - Opportunities for schema construction
   - Practice and application opportunities
   - Metacognitive support

4. **Pacing Analysis**:
   - Concepts per time unit
   - Difficulty jumps
   - Information density
   - Retention risk factors

Return a JSON object with this structure:
{
  "overallLoad": "<low/moderate/high/overload>",
  "loadScore": <0-100>,
  "intrinsicLoad": {
    "score": <0-100>,
    "newConcepts": <number>,
    "newTerms": <number>,
    "complexity": "<low/moderate/high>",
    "assessment": "<description>"
  },
  "extraneousLoad": {
    "score": <0-100>,
    "issues": ["<issue1>", "<issue2>"],
    "assessment": "<description>"
  },
  "germaneLoad": {
    "score": <0-100>,
    "strengths": ["<strength1>", "<strength2>"],
    "assessment": "<description>"
  },
  "pacingAnalysis": {
    "conceptsPerMinute": <number>,
    "difficultyJumps": <number>,
    "riskLevel": "<low/moderate/high>",
    "assessment": "<description>"
  },
  "recommendations": [
    {
      "issue": "<specific issue>",
      "suggestion": "<how to address it>",
      "priority": "<high/medium/low>"
    }
  ],
  "optimizationSuggestions": [
    "<suggestion1>",
    "<suggestion2>",
    "<suggestion3>"
  ],
  "estimatedRetentionRisk": "<low/moderate/high>",
  "breakdownRecommendation": "<should this be split into multiple sessions?>"
}

Return ONLY the JSON object, no markdown formatting.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text().trim();
    
    text = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '');
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      text = jsonMatch[0];
    }

    let analysis;
    try {
      analysis = JSON.parse(text);
    } catch (parseError) {
      console.error('Cognitive load analysis JSON parse error:', parseError);
      console.error('Response text:', text);
      throw new Error('Failed to parse cognitive load analysis. Please try again.');
    }

    res.json({
      success: true,
      analysis
    });
  } catch (error) {
    console.error('Cognitive load analysis error:', error);
    res.status(500).json({
      error: 'Failed to analyze cognitive load',
      message: error.message
    });
  }
});

export default router;

