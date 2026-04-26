const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000";

// Toggle this to false when backend is ready
const USE_MOCK = false;

export interface TopWord {
  word: string;
  score: number;
  direction: string;
}

export interface PredictionResult {
  final_type: string;
  overall_confidence: number;
  reliability_score?: number;
  dimensions: {
    IE: any;
    NS: any;
    TF: any;
    JP: any;
  };
  top_words: TopWord[] | string[];
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
  reliability_score: 63,
  dimensions: {
    IE: { label: "Introvert",  confidence: 0.76, confidence_percent: "76.0%", status: "High Confidence" },
    NS: { label: "Intuitive",  confidence: 0.61, confidence_percent: "61.0%", status: "Moderate Confidence" },
    TF: { label: "Thinking",   confidence: 0.48, confidence_percent: "48.0%", status: "Low Confidence" },
    JP: { label: "Judging",    confidence: 0.55, confidence_percent: "55.0%", status: "Moderate Confidence" },
  },
  top_words: [
    { word: "systems", score: 1.2, direction: "positive" },
    { word: "logic", score: 0.9, direction: "positive" },
    { word: "structure", score: 0.8, direction: "positive" },
    { word: "planning", score: 0.7, direction: "positive" },
    { word: "efficient", score: 0.6, direction: "positive" }
  ],
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
    reliability_score: 58,
    dimensions: {
      IE: { label: "Introvert", confidence: 0.71, confidence_percent: "71.0%", status: "High Confidence" },
      NS: { label: "Intuitive", confidence: 0.66, confidence_percent: "66.0%", status: "Moderate Confidence" },
      TF: { label: "Feeling",   confidence: 0.52, confidence_percent: "52.0%", status: "Moderate Confidence" },
      JP: { label: "Judging",   confidence: 0.44, confidence_percent: "44.0%", status: "Low Confidence" },
    },
    top_words: [
      { word: "empathy", score: 1.1, direction: "positive" },
      { word: "feeling", score: 1.0, direction: "positive" },
      { word: "values", score: 0.9, direction: "positive" },
      { word: "meaning", score: 0.8, direction: "positive" },
      { word: "connect", score: 0.7, direction: "positive" }
    ],
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
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Prediction failed");
  }
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
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Compare failed");
  }
  return res.json();
}