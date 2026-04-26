import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.multioutput import MultiOutputClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, hamming_loss
import pickle
import os
import re

# Get the project root directory
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(PROJECT_ROOT, "data")
MODELS_DIR = os.path.join(PROJECT_ROOT, "models")

DIMENSION_LABELS = {
    "IE": {0: "Extrovert", 1: "Introvert"},
    "NS": {0: "Sensing",   1: "Intuitive"},
    "TF": {0: "Feeling",   1: "Thinking"},
    "JP": {0: "Perceiving",1: "Judging"},
}

def clean_text(text):
    text = text.lower()
    text = re.sub(r"http\S+", "", text)
    text = re.sub(r"[^a-zA-Z\s]", "", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text

def make_labels(df):
    df["IE"] = (df["type"].str[0] == "I").astype(int)
    df["NS"] = (df["type"].str[1] == "N").astype(int)
    df["TF"] = (df["type"].str[2] == "T").astype(int)
    df["JP"] = (df["type"].str[3] == "J").astype(int)
    return df

def train():
    print("Loading data...")
    csv_path = os.path.join(DATA_DIR, "mbti_1.csv")
    df = pd.read_csv(csv_path)
    df["posts"] = df["posts"].apply(clean_text)
    df = make_labels(df)

    X = df["posts"]
    y = df[["IE", "NS", "TF", "JP"]]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    print("Vectorizing...")
    vectorizer = TfidfVectorizer(max_features=5000, stop_words="english")
    X_train_vec = vectorizer.fit_transform(X_train)
    X_test_vec  = vectorizer.transform(X_test)

    print("Training Logistic Regression...")
    lr = MultiOutputClassifier(LogisticRegression(max_iter=1000))
    lr.fit(X_train_vec, y_train)
    lr_pred   = lr.predict(X_test_vec)
    lr_exact  = accuracy_score(y_test, lr_pred)
    lr_hamming = hamming_loss(y_test, lr_pred)
    print(f"  Exact Match : {round(lr_exact * 100, 2)}%")
    print(f"  Hamming Loss: {round(lr_hamming, 4)}")

    print("Training Random Forest...")
    rf = MultiOutputClassifier(
        RandomForestClassifier(n_estimators=100, random_state=42)
    )
    rf.fit(X_train_vec, y_train)
    rf_pred    = rf.predict(X_test_vec)
    rf_exact   = accuracy_score(y_test, rf_pred)
    rf_hamming = hamming_loss(y_test, rf_pred)
    print(f"  Exact Match : {round(rf_exact * 100, 2)}%")
    print(f"  Hamming Loss: {round(rf_hamming, 4)}")

    os.makedirs(MODELS_DIR, exist_ok=True)
    pickle.dump(lr,         open(os.path.join(MODELS_DIR, "lr_model.pkl"),   "wb"))
    pickle.dump(rf,         open(os.path.join(MODELS_DIR, "rf_model.pkl"),   "wb"))
    pickle.dump(vectorizer, open(os.path.join(MODELS_DIR, "vectorizer.pkl"), "wb"))
    print("\nAll models saved to", MODELS_DIR)

    return {
        "lr": {"exact_match": round(lr_exact*100,2), "hamming_loss": round(lr_hamming,4)},
        "rf": {"exact_match": round(rf_exact*100,2), "hamming_loss": round(rf_hamming,4)},
    }

if __name__ == "__main__":
    train()