const { developmentChains } = require("../../helper-hardhat-config.js");
const { network, getNamedAccounts, deployments, ethers } = require("hardhat");
const { assert } = require("chai");

if (developmentChains.includes(network.name)) {
	describe("Basic NFT Unit Tests", function () {
		let basicNft, deployer;

		beforeEach(async () => {
			// get deployer
			deployer = (await getNamedAccounts()).deployer;
			// trigger deployment scripts
			await deployments.fixture();
			// assign BasicNFT contract to basicNft
			basicNft = await ethers.getContract("BasicNft", deployer);
		});

		it("Mints NFT and updates counter", async () => {
			let counter = (await basicNft.getTokenCounter()).toString();
			assert(counter == "0");
			await basicNft.mintNft();
			counter = (await basicNft.getTokenCounter()).toString();
			assert(counter == "1");
		});
	});
}
