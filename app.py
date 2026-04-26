from flask import Flask, request, jsonify
from flask_cors import CORS
from backend.predict import predict, compare
import logging

app = Flask(__name__)
CORS(app)

logging.basicConfig(level=logging.INFO)

@app.route("/", methods=["GET"])
def home():
    """Health check for the MindPrint API root."""
    return jsonify({"status": "MindPrint API running", "version": "1.0"})

@app.route("/predict", methods=["POST"])
def predict_route():
    """
    Predict MBTI personality type based on a single text string.
    Returns dimensions, confidences, top words, and warnings.
    """
    try:
        data = request.get_json()
        if not data or "text" not in data:
            return jsonify({"error": "Missing 'text' field."}), 400

        text = data["text"]
        if not text or len(text.split()) < 5:
            return jsonify({"error": "Text too short for meaningful analysis"}), 400

        model_type = data.get("model", "lr")
        result = predict(text, model_type=model_type)
        logging.info(f"Predicted: {result.get('final_type')} | Conf: {result.get('overall_confidence')}")
        return jsonify(result)

    except Exception as e:
        logging.error(f"Error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/compare", methods=["POST"])
def compare_route():
    """
    Run prediction on the same text using both Logistic Regression and Random Forest.
    Useful for comparing model agreements and disagreements.
    """
    try:
        data = request.get_json()
        if not data or "text" not in data:
            return jsonify({"error": "Missing 'text' field."}), 400

        text = data["text"]
        if not text or len(text.split()) < 5:
            return jsonify({"error": "Text too short for meaningful analysis"}), 400

        result = compare(text)
        return jsonify(result)

    except Exception as e:
        logging.error(f"Error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/analysis", methods=["POST"])
def analysis_route():
    """
    Run prediction on a batch of texts to calculate aggregate statistics.
    Returns average confidence, accuracy distribution (type counts),
    and counts of low vs high confidence statuses.
    """
    try:
        data = request.get_json()
        if not data or "texts" not in data or not isinstance(data["texts"], list):
            return jsonify({"error": "Missing 'texts' field or it is not a list."}), 400

        texts = data["texts"]
        if not texts:
            return jsonify({"error": "Empty list of texts."}), 400

        total_conf = 0
        accuracy_distribution = {}
        confidence_counts = {"High Confidence": 0, "Moderate Confidence": 0, "Low Confidence": 0}

        valid_count = 0

        for text in texts:
            if not text or len(text.split()) < 5:
                continue
            
            result = predict(text, model_type="lr")
            if "error" in result:
                continue

            valid_count += 1
            conf = result.get("overall_confidence", 0)
            total_conf += conf

            # Count final types for accuracy distribution
            ftype = result.get("final_type")
            if ftype:
                accuracy_distribution[ftype] = accuracy_distribution.get(ftype, 0) + 1
            
            # Confidence counts based on dimension statuses
            if "dimensions" in result:
                for dim_data in result["dimensions"].values():
                    status = dim_data.get("status")
                    if status in confidence_counts:
                        confidence_counts[status] += 1
                
        if valid_count == 0:
            return jsonify({"error": "No valid texts long enough for analysis."}), 400
            
        avg_confidence = round(total_conf / valid_count, 3)

        return jsonify({
            "average_confidence": avg_confidence,
            "accuracy_distribution": accuracy_distribution,
            "confidence_counts": confidence_counts
        })

    except Exception as e:
        logging.error(f"Error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/health", methods=["GET"])
def health():
    """Simple healthcheck endpoint."""
    return jsonify({"status": "healthy"})

if __name__ == "__main__":
    app.run(debug=True, port=5000)