import os
import sys
import pandas as pd
import numpy as np
import joblib

from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score

from features import extract_features_dict, FEATURE_COLUMNS

DATA_DIR = os.path.join(os.path.dirname(__file__), 'data')
MODELS_DIR = os.path.join(os.path.dirname(__file__), 'models')
MODEL_PATH = os.path.join(MODELS_DIR, 'baseline.pkl')

def train():
    os.makedirs(MODELS_DIR, exist_ok=True)
    dataset_path = os.path.join(DATA_DIR, 'dataset.csv')

    print(f"Loading dataset from: {dataset_path}")
    df = pd.read_csv(dataset_path)

    df.fillna({'method': 'GET', 'url': '', 'headers': '{}', 'body': '', 'label': 'benign'}, inplace=True)
    print(f"Dataset loaded: {len(df)} total rows.")
    print("Label distribution:\n", df['label'].value_counts())

    print("\nExtracting request features...")
    
    # Vectorized feature calculation for speed
    url_str = df['url'].astype(str)
    body_str = df['body'].astype(str)
    combined = (url_str + " " + body_str).str.lower()
    
    special_chars = ['\'', '"', '<', '>', ';', '--', '|', '&', '$', '%', '`']
    sqli_pats = ['union select', 'or 1=1', 'select ', 'information_schema', '\'--', 'drop table', 'exec', '; select']
    xss_pats = ['<script>', 'javascript:', 'onerror=', 'onload=', 'document.cookie', 'eval(', 'alert(']
    cmd_pats = ['; rm', '| bash', '| sh', 'cat /etc', '`', '$(', 'wget ', 'curl ']

    X = pd.DataFrame({
        'url_length': url_str.str.len(),
        'body_length': body_str.str.len(),
        'special_char_count': sum(combined.str.count(c, regex=False) for c in special_chars),
        'sqli_pattern_count': sum(combined.str.count(p, regex=False) for p in sqli_pats),
        'xss_pattern_count': sum(combined.str.count(p, regex=False) for p in xss_pats),
        'cmd_pattern_count': sum(combined.str.count(p, regex=False) for p in cmd_pats),
        'header_count': 1
    })

    y = df['label'].astype(str)

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )

    print(f"\nTrain set: {len(X_train)} samples | Test set: {len(X_test)} samples")
    print("\nTraining scikit-learn RandomForestClassifier baseline model...")
    
    clf = RandomForestClassifier(
        n_estimators=100,
        max_depth=15,
        random_state=42,
        class_weight='balanced',
        n_jobs=-1
    )
    clf.fit(X_train, y_train)

    y_pred = clf.predict(X_test)
    acc = accuracy_score(y_test, y_pred)

    print("\n" + "="*60)
    print(f"       SKLEARN MODEL EVALUATION (ACCURACY: {acc * 100:.2f}%)       ")
    print("="*60)
    print(classification_report(y_test, y_pred))

    labels_order = clf.classes_
    model_bundle = {
        'model': clf,
        'feature_columns': FEATURE_COLUMNS,
        'classes': labels_order.tolist(),
        'metrics': {
            'accuracy': acc,
            'test_samples': len(y_test)
        }
    }

    joblib.dump(model_bundle, MODEL_PATH)
    print(f"\n[SUCCESS] Standard scikit-learn model saved to: {MODEL_PATH}")

if __name__ == '__main__':
    train()
