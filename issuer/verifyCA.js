const { buildEddsa, buildBabyjub,buildMimc7 } = require("circomlibjs");
const fs = require("fs");
const kyber = require('crystals-kyber');


async function verifySignature() {
  const eddsa = await buildEddsa();
  const mimc7 = await buildMimc7();
  const babyJub = await buildBabyjub();
  const F = babyJub.F;

  // 被验证的 JSON 数据
  const signedJson = JSON.parse(fs.readFileSync("./USER_CA/use1CA.json", "utf-8"));

  // 检查年龄
  if (signedJson.credentialSubject.age >= 18) {
    // 提取签名
    const signature = signedJson.signature;

    // 移除签名字段，留下需要验证的数据
    delete signedJson.signature;

    // 将剩余的 JSON 数据序列化为字符串
    const jsonString = JSON.stringify(signedJson);

    // 将 JSON 字符串转换为消息的字节数组
    const msg = Buffer.from(jsonString, "utf8");
    // 提取公钥和签名信息
    const pubKey = [
      F.e(signature.Ax),
      F.e(signature.Ay)
    ];

    const R8 = [
      F.e(signature.R8x),
      F.e(signature.R8y)
    ];

    const S = signature.S;

    // 验证签名
    const isValid = eddsa.verifyMiMC(msg, { R8, S }, pubKey);

    if (isValid) {
      console.log("签名验证成功！");
      newage={age:signedJson.credentialSubject.age}

      const prvKey = Buffer.from(
        "0001020304050607080900010203040506070809000102030405060708090001",
        "hex"
      );

      const pubKey= eddsa.prv2pub(prvKey);
      const ageHash= mimc7.multiHash(
        [pubKey[0],pubKey[1],newage.age],1
      );
      const signature = eddsa.signMiMC(prvKey, ageHash);
       const inputs={
        age:newage.age.toString(),
        value:"18",
        Ax:BigInt(F.toObject(pubKey[0])).toString(),
        Ay:BigInt(F.toObject(pubKey[1])).toString(),
        R8x:BigInt(F.toObject(signature.R8[0])).toString(),
        R8y:BigInt(F.toObject(signature.R8[1])).toString(),
        S:BigInt(signature.S).toString(),
        enabled:"1"
       }
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
  // 输出为 JSON 文件
  fs.writeFileSync(
    "./Circom/input.json", // 输出文件名
    JSON.stringify(inputs, objReplacer), // 转换为 JSON 字符串并处理 bigint
    "utf-8"
  );
  console.log("签名成功，结果已保存到 input.json");
      //const newage = F.e(signedJson.credentialSubject.age);
      // const data={
      //   //id:signedJson.id,
      //   age:signedJson.credentialSubject.age
      // };
      //const idBytes = Buffer.from(data.id, "utf-8")
      //const NEWString = JSON.stringify(data);
      //const agemsg= data.age.toString();
      
      //const age = BigInt(data.age);
      //const newmsg = {
        //id: BigInt(F.toObject(Array.from(idBytes))).toString(), // 转换为数组
        //age: agemsg // 作为字符串处理
      //};

      //signObject(data,pubKey);
    } else {
      console.log("签名验证失败！");
    }
  } else {
    console.log("未满18岁");
  }
}

// async function signObject(object,pubKey) {
//   const eddsa = await buildEddsa();
//   const babyJub = await buildBabyjub();
//   const F = babyJub.F;

//   // 将对象序列化为 JSON 字符串
//   const jsonString = JSON.stringify(object);

//   // 创建消息的 Buffer
//   const message = Buffer.from(jsonString, "utf8");

//   // 私钥，确保其为 32 字节长度
//   const prvKeyHex = "0001020304050607080900010203040506070809000102030405060708090001";
//   const prvKey = Buffer.from(prvKeyHex, "hex");

//   // 签名
//   const signature = eddsa.signMiMC(prvKey, Buffer.from(JSON.stringify(message), "utf-8"));

//   // 包装结果
//   const signedJsonData = {
//     //id : object.id,
//     age: object.age,
//     value: "18",
//     Ax: BigInt(F.toObject(pubKey[0])).toString(),
//     Ay: BigInt(F.toObject(pubKey[1])).toString(),
//     R8x: BigInt(F.toObject(signature.R8[0])).toString(),
//     R8y: BigInt(F.toObject(signature.R8[1])).toString(),
//     S: signature.S,
//     M: ,
//     enabled:"1"
//   };
//   function objReplacer(key, value) {
//     if (typeof value === "bigint") {
//       return value.toString();
//     } else if (typeof value === "object") {
//       for (const k in value) {
//         if (typeof value[k] === "bigint") {
//           value[k] = value[k].toString();
//         } else if (typeof value[k] === "object") {
//           value[k] = objReplacer(k, value[k]); // 递归处理嵌套对象
//         }
//       }
//     }
//     return value;
//   }
//   // 输出为 JSON 文件
//   fs.writeFileSync(
//     "./Circom/input.json", // 输出文件名
//     JSON.stringify(signedJsonData, objReplacer), // 转换为 JSON 字符串并处理 bigint
//     "utf-8"
//   );
//   console.log("签名成功，结果已保存到 input.json");
// }

verifySignature().catch(console.error);
