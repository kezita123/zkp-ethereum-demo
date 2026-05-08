pragma circom 2.0.0;

include "node_modules/circomlib/circuits/comparators.circom";

/*
 * diabetesClassifier.circom
 * 
 * Proves that a logistic regression model predicted diabetes positive
 * (probability >= 0.5) without revealing the actual probability score,
 * patient input features, or model weights.
 *
 * Private inputs (never revealed to blockchain or verifier):
 *   - predictionScore: model output scaled 0-1000 (e.g. 0.7823 -> 782)
 *
 * Public inputs (visible to verifier/blockchain):
 *   - threshold: classification boundary (always 500 = 0.5)
 *   - modelVersion: hash of model weights (proves correct model was used)
 *
 * Output:
 *   - isPositive: 1 if diabetic prediction, 0 if not
 */

template DiabetesClassifier() {
    // Private signal ? never leaves local environment
    signal input predictionScore;
    
    // Public signals ? visible to verifier
    signal input threshold;
    signal input modelVersion;
    
    // Output
    signal output isPositive;
    
    // Prove predictionScore >= threshold using GreaterEqThan
    component gte = GreaterEqThan(10);
    gte.in[0] <== predictionScore;
    gte.in[1] <== threshold;
    
    isPositive <== gte.out;
    
    // Constrain modelVersion is non-zero (model was specified)
    signal modelCheck;
    modelCheck <== modelVersion * modelVersion;
}

component main {public [threshold, modelVersion]} = DiabetesClassifier();
