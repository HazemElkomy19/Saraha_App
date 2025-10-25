import crypto from "node:crypto";
import fs from "node:fs";
const IV_LENGTH = +process.env.IV_LENGTH;
const ENCRYPTION_KEY = Buffer.from(process.env.ENCRYPTION_KEY);


export const encrypt = (text) => {

const iv = crypto.randomBytes(IV_LENGTH);
console.log("iv",iv);
const cipher = crypto.createCipheriv("aes-256-cbc", ENCRYPTION_KEY, iv);
console.log("cipher",cipher);

let encrypted = cipher.update(text, "utf8", "hex");
console.log("encrypted",encrypted);
encrypted += cipher.final("hex");
console.log("encrypted_final",encrypted);
return iv.toString("hex")+"_"+encrypted ;
}

export const decrypt = (text) => {  
  const [iv, encrypted] = text.split("_");
  const decipher = crypto.createDecipheriv("aes-256-cbc", ENCRYPTION_KEY, Buffer.from(iv, "hex"));
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

if (fs.existsSync("public.pem") && fs.existsSync("private.pem")) {
  console.log("public.pem and private.pem already exist");
}else{
  const {publicKey, privateKey} = crypto.generateKeyPairSync("rsa", {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: "pkcs1",
      format: "pem"
    },
    privateKeyEncoding: {
      type: "pkcs1",
      format: "pem"
    }
  })
  
  fs.writeFileSync("public.pem", publicKey);
  fs.writeFileSync("private.pem", privateKey);
}

export const AsymmetricEncrypt = (text) => {
const buffer = Buffer.from(text,"utf8");
const publicKey = fs.readFileSync("public.pem","utf8");
const encrypted = crypto.publicEncrypt({
  key: publicKey,
  padding: crypto.constants.RSA_PKCS1_OAEP_PADDING
},buffer);

return encrypted.toString("hex");

}


export const AsymmetricDecrypt = (text) => {
  const buffer = Buffer.from(text,"hex");
  const privateKey = fs.readFileSync("private.pem","utf8");
  const decrypted = crypto.privateDecrypt({
    key: privateKey,
    padding: crypto.constants.RSA_PKCS1_OAEP_PADDING
  },buffer);
  return decrypted.toString("utf8");
}

