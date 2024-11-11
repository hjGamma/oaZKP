const fs = require("fs");
const { buildEddsa, buildBabyjub } = require("circomlibjs");


async function main() {
  const eddsa = await buildEddsa();
  const babyJub = await buildBabyjub();

  const F = babyJub.F;
  // 定义要签名的 JSON 数据
  const jsonData = JSON.parse(fs.readFileSync("./USER1/ageSSA.json", "utf-8"));

  // 将 JSON 数据转换为字符串
  const jsonString = JSON.stringify(jsonData);

  // 将 JSON 字符串转换为 message
  const msg = Buffer.from(jsonString, "utf8");

  // 生成私钥
  const prvKey = Buffer.from(
    "0022033304450607780900010203040506070809000102030405060788090011",
    "hex"
  );

  // 生成公钥
  const pubKey = eddsa.prv2pub(prvKey);


  // 使用 MiMC 签名算法对消息进行签名
  const signature = eddsa.signMiMC(prvKey, msg);

  // 将签名结果附加到原始 JSON 数据
  const signedJsonData = {
    ...jsonData, // 原始 JSON 数据
    "signature_user": { // 附加的签名字段
      "Ax": BigInt(F.toObject(pubKey[0])).toString(),
      "Ay": BigInt(F.toObject(pubKey[1])).toString(),
      "R8x": BigInt(F.toObject(signature.R8[0])).toString(),
      "R8y": BigInt(F.toObject(signature.R8[1])).toString(),
      "S": signature.S
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

  // 将带有签名的 JSON 数据保存到一个文件
  fs.writeFileSync(
    "./USER1/age.json", // 输出文件名
    JSON.stringify(signedJsonData, objReplacer), // 转换为 JSON 字符串并处理 bigint
    "utf-8"
  );
}

main();