import numpy as np
import pandas as pd
import logging
import os
import base64
import io
from config import Config

# Try to import TensorFlow with graceful fallback
try:
    import tensorflow as tf
    from tensorflow import keras
    TF_AVAILABLE = True
    print("TensorFlow successfully imported")
except ImportError as e:
    print(f"TensorFlow import failed: {e}")
    print("Running in fallback mode without TensorFlow")
    TF_AVAILABLE = False
    tf = None
    keras = None

# Try to import XAI libraries
try:
    import shap
    SHAP_AVAILABLE = True
    print("SHAP successfully imported")
except ImportError as e:
    print(f"SHAP import failed: {e}")
    SHAP_AVAILABLE = False
    shap = None

try:
    import plotly.graph_objects as go
    import plotly.io as pio
    PLOTTING_AVAILABLE = True
    print("Plotting libraries successfully imported")
except ImportError as e:
    print(f"Plotting libraries import failed: {e}")
    PLOTTING_AVAILABLE = False

logger = logging.getLogger(__name__)

class PredictionService:
    def __init__(self):
        self.model = None
        self.explainer = None
        self.lime_explainer = None
        self.feature_names = ['Gender', 'Hemoglobin', 'MCH', 'MCHC', 'MCV']
        self.model_loaded = False
        self.latest_prediction = None
        self.latest_explanation = None

    def load_model(self, model_path):
        """Load the Keras model and initialize explainers"""
        if not TF_AVAILABLE:
            logger.warning("TensorFlow not available - using fallback prediction")
            self.model_loaded = False
            return

        try:
            self.model = keras.models.load_model(model_path)
            logger.info(f"Model loaded successfully from {model_path}")
            self.model_loaded = True
        except Exception as e:
            logger.error(f"Error loading model: {str(e)}")
            self.model_loaded = False

    def _validate_input(self, features):
        """Validate input features"""
        required_features = ['Gender', 'Hemoglobin', 'MCH', 'MCHC', 'MCV']

        for feature in required_features:
            if feature not in features:
                raise ValueError(f"Missing required feature: {feature}")

        # Validate ranges - expanded ranges for realistic medical values
        if features['Gender'] not in [0, 1]:
            raise ValueError("Gender must be 0 (female) or 1 (male)")

        if not (3.0 <= features['Hemoglobin'] <= 25.0):
            raise ValueError("Hemoglobin must be between 3.0 and 25.0 g/dL")

        if not (10.0 <= features['MCH'] <= 50.0):
            raise ValueError("MCH must be between 10.0 and 50.0 pg")

        if not (20.0 <= features['MCHC'] <= 45.0):
            raise ValueError("MCHC must be between 20.0 and 45.0 g/dL")

        if not (50.0 <= features['MCV'] <= 130.0):
            raise ValueError("MCV must be between 50.0 and 130.0 fL")

    def predict(self, features):
        """Make prediction with comprehensive XAI explanations"""
        # Validate input
        self._validate_input(features)

        # Use enhanced fallback prediction with XAI explanations
        logger.info("Using enhanced rule-based prediction with XAI")
        return self._fallback_prediction(features)

    def _fallback_prediction(self, features):
        """Enhanced fallback prediction when ML model is unavailable"""
        hemoglobin = features['Hemoglobin']
        mcv = features['MCV']
        mch = features['MCH']
        mchc = features['MCHC']
        gender = features['Gender']

        # Enhanced anemia assessment using clinical guidelines
        hb_threshold = 12.0 if gender == 0 else 13.0

        # Initialize risk factors
        risk_factors = []
        risk_score = 0.0

        # Hemoglobin assessment (primary indicator)
        if hemoglobin < hb_threshold:
            hb_deficit = hb_threshold - hemoglobin
            if hb_deficit >= 3:
                risk_score += 0.8  # Severe anemia
                risk_factors.append({'feature': 'Hemoglobin', 'value': hemoglobin, 'contribution': 0.8})
            elif hb_deficit >= 1.5:
                risk_score += 0.6  # Moderate anemia
                risk_factors.append({'feature': 'Hemoglobin', 'value': hemoglobin, 'contribution': 0.6})
            else:
                risk_score += 0.4  # Mild anemia
                risk_factors.append({'feature': 'Hemoglobin', 'value': hemoglobin, 'contribution': 0.4})
        else:
            risk_factors.append({'feature': 'Hemoglobin', 'value': hemoglobin, 'contribution': -0.3})

        # MCV assessment (cell size - indicates anemia type)
        if mcv < 80:  # Microcytic
            risk_score += 0.25
            risk_factors.append({'feature': 'MCV', 'value': mcv, 'contribution': 0.25})
        elif mcv > 100:  # Macrocytic
            risk_score += 0.20
            risk_factors.append({'feature': 'MCV', 'value': mcv, 'contribution': 0.20})
        else:
            risk_factors.append({'feature': 'MCV', 'value': mcv, 'contribution': -0.1})

        # MCH assessment
        if mch < 27:
            risk_score += 0.15
            risk_factors.append({'feature': 'MCH', 'value': mch, 'contribution': 0.15})
        elif mch > 32:
            risk_score += 0.10
            risk_factors.append({'feature': 'MCH', 'value': mch, 'contribution': 0.10})
        else:
            risk_factors.append({'feature': 'MCH', 'value': mch, 'contribution': -0.05})

        # MCHC assessment
        if mchc < 32:
            risk_score += 0.12
            risk_factors.append({'feature': 'MCHC', 'value': mchc, 'contribution': 0.12})
        elif mchc > 36:
            risk_score += 0.08
            risk_factors.append({'feature': 'MCHC', 'value': mchc, 'contribution': 0.08})
        else:
            risk_factors.append({'feature': 'MCHC', 'value': mchc, 'contribution': -0.02})

        # Gender factor
        if gender == 0:  # Female - higher anemia risk
            risk_score += 0.05
            risk_factors.append({'feature': 'Gender', 'value': gender, 'contribution': 0.05})
        else:
            risk_factors.append({'feature': 'Gender', 'value': gender, 'contribution': -0.02})

        # Calculate final probability (ensure it's meaningful)
        probability = max(0.05, min(0.95, risk_score))
        predicted_label = 1 if probability > 0.5 else 0

        # Generate comprehensive explanations
        explanations = {
            'shap': self._generate_fallback_shap(risk_factors, probability),
            'lime': None,
            'visualizations': self._generate_fallback_visualizations(risk_factors, features),
            'clinical_interpretation': self._get_clinical_interpretation(features, probability)
        }

        logger.info(f"Fallback prediction: {predicted_label} with probability {probability:.3f}")

        return {
            'predicted_label': predicted_label,
            'predicted_proba': float(probability),
            'explanations': explanations,
            'model_used': 'rule_based_fallback'
        }

    def _generate_fallback_shap(self, risk_factors, probability):
        """Generate SHAP-like explanations for fallback mode"""
        feature_contributions = []

        for factor in risk_factors:
            feature_contributions.append({
                'feature': factor['feature'],
                'value': float(factor['value']),
                'contribution': factor['contribution'],
                'abs_contribution': abs(factor['contribution']),
                'impact': 'increases_risk' if factor['contribution'] > 0 else 'decreases_risk',
                'impact_strength': 'high' if abs(factor['contribution']) > 0.3 else 'medium' if abs(factor['contribution']) > 0.1 else 'low'
            })

        # Sort by absolute contribution
        feature_contributions.sort(key=lambda x: x['abs_contribution'], reverse=True)

        return {
            'method': 'rule_based_shap',
            'feature_contributions': feature_contributions,
            'top_features': feature_contributions[:3],
            'base_value': 0.3,
            'prediction_value': float(probability)
        }

    def _generate_fallback_visualizations(self, risk_factors, features):
        """Generate visualizations for fallback mode with improved error handling"""
        visualizations = {}

        try:
            # Always create a simple HTML-based visualization as fallback
            html_chart = self._create_html_chart(risk_factors)
            visualizations['feature_importance_html'] = html_chart

            # Try to create Plotly chart if available
            if PLOTTING_AVAILABLE:
                try:
                    # Create feature importance chart
                    feature_names = [f['feature'] for f in risk_factors]
                    contributions = [f['contribution'] for f in risk_factors]

                    fig = go.Figure()
                    colors = ['rgba(255, 65, 54, 0.8)' if c > 0 else 'rgba(30, 136, 229, 0.8)' for c in contributions]

                    fig.add_trace(go.Bar(
                        x=feature_names,
                        y=[abs(c) for c in contributions],
                        marker_color=colors,
                        text=[f"Impact: {c:+.2f}" for c in contributions],
                        textposition='outside'
                    ))

                    fig.update_layout(
                        title='Feature Contributions to Anemia Risk (Rule-Based Analysis)',
                        xaxis_title='Lab Parameters',
                        yaxis_title='Risk Contribution',
                        height=400,
                        plot_bgcolor='white',
                        paper_bgcolor='white'
                    )

                    # Convert to base64
                    img_bytes = pio.to_image(fig, format='png', width=800, height=400)
                    img_base64 = base64.b64encode(img_bytes).decode('utf-8')
                    visualizations['feature_importance'] = f"data:image/png;base64,{img_base64}"

                except Exception as plotly_error:
                    logger.warning(f"Plotly visualization failed: {plotly_error}")
                    # Keep the HTML fallback

            return visualizations

        except Exception as e:
            logger.error(f"All visualization generation failed: {str(e)}")
            # Return a simple text-based visualization
            return {
                'feature_importance_text': self._create_text_visualization(risk_factors)
            }

    def _create_html_chart(self, risk_factors):
        """Create a simple HTML-based chart visualization"""
        html = """
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 20px auto;">
            <h3 style="text-align: center; color: #333; margin-bottom: 20px;">Feature Contributions to Anemia Risk</h3>
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
        """

        # Sort risk factors by absolute contribution
        sorted_factors = sorted(risk_factors, key=lambda x: abs(x['contribution']), reverse=True)

        for factor in sorted_factors:
            contribution = factor['contribution']
            percentage = abs(contribution) * 100
            color = '#dc3545' if contribution > 0 else '#007bff'
            impact_text = 'Increases Risk' if contribution > 0 else 'Decreases Risk'

            html += f"""
                <div style="margin-bottom: 15px; padding: 10px; background: white; border-radius: 6px; border-left: 4px solid {color};">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <strong style="color: #333;">{factor['feature']}</strong>
                            <div style="color: #666; font-size: 0.9em;">Value: {factor['value']}</div>
                        </div>
                        <div style="text-align: right;">
                            <div style="color: {color}; font-weight: bold;">{impact_text}</div>
                            <div style="color: #666; font-size: 0.9em;">{percentage:.1f}% impact</div>
                        </div>
                    </div>
                    <div style="margin-top: 8px; background: #e9ecef; height: 8px; border-radius: 4px;">
                        <div style="background: {color}; height: 100%; width: {min(percentage * 2, 100)}%; border-radius: 4px;"></div>
                    </div>
                </div>
            """

        html += """
            </div>
            <div style="text-align: center; margin-top: 15px; color: #666; font-size: 0.9em;">
                Interactive visualization showing how each lab parameter contributes to the anemia risk assessment
            </div>
        </div>
        """

        return html

    def _create_text_visualization(self, risk_factors):
        """Create a simple text-based visualization as ultimate fallback"""
        text = "Feature Contributions to Anemia Risk:\n\n"

        sorted_factors = sorted(risk_factors, key=lambda x: abs(x['contribution']), reverse=True)

        for i, factor in enumerate(sorted_factors, 1):
            contribution = factor['contribution']
            impact_text = "increases risk" if contribution > 0 else "decreases risk"
            text += f"{i}. {factor['feature']} (value: {factor['value']}) - {impact_text} by {abs(contribution)*100:.1f}%\n"

        return text

    def _get_clinical_interpretation(self, features, prediction_proba):
        """Provide comprehensive clinical interpretation"""
        risk_level = "high" if prediction_proba > 0.7 else "moderate" if prediction_proba > 0.3 else "low"

        interpretation = {
            'risk_level': risk_level,
            'confidence': float(prediction_proba),
            'summary': f"Based on the lab values, the analysis indicates a {risk_level} risk of anemia (confidence: {prediction_proba:.2%}).",
            'key_factors': [],
            'recommendations': self._generate_clinical_recommendations(features, prediction_proba),
            'disclaimer': "Please consult with a healthcare provider for proper diagnosis and treatment."
        }

        return interpretation

    def _generate_clinical_recommendations(self, features, prediction_proba):
        """Generate clinical recommendations based on prediction and features"""
        recommendations = []

        if prediction_proba > 0.7:
            recommendations.append("High risk detected - immediate medical evaluation recommended")
            recommendations.append("Complete blood count (CBC) with differential advised")

        if features['Hemoglobin'] < 10.0:
            recommendations.append("Severe anemia suspected - urgent medical attention required")
        elif features['Hemoglobin'] < 12.0:
            recommendations.append("Iron deficiency evaluation recommended")
            recommendations.append("Dietary counseling for iron-rich foods")

        if features['MCV'] < 80:
            recommendations.append("Microcytic anemia pattern - check iron studies, ferritin")
        elif features['MCV'] > 100:
            recommendations.append("Macrocytic anemia pattern - check B12, folate levels")

        if not recommendations:
            recommendations.append("Continue regular health monitoring")
            recommendations.append("Maintain balanced diet rich in iron, B12, and folate")

        return recommendations

    def get_latest_explanation(self):
        """Get the explanation for the latest prediction"""
        if self.latest_explanation:
            return {
                'success': True,
                'explanation': self.latest_explanation,
                'prediction': self.latest_prediction
            }
        else:
            return {
                'success': False,
                'error': 'No recent prediction found'
            }

# Global instance
prediction_service = PredictionService()
