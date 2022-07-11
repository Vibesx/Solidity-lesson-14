const { developmentChains } = require("../../helper-hardhat-config.js");
const { network, getNamedAccounts, deployments, ethers } = require("hardhat");
const { assert, expect } = require("chai");

// TO BE CONTINUED
if (developmentChains.includes(network.name)) {
	describe("Random IPFS NFT Unit Tests", () => {
		let randomIpfsNft, mintFee, deployer;

		beforeEach(async () => {
			deployer = (await getNamedAccounts()).deployer;
			await deployments.fixture();
			randomIpfsNft = await ethers.getContract("RandomIpfsNft", deployer);
			mintFee = await randomIpfsNft.getMintFee();
		});

		it("fails if sent eth is not enough", async () => {
			expect(randomIpfsNft.requestNft({ value: "0" })).to.be.revertedWith(
				"RandomIpfsNft__NeedMoreETHSent"
			);
		});

		it("computes requestId and returns it", async () => {
			let requestId = await randomIpfsNft.requestNft({ value: mintFee });
			assert(requestId.value !== undefined);
		});

		it("populates requestIdToSender on success", async () => {
			let requestId = (await randomIpfsNft.requestNft({ value: mintFee })).value.mul(100);
			//console.log(requestId.toString());
			console.log(ethers.utils.formatEther(requestId.toString()).toString());
			let address = await randomIpfsNft.s_requestIdToSender(requestId.toString());
			assert(address == deployer);
		});
	});
}
