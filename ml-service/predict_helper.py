import sys, json, joblib
from features import extract_features_dict, FEATURE_COLUMNS

model_path = sys.argv[1]
model_bundle = joblib.load(model_path)
model = model_bundle['model']
feature_cols = model_bundle['feature_columns']

for line in sys.stdin:
    req = json.loads(line)
    feats = extract_features_dict(
        req.get('method'),
        req.get('url'),
        req.get('headers', '{}'),
        req.get('body', '')
    )
    X = [feats[col] for col in feature_cols]
    pred = model.predict([X])[0]
    print(json.dumps({'prediction': pred}))
    sys.stdout.flush()
