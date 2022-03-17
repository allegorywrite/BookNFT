const Moralis = require("moralis/node");
const request = require("request");

const createFile = async (
  nameOfBook,
  author,
  edition
  ) => {

  let imageData = {
    nameOfBook: nameOfBook,
    author: author,
    editon: edition,
  };

  return imageData;
}

// モラリスにアップロード
const saveToDb = async (metaHash, imageHash, i) => {
  let id = "1";
  let paddedHex = (
    "0000000000000000000000000000000000000000000000000000000000000000" + id
  ).slice(-64);
  let url = `https://ipfs.moralis.io:2053/ipfs/${metaHash}/metadata/${paddedHex}.json`;
  let options = { json: true };

  request(url, options, (error, res, body) => {
    if (error) {
      return console.log(error);
    }

    if (!error && res.statusCode == 200) {
      // moralisのダッシュボードにセーブ
      const FileDatabase = new Moralis.Object("Metadata");
      FileDatabase.set("BookName", body.name);
      FileDatabase.set("Author", body.author);
      FileDatabase.set("edition", body.edition);
      FileDatabase.set("image", body.image);
      FileDatabase.set("attributes", body.attributes);
      FileDatabase.set("meta_hash", metaHash);
      FileDatabase.set("image_hash", imageHash);
      FileDatabase.save();
    }
  });
};

module.exports = {
  createFile,
  saveToDb
};
