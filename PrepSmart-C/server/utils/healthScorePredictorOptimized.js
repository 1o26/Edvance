/**
 * Health Score Predictor - Optimized Version
 * Keeps Python process persistent for ~10x faster predictions
 * First prediction: ~1.5s (model loads once)
 * Subsequent predictions: <100ms each
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to Python bridge script
const PYTHON_BRIDGE = path.join(__dirname, '../../ml-model/node_bridge_persistent.py');
const PYTHON_EXECUTABLE = process.env.PYTHON_PATH || 'C:\\Users\\User\\AppData\\Local\\Programs\\Python\\Python312\\python.exe';

// Global persistent Python process
let pythonProcess = null;
let processReady = false;
let messageQueue = [];
let requestId = 0;
const pendingRequests = new Map();

/**
 * Start and maintain persistent Python process
 */
export function initializePythonProcess() {
  if (pythonProcess) return Promise.resolve();

  return new Promise((resolve, reject) => {
    try {
      console.log('🚀 Starting persistent Python process for health score predictions...');
      
      pythonProcess = spawn(PYTHON_EXECUTABLE, [PYTHON_BRIDGE], {
        cwd: 'c:\\Users\\User\\Desktop\\PrepSmart-C\\ml-model',
        stdio: ['pipe', 'pipe', 'pipe'],
        detached: false
      });

      let startupOutput = '';

      // Handle startup
      pythonProcess.stdout.once('data', (data) => {
        startupOutput = data.toString();
        if (startupOutput.includes('READY')) {
          console.log('✅ Python process initialized and ready!');
          processReady = true;
          
          // Process any queued messages
          while (messageQueue.length > 0) {
            const msg = messageQueue.shift();
            sendToPython(msg);
          }
          
          resolve();
        }
      });

      // Handle stdout continuously
      pythonProcess.stdout.on('data', (data) => {
        const responses = data.toString().trim().split('\n').filter(l => l);
        responses.forEach(response => {
          try {
            const msg = JSON.parse(response);
            if (msg.id !== undefined && pendingRequests.has(msg.id)) {
              const { resolve: resolveFn } = pendingRequests.get(msg.id);
              pendingRequests.delete(msg.id);
              resolveFn(msg);
            }
          } catch (e) {
            console.error('Failed to parse Python response:', response);
          }
        });
      });

      // Handle errors
      pythonProcess.stderr.on('data', (data) => {
        console.error('🔴 Python stderr:', data.toString());
      });

      // Handle process exit
      pythonProcess.on('close', (code) => {
        console.error('⚠️ Python process died with code:', code);
        pythonProcess = null;
        processReady = false;
        
        // Reject all pending requests
        pendingRequests.forEach(({ reject }) => {
          reject(new Error('Python process terminated'));
        });
        pendingRequests.clear();
      });

      pythonProcess.on('error', (err) => {
        console.error('🔴 Python process error:', err);
        reject(err);
      });

      // Timeout for initialization
      setTimeout(() => {
        if (!processReady) {
          pythonProcess?.kill();
          reject(new Error('Python process initialization timeout (>15 seconds)'));
        }
      }, 15000);

    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Send message to persistent Python process
 */
function sendToPython(message) {
  if (!pythonProcess) {
    throw new Error('Python process not initialized');
  }
  
  if (!processReady) {
    messageQueue.push(message);
    return;
  }

  pythonProcess.stdin.write(JSON.stringify(message) + '\n');
}

/**
 * Make prediction with persistent Python process
 */
export async function predictHealthScoreOptimized(lessonPlan) {
  try {
    // Initialize process if needed
    if (!pythonProcess) {
      await initializePythonProcess();
    }

    // Create request with unique ID
    const id = ++requestId;
    const request = {
      id,
      lesson_plan: lessonPlan
    };

    // Send to Python
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        pendingRequests.delete(id);
        reject(new Error('Prediction timeout after 30 seconds'));
      }, 30000);

      pendingRequests.set(id, {
        resolve: (response) => {
          clearTimeout(timeout);
          if (response.error) {
            reject(new Error(response.error));
          } else {
            resolve(response.result);
          }
        },
        reject: (error) => {
          clearTimeout(timeout);
          reject(error);
        }
      });

      sendToPython(request);
    });

  } catch (error) {
    console.error('Prediction error:', error);
    throw error;
  }
}

/**
 * Gracefully shutdown Python process
 */
export function shutdownPythonProcess() {
  if (pythonProcess) {
    console.log('Shutting down Python process...');
    pythonProcess.kill();
    pythonProcess = null;
    processReady = false;
  }
}

/**
 * Predict health score with fallback
 */
export async function predictHealthScoreWithFallback(lessonPlan) {
  try {
    const startTime = Date.now();
    const prediction = await predictHealthScoreOptimized(lessonPlan);
    const elapsed = Date.now() - startTime;
    
    console.log(`✅ ML Model Score: ${prediction.score} (${elapsed}ms)`);
    return {
      ...prediction,
      source: 'ml_model',
      elapsed
    };
  } catch (error) {
    console.warn('⚠️  ML Model failed, using fallback:', error.message);
    return fallbackHealthScore(lessonPlan);
  }
}

/**
 * Fallback scoring
 */
function fallbackHealthScore(lessonPlan) {
  let score = 5;

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
    reasoning: ['Fallback scoring used'],
    source: 'fallback',
    elapsed: 0
  };
}

/**
 * Batch predictions
 */
export async function predictHealthScoreBatch(lessonPlans) {
  const predictions = await Promise.all(
    lessonPlans.map(plan => predictHealthScoreWithFallback(plan))
  );
  return predictions;
}

export default {
  predictHealthScoreOptimized,
  predictHealthScoreWithFallback,
  predictHealthScoreBatch,
  initializePythonProcess,
  shutdownPythonProcess
};
