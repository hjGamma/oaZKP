const fs = require('fs');
const kyber = require('crystals-kyber'); // 导入 Kyber 模块

async function main() {
    // 生成公钥和私钥
    const pk_sk = kyber.KeyGen768(); // 使用 Kyber 768 参数集生成密钥对
    const publicKey = pk_sk[0]; // 获取公钥
    const privateKey = pk_sk[1]; // 获取私钥

    // 将公钥和私钥转换为 Base64 格式
    const publicKeyBase64 = Buffer.from(publicKey).toString('base64');
    const privateKeyBase64 = Buffer.from(privateKey).toString('base64');

    // 构建 JSON 对象
    const keyPairJson = {
        publicKey: publicKeyBase64,
        privateKey: privateKeyBase64
    };

    // 保存密钥对到 JSON 文件
    fs.writeFileSync('keyPair.json', JSON.stringify(keyPairJson, null, 2), 'utf-8');
    console.log('Key pair saved to keyPair.json');
}

main();
