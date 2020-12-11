import cryptojs from "crypto-js";

const seckey = "secretkey";

let dataOpr = {
  encrypt: (data) => {
    return cryptojs.AES.encrypt(JSON.stringify(data), seckey).toString();
  },
  decrypt: (cipherData) => {
    let bytes = cryptojs.AES.decrypt(cipherData, seckey);
    let data = JSON.parse(bytes.toString(cryptojs.enc.Utf8));
    return data;
  }
};

export default dataOpr;
