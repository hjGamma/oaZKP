const fs = require('fs');
const crypto = require('crypto');
const kyber = require('crystals-kyber'); // 导入 Kyber 模块

async function encryptData() {
    // 读取 JSON 文件中的密钥对
    const keyPairJson = JSON.parse(fs.readFileSync('ISSUERDID.json', 'utf-8'));

    // 从 JSON 中获取公钥，并将其从 Base64 转换为 Buffer
    const publicKey = Buffer.from(keyPairJson.Enc[0].publicKey, 'base64');

    // 要加密的数据 (读取原始 JSON 文件)
    const dataToEncrypt = fs.readFileSync('USER1/use1CA.json', 'utf-8');

    // 生成一次性对称密钥 (256 bit)，用于 AES 加密
    const ss1 = crypto.randomBytes(32); // 256-bit key
    console.log('Generated Symmetric Key:', ss1.toString('hex'));

    // 使用 AES 对数据进行加密
    const iv = crypto.randomBytes(16); // 初始化向量
    const cipher = crypto.createCipheriv('aes-256-cbc', ss1, iv);
    let encryptedMessage = cipher.update(dataToEncrypt, 'utf-8', 'hex');
    encryptedMessage += cipher.final('hex'); 

    // 使用 Kyber 加密生成的对称密钥
    let kyberResult = kyber.Encrypt768(publicKey);
    const encryptedSymmetricKey = Buffer.from(kyberResult[0]).toString('hex'); // 使用 Kyber 加密后的对称密钥

    // 将加密的数据和加密的对称密钥保存到 JSON 文件
    const encryptedDataJson = {
        iv: iv.toString('hex'),  // 将初始化向量保存
        encryptedData: encryptedMessage, // 保存 AES 加密后的数据
        encryptedSymmetricKey: encryptedSymmetricKey // 保存 Kyber 加密的对称密钥
    };

    // 保存加密结果到文件
    fs.writeFileSync('./encryptedData.json', JSON.stringify(encryptedDataJson, null, 2), 'utf-8');
    console.log('Data has been encrypted and saved to encryptedData.json');
}

encryptData();
