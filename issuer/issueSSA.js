const fs = require("fs");
const { buildEddsa, buildBabyjub } = require("circomlibjs");

async function main() {
  const eddsa = await buildEddsa();
  const babyJub = await buildBabyjub();
  const F = babyJub.F;

  // 读取两个 JSON 文件
  const proofData = JSON.parse(fs.readFileSync("./Circom/proof/proof.json", "utf-8"));
  const publicData = JSON.parse(fs.readFileSync("./Circom/proof/public.json", "utf-8"));

  // 生成符合 did:example: 格式的 ID (假设随机生成)
  const prvKey = Buffer.from(
    "0001020304050607080900010203040506070809000102030405060708090001",
    "hex"
  );
  const pubKey = eddsa.prv2pub(prvKey);
  const generateRandomNineDigits = () => {
    return Math.floor(100000000 + Math.random() * 900000000).toString(); // 生成 9 位随机数
  };

  const randomId = generateRandomNineDigits();
  const did = `did:example:${randomId}`;


  // 生成时间戳
  const timestamp = new Date().toISOString();

  // 构造完整的 DID 文档
  const didDocument = {
    "@context": "https://www.w3.org/ns/did/v1",
    id: did,
    created: timestamp,
    proof: {
      ...proofData // 包含 proof.json 的数据
    },
    public: {
      ...publicData // 包含 public.json 的数据
    }
  };

  // 将完整的 DID 文档转换为字符串
  const didDocumentString = JSON.stringify(didDocument);

  // 将 DID 文档字符串转换为 Buffer 以便进行签名
  const msg = Buffer.from(didDocumentString, "utf8");

  // 使用 MiMC 签名算法对完整的 DID 文档进行签名
  const signature = eddsa.signMiMC(prvKey, msg);

  // 在最终的 DID 文档中添加签名字段
  const signedDidDocument = {
    ...didDocument, // 原始的 DID 文档
    signature: { // 附加的签名字段
      "Ax": BigInt(F.toObject(pubKey[0])).toString(),
      "Ay": BigInt(F.toObject(pubKey[1])).toString(),
      "R8x": BigInt(F.toObject(signature.R8[0])).toString(),
      "R8y": BigInt(F.toObject(signature.R8[1])).toString(),
      "S": signature.S.toString() // S 是 bigint，直接转换为字符串
    }
  };

  // 将 bigint 转为字符串的替换函数
  function objReplacer(key, value) {
    if (typeof value === "bigint") {
      return value.toString();
    } else if (typeof value === "object") {
      for (const k in value) {
        if (typeof value[k] === "bigint") {
          value[k] = value[k].toString();
        } else if (typeof value[k] === "object") {
          value[k] = objReplacer(k, value[k]); // 递归处理嵌套对象
        }
      }
    }
    return value;
  }

  // 将带有签名的 DID 文档保存到一个文件
  fs.writeFileSync(
    "./USER_SSC/SSC_USER1.json", // 输出文件名
    JSON.stringify(signedDidDocument, objReplacer, 2), // 转换为 JSON 字符串并处理 bigint
    "utf-8"
  );

  console.log("Signed DID document generated and saved to ./USER_CA/signedDidDocument.json");
}

main();
