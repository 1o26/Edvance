"""
Health Score Model Training Pipeline
Trains a Random Forest model to predict lesson plan health scores
"""

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split, cross_val_score, GridSearchCV
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_squared_error, r2_score, mean_absolute_error
import joblib
import os
import json
from datetime import datetime

class HealthScoreModelTrainer:
    """Train and evaluate health score prediction model"""
    
    def __init__(self, data_path='data/training_data.csv'):
        self.data_path = data_path
        self.model = None
        self.scaler = StandardScaler()
        self.feature_importance = None
        self.metrics = {}
        
    def load_data(self):
        """Load training data from Kaggle datasets"""
        print(f"📥 Loading data from Kaggle datasets...")
        print(f"   Using: data/training_data.csv (processed from 10 Kaggle education datasets)")
        
        df = pd.read_csv(self.data_path)
        
        # Show dataset sources
        if 'dataset' in df.columns:
            print(f"\n📊 Datasets included:")
            for dataset in df['dataset'].unique():
                count = len(df[df['dataset'] == dataset])
                print(f"   - {dataset}: {count} samples")
        
        # Remove non-feature columns
        columns_to_drop = [col for col in df.columns if col in ['health_score', 'dataset', 'index']]
        X = df.drop(columns_to_drop, axis=1)
        y = df['health_score']
        
        # Convert all features to numeric, handle list-like strings
        for col in X.columns:
            if X[col].dtype == 'object':
                # Try to convert to numeric
                try:
                    # If it's a list string representation, count elements
                    X[col] = X[col].apply(lambda x: len(eval(x)) if isinstance(x, str) and x.startswith('[') else 0)
                except:
                    # Fallback: convert any non-numeric to 0
                    X[col] = pd.to_numeric(X[col], errors='coerce').fillna(0)
        
        print(f"\n✅ Data loaded: {X.shape[0]} samples, {X.shape[1]} features")
        print(f"   Features: {list(X.columns)}")
        print(f"\n📈 Target (Health Score) Distribution:")
        print(y.describe())
        
        return X, y
    
    def prepare_data(self, X, y, test_size=0.2, random_state=42):
        """Split data into train and test sets"""
        print(f"\n📊 Preparing data (test_size={test_size})...")
        
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=test_size, random_state=random_state
        )
        
        print(f"✅ Training set: {X_train.shape[0]} samples")
        print(f"✅ Test set: {X_test.shape[0]} samples")
        
        return X_train, X_test, y_train, y_test
    
    def train_random_forest(self, X_train, y_train, hyperparameters=None):
        """Train Random Forest model"""
        print("\n🤖 Training Random Forest model...")
        
        default_params = {
            'n_estimators': 100,
            'max_depth': 15,
            'min_samples_split': 5,
            'min_samples_leaf': 2,
            'random_state': 42,
            'n_jobs': -1
        }
        
        if hyperparameters:
            default_params.update(hyperparameters)
        
        self.model = RandomForestRegressor(**default_params)
        self.model.fit(X_train, y_train)
        
        print(f"✅ Model trained successfully!")
        print(f"   - Estimators: {default_params['n_estimators']}")
        print(f"   - Max Depth: {default_params['max_depth']}")
        
        return self.model
    
    def train_gradient_boosting(self, X_train, y_train, hyperparameters=None):
        """Train Gradient Boosting model (alternative)"""
        print("\n🤖 Training Gradient Boosting model...")
        
        default_params = {
            'n_estimators': 100,
            'max_depth': 5,
            'learning_rate': 0.1,
            'min_samples_split': 5,
            'random_state': 42
        }
        
        if hyperparameters:
            default_params.update(hyperparameters)
        
        self.model = GradientBoostingRegressor(**default_params)
        self.model.fit(X_train, y_train)
        
        print(f"✅ Model trained successfully!")
        
        return self.model
    
    def evaluate_model(self, X_test, y_test, model_name="Random Forest"):
        """Evaluate model performance"""
        print(f"\n📈 Evaluating {model_name} Model...")
        
        # Make predictions
        y_pred = self.model.predict(X_test)
        
        # Calculate metrics
        mse = mean_squared_error(y_test, y_pred)
        rmse = np.sqrt(mse)
        mae = mean_absolute_error(y_test, y_pred)
        r2 = r2_score(y_test, y_pred)
        
        # Cross-validation score
        cv_scores = cross_val_score(self.model, X_test, y_test, cv=5, scoring='r2')
        
        self.metrics = {
            'mse': mse,
            'rmse': rmse,
            'mae': mae,
            'r2': r2,
            'cv_mean': cv_scores.mean(),
            'cv_std': cv_scores.std()
        }
        
        print(f"\n📊 Performance Metrics:")
        print(f"   ✓ Mean Squared Error (MSE): {mse:.4f}")
        print(f"   ✓ Root Mean Squared Error (RMSE): {rmse:.4f}")
        print(f"   ✓ Mean Absolute Error (MAE): {mae:.4f}")
        print(f"   ✓ R² Score: {r2:.4f}")
        print(f"   ✓ Cross-Validation R² (mean ± std): {cv_scores.mean():.4f} ± {cv_scores.std():.4f}")
        
        # Show sample predictions
        print(f"\n🎯 Sample Predictions (Actual vs Predicted):")
        sample_indices = np.random.choice(len(y_test), 5, replace=False)
        for idx in sample_indices:
            actual = y_test.iloc[idx]
            predicted = y_pred[idx]
            error = abs(actual - predicted)
            print(f"   Actual: {actual:.2f}, Predicted: {predicted:.2f}, Error: {error:.2f}")
        
        return y_pred, self.metrics
    
    def plot_feature_importance(self, X_train, output_dir='models'):
        """Plot and save feature importance"""
        print(f"\n📊 Analyzing feature importance...")
        
        os.makedirs(output_dir, exist_ok=True)
        
        feature_importance = pd.DataFrame({
            'feature': X_train.columns,
            'importance': self.model.feature_importances_
        }).sort_values('importance', ascending=False)
        
        self.feature_importance = feature_importance
        
        print(f"\n🔝 Top Features:")
        for idx, row in feature_importance.head(10).iterrows():
            print(f"   {row['feature']}: {row['importance']:.4f}")
        
        # Create plot
        plt.figure(figsize=(10, 6))
        sns.barplot(data=feature_importance.head(10), x='importance', y='feature', palette='viridis')
        plt.title('Top 10 Feature Importance for Health Score Prediction')
        plt.xlabel('Importance Score')
        plt.ylabel('Feature')
        plt.tight_layout()
        
        plot_path = os.path.join(output_dir, 'feature_importance.png')
        plt.savefig(plot_path, dpi=300, bbox_inches='tight')
        print(f"✅ Feature importance plot saved to {plot_path}")
        plt.close()
        
        return feature_importance
    
    def plot_predictions(self, y_test, y_pred, output_dir='models'):
        """Plot actual vs predicted values"""
        print(f"\n📊 Creating prediction visualization...")
        
        os.makedirs(output_dir, exist_ok=True)
        
        fig, axes = plt.subplots(1, 2, figsize=(14, 5))
        
        # Actual vs Predicted scatter plot
        axes[0].scatter(y_test, y_pred, alpha=0.6, edgecolors='k')
        axes[0].plot([y_test.min(), y_test.max()], [y_test.min(), y_test.max()], 'r--', lw=2)
        axes[0].set_xlabel('Actual Health Score')
        axes[0].set_ylabel('Predicted Health Score')
        axes[0].set_title('Actual vs Predicted Health Scores')
        axes[0].grid(True, alpha=0.3)
        
        # Residuals plot
        residuals = y_test.values - y_pred
        axes[1].scatter(y_pred, residuals, alpha=0.6, edgecolors='k')
        axes[1].axhline(y=0, color='r', linestyle='--', lw=2)
        axes[1].set_xlabel('Predicted Health Score')
        axes[1].set_ylabel('Residuals')
        axes[1].set_title('Residual Plot')
        axes[1].grid(True, alpha=0.3)
        
        plt.tight_layout()
        
        plot_path = os.path.join(output_dir, 'predictions_plot.png')
        plt.savefig(plot_path, dpi=300, bbox_inches='tight')
        print(f"✅ Prediction plot saved to {plot_path}")
        plt.close()
    
    def save_model(self, output_dir='models'):
        """Save trained model and metadata"""
        print(f"\n💾 Saving model...")
        
        os.makedirs(output_dir, exist_ok=True)
        
        # Save model
        model_path = os.path.join(output_dir, 'health_score_model.pkl')
        joblib.dump(self.model, model_path)
        print(f"✅ Model saved to {model_path}")
        
        # Save metadata
        metadata = {
            'model_type': type(self.model).__name__,
            'training_date': datetime.now().isoformat(),
            'metrics': self.metrics,
            'feature_importance': self.feature_importance.to_dict() if self.feature_importance is not None else None,
            'hyperparameters': self.model.get_params()
        }
        
        metadata_path = os.path.join(output_dir, 'model_metadata.json')
        with open(metadata_path, 'w') as f:
            json.dump(metadata, f, indent=2)
        print(f"✅ Metadata saved to {metadata_path}")
        
        return model_path, metadata_path
    
    def run_full_pipeline(self):
        """Run complete training pipeline"""
        print("=" * 60)
        print("🚀 HEALTH SCORE MODEL TRAINING PIPELINE")
        print("=" * 60)
        
        # Load data
        X, y = self.load_data()
        
        # Prepare data
        X_train, X_test, y_train, y_test = self.prepare_data(X, y)
        
        # Train model
        self.train_random_forest(X_train, y_train)
        
        # Evaluate
        y_pred, metrics = self.evaluate_model(X_test, y_test)
        
        # Feature importance
        self.plot_feature_importance(X_train)
        
        # Visualizations
        self.plot_predictions(y_test, y_pred)
        
        # Save model
        self.save_model()
        
        print("\n" + "=" * 60)
        print("✅ TRAINING COMPLETE!")
        print("=" * 60)
        
        return self.model, metrics


if __name__ == "__main__":
    # Create trainer
    trainer = HealthScoreModelTrainer()
    
    # Run pipeline
    model, metrics = trainer.run_full_pipeline()
