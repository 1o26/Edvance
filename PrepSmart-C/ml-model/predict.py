"""
Standalone Prediction Module for Health Score
Can be called from Node.js or Python applications
Optimized with model caching to avoid repeated disk loads
"""

import numpy as np
import pandas as pd
import joblib
import os
import json

# Global model instance - cached after first load to avoid disk I/O
_GLOBAL_MODEL_INSTANCE = None

class HealthScorePredictor:
    """Load trained model and make predictions on new lesson plans"""
    
    def __init__(self, model_path='models/health_score_model.pkl'):
        self.model_path = model_path
        self.model = None
        self.feature_names = [
            'num_objectives',
            'num_materials', 
            'num_activities',
            'num_assessments',
            'has_differentiation',
            'duration',
            'content_words'
        ]
        
        self._load_model()
    
    def _load_model(self):
        """Load trained model from disk (cached in memory)"""
        global _GLOBAL_MODEL_INSTANCE
        
        # Return cached model if available
        if _GLOBAL_MODEL_INSTANCE is not None:
            self.model = _GLOBAL_MODEL_INSTANCE
            return
        
        if not os.path.exists(self.model_path):
            raise FileNotFoundError(
                f"Model not found at {self.model_path}. "
                f"Please run train_model.py first."
            )
        
        # Load from disk only once
        self.model = joblib.load(self.model_path)
        
        # Cache globally for reuse
        _GLOBAL_MODEL_INSTANCE = self.model
    
    def extract_features(self, lesson_plan):
        """
        Extract features from lesson plan
        
        Args:
            lesson_plan: dict with keys:
                - objectives: list of learning objectives
                - materials: list of materials
                - activities: list of activities
                - assessments: list of assessment methods
                - differentiation: list or bool
                - duration: int (minutes)
                - content: str or dict (lesson content)
        
        Returns:
            dict: extracted features ready for prediction
        """
        # Get feature values
        num_objectives = len(lesson_plan.get('objectives', []))
        num_materials = len(lesson_plan.get('materials', []))
        num_activities = len(lesson_plan.get('activities', []))
        num_assessments = len(lesson_plan.get('assessments', []))
        
        differentiation = lesson_plan.get('differentiation', [])
        has_differentiation = 1 if (isinstance(differentiation, list) and len(differentiation) > 0) else int(bool(differentiation))
        
        duration = int(lesson_plan.get('duration', 45))
        
        # Calculate content words
        content = lesson_plan.get('content', '')
        if isinstance(content, dict):
            content = json.dumps(content)
        content_words = len(str(content).split())
        
        features = {
            'num_objectives': num_objectives,
            'num_materials': num_materials,
            'num_activities': num_activities,
            'num_assessments': num_assessments,
            'has_differentiation': has_differentiation,
            'duration': duration,
            'content_words': content_words
        }
        
        return features
    
    def predict(self, lesson_plan, return_features=False):
        """
        Predict health score for lesson plan
        
        Args:
            lesson_plan: dict with lesson plan data
            return_features: bool, whether to return extracted features
        
        Returns:
            float: predicted health score (1-10)
            or tuple: (score, features) if return_features=True
        """
        # Extract features
        features = self.extract_features(lesson_plan)
        
        # Create feature array in correct order
        feature_array = np.array([[
            features['num_objectives'],
            features['num_materials'],
            features['num_activities'],
            features['num_assessments'],
            features['has_differentiation'],
            features['duration'],
            features['content_words']
        ]])
        
        # Make prediction
        prediction = self.model.predict(feature_array)[0]
        
        # Clamp to 1-10 range
        score = max(1.0, min(10.0, float(prediction)))
        
        if return_features:
            return round(score, 1), features
        return round(score, 1)
    
    def predict_batch(self, lesson_plans):
        """
        Predict health scores for multiple lesson plans
        
        Args:
            lesson_plans: list of lesson plan dicts
        
        Returns:
            list: predicted scores
        """
        scores = []
        for plan in lesson_plans:
            score = self.predict(plan)
            scores.append(score)
        
        return scores
    
    def predict_with_reasoning(self, lesson_plan):
        """
        Predict score and provide explanation
        
        Returns:
            dict with:
                - score: predicted score
                - features: extracted features
                - reasoning: explanation of score
        """
        score, features = self.predict(lesson_plan, return_features=True)
        
        # Generate reasoning
        reasoning = self._generate_reasoning(score, features)
        
        return {
            'score': score,
            'features': features,
            'reasoning': reasoning
        }
    
    def _generate_reasoning(self, score, features):
        """Generate human-readable explanation for score"""
        reasons = []
        
        # Learning objectives
        if features['num_objectives'] >= 4:
            reasons.append("✓ Strong learning objectives (4+)")
        elif features['num_objectives'] >= 2:
            reasons.append("✓ Adequate learning objectives")
        else:
            reasons.append("⚠ Few learning objectives")
        
        # Activities
        if features['num_activities'] >= 4:
            reasons.append("✓ Diverse activities (4+)")
        elif features['num_activities'] >= 2:
            reasons.append("✓ Multiple activities")
        else:
            reasons.append("⚠ Limited activities")
        
        # Assessment
        if features['num_assessments'] >= 3:
            reasons.append("✓ Multiple assessment methods")
        elif features['num_assessments'] >= 1:
            reasons.append("✓ Assessment included")
        else:
            reasons.append("⚠ No formal assessment")
        
        # Differentiation
        if features['has_differentiation']:
            reasons.append("✓ Includes differentiation strategies")
        else:
            reasons.append("⚠ Could add differentiation")
        
        # Duration
        if features['duration'] >= 45:
            reasons.append(f"ℹ Duration: {features['duration']} minutes (reasonable)")
        else:
            reasons.append(f"⚠ Duration: {features['duration']} minutes (may be tight)")
        
        return reasons


def predict_health_score(lesson_plan_json):
    """
    Simple function to predict health score from JSON
    Can be called from Node.js via child_process
    
    Args:
        lesson_plan_json: JSON string with lesson plan data
    
    Returns:
        JSON string with score and features
    """
    try:
        predictor = HealthScorePredictor()
        lesson_plan = json.loads(lesson_plan_json) if isinstance(lesson_plan_json, str) else lesson_plan_json
        
        result = predictor.predict_with_reasoning(lesson_plan)
        return json.dumps(result)
    
    except Exception as e:
        return json.dumps({
            'error': str(e),
            'score': None
        })


if __name__ == "__main__":
    # Example usage
    predictor = HealthScorePredictor()
    
    # Sample lesson plan
    sample_lesson = {
        'title': 'Photosynthesis Basics',
        'subject': 'Biology',
        'grade': '9',
        'duration': 45,
        'objectives': [
            'Understand photosynthesis process',
            'Identify inputs and outputs',
            'Explain chlorophyll role'
        ],
        'materials': [
            'Textbook',
            'Microscope',
            'Plant samples'
        ],
        'activities': [
            'Lab experiment (20 mins)',
            'Group discussion (15 mins)',
            'Video presentation (10 mins)'
        ],
        'assessments': [
            'Lab report',
            'Quiz'
        ],
        'differentiation': [
            'Extended resources for advanced students',
            'Simplified diagrams for struggling students'
        ],
        'content': 'Comprehensive lesson on photosynthesis covering...'
    }
    
    print("=" * 60)
    print("🔮 HEALTH SCORE PREDICTION")
    print("=" * 60)
    
    # Predict with reasoning
    result = predictor.predict_with_reasoning(sample_lesson)
    
    print(f"\n📊 Lesson: {sample_lesson['title']}")
    print(f"\n🎯 Predicted Health Score: {result['score']}/10")
    print(f"\n📋 Extracted Features:")
    for key, value in result['features'].items():
        print(f"   - {key}: {value}")
    
    print(f"\n📝 Reasoning:")
    for reason in result['reasoning']:
        print(f"   {reason}")
    
    print("\n" + "=" * 60)
