/**
 * Health Score Predictor - Node.js Integration
 * Calls Python ML model via child process for health score prediction
 * 
 * Usage:
 *   import { predictHealthScore } from './utils/healthScorePredictor.js';
 *   
 *   const lessonPlan = { ... };
 *   const result = await predictHealthScore(lessonPlan);
 *   console.log(result.score); // 8.5
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to Python bridge script
const PYTHON_BRIDGE = path.join(__dirname, '../../ml-model/node_bridge.py');
const PYTHON_EXECUTABLE = process.env.PYTHON_PATH || 'C:\\Users\\User\\AppData\\Local\\Programs\\Python\\Python312\\python.exe';

/**
 * Call Python prediction model
 * @param {Object} lessonPlan - Lesson plan data
 * @returns {Promise<Object>} - Prediction result with score and reasoning
 */
export async function predictHealthScore(lessonPlan) {
  return new Promise((resolve, reject) => {
    try {
      // Spawn Python process
      const pythonProcess = spawn(PYTHON_EXECUTABLE, [PYTHON_BRIDGE], {
        cwd: 'c:\\Users\\User\\Desktop\\PrepSmart-C\\ml-model',
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let result = '';
      let error = '';
      let timeout;

      // Handle spawn errors
      pythonProcess.on('error', (err) => {
        clearTimeout(timeout);
        console.error('Failed to spawn Python process:', err.message);
        reject(new Error(`Failed to spawn Python: ${err.message}`));
      });

      // Handle stdout
      pythonProcess.stdout.on('data', (data) => {
        result += data.toString();
      });

      // Handle stderr
      pythonProcess.stderr.on('data', (data) => {
        error += data.toString();
      });

      // Handle process completion
      pythonProcess.on('close', (code) => {
        clearTimeout(timeout);
        const elapsed = Date.now() - startTime;
        console.log(`✅ Python process completed in ${elapsed}ms (code: ${code})`);
        if (result) console.log(`Python stdout: ${result.substring(0, 500)}`);
        if (error) console.log(`Python stderr: ${error.substring(0, 500)}`);
        
        if (code !== 0) {
          console.error('Python process error:', error);
          reject(new Error(`Python process exited with code ${code}: ${error}`));
          return;
        }

        try {
          const prediction = JSON.parse(result);
          if (prediction.error) {
            reject(new Error(prediction.error));
          } else {
            resolve(prediction);
          }
        } catch (parseError) {
          console.error('Failed to parse Python output:', result);
          reject(parseError);
        }
      });

      // Set timeout for Python process (120s to allow model loading)
      const startTime = Date.now();
      console.log('🐍 Spawning Python process...');
      timeout = setTimeout(() => {
        pythonProcess.kill();
        reject(new Error('Python process timeout after 120 seconds'));
      }, 120000);

      // Send lesson plan as JSON to Python
      pythonProcess.stdin.write(JSON.stringify(lessonPlan));
      pythonProcess.stdin.end();

    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Predict health score for multiple lesson plans
 * @param {Array} lessonPlans - Array of lesson plan objects
 * @returns {Promise<Array>} - Array of prediction results
 */
export async function predictHealthScoreBatch(lessonPlans) {
  const predictions = await Promise.all(
    lessonPlans.map(plan => predictHealthScore(plan))
  );
  return predictions;
}

/**
 * Fallback: Use Gemini API if Python model fails
 * @param {Object} lessonPlan - Lesson plan data
 * @returns {Promise<number>} - Fallback health score
 */
export async function predictHealthScoreWithFallback(lessonPlan) {
  try {
    const prediction = await predictHealthScore(lessonPlan);
    console.log(`✅ ML Model Score: ${prediction.score}`);
    return {
      ...prediction,
      source: 'ml_model'
    };
  } catch (error) {
    console.warn('⚠️  ML Model failed, using fallback:', error.message);
    
    // Fallback: use simple rule-based scoring
    return fallbackHealthScore(lessonPlan);
  }
}

/**
 * Simple fallback scoring (no ML required)
 * @param {Object} lessonPlan - Lesson plan data
 * @returns {Object} - Score and features
 */
function fallbackHealthScore(lessonPlan) {
  let score = 5; // Base score

  // Add points for components
  if (lessonPlan.objectives?.length >= 3) score += 1.5;
  if (lessonPlan.materials?.length >= 2) score += 1;
  if (lessonPlan.activities?.length >= 2) score += 1.5;
  if (lessonPlan.assessments?.length >= 2) score += 1;
  if (lessonPlan.differentiation?.length > 0) score += 1;

  score = Math.max(1, Math.min(10, score));

  return {
    score: parseFloat(score.toFixed(1)),
    features: {
      num_objectives: lessonPlan.objectives?.length || 0,
      num_materials: lessonPlan.materials?.length || 0,
      num_activities: lessonPlan.activities?.length || 0,
      num_assessments: lessonPlan.assessments?.length || 0,
      has_differentiation: lessonPlan.differentiation?.length > 0 ? 1 : 0,
    },
    reasoning: ['Fallback scoring used (Python model unavailable)'],
    source: 'fallback'
  };
}

export default {
  predictHealthScore,
  predictHealthScoreBatch,
  predictHealthScoreWithFallback,
  fallbackHealthScore
};
