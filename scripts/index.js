// import dependencies
const console = require("console");
const dotenv = require("dotenv");
dotenv.config(); // setup dotenv

// utilise Moralis
const Moralis = require("moralis/node");

// import config
const {
  nameOfBook,
  author,
  edition
} = require("../input/config.js");

// import metadata
const { compileMetadata } = require("./src/metadata");
const { createFile } = require("./src/filesystem");

// Moralis creds
const serverUrl = process.env.SERVER_URL;
const appId = process.env.APP_ID;
const masterKey = process.env.MASTER_KEY;
const apiUrl = process.env.API_URL;
const apiKey = process.env.API_KEY;

// Start Moralis session
Moralis.start({ serverUrl, appId, masterKey });

// Create generative art by using the canvas api
const startCreating = async () => {

  const imageData = await createFile(
    nameOfBook,
    author,
    edition
  );

  // ファイルをアップロード
  //→metadata.jsを呼び出し
  await compileMetadata(
    apiUrl,
    apiKey,
    imageData
  );
};

// スタート！
startCreating();