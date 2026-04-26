# MindPrint: A Lexical Analysis Framework for Confidence-Aware Personality Classification

## Abstract
MindPrint is an exploratory research project investigating the intersection of natural language processing and psychometrics. By employing the Myers-Briggs Type Indicator (MBTI) as a heuristic proxy, this framework classifies linguistic patterns across four independent behavioral dichotomies (Introversion/Extraversion, Sensing/Intuition, Thinking/Feeling, Judging/Perceiving). Unlike traditional trait predictors that collapse dimensionality into a rigid label and hide their hesitation, MindPrint utilizes a comparative methodology—evaluating text concurrently through Logistic Regression and Random Forest models—to surface epistemic uncertainty and model disagreement.

## Methodology

### 1. Independent Dichotomy Classification
Instead of treating the 16 MBTI types as discrete, atomic classes, the framework models each of the four psychometric axes independently. This prevents forced typology collapse and allows for multidimensional variance in the predictions.

### 2. Feature Extraction
The framework employs Term Frequency-Inverse Document Frequency (TF-IDF) vectorization to capture both stylistic nuances and semantic lexical fingerprints from raw, unstructured text.

### 3. Model Comparison
Predictions are generated using a dual-reader methodology:
*   **Reader A (Logistic Regression):** Serves as a highly interpretable, linear baseline identifying distinct discriminative vocabulary. It allows us to extract the precise words driving the prediction.
*   **Reader B (Random Forest):** A non-linear ensemble method that captures complex feature interactions and high-dimensional variance.
By comparing the outputs, the system treats model disagreement as a signal rather than noise.

### 4. Confidence Calibration
The system does not simply output a deterministic label. Instead, it extracts the `predict_proba` array for each dimension, calibrating confidence into distinct tiers (High: $\ge$ 70%, Moderate: 50–69%, Low: $<50\%$). A calibrated machine is a humble one—doubt is treated as data.

## System Architecture
*   **Frontend**: A React-based interface built with Vite, Tailwind CSS, and Framer Motion. The UI adopts an exploratory, zine-like aesthetic (hand-drawn elements, typewriter fonts) to encourage user reflection on the probabilistic nature of the results.
*   **Backend**: A lightweight Flask API serving the machine learning pipeline. Scikit-learn is utilized for model serialization, inference, and extracting TF-IDF feature importances.

## Reproducibility & Setup

### Prerequisites
*   Node.js (v18+)
*   Python 3.10+

### 1. Environment Setup
```bash
git clone <your-repo-url>
cd mindprint

# Set up the Python virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install backend dependencies
pip install -r requirements.txt
```

### 2. Model Training (Optional)
If you wish to retrain the classifiers:
1.  Obtain the MBTI dataset (`mbti_1.csv`) from Kaggle.
2.  Place the dataset in the `data/` directory.
3.  Run the training script:
```bash
python backend/train.py
```
*Note: The pre-trained `.pkl` files will be saved to the `models/` directory.*

### 3. Running the Framework
Start the Flask inference API (runs on `http://127.0.0.1:5000`):
```bash
python app.py
```

In a new terminal window, start the frontend interface:
```bash
cd frontend
npm install
npm run dev
```
Navigate to `http://localhost:8081` (or the port specified by Vite) to access the interface.

## Caveats & Epistemological Limitations
MindPrint is built for inquiry, not clinical diagnosis. The underlying psychometric heuristic (MBTI) is widely contested in modern psychology. The outputs represent statistical inferences over lexical distributions, not inherent psychological assessments. We explicitly encourage users to treat predictions as hypotheses, and to read the model's hesitation as carefully as its prediction.

## License
MIT License. Built for research and exploratory inquiry.
