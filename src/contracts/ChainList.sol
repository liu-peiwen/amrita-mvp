pragma solidity ^0.4.19;
pragma experimental ABIEncoderV2;

contract ChainList {
  enum DataType {MEDICAL_IMAGING_DATA, GENETIC_DATA, EMR, NUMERICAL_MEASUREMENT}
  // Healthcare Data struct
  struct HealthData {
    uint id;
    address seller;
    string subcategory;
    string name;
    string description;
    uint256 price;
    string ipfsAddress;
    bool isForSale;
    DataType dataType;
    string key;
    string extension;
    string category;
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
  function uploadData(string _name, string _description, DataType _dataType, string _category, string _subcategory, string _ipfsAddress, string _key, string _extension) public {
   dataCounter++;

   dataList[dataCounter] = HealthData(
     dataCounter,
     msg.sender,
     _subcategory,
     _name,
     _description,
     0x0,
     _ipfsAddress,
     false,
     _dataType,
     _key,
     _extension,
     _category
   );

   dataListByAccount[msg.sender].push(HealthData(
     dataCounter,
     msg.sender,
     _subcategory,
     _name,
     _description,
     0x0,
     _ipfsAddress,

     false,
     _dataType,
     _key,
     _extension,
     _category
   ));
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

  function buyData(uint _id) payable public {
    // we check whether there is data for sale
    require(dataCounter > 0);

    // we check that the data exists
    require(_id > 0 && _id <= dataCounter);

    // we retrieve the data
    HealthData storage data = dataList[_id];

    require(data.isForSale = true);

    require(msg.sender != data.seller);

    // we check that the value sent corresponds to the price of the data
    require(msg.value == data.price);

    // the buyer can pay the seller
    data.seller.transfer(msg.value);
  }
}
