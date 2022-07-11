const pinataSDK = require("@pinata/sdk");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

const pinataApiKey = process.env.PINATA_API_KEY;
const pinataApiSecret = process.env.PINATA_API_SECRET;
// initialize pinata with api key and api secret
const pinata = pinataSDK(pinataApiKey, pinataApiSecret);

async function storeImages(imagesFilePath) {
	const fullImagesPath = path.resolve(imagesFilePath);
	// readdirSync = read entire directory and get our files
	const files = fs.readdirSync(fullImagesPath);
	console.log(files);
	let responses = [];
	console.log("Uploading to IPFS!");
	for (fileIndex in files) {
		const readableStreamForFile = fs.createReadStream(`${fullImagesPath}/${files[fileIndex]}`);
		try {
			const response = await pinata.pinFileToIPFS(readableStreamForFile);
			responses.push(response);
		} catch (error) {
			console.log(error);
		}
	}
	return { responses, files };
}

async function storeTokenUriMetadata(metadata) {
	try {
		// https://docs.pinata.cloud/pinata-api/pinning/pin-json#uploading-and-pinning-json
		const response = await pinata.pinJSONToIPFS(metadata);
		return response;
	} catch (error) {
		console.log(error);
	}
	return null;
}

module.exports = { storeImages, storeTokenUriMetadata };
