import express from 'express';
import { body, validationResult } from 'express-validator';
import { PrismaClient } from '@prisma/client';
import { authorizeRoles } from '../middleware/auth.js';
import { generateLessonPlanPDF } from '../utils/pdfGenerator.js';
import { generateLessonPlanPPT } from '../utils/pptGenerator.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = express.Router();
const prisma = new PrismaClient();

// Initialize AI for quiz and question paper generation
const getApiKey = () => {
  return process.env.GEMINI_API_KEY || "AIzaSyDEIGf1uBs5sjn-zt0e3pBjgmBt5NrGM2s";
};

let genAI;
try {
  const apiKey = getApiKey();
  if (apiKey) {
    genAI = new GoogleGenerativeAI(apiKey);
  }
} catch (error) {
  console.error('Failed to initialize GoogleGenerativeAI:', error);
}

const getModel = () => {
  if (!genAI) {
    throw new Error('GoogleGenerativeAI not initialized');
  }
  const modelNames = [
    'gemini-2.5-flash',           // Latest stable flash (most compatible)
    'gemini-2.5-pro',              // Latest stable pro
    'gemini-2.0-flash',            // Stable 2.0 flash
    'gemini-flash-latest',         // Latest flash alias
    'gemini-pro-latest',          // Latest pro alias
    'gemini-2.5-flash-lite',       // Lite version
    'gemini-2.0-flash-exp',        // Experimental version
    'gemini-2.5-pro-preview-03-25', // Preview version
    'gemini-2.5-flash-preview-05-20' // Preview version
  ];
  
  let lastError = null;
  for (const modelName of modelNames) {
    try {
      // Try with JSON mode first
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: {
            temperature: 0.7,
            responseMimeType: 'application/json'
          }
        });
        console.log(`Successfully initialized model: ${modelName} with JSON mode`);
        return model;
      } catch (jsonError) {
        // If JSON mode fails, try without JSON mode
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: {
            temperature: 0.7
          }
        });
        console.log(`Successfully initialized model: ${modelName} (default mode)`);
        return model;
      }
    } catch (error) {
      lastError = error;
      console.warn(`Failed to initialize ${modelName}:`, error.message);
      continue;
    }
  }
  
  throw new Error(`Failed to initialize any Gemini model. Last error: ${lastError?.message || 'Unknown error'}. Please check your API key and model access.`);
};

// Get all lesson plans (filtered by user role)
router.get('/', async (req, res) => {
  try {
    const { status, subject, grade, page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    
    // Teachers can see their own plans + plans they're collaborating on
    if (req.user.role === 'teacher') {
      where.OR = [
        { creatorId: req.user.id }, // Plans they created
        {
          collaborators: {
            some: {
              userId: req.user.id
            }
          }
        } // Plans they're collaborating on
      ];
    }

    if (status) {
      where.status = status;
    }
    if (subject) {
      where.subject = subject;
    }
    if (grade) {
      where.grade = grade;
    }

    const [plans, total] = await Promise.all([
      prisma.lessonPlan.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { updatedAt: 'desc' },
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          approvals: {
            include: {
              reviewer: {
                select: {
                  id: true,
                  name: true
                }
              }
            },
            orderBy: { createdAt: 'desc' },
            take: 1
          }
        }
      }),
      prisma.lessonPlan.count({ where })
    ]);

    res.json({
      plans,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get lesson plans error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single lesson plan
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const plan = await prisma.lessonPlan.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        },
        versions: {
          orderBy: { version: 'desc' }
        },
        approvals: {
          include: {
            reviewer: {
              select: {
                id: true,
                name: true,
                role: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        collaborators: {
          where: { userId: req.user.id },
          select: { role: true }
        }
      }
    });

    if (!plan) {
      return res.status(404).json({ error: 'Lesson plan not found' });
    }

    // Check permissions
    if (req.user.role === 'teacher') {
      const isCreator = plan.creatorId === req.user.id;
      const isCollaborator = plan.collaborators.length > 0;
      
      if (!isCreator && !isCollaborator) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    res.json({ plan });
  } catch (error) {
    console.error('Get lesson plan error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create lesson plan
router.post('/', [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('subject').trim().notEmpty().withMessage('Subject is required'),
  body('grade').trim().notEmpty().withMessage('Grade is required'),
  body('content').notEmpty().withMessage('Content is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, subject, topic, grade, duration, content } = req.body;

    // Convert duration to integer if it's a string
    const durationInt = duration ? parseInt(duration, 10) : null;

    const plan = await prisma.lessonPlan.create({
      data: {
        title,
        subject,
        topic,
        grade,
        duration: durationInt,
        content,
        creatorId: req.user.id
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    // Create activity log
    await prisma.activity.create({
      data: {
        userId: req.user.id,
        planId: plan.id,
        action: 'created',
        description: `Created lesson plan: ${title}`
      }
    });

    res.status(201).json({ plan });
  } catch (error) {
    console.error('Create lesson plan error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update lesson plan
router.put('/:id', [
  body('title').optional().trim().notEmpty(),
  body('subject').optional().trim().notEmpty(),
  body('grade').optional().trim().notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { title, subject, topic, grade, duration, content, changeNote } = req.body;

    // Convert duration to integer if it's a string
    const durationInt = duration ? parseInt(duration, 10) : null;

    // Check if plan exists and user has permission
    const existingPlan = await prisma.lessonPlan.findUnique({
      where: { id },
      include: {
        collaborators: {
          where: { userId: req.user.id },
          select: { role: true }
        }
      }
    });

    if (!existingPlan) {
      return res.status(404).json({ error: 'Lesson plan not found' });
    }

    // Check permissions for teachers
    if (req.user.role === 'teacher') {
      const isCreator = existingPlan.creatorId === req.user.id;
      const isCollaboratorEditor = existingPlan.collaborators.length > 0 && existingPlan.collaborators[0].role === 'editor';
      
      if (!isCreator && !isCollaboratorEditor) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    // Create version snapshot before updating
    await prisma.lessonPlanVersion.create({
      data: {
        planId: id,
        version: existingPlan.version,
        content: existingPlan.content,
        changeNote: changeNote || 'Updated',
        createdBy: req.user.id
      }
    });

    // Update plan
    const plan = await prisma.lessonPlan.update({
      where: { id },
      data: {
        title,
        subject,
        topic,
        grade,
        duration: durationInt,
        content,
        version: existingPlan.version + 1
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    // Create activity log
    await prisma.activity.create({
      data: {
        userId: req.user.id,
        planId: plan.id,
        action: 'updated',
        description: `Updated lesson plan: ${plan.title}`,
        metadata: { version: plan.version }
      }
    });

    res.json({ plan });
  } catch (error) {
    console.error('Update lesson plan error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete lesson plan
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const plan = await prisma.lessonPlan.findUnique({
      where: { id }
    });

    if (!plan) {
      return res.status(404).json({ error: 'Lesson plan not found' });
    }

    if (req.user.role === 'teacher' && plan.creatorId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await prisma.lessonPlan.delete({
      where: { id }
    });

    // Create activity log
    await prisma.activity.create({
      data: {
        userId: req.user.id,
        action: 'deleted',
        description: `Deleted lesson plan: ${plan.title}`
      }
    });

    res.json({ message: 'Lesson plan deleted successfully' });
  } catch (error) {
    console.error('Delete lesson plan error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Submit for approval
router.post('/:id/submit', async (req, res) => {
  try {
    const { id } = req.params;

    const plan = await prisma.lessonPlan.findUnique({
      where: { id }
    });

    if (!plan) {
      return res.status(404).json({ error: 'Lesson plan not found' });
    }

    if (plan.creatorId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const updatedPlan = await prisma.lessonPlan.update({
      where: { id },
      data: { status: 'submitted' }
    });

    // Create activity log
    await prisma.activity.create({
      data: {
        userId: req.user.id,
        planId: plan.id,
        action: 'submitted',
        description: `Submitted lesson plan for approval: ${plan.title}`
      }
    });

    res.json({ plan: updatedPlan, message: 'Lesson plan submitted for approval' });
  } catch (error) {
    console.error('Submit lesson plan error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Revert to version
router.post('/:id/revert/:version', async (req, res) => {
  try {
    const { id, version } = req.params;

    const plan = await prisma.lessonPlan.findUnique({
      where: { id },
      include: {
        collaborators: {
          where: { userId: req.user.id },
          select: { role: true }
        }
      }
    });

    if (!plan) {
      return res.status(404).json({ error: 'Lesson plan not found' });
    }

    // Check permissions for teachers
    if (req.user.role === 'teacher') {
      const isCreator = plan.creatorId === req.user.id;
      const isCollaboratorEditor = plan.collaborators.length > 0 && plan.collaborators[0].role === 'editor';
      
      if (!isCreator && !isCollaboratorEditor) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    const versionRecord = await prisma.lessonPlanVersion.findFirst({
      where: {
        planId: id,
        version: parseInt(version)
      }
    });

    if (!versionRecord) {
      return res.status(404).json({ error: 'Version not found' });
    }

    // Create new version from the reverted version
    await prisma.lessonPlanVersion.create({
      data: {
        planId: id,
        version: plan.version + 1,
        content: versionRecord.content,
        changeNote: `Reverted to version ${version}`,
        createdBy: req.user.id
      }
    });

    const updatedPlan = await prisma.lessonPlan.update({
      where: { id },
      data: {
        content: versionRecord.content,
        version: plan.version + 1
      }
    });

    // Create activity log
    await prisma.activity.create({
      data: {
        userId: req.user.id,
        planId: plan.id,
        action: 'reverted',
        description: `Reverted lesson plan to version ${version}`
      }
    });

    res.json({ plan: updatedPlan, message: 'Lesson plan reverted successfully' });
  } catch (error) {
    console.error('Revert lesson plan error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Export lesson plan as PDF
router.get('/:id/export/pdf', async (req, res) => {
  try {
    const { id } = req.params;

    const plan = await prisma.lessonPlan.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!plan) {
      return res.status(404).json({ error: 'Lesson plan not found' });
    }

    // Check permissions
    if (req.user.role === 'teacher' && plan.creatorId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const pdf = await generateLessonPlanPDF(plan);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${plan.title.replace(/[^a-z0-9]/gi, '_')}.pdf"`);
    res.send(pdf);
  } catch (error) {
    console.error('PDF export error:', error);
    res.status(500).json({ error: 'Failed to generate PDF', message: error.message });
  }
});

// Generate PPT for lesson plan
router.get('/:id/export/ppt', async (req, res) => {
  try {
    const { id } = req.params;

    const plan = await prisma.lessonPlan.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!plan) {
      return res.status(404).json({ error: 'Lesson plan not found' });
    }

    // Check permissions
    if (req.user.role === 'teacher' && plan.creatorId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const pptx = generateLessonPlanPPT(plan);
    const pptxBuffer = await pptx.write({ outputType: 'nodebuffer' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
    res.setHeader('Content-Disposition', `attachment; filename="${plan.title.replace(/[^a-z0-9]/gi, '_')}.pptx"`);
    res.send(pptxBuffer);
  } catch (error) {
    console.error('PPT export error:', error);
    res.status(500).json({ error: 'Failed to generate PPT', message: error.message });
  }
});

// Generate quiz based on lesson plan
router.post('/:id/generate/quiz', async (req, res) => {
  try {
    const { id } = req.params;
    const { numberOfQuestions = 10, difficulty = 'medium' } = req.body;

    const plan = await prisma.lessonPlan.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            name: true
          }
        }
      }
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

    const model = getModel();
    
    const prompt = `You are an expert educator. Generate a quiz based on the following lesson plan.

Lesson Plan Details:
- Title: ${plan.title}
- Subject: ${plan.subject}
- Grade: ${plan.grade}
- Topic: ${plan.topic || 'N/A'}

Lesson Content:
${JSON.stringify(plan.content, null, 2)}

Generate a quiz with ${numberOfQuestions} questions at ${difficulty} difficulty level.

Return ONLY a valid JSON object with this exact structure (no markdown, no explanations):
{
  "title": "Quiz Title",
  "subject": "${plan.subject}",
  "grade": "${plan.grade}",
  "difficulty": "${difficulty}",
  "questions": [
    {
      "questionNumber": 1,
      "question": "Question text here",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Explanation of the correct answer"
    }
  ],
  "totalMarks": ${numberOfQuestions * 1}
}

Important: Return ONLY the JSON object. No markdown, no code blocks, no explanations.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text().trim();
    
    // Clean up the response
    text = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '');
    text = text.trim();
    
    // Extract JSON
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      text = jsonMatch[0];
    }

    let quiz;
    try {
      quiz = JSON.parse(text);
    } catch (parseError) {
      console.error('Quiz JSON parse error:', parseError);
      console.error('Response text:', text);
      throw new Error('Failed to parse quiz response. The AI may have returned invalid JSON.');
    }

    res.json({
      success: true,
      quiz
    });
  } catch (error) {
    console.error('Quiz generation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate quiz', 
      message: error.message 
    });
  }
});

// Generate question paper based on lesson plan
router.post('/:id/generate/question-paper', async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      totalMarks = 50, 
      difficulty = 'medium',
      includeMultipleChoice = true,
      includeShortAnswer = true,
      includeLongAnswer = true
    } = req.body;

    const plan = await prisma.lessonPlan.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            name: true
          }
        }
      }
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

    const model = getModel();
    
    const prompt = `You are an expert educator. Generate a comprehensive question paper based on the following lesson plan.

Lesson Plan Details:
- Title: ${plan.title}
- Subject: ${plan.subject}
- Grade: ${plan.grade}
- Topic: ${plan.topic || 'N/A'}

Lesson Content:
${JSON.stringify(plan.content, null, 2)}

Generate a question paper with the following specifications:
- Total Marks: ${totalMarks}
- Difficulty Level: ${difficulty}
- Include Multiple Choice Questions: ${includeMultipleChoice}
- Include Short Answer Questions: ${includeShortAnswer}
- Include Long Answer Questions: ${includeLongAnswer}

Return ONLY a valid JSON object with this exact structure (no markdown, no explanations):
{
  "title": "Question Paper Title",
  "subject": "${plan.subject}",
  "grade": "${plan.grade}",
  "totalMarks": ${totalMarks},
  "duration": "90 minutes",
  "instructions": "General instructions for students",
  "sections": [
    {
      "sectionName": "Section A - Multiple Choice",
      "sectionType": "multipleChoice",
      "marks": 10,
      "questions": [
        {
          "questionNumber": 1,
          "question": "Question text here",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "correctAnswer": 0,
          "marks": 1
        }
      ]
    },
    {
      "sectionName": "Section B - Short Answer",
      "sectionType": "shortAnswer",
      "marks": 15,
      "questions": [
        {
          "questionNumber": 1,
          "question": "Question text here",
          "marks": 3,
          "expectedAnswer": "Expected answer points"
        }
      ]
    },
    {
      "sectionName": "Section C - Long Answer",
      "sectionType": "longAnswer",
      "marks": 25,
      "questions": [
        {
          "questionNumber": 1,
          "question": "Question text here",
          "marks": 10,
          "expectedAnswer": "Expected answer points"
        }
      ]
    }
  ],
  "answerKey": {
    "sectionA": [
      {
        "questionNumber": 1,
        "correctAnswer": "A",
        "explanation": "Explanation"
      }
    ]
  }
}

Important: Return ONLY the JSON object. No markdown, no code blocks, no explanations.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text().trim();
    
    // Clean up the response
    text = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '');
    text = text.trim();
    
    // Extract JSON
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      text = jsonMatch[0];
    }

    const questionPaper = JSON.parse(text);

    res.json({
      success: true,
      questionPaper
    });
  } catch (error) {
    console.error('Question paper generation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate question paper', 
      message: error.message 
    });
  }
});

export default router;

