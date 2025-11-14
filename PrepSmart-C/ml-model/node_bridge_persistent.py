"""
Persistent Python Bridge for Health Score Prediction
Keeps process alive and handles multiple requests efficiently
Startup: ~1-2 seconds (model loads once)
Per-prediction: ~50-100ms
"""

import sys
import json
import io
from contextlib import redirect_stdout, redirect_stderr
from predict import HealthScorePredictor

# Global predictor instance - created once on startup
predictor = None

def initialize():
    """Initialize predictor on startup"""
    global predictor
    
    # Pre-load model
    try:
        predictor = HealthScorePredictor()
        # Signal Node.js that we're ready AFTER model loads
        print("READY", flush=True)
    except Exception as e:
        print(json.dumps({"error": f"Failed to initialize: {str(e)}"}), flush=True)
        sys.exit(1)

def handle_request(request_data):
    """Handle a single prediction request"""
    try:
        request_id = request_data.get('id')
        lesson_plan = request_data.get('lesson_plan')
        
        # Suppress stdout/stderr during prediction
        f = io.StringIO()
        with redirect_stdout(f), redirect_stderr(f):
            result = predictor.predict_with_reasoning(lesson_plan)
        
        response = {
            'id': request_id,
            'result': result,
            'error': None
        }
        
    except Exception as e:
        response = {
            'id': request_id,
            'result': None,
            'error': str(e)
        }
    
    return response

def main():
    """Main event loop for persistent predictions"""
    initialize()
    
    try:
        for line in sys.stdin:
            try:
                request_data = json.loads(line.strip())
                response = handle_request(request_data)
                print(json.dumps(response, ensure_ascii=True), flush=True)
                
            except json.JSONDecodeError:
                print(json.dumps({
                    'id': None,
                    'result': None,
                    'error': 'Invalid JSON request'
                }, ensure_ascii=True), flush=True)
                
            except Exception as e:
                print(json.dumps({
                    'id': None,
                    'result': None,
                    'error': str(e)
                }, ensure_ascii=True), flush=True)
                
    except KeyboardInterrupt:
        pass
    except Exception as e:
        print(f"Fatal error: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
