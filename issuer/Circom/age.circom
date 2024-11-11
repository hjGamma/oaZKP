pragma circom 2.0.0;
include "../../node_modules/circomlib/circuits/mimc.circom";
include "../../node_modules/circomlib/circuits/eddsamimc.circom";
include "../../node_modules/circomlib/circuits/comparators.circom";
include "../../node_modules/circomlib/circuits/mux1.circom"; 

template VeriftyAge(m, n) {
    signal input pparameter[m]; 
    signal input pvalue[m];   

    signal input parameter[n]; 
    signal input value[n];     

    signal input jsonHash;
    signal input Ax;
    signal input Ay;
    signal input R8x;
    signal input R8y;
    signal input S;
    signal input enabled;

    signal output result;

    // 声明组件
    component signatureCheck = EdDSAMiMCVerifier();
    component isEqual[m][n];    
    component isValueEqual[m][n]; 
    component mux[m][n];        
    component Equal = IsEqual();

    signatureCheck.enabled <== enabled;
    signatureCheck.Ax <== Ax;
    signatureCheck.Ay <== Ay;
    signatureCheck.R8x <== R8x;
    signatureCheck.R8y <== R8y;
    signatureCheck.S <== S;
    signatureCheck.M <== jsonHash;

    signal matchnum;
    var allMatched = 0;  // 初始值设为1，表示所有匹配成功
    var matched[m];
    // 遍历并匹配 pparameter 和 parameter
    for (var k = 0; k < n; k++){
        matched[k] = 0;
    }
    
    for (var i = 0; i < m; i++) {

        for (var j = 0; j < n; j++) {

            isEqual[i][j] = IsEqual();  
            isValueEqual[i][j] = IsEqual();
            mux[i][j] = Mux1();     
            // 判断是否 pparameter[i] 与 parameter[j] 匹配
            isEqual[i][j].in[0] <== pparameter[i];
            isEqual[i][j].in[1] <== parameter[j];

            isValueEqual[i][j].in[0] <== pvalue[i];
            isValueEqual[i][j].in[1] <== value[j];
      
            mux[i][j].s <== isEqual[i][j].out;
            mux[i][j].c[0] <== 0;  //
            mux[i][j].c[1] <== isValueEqual[i][j].out; // 
            matched[i] += mux[i][j].out; 
            //allMatched *= mux[i].out;
            // 
            //tempMatched[i][j] <== mux[i][j].out;
        }
        allMatched = allMatched + matched[i];
        // // 在内层循环结束后更新 matched[i]
        // for (var j = 0; j < n; j++) {
        //     matched[i] <== matched[i] + tempMatched[i][j]; // 累积内部循环的结果
        // }

        // 
        // allMatched <== allMatched * matched[i];
    }
    matchnum <== allMatched;
    Equal.in[0] <== matchnum;
    Equal.in[1] <== n;
    result <== Equal.out;  
}

component main {public [parameter, value]} = VeriftyAge(50, 50);
