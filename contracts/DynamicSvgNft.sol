// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "base64-sol/base64.sol";
import "hardhat/console.sol";

contract DynamicSvgNft is ERC721 {
	// mint
	// store our SVG information somewhere
	// some logic to say "Show X image" or "Show Y image"

	uint256 private s_tokenCounter;
	string private s_lowImageURI;
	string private s_highImageURI;
	string private constant base64EncodedSvgPrefix = "data:image/svg+xml;base64,";
	AggregatorV3Interface internal immutable i_priceFeed;
	mapping(uint256 => int256) public s_tokenIdToHighValue;

	event CreatedNFT(uint256 indexed tokenId, int256 highValue);

	constructor(
		address priceFeedAddress,
		string memory lowSvg,
		string memory highSvg
	) ERC721("Dynamic SVG NFT", "DSN") {
		s_tokenCounter = 0;
		s_lowImageURI = svgToImageURI(lowSvg);
		s_highImageURI = svgToImageURI(highSvg);
		i_priceFeed = AggregatorV3Interface(priceFeedAddress);
	}

	function svgToImageURI(string memory svg) public pure returns (string memory) {
		string memory svgBase64Encoded = Base64.encode(bytes(string(abi.encodePacked(svg))));
		// abi.encodePacked is a way of concatenating strings
		// abi.encodePacked returns a bytes object and we are typecasting it to a string
		// starting 0.8.12+, we can use string.concat(strA, strB)
		return string(abi.encodePacked(base64EncodedSvgPrefix, svgBase64Encoded));
	}

	function mintNft(int256 highValue) public {
		// the minter will set the highValue for each nft
		s_tokenIdToHighValue[s_tokenCounter] = highValue;
		emit CreatedNFT(s_tokenCounter, highValue);
		_safeMint(msg.sender, s_tokenCounter);
		s_tokenCounter++;
	}

	function _baseURI() internal pure override returns (string memory) {
		return "data:application/json;base64,";
	}

	function tokenURI(uint256 tokenId) public view override returns (string memory) {
		// _exists() is part of ERC721
		require(_exists(tokenId), "URI Query for nonexistent token");
		(, int256 price, , , ) = i_priceFeed.latestRoundData();
		string memory imageURI = s_lowImageURI;

		if (price >= s_tokenIdToHighValue[tokenId]) {
			imageURI = s_highImageURI;
		}
		// encode the JSON in base64
		return
			string(
				// we append the base URI, which is the string returned by _baseURI
				abi.encodePacked(
					_baseURI(),
					Base64.encode(
						bytes(
							abi.encodePacked(
								'{"name":"',
								// name() is another ERC721 function that returns _name (also from ERC721)
								name(), // You can add whatever name here
								'", "description":"An NFT that changes based on the Chainlink Feed", ',
								'"attributes": [{"trait_type": "coolness", "value": 100}], "image":"',
								imageURI,
								'"}'
							)
						)
					)
				)
			);
	}
}
