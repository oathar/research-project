from flask import Flask, request, jsonify
from flask_cors import CORS
from backend.predict import predict, compare
import logging

app = Flask(__name__)
CORS(app)

logging.basicConfig(level=logging.INFO)

@app.route("/", methods=["GET"])
def home():
    return jsonify({"status": "MindPrint API running", "version": "1.0"})

@app.route("/predict", methods=["POST"])
def predict_route():
    try:
        data = request.get_json()
        if not data or "text" not in data:
            return jsonify({"error": "Missing 'text' field."}), 400

        model_type = data.get("model", "lr")
        result = predict(data["text"], model_type=model_type)
        logging.info(f"Predicted: {result.get('final_type')} | Conf: {result.get('overall_confidence')}")
        return jsonify(result)

    except Exception as e:
        logging.error(f"Error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/compare", methods=["POST"])
def compare_route():
    try:
        data = request.get_json()
        if not data or "text" not in data:
            return jsonify({"error": "Missing 'text' field."}), 400

        result = compare(data["text"])
        return jsonify(result)

    except Exception as e:
        logging.error(f"Error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "healthy"})

if __name__ == "__main__":
    app.run(debug=True, port=5000)