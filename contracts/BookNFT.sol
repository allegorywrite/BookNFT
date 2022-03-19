// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "hardhat/console.sol";

contract BookNFT is ERC1155, Ownable {
  using SafeMath for uint256;

    mapping(string => address) authorToAddress;
    mapping(uint256 => bool) salesCondition;
    uint256 private _totalSupply;
    string private _name;
    string private _symbol;
    string private _author;

    modifier canSell(address _to, uint256 _edition) {
      require(
        msg.sender == owner() && balanceOf(_to, _edition) == 0
        && salesCondition[_edition],
        "cannot sell"
      );
      _;
    }

  constructor(string memory author, address authorAddress)
    ERC1155(
        "https://ipfs.moralis.io:2053/ipfs/QmezZx6KcJi8biZ7ruv4V6mkw6niupkaC8KgRsAKMLUJfD/metadata/0000000000000000000000000000000000000000000000000000000000000001.json"
    ){
      _name = "spectator";
      _symbol = "copy";
      _author = author;
      authorToAddress[author] = authorAddress;
      _totalSupply = 0;
    }

    function inStock(uint256 _newEdition, uint256 amount) public onlyOwner() {
      _mint(msg.sender, _newEdition, amount,"");
      salesCondition[_newEdition] = true;
      _totalSupply += amount;
    }

    function sellBook(address _to, uint256 _edition, uint256 _amount) public canSell(_to,_edition) {
      safeTransferFrom(msg.sender, _to, _edition, _amount, "");
    }

    function getAuthor() public view returns (string memory){
      return _author;
    }

    function getAuthorAddress() public view returns(address){
      return authorToAddress[_author];
    }

    function getTotalSupply() public view returns(uint256){
      return _totalSupply;
    }

      function name() public view virtual returns (string memory) {
      return _name;
    }

    function symbol() public view virtual returns (string memory) {
        return _symbol;
    }
}