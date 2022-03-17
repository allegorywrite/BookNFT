const fs = require("fs");
const Moralis = require("moralis/node");
const { default: axios } = require("axios");
const { saveToDb } = require("./filesystem");

// ローカルにmetadataを書き込み
const writeMetaData = nftMetadata => {
  fs.writeFileSync("./output/_metadata.json", JSON.stringify(nftMetadata));
};

// メタデータを生成
const generateMetadata = (name, author, edition, path) => {
  let dateTime = Date.now();
  let tempMetadata = {
    name: name,
    copy: `#${edition}`,
    author: author,
    edition: edition,
    image: path,
    date: dateTime,
  };
  return tempMetadata;
};

// compileMetadata→
// ローカルにファイル保存して，apiにpost
// →writeMetadata
const uploadMetadata = async (
  apiUrl,
  xAPIKey,
  imageCID,
  imageData
) => {
  const ipfsArray = []; // holds all IPFS data
  const metadataList = []; // holds metadata for all NFTs (could be a session store of data)
  const promiseArray = []; // array of promises so that only if finished, will next promise be initiated

  let id = "1";
  let paddedHex = (
    "0000000000000000000000000000000000000000000000000000000000000000" + id
  ).slice(-64);
  let filename = id + ".json";

  imageData.filePath = `https://ipfs.moralis.io:2053/ipfs/${imageCID}/images/${paddedHex}.png`;
  //imageData[i].image_file = res.data[i].content;

  // メタデータを作成
  let nftMetadata = generateMetadata(
    imageData.nameOfBook,
    imageData.author,
    imageData.edition,
    imageData.filePath
  );

  // // upload metafile data to Moralis. これいる？
  // const metaFile = new Moralis.File(filename, {
  //   base64: Buffer.from(
  //     JSON.stringify(metadataList.find(meta => meta.edition == i))
  //   ).toString("base64")
  // });

  // ローカルにjsonファイルを保存
  fs.writeFileSync(
    `./output/${filename}`,
    JSON.stringify(nftMetadata)
  );

  // jsonファイルをipfsArrayにpush
  promiseArray.push(
    new Promise((res, rej) => {
      fs.readFile(`./output/${id}.json`, (err, data) => {
        if (err) rej();
        ipfsArray.push({
          path: `metadata/${paddedHex}.json`,
          content: data.toString("base64")
        });
        res();
      });
    })
  );

  //プロミスが返ってきたらipfsArrayをapiにpost
  Promise.all(promiseArray).then(() => {
    axios
      .post(apiUrl, ipfsArray, {
        headers: {
          "X-API-Key": xAPIKey,
          "content-type": "application/json",
          accept: "application/json"
        }
      })
      .then(res => {
        let metaCID = res.data[0].path.split("/")[4];
        console.log("META FILE PATHS:", res.data);
        //モラリスにアップロード
        saveToDb(metaCID, imageCID);
        writeMetaData(nftMetadata);
      })
      .catch(err => {
        console.log(err);
      });
  });
};

// index.js→
// outputのpngファイルをipfsArrayにpushしてapiにpost
//→uploadMetadata
const compileMetadata = async (
  apiUrl,
  xAPIKey,
  imageData
) => {
  ipfsArray = [];
  promiseArray = [];

  let id = "1";
  let paddedHex = (
    "0000000000000000000000000000000000000000000000000000000000000000" + id
  ).slice(-64);

  // pngファイルをipfsArrayにpush
  promiseArray.push(
    new Promise((res, rej) => {
      fs.readFile(`./input/spectator.png`, (err, data) => {
        if (err) rej();
        ipfsArray.push({
          path: `images/${paddedHex}.png`,
          content: data.toString("base64")
        });
        res();
      });
    })
  );

  // //プロミスが返ってきたらipfsArrayをapiにpost
  Promise.all(promiseArray).then(() => {
    axios
      .post(apiUrl, ipfsArray, {
        headers: {
          "X-API-Key": xAPIKey,
          "content-type": "application/json",
          accept: "application/json"
        }
      })
      .then(res => {
        console.log("IMAGE FILE PATHS:", res.data);
        let imageCID = res.data[0].path.split("/")[4];
        console.log("IMAGE CID:", imageCID);
        // pass folder CID to meta data
        uploadMetadata(apiUrl, xAPIKey, imageCID, imageData);
      })
      .catch(err => {
        console.log(err);
      });
  });
};

module.exports = {
  generateMetadata,
  writeMetaData,
  uploadMetadata,
  compileMetadata
};
