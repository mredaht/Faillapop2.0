// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract FP_Shop {
    struct Item {
        uint256 id;
        string name;
        string description;
        uint256 price;
        address seller;
        bool isSold;
        string imageUrl;
    }

    uint256 private _nextItemId;
    mapping(uint256 => Item) public items;
    mapping(address => bool) private _blacklist;

    event ItemListed(uint256 indexed itemId, address indexed seller, string name, uint256 price);
    event ItemSold(uint256 indexed itemId, address indexed buyer, address indexed seller);

    constructor() {
        _nextItemId = 0;
    }

    function listItem(string memory _name, string memory _description, uint256 _price) public {
        require(!_blacklist[msg.sender], "Seller is blacklisted");
        require(_price > 0, "Price must be greater than 0");

        uint256 itemId = _nextItemId;
        items[itemId] = Item({
            id: itemId,
            name: _name,
            description: _description,
            price: _price,
            seller: msg.sender,
            isSold: false,
            imageUrl: ""
        });

        _nextItemId++;
        emit ItemListed(itemId, msg.sender, _name, _price);
    }

    function buyItem(uint256 _itemId) public payable {
        Item storage item = items[_itemId];
        require(!item.isSold, "Item is already sold");
        require(msg.sender != item.seller, "Cannot buy your own item");
        require(msg.value >= item.price, "Insufficient payment");

        item.isSold = true;
        payable(item.seller).transfer(item.price);
        
        if (msg.value > item.price) {
            payable(msg.sender).transfer(msg.value - item.price);
        }

        emit ItemSold(_itemId, msg.sender, item.seller);
    }

    function nextItemId() public view returns (uint256) {
        return _nextItemId;
    }

    function isBlacklisted(address _address) public view returns (bool) {
        return _blacklist[_address];
    }

    // Función para testing - solo el owner debería poder blacklistear
    function blacklist(address _address) public {
        _blacklist[_address] = true;
    }
} 