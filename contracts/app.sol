// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./age_zkp.sol"; // 确保正确路径
import "./upload.sol"; // 确保DIDStorage路径正确

contract App {
    Groth16Verifier public verifier;
    DIDStorage public didStorage;  // 引入 DIDStorage 合约

    constructor(address AgezkpAddress, address DIDStorageAddress) {
        verifier = Groth16Verifier(AgezkpAddress);
        didStorage = DIDStorage(DIDStorageAddress);  // 初始化 DIDStorage 实例
    }

    // 零知识证明验证函数
    function Ageverify(
        uint[2] calldata _pA, 
        uint[2][2] calldata _pB, 
        uint[2] calldata _pC, 
        uint[2] calldata _pubSignals
    ) external view returns (bool isValid) {
        isValid = verifier.verifyProof(_pA, _pB, _pC, _pubSignals);
        return isValid;
    }

    // 调用 DIDStorage 合约的 getDIDDocument 查询函数
    function getDIDDocumentDetails(string memory _id) public view returns (
        string memory context,
        string memory id,
        string memory verificationMethodId,
        string memory methodType,
        string memory Ax,
        string memory Ay,
        string memory encType,
        string memory publicKey,
        string memory authType,
        string memory publicKeyBase58,
        string memory proofType,
        string memory created,
        string memory verificationMethod,
        string memory proofPurpose,
        string memory signature
    ) {
        return didStorage.getDIDDocument(_id);  // 查询并返回 DID 文档数据
    }
}
