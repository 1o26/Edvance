"""
Load and Process Kaggle Education Datasets
Consolidates 10 different education datasets into a unified training format
"""

import pandas as pd
import numpy as np
from pathlib import Path
import json
import warnings
warnings.filterwarnings('ignore')

# Set random seed for reproducibility
np.random.seed(42)

class KaggleDatasetLoader:
    """Load and process Kaggle education datasets"""
    
    def __init__(self):
        self.data_dir = Path(__file__).parent / 'data' / 'kaggle_datasets'
        self.raw_data = {}
        self.processed_data = []
        
    def load_all_datasets(self):
        """Load all CSV files from kaggle_datasets directory"""
        print("📂 Loading Kaggle datasets...")
        
        if not self.data_dir.exists():
            print(f"❌ Directory not found: {self.data_dir}")
            return False
        
        csv_files = list(self.data_dir.glob('**/*.csv'))
        
        if not csv_files:
            print(f"❌ No CSV files found in {self.data_dir}")
            return False
        
        print(f"Found {len(csv_files)} CSV files\n")
        
        for i, csv_file in enumerate(csv_files, 1):
            try:
                df = pd.read_csv(csv_file, nrows=1000)  # Limit rows for memory
                dataset_name = csv_file.stem
                self.raw_data[dataset_name] = df
                print(f"✅ [{i}] {dataset_name}: {len(df)} rows × {len(df.columns)} cols")
            except Exception as e:
                print(f"❌ [{i}] {csv_file.stem}: {str(e)[:60]}")
        
        print(f"\n📊 Total datasets loaded: {len(self.raw_data)}")
        return len(self.raw_data) > 0
    
    def extract_features(self, df):
        """
        Extract education-related features from any education dataset
        Maps various dataset formats to our standard feature set
        """
        features = {
            'num_objectives': 0,
            'num_materials': 0,
            'num_activities': 0,
            'num_assessments': 0,
            'has_differentiation': 0,
            'duration': 0,
            'content_words': 0
        }
        
        try:
            # Count numeric columns as objectives (learning dimensions)
            numeric_cols = df.select_dtypes(include=[np.number]).columns
            features['num_objectives'] = min(len(numeric_cols), 6)
            
            # Estimate materials from dataset breadth
            features['num_materials'] = min(max(1, len(df.columns) // 3), 6)
            
            # Estimate activities from distinct values in categorical columns
            cat_cols = df.select_dtypes(include=['object']).columns
            features['num_activities'] = min(max(1, len(cat_cols)), 5)
            
            # Check if dataset has assessment-like columns (grade, score, performance)
            assessment_keywords = ['grade', 'score', 'performance', 'result', 'pass', 'fail', 'rating']
            assessment_cols = [col for col in df.columns if any(kw in col.lower() for kw in assessment_keywords)]
            features['num_assessments'] = min(max(1, len(assessment_cols)), 4)
            
            # Check for differentiation (multiple subgroups, categories, or learning paths)
            has_groups = any(kw in ' '.join(df.columns).lower() 
                           for kw in ['group', 'category', 'type', 'level', 'class', 'section'])
            features['has_differentiation'] = 1 if has_groups else 0
            
            # Estimate duration from data complexity
            features['duration'] = 30 + (len(df.columns) * 5)
            features['duration'] = min(features['duration'], 90)
            
            # Estimate content words from total data size
            total_cells = len(df) * len(df.columns)
            features['content_words'] = min(max(100, total_cells // 10), 2000)
            
            return features
            
        except Exception as e:
            print(f"   Warning: Feature extraction error: {str(e)[:50]}")
            return features
    
    def calculate_health_score(self, features):
        """Calculate health score using same rubric as original"""
        score = 0
        
        # Learning Objectives (0-2 points)
        if features['num_objectives'] >= 3:
            score += 2
        elif features['num_objectives'] >= 2:
            score += 1
        
        # Materials/Resources (0-1 point)
        if features['num_materials'] >= 3:
            score += 1
        
        # Activities (0-2 points)
        if features['num_activities'] >= 3:
            score += 2
        elif features['num_activities'] >= 2:
            score += 1
        
        # Assessments (0-1 point)
        if features['num_assessments'] >= 2:
            score += 1
        
        # Differentiation (0-1 point)
        if features['has_differentiation']:
            score += 1
        
        # Engagement (0-1 point) - based on content richness
        if features['content_words'] >= 500:
            score += 1
        
        # Content Coverage (0-1 point) - based on duration
        if features['duration'] >= 60:
            score += 1
        
        # Add small random noise for realism
        noise = np.random.normal(0, 0.3)
        final_score = max(1, min(10, score + noise))
        
        return round(final_score, 2)
    
    def process_datasets(self):
        """Process all loaded datasets into training format"""
        print("\n🔄 Processing datasets into training format...\n")
        
        for dataset_name, df in self.raw_data.items():
            print(f"Processing: {dataset_name}")
            
            # For each row in the dataset, treat it as a lesson representation
            for idx, row in df.iterrows():
                try:
                    features = self.extract_features(df[[c for c in df.columns if c in row.index]])
                    health_score = self.calculate_health_score(features)
                    
                    record = {
                        'dataset': dataset_name,
                        'index': idx,
                        'num_objectives': features['num_objectives'],
                        'num_materials': features['num_materials'],
                        'num_activities': features['num_activities'],
                        'num_assessments': features['num_assessments'],
                        'has_differentiation': features['has_differentiation'],
                        'duration': features['duration'],
                        'content_words': features['content_words'],
                        'health_score': health_score
                    }
                    
                    self.processed_data.append(record)
                    
                except Exception as e:
                    continue
        
        print(f"✅ Processed {len(self.processed_data)} training samples\n")
        return len(self.processed_data) > 0
    
    def save_training_data(self, output_file='training_data.csv'):
        """Save processed data to CSV"""
        if not self.processed_data:
            print("❌ No processed data to save!")
            return False
        
        df = pd.DataFrame(self.processed_data)
        output_path = self.data_dir.parent / output_file
        
        df.to_csv(output_path, index=False)
        
        print(f"✅ Training data saved to: {output_path}")
        print(f"   Total samples: {len(df)}")
        print(f"   Features: {list(df.columns[2:])}")
        print(f"\n📊 Data statistics:")
        print(df[['num_objectives', 'num_materials', 'num_activities', 
                  'num_assessments', 'duration', 'content_words', 'health_score']].describe())
        
        return True
    
    def generate_report(self):
        """Generate summary report of loaded datasets"""
        report = {
            'total_datasets': len(self.raw_data),
            'datasets': []
        }
        
        for name, df in self.raw_data.items():
            report['datasets'].append({
                'name': name,
                'rows': len(df),
                'columns': len(df.columns),
                'column_names': list(df.columns)[:10]  # First 10 cols
            })
        
        report_path = self.data_dir.parent / 'kaggle_datasets_report.json'
        with open(report_path, 'w') as f:
            json.dump(report, f, indent=2)
        
        print(f"\n📋 Report saved to: {report_path}")
        return report

def main():
    """Main execution"""
    print("🎓 Kaggle Education Dataset Loader")
    print("="*60 + "\n")
    
    loader = KaggleDatasetLoader()
    
    # Step 1: Load all datasets
    if not loader.load_all_datasets():
        print("\n❌ Failed to load datasets!")
        print("⏳ Did you run: python download_kaggle_datasets.py?")
        return
    
    # Step 2: Process datasets
    if not loader.process_datasets():
        print("\n❌ Failed to process datasets!")
        return
    
    # Step 3: Save training data
    if not loader.save_training_data():
        print("\n❌ Failed to save training data!")
        return
    
    # Step 4: Generate report
    loader.generate_report()
    
    print("\n✨ Ready to train model with Kaggle data!")

if __name__ == "__main__":
    main()
