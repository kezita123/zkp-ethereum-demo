# ZKP Circuits

## diabetesClassifier.circom

Proves that a logistic regression model predicted diabetes positive
(probability >= 0.5) without revealing the actual probability score,
patient features, or model weights.

### Signals

| Signal | Type | Visibility | Description |
|--------|------|-----------|-------------|
| predictionScore | input | Private | Model output scaled 0-1000 |
| threshold | input | Public | Classification boundary (500) |
| modelVersion | input | Public | Model identity hash |
| isPositive | output | Public | 1=diabetic, 0=non-diabetic |

### Compile

circom diabetesClassifier.circom --r1cs --wasm --sym -o . -l "."


### Security Properties

- Completeness: valid predictions always generate valid proofs
- Soundness: impossible to fake a positive prediction
- Zero-Knowledge: verifier learns only isPositive, not the score

## ageVerification.circom (legacy)

Original prototype circuit for age-based eligibility.
Proves patient age >= minAge without revealing actual age.
Superseded by diabetesClassifier.circom for the full pipeline.
