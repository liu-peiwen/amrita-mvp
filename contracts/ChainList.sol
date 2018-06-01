pragma solidity ^0.4.19;
pragma experimental ABIEncoderV2;

contract ChainList {
  // Healthcare Data struct
  struct HealthData {
    uint id;
    address seller;
    address buyer;
    string name;
    string description;
    uint256 price;
    string ipfsAddress;
    bool isForSale;
  }

  // list of data for sale
  mapping (uint => HealthData) public dataList;
  uint dataCounter;

  mapping(address => HealthData[]) public dataListByAccount;

  // events
  event LogSellData(
    uint indexed _id,
    address indexed _seller,
    string _name,
    uint256 _price,
    string _ipfsAddress
  );
  event LogBuyData(
    uint indexed _id,
    address indexed _seller,
    address indexed _buyer,
    string _name,
    uint256 _price,
    string _ipfsAddress
  ); 

  // store ipfsAddress with data name and description into ethereum
  function uploadData(string _name, string _description, string _ipfsAddress) public {
   dataCounter++;

   dataList[dataCounter] = HealthData(
     dataCounter,
     msg.sender,
     0x0,
     _name,
     _description,
     0x0,
     _ipfsAddress,
     false
   );

   dataListByAccount[msg.sender].push(HealthData(
     dataCounter,
     msg.sender,
     0x0,
     _name,
     _description,
     0x0,
     _ipfsAddress,
     false));
  }

  uint[] currentUserIdList;


  function getAllMyData(address currentUser) public constant returns (uint[]) {    
    for(uint i = 1; i <= dataCounter;  i++) {
      if (dataList[i].seller == currentUser){
        currentUserIdList.push(i);
      }
    }
    return currentUserIdList;
  }

  function sellData(uint _id, uint256 _price) public { 
    require(dataList[_id].isForSale == false);
    dataList[_id].price = _price; 
    dataList[_id].isForSale = true; 
  }

  // fetch the number of data in the contract
  function getNumberOfData() public view returns (uint) {
    return dataCounter;
  }

  // fetch and return all data IDs for data with isForSale being true
  function getDataForSale() public view returns (uint[]) {
    // prepare output array
    uint[] memory dataIds = new uint[](dataCounter);

    uint numberOfDataForSale = 0;
    // iterate over data
    for(uint i = 1; i <= dataCounter;  i++) {
      if(dataList[i].isForSale == true) {
        dataIds[numberOfDataForSale] = dataList[i].id;
        numberOfDataForSale++;
      }
    }

    // copy the data Ids array into a smaller forSale array
    uint[] memory forSale = new uint[](numberOfDataForSale);
    for(uint j = 0; j < numberOfDataForSale; j++) {
      forSale[j] = dataIds[j];
    }
    return forSale;
  }

  function buyData(uint _id) payable public returns(string) {
    // we check whether there is data for sale
    require(dataCounter > 0);

    // we check that the article exists
    require(_id > 0 && _id <= dataCounter);

    // we retrieve the article
    HealthData storage data = dataList[_id];

    require(data.isForSale = true);

    require(msg.sender != data.seller);

    // we check that the value sent corresponds to the price of the data
    require(msg.value == data.price);

    // the buyer can pay the seller
    data.seller.transfer(msg.value);
    
    return data.ipfsAddress;
    // trigger the event
    //LogBuyData(_id, data.seller, data.buyer, data.name, data.price, data.ipfsAddress);
  }
}

