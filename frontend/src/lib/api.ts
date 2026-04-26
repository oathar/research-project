const BASE_URL = "http://localhost:5000";

// Toggle this to false when backend is ready
const USE_MOCK = false;

export interface PredictionResult {
  final_type: string;
  overall_confidence: number;
  dimensions: {
    IE: any;
    NS: any;
    TF: any;
    JP: any;
  };
  top_words: string[];
  word_count: number;
  warning: string | null;
  model_used: string;
}

export interface CompareResult {
  lr: PredictionResult;
  rf: PredictionResult;
}

// ── MOCK DATA ────────────────────────────────────────────
const MOCK_PREDICT: PredictionResult = {
  final_type: "INTJ",
  overall_confidence: 0.63,
  dimensions: {
    IE: { label: "Introvert",  confidence: 0.76, confidence_percent: "76.0%", status: "High Confidence" },
    NS: { label: "Intuitive",  confidence: 0.61, confidence_percent: "61.0%", status: "Moderate Confidence" },
    TF: { label: "Thinking",   confidence: 0.48, confidence_percent: "48.0%", status: "Low Confidence" },
    JP: { label: "Judging",    confidence: 0.55, confidence_percent: "55.0%", status: "Moderate Confidence" },
  },
  top_words: ["systems", "logic", "structure", "planning", "efficient"],
  word_count: 45,
  warning: null,
  model_used: "Logistic Regression",
};

const MOCK_COMPARE: CompareResult = {
  lr: { ...MOCK_PREDICT, model_used: "Logistic Regression" },
  rf: {
    ...MOCK_PREDICT,
    final_type: "INFJ",
    overall_confidence: 0.58,
    dimensions: {
      IE: { label: "Introvert", confidence: 0.71, confidence_percent: "71.0%", status: "High Confidence" },
      NS: { label: "Intuitive", confidence: 0.66, confidence_percent: "66.0%", status: "Moderate Confidence" },
      TF: { label: "Feeling",   confidence: 0.52, confidence_percent: "52.0%", status: "Moderate Confidence" },
      JP: { label: "Judging",   confidence: 0.44, confidence_percent: "44.0%", status: "Low Confidence" },
    },
    top_words: ["empathy", "feeling", "values", "meaning", "connect"],
    model_used: "Random Forest",
  },
};

// ── REAL API CALLS ────────────────────────────────────────
export async function predict(text: string, model = "lr"): Promise<PredictionResult> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 800)); // fake delay
    return MOCK_PREDICT;
  }
  const res = await fetch(`${BASE_URL}/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, model }),
  });
  if (!res.ok) throw new Error("Prediction failed");
  return res.json();
}

export async function compare(text: string): Promise<CompareResult> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 1000));
    return MOCK_COMPARE;
  }
  const res = await fetch(`${BASE_URL}/compare`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) throw new Error("Compare failed");
  return res.json();
}