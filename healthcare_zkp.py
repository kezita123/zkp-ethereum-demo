"""
Healthcare AI + ZKP Commitment Generator
Paper: Beyond Blind Trust ? Three-Tier ZK-SNARK Framework for Verifiable Clinical AI
Authors: Kezita Jebastine, Jeslyn Liz Jacob
Conference: BRAINS 2026, Florence, Italy

This script:
1. Loads the Pima Diabetes dataset
2. Trains a logistic regression classifier using sklearn (proper train/test split)
3. Computes model metrics ? accuracy, precision, recall, F1, AUC-ROC
4. Saves model_metrics.json for the paper's evaluation table
5. Runs inference on test patients
6. Generates a ZKP commitment (SHA-256 hash) of each inference
7. Generates circuit inputs for diabetesClassifier.circom
8. Records timing metrics for the paper
"""

import hashlib
import time
import json
import csv
import os
import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import (accuracy_score, precision_score, recall_score,
                             f1_score, roc_auc_score, classification_report)

# ?? Pima Diabetes dataset (embedded ? 20 samples) ?????????????????????????
# Columns: Pregnancies, Glucose, BloodPressure, SkinThickness,
#          Insulin, BMI, DiabetesPedigreeFunction, Age, Outcome
DATASET = [
    [6,148,72,35,0,33.6,0.627,50,1],
    [1,85,66,29,0,26.6,0.351,31,0],
    [8,183,64,0,0,23.3,0.672,32,1],
    [1,89,66,23,94,28.1,0.167,21,0],
    [0,137,40,35,168,43.1,2.288,33,1],
    [5,116,74,0,0,25.6,0.201,30,0],
    [3,78,50,32,88,31.0,0.248,26,1],
    [10,115,0,0,0,35.3,0.134,29,0],
    [2,197,70,45,543,30.5,0.158,53,1],
    [8,125,96,0,0,0.0,0.232,54,1],
    [4,110,92,0,0,37.6,0.191,30,0],
    [10,168,74,0,0,38.0,0.537,34,1],
    [10,139,80,0,0,27.1,1.441,57,0],
    [1,189,60,23,846,30.1,0.398,59,1],
    [5,166,72,19,175,25.8,0.587,51,1],
    [7,100,0,0,0,30.0,0.484,32,1],
    [0,118,84,47,230,45.8,0.551,31,1],
    [7,107,74,0,0,29.6,0.254,31,1],
    [1,103,30,38,83,43.3,0.183,33,0],
    [1,115,70,30,96,34.6,0.529,32,1],
]

# ?? Train model with sklearn ??????????????????????????????????????????????
def train_model():
    """Train logistic regression on train/test split, compute metrics"""
    X = np.array([row[:8] for row in DATASET])
    y = np.array([row[8] for row in DATASET])
    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.5, random_state=42, stratify=y
    )
    
    model = LogisticRegression(max_iter=1000, random_state=42)
    model.fit(X_train, y_train)
    
    y_pred = model.predict(X_test)
    y_prob = model.predict_proba(X_test)[:, 1]
    
    metrics = {
        "accuracy": round(float(accuracy_score(y_test, y_pred)), 4),
        "precision": round(float(precision_score(y_test, y_pred, zero_division=0)), 4),
        "recall": round(float(recall_score(y_test, y_pred, zero_division=0)), 4),
        "f1_score": round(float(f1_score(y_test, y_pred, zero_division=0)), 4),
        "auc_roc": round(float(roc_auc_score(y_test, y_prob)), 4),
        "train_size": len(X_train),
        "test_size": len(X_test),
        "model_type": "LogisticRegression",
        "features": ["Pregnancies", "Glucose", "BloodPressure", "SkinThickness",
                     "Insulin", "BMI", "DiabetesPedigreeFunction", "Age"]
    }
    
    # Save metrics
    with open("model_metrics.json", "w") as f:
        json.dump(metrics, f, indent=2)
    
    print("=" * 65)
    print("  Model Training Complete")
    print("=" * 65)
    for k, v in metrics.items():
        if isinstance(v, float):
            print(f"  {k:<20}: {v:.4f}")
        elif isinstance(v, list):
            print(f"  {k:<20}: {v}")
        else:
            print(f"  {k:<20}: {v}")
    print("=" * 65)
    
    return model, metrics

# ?? ZKP Commitment ????????????????????????????????????????????????????????
def generate_commitment(patient_id, model_version, prediction, probability):
    """Generates SHA-256 commitment hash"""
    payload = {
        "patient_id": patient_id,
        "model_version": model_version,
        "prediction": prediction,
        "probability": probability,
        "timestamp": int(time.time())
    }
    payload_str = json.dumps(payload, sort_keys=True)
    commitment = hashlib.sha256(payload_str.encode()).hexdigest()
    return commitment, payload_str

# ?? Circuit Input Generator ???????????????????????????????????????????????
def generate_circuit_input(patient_id, prediction, probability, model_version_hash):
    """Generates input.json for diabetesClassifier.circom"""
    scaled_score = int(probability * 1000)
    model_int = int(hashlib.sha256(
        model_version_hash.encode()
    ).hexdigest()[:8], 16) % (2**10)
    circuit_input = {
        "predictionScore": str(scaled_score),
        "threshold": "500",
        "modelVersion": str(model_int)
    }
    return circuit_input

# ?? Main experiment loop ??????????????????????????????????????????????????
def run_experiment():
    print("=" * 65)
    print("  Healthcare ZKP Commitment Generator")
    print("  Pima Diabetes Dataset | Logistic Regression (sklearn)")
    print("=" * 65)

    # Train model first
    model, metrics = train_model()

    results = []
    MODEL_VERSION = "logistic_regression_sklearn_v2.0"
    X = np.array([row[:8] for row in DATASET[:10]])  # first 10 as demo test set
    y_actual = np.array([row[8] for row in DATASET[:10]])

    os.makedirs("circuits/inputs", exist_ok=True)

    print(f"\n{'Run':<5} {'Patient':<10} {'Prediction':<12} {'Prob':<8} "
          f"{'Commit Time(ms)':<18} {'Commitment (first 16 chars)'}")
    print("-" * 75)

    for i in range(len(X)):
        patient_id  = f"PAT-{1000 + i}"
        actual      = int(y_actual[i])

        t1 = time.perf_counter()
        probability = float(model.predict_proba([X[i]])[0][1])
        prediction = int(probability >= 0.5)
        commitment, payload = generate_commitment(
            patient_id, MODEL_VERSION, prediction, round(probability, 4)
        )
        circuit_input = generate_circuit_input(
            patient_id, prediction, round(probability, 4), MODEL_VERSION
        )
        input_path = f"circuits/inputs/input_{patient_id}.json"
        with open(input_path, "w") as f:
            json.dump(circuit_input, f, indent=2)
        commit_time = (time.perf_counter() - t1) * 1000

        label = "Diabetic" if prediction == 1 else "Non-Diabetic"
        correct = "OK" if prediction == actual else "XX"

        print(f"{i+1:<5} {patient_id:<10} {label:<12} {round(probability, 4):<8} "
              f"{commit_time:<18.4f} {commitment[:16]}... {correct}")

        results.append({
            "run": i + 1,
            "patient_id": patient_id,
            "prediction": prediction,
            "label": label,
            "probability": round(probability, 4),
            "actual": actual,
            "correct": prediction == actual,
            "commit_time_ms": round(commit_time, 4),
            "commitment": commitment,
            "commitment_hex": "0x" + commitment
        })

    # ?? Summary ????????????????????????????????????????????????????????
    correct_count = sum(1 for r in results if r["correct"])
    avg_commit    = sum(r["commit_time_ms"] for r in results) / len(results)
    accuracy      = (correct_count / len(results)) * 100

    print("\n" + "=" * 65)
    print("  RESULTS SUMMARY")
    print("=" * 65)
    print(f"  Total patients processed : {len(results)}")
    print(f"  Correct predictions      : {correct_count}/{len(results)} ({accuracy:.0f}%)")
    print(f"  Avg commitment gen time  : {avg_commit:.4f} ms")
    print("=" * 65)

    # Save CSV
    csv_file = "zkp_results.csv"
    with open(csv_file, "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=results[0].keys())
        writer.writeheader()
        writer.writerows(results)
    print(f"\n  Results saved to: {csv_file}")

    # Save commitments
    commitments_file = "commitments_for_blockchain.json"
    commitments = [{"patient_id": r["patient_id"],
                    "commitment": r["commitment_hex"]} for r in results]
    with open(commitments_file, "w") as f:
        json.dump(commitments, f, indent=2)
    print(f"  Commitments saved to: {commitments_file}")
    print(f"  Model metrics saved to: model_metrics.json")
    print("\n  NEXT: Run npx hardhat run scripts/storeProof_batch.js --network hardhat\n")

    return results

if __name__ == "__main__":
    run_experiment()
