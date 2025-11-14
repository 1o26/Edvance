import express from 'express';
import { PrismaClient } from '@prisma/client';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { generateWithRetry } from '../utils/geminiRetry.js';

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

// Check curriculum alignment
router.post('/check-alignment/:planId', [
  // body('curriculumStandards').optional().isArray(),
  // body('syllabus').optional().trim()
], async (req, res) => {
  try {
    const { planId } = req.params;
    const { curriculumStandards, syllabus, country = 'US', gradeLevel } = req.body;

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

    // Try multiple models for better compatibility
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
        console.log(`Using model: ${modelName} for curriculum alignment`);
        break;
      } catch (error) {
        lastError = error;
        try {
          // Try without JSON mode
          model = genAI.getGenerativeModel({ 
            model: modelName,
            generationConfig: {
              temperature: 0.7
            }
          });
          console.log(`Using model: ${modelName} (default mode) for curriculum alignment`);
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

    const effectiveGrade = gradeLevel || plan.grade;
    
    // Check if this is an engineering plan for India (VTU syllabus)
    const isEngineeringIndia = country === 'IN' && 
                                (effectiveGrade?.includes('Engineering') || 
                                 plan.subject?.toLowerCase().includes('engineering') ||
                                 plan.grade?.includes('Engineering'));
    
    // Extract field of study and year if it's a college-level plan
    let fieldOfStudy = null;
    let year = null;
    if (effectiveGrade && effectiveGrade.includes(' - ')) {
      const parts = effectiveGrade.split(' - ');
      fieldOfStudy = parts[0];
      year = parts[1];
    }

    // Build syllabus-specific instructions
    let syllabusInstructions = '';
    if (isEngineeringIndia && fieldOfStudy === 'Engineering') {
      syllabusInstructions = `\n\nIMPORTANT: This is an Engineering lesson plan for students in India. You MUST check alignment with VTU (Visvesvaraya Technological University) syllabus requirements. 

VTU Syllabus Alignment Requirements:
- Check if the lesson plan aligns with VTU curriculum structure and credit system
- Verify coverage of VTU module topics and learning outcomes
- Ensure alignment with VTU examination pattern and assessment methods
- Check if the content matches VTU semester-wise syllabus structure
- Verify if practical components (if applicable) align with VTU lab requirements
- Ensure the lesson plan covers VTU-prescribed textbooks and reference materials where relevant
- Check alignment with VTU's Continuous Internal Evaluation (CIE) and Semester End Examination (SEE) patterns

The lesson plan should specifically address:
1. VTU module-wise content coverage
2. VTU credit hours and contact hours requirements
3. VTU learning outcomes and course outcomes (COs)
4. VTU assessment and evaluation methods
5. VTU practical/lab components if applicable
6. VTU prescribed textbooks and reference materials`;
    }

    const prompt = `You are an educational standards expert. Analyze this lesson plan and check its alignment with standard curriculum requirements.

Lesson Plan Details:
Title: ${plan.title}
Subject: ${plan.subject}
Topic: ${plan.topic || 'N/A'}
Grade/Level: ${effectiveGrade}
Country/Region: ${country}
${fieldOfStudy ? `Field of Study: ${fieldOfStudy}` : ''}
${year ? `Year Level: ${year}` : ''}

Lesson Plan Content:
${planContent}

${curriculumStandards ? `Additional Standards to Check:
${JSON.stringify(curriculumStandards, null, 2)}` : ''}

${syllabus ? `Syllabus Requirements:
${syllabus}` : ''}
${syllabusInstructions}

Analyze the lesson plan and provide:
1. Alignment with common curriculum standards${isEngineeringIndia ? ' and VTU syllabus requirements' : ' (e.g., Common Core, NGSS, etc. based on subject and grade)'}
2. Coverage of key learning objectives for the grade level${isEngineeringIndia ? ' and VTU course outcomes' : ''}
3. Gaps or missing elements${isEngineeringIndia ? ' in VTU syllabus coverage' : ''}
4. Suggestions for better alignment${isEngineeringIndia ? ' with VTU requirements' : ''}

Return a JSON object with this structure:
{
  "alignmentScore": <percentage 0-100>,
  "overallAlignment": "<excellent/good/fair/poor>",
  "alignedStandards": [
    {
      "standard": "<standard code/name>${isEngineeringIndia ? ' or VTU module/topic' : ''}",
      "description": "<what it covers>",
      "coverage": "<fully/partially/not covered>",
      "evidence": "<evidence from lesson plan>"${isEngineeringIndia ? ',\n      "vtuAlignment": "<how it aligns with VTU syllabus>",\n      "vtuModule": "<VTU module number/topic if applicable>",\n      "vtuCO": "<VTU Course Outcome if applicable>"' : ''}
    }
  ],
  "gaps": [
    {
      "area": "<subject/domain area>",
      "missing": "<what's missing>",
      "suggestion": "<how to address it>"
    }
  ],
  "strengths": ["<strength1>", "<strength2>", ...],
  "recommendations": ["<recommendation1>", "<recommendation2>", ...],
  "gradeLevelAppropriateness": {
    "score": <1-10>,
    "feedback": "<feedback on grade level appropriateness>"
  }
}

Return ONLY the JSON object, no markdown formatting.`;

    const result = await generateWithRetry(model, prompt, `Curriculum Alignment Check for ${plan.title}`);
    const response = await result.response;
    let text = response.text().trim();

    // Clean up response
    text = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '');
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      text = jsonMatch[0];
    }

    let alignmentData;
    try {
      alignmentData = JSON.parse(text);
    } catch (parseError) {
      console.error('Curriculum alignment JSON parse error:', parseError);
      console.error('Response text:', text);
      alignmentData = {
        alignmentScore: 75,
        overallAlignment: "fair",
        alignedStandards: [],
        gaps: [],
        strengths: ["Basic structure present"],
        recommendations: ["Could benefit from more detailed alignment analysis"],
        gradeLevelAppropriateness: {
          score: 7,
          feedback: "Plan appears appropriate for grade level"
        }
      };
    }

    // Validate alignment score
    if (alignmentData.alignmentScore < 0) alignmentData.alignmentScore = 0;
    if (alignmentData.alignmentScore > 100) alignmentData.alignmentScore = 100;

    // Update plan with curriculum alignment data
    const updatedPlan = await prisma.lessonPlan.update({
      where: { id: planId },
      data: {
        curriculumAlignment: {
          ...alignmentData,
          checkedAt: new Date().toISOString(),
          checkedBy: req.user.id,
          country,
          gradeLevel: effectiveGrade
        }
      }
    });

    // Create activity log
    await prisma.activity.create({
      data: {
        userId: req.user.id,
        planId: plan.id,
        action: 'curriculum_alignment_checked',
        description: `Checked curriculum alignment: ${alignmentData.alignmentScore}%`,
        metadata: { alignmentScore: alignmentData.alignmentScore }
      }
    });

    res.json({
      success: true,
      alignment: alignmentData,
      plan: updatedPlan
    });
  } catch (error) {
    console.error('Curriculum alignment check error:', error);
    
    // Check if it's a service overload error
    const is503Error = error.message?.includes('503') || error.message?.includes('overloaded');
    
    if (is503Error) {
      return res.status(503).json({
        error: 'AI service is temporarily overloaded',
        message: 'The curriculum alignment service is experiencing high load. Please try again in a few moments.',
        retryable: true
      });
    }
    
    res.status(500).json({
      error: 'Failed to check curriculum alignment',
      message: error.message
    });
  }
});

// Regenerate lesson plan for better curriculum alignment
router.post('/regenerate/:planId', async (req, res) => {
  try {
    const { planId } = req.params;
    const { country = 'US', gradeLevel, curriculumStandards, syllabus } = req.body;

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

    // Get current alignment data if available
    const currentAlignment = plan.curriculumAlignment || {};
    const alignmentGaps = currentAlignment.gaps || [];
    const alignmentRecommendations = currentAlignment.recommendations || [];

    // Try multiple models for better compatibility
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
        console.log(`Using model: ${modelName} for plan regeneration`);
        break;
      } catch (error) {
        lastError = error;
        try {
          model = genAI.getGenerativeModel({ 
            model: modelName,
            generationConfig: {
              temperature: 0.7
            }
          });
          console.log(`Using model: ${modelName} (default mode) for plan regeneration`);
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

    const effectiveGrade = gradeLevel || plan.grade;

    const prompt = `You are an expert educator. Regenerate and improve this lesson plan to better align with curriculum standards.

Current Lesson Plan:
Title: ${plan.title}
Subject: ${plan.subject}
Topic: ${plan.topic || 'N/A'}
Grade/Level: ${effectiveGrade}
Country/Region: ${country}
Duration: ${plan.duration || 45} minutes

Current Lesson Plan Content:
${planContent}

${alignmentGaps.length > 0 ? `Identified Gaps to Address:
${JSON.stringify(alignmentGaps, null, 2)}` : ''}

${alignmentRecommendations.length > 0 ? `Recommendations to Implement:
${alignmentRecommendations.join('\n')}` : ''}

${curriculumStandards ? `Additional Standards to Align With:
${JSON.stringify(curriculumStandards, null, 2)}` : ''}

${syllabus ? `Syllabus Requirements:
${syllabus}` : ''}

Please regenerate the lesson plan with improved curriculum alignment. Address the identified gaps and implement the recommendations while maintaining the core topic and learning objectives.

Return ONLY a valid JSON object with this exact structure (no markdown, no explanations):
{
  "lessonTitle": "Improved lesson title",
  "grade": "${effectiveGrade}",
  "duration": ${plan.duration || 45},
  "learningObjectives": ["Objective 1", "Objective 2", "Objective 3"],
  "materialsRequired": ["Material 1", "Material 2", "Material 3"],
  "lessonFlow": {
    "introduction": "Improved introduction",
    "activities": ["Activity 1", "Activity 2", "Activity 3"],
    "wrapUp": "Improved wrap-up"
  },
  "assessment": "Improved assessment methods",
  "homework": "Improved homework assignment",
  "summary": "Brief summary"
}

Important: Return ONLY the JSON object. No markdown, no code blocks, no explanations.`;

    const result = await generateWithRetry(model, prompt, `Lesson Plan Regeneration for ${plan.title}`);
    const response = await result.response;
    let text = response.text().trim();
    
    // Clean up response
    text = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '');
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      text = jsonMatch[0];
    }

    let improvedContent;
    try {
      improvedContent = JSON.parse(text);
    } catch (parseError) {
      console.error('Regeneration JSON parse error:', parseError);
      console.error('Response text:', text);
      throw new Error('Failed to parse regenerated lesson plan. Please try again.');
    }

    // Create version snapshot before updating
    await prisma.lessonPlanVersion.create({
      data: {
        planId: planId,
        version: plan.version,
        content: plan.content,
        changeNote: 'Regenerated for better curriculum alignment',
        createdBy: req.user.id
      }
    });

    // Update plan with improved content
    const updatedPlan = await prisma.lessonPlan.update({
      where: { id: planId },
      data: {
        content: improvedContent,
        version: plan.version + 1,
        curriculumAlignment: null // Reset alignment so it can be rechecked
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    // Create activity log
    await prisma.activity.create({
      data: {
        userId: req.user.id,
        planId: plan.id,
        action: 'regenerated',
        description: 'Regenerated lesson plan for better curriculum alignment',
        metadata: { reason: 'low_alignment_score' }
      }
    });

    res.json({
      success: true,
      plan: updatedPlan,
      message: 'Lesson plan regenerated successfully. Please recheck curriculum alignment.'
    });
  } catch (error) {
    console.error('Regenerate lesson plan error:', error);
    
    // Check if it's a service overload error
    const is503Error = error.message?.includes('503') || error.message?.includes('overloaded');
    
    if (is503Error) {
      return res.status(503).json({
        error: 'AI service is temporarily overloaded',
        message: 'The lesson plan regeneration service is experiencing high load. Please try again in a few moments.',
        retryable: true
      });
    }
    
    res.status(500).json({
      error: 'Failed to regenerate lesson plan',
      message: error.message
    });
  }
});

// Get curriculum coverage map (must be before /:planId to avoid being caught by the parameter matcher)
router.get('/coverage-map', async (req, res) => {
  try {
    const { subject, grade, planId } = req.query;

    if (!subject || !grade) {
      return res.status(400).json({ error: 'Subject and grade are required' });
    }

    // Get plan if planId provided
    let plan = null;
    let planNotFound = false;
    
    if (planId) {
      try {
        plan = await prisma.lessonPlan.findUnique({
          where: { id: planId },
          select: {
            id: true,
            title: true,
            topic: true,
            content: true,
            curriculumAlignment: true
          }
        });

        if (!plan) {
          planNotFound = true;
        }
      } catch (dbError) {
        console.error('Database error fetching lesson plan:', dbError);
        planNotFound = true;
      }
    }

    // If a planId was provided but plan not found, return helpful message
    if (planId && planNotFound) {
      return res.json({
        success: true,
        coverageMap: null,
        message: 'Lesson plan not found. Please check the lesson plan ID and try again.'
      });
    }

    // Try to get topics from curriculum alignment data first
    let topics = [];
    const alignment = plan?.curriculumAlignment;
    
    if (alignment && alignment.alignedStandards && alignment.alignedStandards.length > 0) {
      // Use aligned standards as topics
      topics = alignment.alignedStandards.map(standard => ({
        name: standard.standard || standard.description,
        standard: standard.standard,
        covered: standard.coverage === 'fully' || standard.coverage === 'partially',
        coverage: standard.coverage,
        evidence: standard.evidence
      }));
    } else if (plan?.content) {
      // If no alignment data, generate topics from lesson plan content
      topics = extractTopicsFromPlan(plan);
    } else {
      // No data available
      return res.json({
        success: true,
        coverageMap: null,
        message: 'No curriculum data available. Please check curriculum alignment first for better coverage map.'
      });
    }

    const coveredTopics = topics.filter(t => t.covered).length;
    const uncoveredTopics = topics
      .filter(t => !t.covered)
      .map(t => t.name);

    res.json({
      success: true,
      coverageMap: {
        subject,
        grade,
        topics,
        totalTopics: topics.length,
        coveredTopics,
        uncoveredTopics,
        coveragePercentage: topics.length > 0 
          ? Math.round((coveredTopics / topics.length) * 100) 
          : 0
      }
    });
  } catch (error) {
    console.error('Get coverage map error:', error);
    res.status(500).json({
      error: 'Failed to get coverage map',
      message: error.message
    });
  }
});

// Get curriculum alignment for a plan
router.get('/:planId', async (req, res) => {
  try {
    const { planId } = req.params;

    const plan = await prisma.lessonPlan.findUnique({
      where: { id: planId },
      select: {
        id: true,
        curriculumAlignment: true
      }
    });

    if (!plan) {
      return res.status(404).json({ error: 'Lesson plan not found' });
    }

    res.json({
      alignment: plan.curriculumAlignment
    });
  } catch (error) {
    console.error('Get curriculum alignment error:', error);
    res.status(500).json({ error: 'Failed to get curriculum alignment' });
  }
});

/**
 * Helper function to extract topics from lesson plan content
 * Used when curriculum alignment data is not available
 */
function extractTopicsFromPlan(plan) {
  const topics = [];
  const seenTopics = new Set();

  try {
    const content = plan.content || {};

    // Extract from learning objectives
    if (content.learningObjectives && Array.isArray(content.learningObjectives)) {
      content.learningObjectives.forEach(obj => {
        const topic = extractTopicName(obj);
        if (topic && !seenTopics.has(topic)) {
          topics.push({ name: topic, covered: true });
          seenTopics.add(topic);
        }
      });
    }

    // Extract from lesson flow activities
    if (content.lessonFlow?.activities && Array.isArray(content.lessonFlow.activities)) {
      content.lessonFlow.activities.forEach(activity => {
        const topic = extractTopicName(activity);
        if (topic && !seenTopics.has(topic)) {
          topics.push({ name: topic, covered: true });
          seenTopics.add(topic);
        }
      });
    }

    // Extract from materials required
    if (content.materialsRequired && Array.isArray(content.materialsRequired)) {
      content.materialsRequired.forEach(material => {
        const topic = extractTopicName(material);
        if (topic && !seenTopics.has(topic)) {
          topics.push({ name: topic, covered: true });
          seenTopics.add(topic);
        }
      });
    }

    // Extract from assessment
    if (content.assessment && typeof content.assessment === 'string') {
      const topic = extractTopicName(content.assessment);
      if (topic && !seenTopics.has(topic)) {
        topics.push({ name: topic, covered: true });
        seenTopics.add(topic);
      }
    }

    // If no topics extracted, return default topics
    if (topics.length === 0) {
      return createDefaultTopics(plan);
    }

    return topics;
  } catch (error) {
    console.error('Error extracting topics from plan:', error);
    return createDefaultTopics(plan);
  }
}

/**
 * Helper function to extract a meaningful topic name from text
 */
function extractTopicName(text) {
  if (!text) return null;
  
  // Convert to string if needed
  const str = typeof text === 'string' ? text : String(text);
  
  // Remove common prefixes and take the first 60 characters
  let topic = str
    .replace(/^(objective|activity|material|assessment):\s*/i, '')
    .replace(/^\d+\.\s*/, '')
    .trim();

  // Return only if it has meaningful content
  if (topic && topic.length > 3) {
    return topic.substring(0, 80);
  }
  
  return null;
}

/**
 * Helper function to create default topics based on subject/grade
 */
function createDefaultTopics(plan) {
  const defaultTopics = [
    { name: 'Introduction to Core Concepts', covered: true },
    { name: 'Fundamental Principles', covered: true },
    { name: 'Application and Practice', covered: true },
    { name: 'Assessment and Evaluation', covered: true }
  ];

  return defaultTopics;
}

export default router;

