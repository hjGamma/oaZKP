pragma circom 2.0.0;
include "./node_modules/circomlib/circuits/eddsamimc.circom";
include "../../node_modules/circomlib/circuits/comparators.circom";

template VeriftyAge(){
    signal input age;
    signal input value;
    
    signal input Ax;
    signal input Ay;
    signal input R8x;
    signal input R8y;
    signal input S;
    signal input M;

    signal input enabled;
    signal output result;
    component eddsa= EdDSAMiMCVerifier();
    signatureCheck.enabled <== enabled;
    signatureCheck.Ax <== Ax;
    signatureCheck.Ay <== Ay;
    signatureCheck.R8x <== R8x;
    signatureCheck.R8y <== R8y;
    signatureCheck.S <== S;
    signatureCheck.M <== M;

    component greaterEq = GreaterEqThan(8);
    greaterEq.in[0] <== age;      
    greaterEq.in[1] <== value;   
    result <== greaterEq.out;
}

component main {public [value]}=VeriftyAge();