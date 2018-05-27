pragma solidity ^0.4.18;

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

  mapping (uint => HealthData) public myDataList;
  uint myDataCounter;

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

  // store ipfsAddress with data name and description into ipfs
  function uploadData(string _name, string _description, string _ipfsAddress) public {
   myDataCounter++;

   myDataList[myDataCounter] = HealthData(
     myDataCounter,
     msg.sender,
     0x0,
     _name,
     _description,
     0x0,
     _ipfsAddress,
     false
   );

  }

  function getNumberofMyData() public view returns (uint) {
    return myDataCounter;
  }

  // fetch all of current user's data for sale 
  function getAllMyData() public returns (uint[]) {
    // prepare output array
    uint[] memory myDataIds = new uint[](myDataCounter);

    uint numberOfMyData = 0;
    // iterate over data
    for(uint i = 1; i <= myDataCounter;  i++) {
      // keep the id if the seller is the current user
      if(dataList[i].seller == msg.sender) {
        myDataIds[numberOfMyData] = myDataList[i].id;
        numberOfMyData++;
      }
    }

    // copy the data Ids array into a smaller allMyData array
    uint[] memory allMyData = new uint[](numberOfMyData);
    for(uint j = 0; j < numberOfMyData; j++) {
      allMyData[j] = myDataIds[j];
    }
    return allMyData;
  }

  // sell a data
  function sellData(string _name, string _description, uint256 _price,string _ipfsAddress) public {
    // a new data
    dataCounter++;

    // store this data
    dataList[dataCounter] = HealthData(
      dataCounter, //id
      msg.sender, //seller
      0x0, //buyer
      _name, //data name
      _description,
      _price,
      _ipfsAddress,
      true
    );

    LogSellData(dataCounter, msg.sender, _name, _price, _ipfsAddress);
  }

  // fetch the number of data in the contract
  function getNumberOfData() public view returns (uint) {
    return dataCounter;
  }

  // fetch and return all data IDs for data still for sale
  function getDataForSale() public view returns (uint[]) {
    // prepare output array
    uint[] memory dataIds = new uint[](dataCounter);

    uint numberOfDataForSale = 0;
    // iterate over data
    for(uint i = 1; i <= dataCounter;  i++) {
      // keep the ID if the data is still for sale
      dataIds[numberOfDataForSale] = dataList[i].id;
      numberOfDataForSale++;
    }

    // copy the data Ids array into a smaller forSale array
    uint[] memory forSale = new uint[](numberOfDataForSale);
    for(uint j = 0; j < numberOfDataForSale; j++) {
      forSale[j] = dataIds[j];
    }
    return forSale;
  }

  // buy data
  function buyData(uint _id) payable public {
    // we check whether there is an data for sale
    require(dataCounter > 0);

    // we check that the data exists
    require(_id > 0 && _id <= dataCounter);

    // we retrieve the data
    HealthData storage data = dataList[_id];

    // we check that the data has not been sold yet
    require(data.buyer == 0X0);

    // we don't allow the seller to buy his own data
    require(msg.sender != data.seller);

    // we check that the value sent corresponds to the price of the data
    require(msg.value == data.price);

    // keep buyer's information
    data.buyer = msg.sender;

    // the buyer can pay the seller
    data.seller.transfer(msg.value);

    // trigger the event
    LogBuyData(_id, data.seller, data.buyer, data.name, data.price, data.ipfsAddress);
  }
}
