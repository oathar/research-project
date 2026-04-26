import pickle
import re
import numpy as np
import os

# Get the project root directory
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODELS_DIR = os.path.join(PROJECT_ROOT, "models")

# Load once on import
lr_model   = pickle.load(open(os.path.join(MODELS_DIR, "lr_model.pkl"),   "rb"))
rf_model   = pickle.load(open(os.path.join(MODELS_DIR, "rf_model.pkl"),   "rb"))
vectorizer = pickle.load(open(os.path.join(MODELS_DIR, "vectorizer.pkl"), "rb"))

# Patch for scikit-learn version mismatch (pickled in 1.8.0, running in 1.7.2)
if hasattr(lr_model, "estimators_"):
    for estimator in lr_model.estimators_:
        if not hasattr(estimator, "multi_class"):
            estimator.multi_class = "auto"


DIMS = ["IE", "NS", "TF", "JP"]
LABELS = {
    "IE": {0: "Extrovert",  1: "Introvert"},
    "NS": {0: "Sensing",    1: "Intuitive"},
    "TF": {0: "Feeling",    1: "Thinking"},
    "JP": {0: "Perceiving", 1: "Judging"},
}

def clean_text(text):
    """
    Clean the input text by converting to lowercase, removing URLs,
    removing non-alphabetic characters, and stripping extra whitespace.
    """
    text = text.lower()
    text = re.sub(r"http\S+", "", text)
    text = re.sub(r"[^a-zA-Z\s]", "", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text

def confidence_status(c):
    """
    Map a confidence probability (0.0 to 1.0) to a human-readable status tier.
    """
    if c >= 0.70: return "High Confidence"
    if c >= 0.50: return "Moderate Confidence"
    return "Low Confidence"

def get_top_words(text, model, n=5):
    """
    Extract top TF-IDF words influencing the prediction.
    Returns a list of objects containing the word, its absolute score,
    and its influence direction ('positive' pushes toward class 1, 'negative' toward class 0).
    """
    X = vectorizer.transform([text])
    feature_names = vectorizer.get_feature_names_out()
    word_scores = {}
    
    for estimator in model.estimators_:
        if hasattr(estimator, "coef_"):
            coef = estimator.coef_[0]
            x_arr = X.toarray()[0]
            scores = coef * x_arr
            
            for i in np.nonzero(x_arr)[0]:
                w = feature_names[i]
                score = scores[i]
                # Keep the score with the highest absolute magnitude for a word across dimensions
                if w not in word_scores or abs(score) > abs(word_scores[w]):
                    word_scores[w] = score
    
    # Sort by absolute score descending
    sorted_words = sorted(word_scores.items(), key=lambda x: abs(x[1]), reverse=True)
    
    top_words = []
    for w, score in sorted_words[:n]:
        direction = "positive" if score > 0 else "negative"
        top_words.append({
            "word": w,
            "score": float(abs(score)),
            "direction": direction
        })
        
    return top_words

def predict_single(text, model, model_name):
    """
    Process text, run it through the specified model, and calculate
    dimension predictions, confidence scores, top words, and reliability score.
    """
    cleaned = clean_text(text)
    X = vectorizer.transform([cleaned])

    predictions = model.predict(X)[0]           # [IE, NS, TF, JP]
    probas      = model.predict_proba(X)         # list of 4 arrays

    word_count = len(text.split())
    warning = "Input is short — prediction may be unreliable. Try writing more." \
              if word_count < 20 else None

    dimensions = {}
    for i, dim in enumerate(DIMS):
        pred  = int(predictions[i])
        proba = probas[i][0][1]                     # probability of class 1
        conf  = float(proba) if pred == 1 else float(1 - proba)
        dimensions[dim] = {
            "label":      LABELS[dim][pred],
            "confidence": round(conf, 3),
            "confidence_percent": f"{round(conf*100, 1)}%",
            "status":     confidence_status(conf),
        }

    final_type = (
        ("I" if dimensions["IE"]["label"] == "Introvert"  else "E") +
        ("N" if dimensions["NS"]["label"] == "Intuitive"  else "S") +
        ("T" if dimensions["TF"]["label"] == "Thinking"   else "F") +
        ("J" if dimensions["JP"]["label"] == "Judging"    else "P")
    )

    overall_conf = round(
        sum(d["confidence"] for d in dimensions.values()) / 4, 3
    )
    
    reliability_score = round(overall_conf * 100, 1)

    top_words = get_top_words(cleaned, model)

    return {
        "final_type":         final_type,
        "dimensions":         dimensions,
        "overall_confidence": overall_conf,
        "reliability_score":  reliability_score,
        "top_words":          top_words,
        "word_count":         word_count,
        "warning":            warning,
        "model_used":         model_name,
    }

def predict(text, model_type="lr"):
    """
    Validate input and return single-model predictions.
    Defaults to Logistic Regression.
    """
    if not text or not text.strip():
        return {"error": "Text is empty."}
    model      = lr_model if model_type == "lr" else rf_model
    model_name = "Logistic Regression" if model_type == "lr" else "Random Forest"
    return predict_single(text, model, model_name)

def compare(text):
    """
    Compare predictions from both Logistic Regression and Random Forest models.
    """
    if not text or not text.strip():
        return {"error": "Text is empty."}
    return {
        "lr": predict_single(text, lr_model, "Logistic Regression"),
        "rf": predict_single(text, rf_model, "Random Forest"),
    }