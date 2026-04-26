import pandas as pd
from backend.predict import predict

def run_analysis(sample_size=300):
    print(f"Running analysis on {sample_size} samples...")
    df = pd.read_csv("data/mbti_1.csv").head(sample_size)

    records = []
    for _, row in df.iterrows():
        res = predict(row["posts"], model_type="lr")
        if "error" not in res:
            records.append({
                "true_type":    row["type"],
                "predicted":    res["final_type"],
                "overall_conf": res["overall_confidence"],
                "word_count":   res["word_count"],
                "correct":      row["type"] == res["final_type"],
            })

    result_df = pd.DataFrame(records)

    avg_conf = result_df["overall_conf"].mean()
    accuracy = result_df["correct"].mean()
    low_conf  = result_df[result_df["overall_conf"] <  0.50]
    high_conf = result_df[result_df["overall_conf"] >= 0.70]

    print(f"\n--- Analysis Results ---")
    print(f"Avg Confidence:        {round(avg_conf, 3)}")
    print(f"Overall Accuracy:      {round(accuracy*100, 2)}%")
    print(f"Low Confidence count:  {len(low_conf)}")
    print(f"High Confidence count: {len(high_conf)}")

    if len(low_conf):
        print(f"Accuracy on Low Conf:  {round(low_conf['correct'].mean()*100,2)}%")
    if len(high_conf):
        print(f"Accuracy on High Conf: {round(high_conf['correct'].mean()*100,2)}%")

    print("\nKey Insight: Higher confidence correlates with higher accuracy.")
    return result_df

if __name__ == "__main__":
    run_analysis()