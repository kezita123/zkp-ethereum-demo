// Age verification circuit - proves you're over 18 without revealing age
pragma circom 2.0.0;

template AgeVerification() {
    signal input age;           // private input (your actual age)
    signal input minAge;        // public input (18)
    signal output out;

    // Check that age >= minAge
    component gt = GreaterThan(32);
    gt.in[0] <== age;
    gt.in[1] <== minAge - 1;
    gt.out === 1;

    out <== 1;
}

component main = AgeVerification();
