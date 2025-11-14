import express from 'express';
import { PrismaClient } from '@prisma/client';
import { predictHealthScoreWithFallback } from '../utils/healthScorePredictor.js';

const router = express.Router();
const prisma = new PrismaClient();

// Middleware to get user from request (set by authenticateToken)
router.use((req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
});

// Calculate health score for a lesson plan
router.post('/calculate/:planId', async (req, res) => {
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

    console.log(`📊 Calculating health score for plan: ${plan.title}`);

    // Prepare lesson plan data for prediction
    const lessonData = {
      title: plan.title,
      subject: plan.subject,
      topic: plan.topic || '',
      grade: plan.grade,
      duration: plan.duration || 45,
      content: typeof plan.content === 'object' ? plan.content : {},
      objectives: plan.objectives || [],
      materials: plan.materials || [],
      activities: plan.activities || [],
      assessments: plan.assessments || [],
      differentiation: plan.differentiation || []
    };

    // Use ML model for prediction
    const prediction = await predictHealthScoreWithFallback(lessonData);

    console.log(`✅ Health Score: ${prediction.score}/10 (Source: ${prediction.source || 'ML Model'})`);

    // Update plan with health score
    const updatedPlan = await prisma.lessonPlan.update({
      where: { id: planId },
      data: {
        healthScore: prediction.score,
        healthScoreDetails: {
          score: prediction.score,
          features: prediction.features,
          reasoning: prediction.reasoning,
          source: prediction.source || 'ml_model',
          calculatedAt: new Date().toISOString()
        }
      }
    });

    // Create activity log
    try {
      await prisma.activity.create({
        data: {
          userId: req.user.id,
          planId: plan.id,
          action: 'health_score_calculated',
          description: `Calculated health score: ${prediction.score}/10 (${prediction.source || 'ML Model'})`,
          metadata: { 
            score: prediction.score,
            source: prediction.source || 'ml_model'
          }
        }
      });
    } catch (logError) {
      console.warn('Failed to create activity log:', logError.message);
      // Don't fail the whole request if logging fails
    }

    res.json({
      success: true,
      healthScore: prediction.score,
      source: prediction.source || 'ml_model',
      features: prediction.features,
      reasoning: prediction.reasoning,
      plan: updatedPlan
    });

  } catch (error) {
    console.error('Calculate health score error:', error);
    res.status(500).json({
      error: 'Failed to calculate health score',
      message: error.message
    });
  }
});

// Get health score for a plan
router.get('/:planId', async (req, res) => {
  try {
    const { planId } = req.params;

    const plan = await prisma.lessonPlan.findUnique({
      where: { id: planId },
      select: {
        id: true,
        healthScore: true,
        healthScoreDetails: true
      }
    });

    if (!plan) {
      return res.status(404).json({ error: 'Lesson plan not found' });
    }

    res.json({
      healthScore: plan.healthScore,
      details: plan.healthScoreDetails
    });
  } catch (error) {
    console.error('Get health score error:', error);
    res.status(500).json({ error: 'Failed to get health score' });
  }
});

export default router;

