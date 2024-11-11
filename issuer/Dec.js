const fs = require('fs');
const crypto = require('crypto');
const kyber = require('crystals-kyber'); // 导入 Kyber 模块

async function decryptData() {
    try {
        // 读取加密的 JSON 文件
        const encryptedData = JSON.parse(fs.readFileSync('./USER_DATA/encryptedData.json', 'utf-8'));

        // 读取私钥
        const keyPairJson = JSON.parse(fs.readFileSync('keyPair.json', 'utf-8'));
        const privateKey = Buffer.from(keyPairJson.privateKey, 'hex');

        // 将密文从 hex 转换为 Buffer
        const encryptedSymmetricKey = Buffer.from(encryptedData.encryptedSymmetricKey, 'hex');

        // 使用 Kyber 解密，恢复对称密钥
        const symmetricKey = kyber.Decrypt768(encryptedSymmetricKey, privateKey);
        console.log('Restored Symmetric Key:', symmetricKey.toString('hex'));

        // 从 JSON 文件中读取 AES 加密的密文和初始化向量
        const encryptedMessage = encryptedData.encryptedData;
        const iv = Buffer.from(encryptedData.iv, 'hex');

        // 使用恢复的对称密钥和初始化向量解密数据
        const decipher = crypto.createDecipheriv('aes-256-cbc', symmetricKey, iv);
        let decData = decipher.update(encryptedMessage, 'hex', 'utf-8');
        decData += decipher.final('utf-8');

        // 将解密的数据保存为原始 JSON 文件
        fs.writeFileSync('./decryptedData.json', decData, 'utf-8');
        console.log('Data has been decrypted and saved to decryptedData.json');
    } catch (error) {
        console.error('Error decrypting data:', error);
    }
}

decryptData();
