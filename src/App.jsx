import { Button, Form, Modal ,Jumbotron} from 'react-bootstrap';
import React, { Component } from 'react';

import logo from './images/logo.png';
import currency from './images/currency.png';
import profile from './images/empty-profile-pic.jpg';
import genomic from './images/genomic.png';
import image from './images/image.png';
import ReactTooltip from 'react-tooltip';

import './App.css';
import web3 from './web3';

import ipfs from './ipfs';

import chainList from './build/contracts/ChainList.json';
const TruffleContract = require('truffle-contract');
const aesjs = require('aes-js');
const fs = require('browserify-fs');


class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      ipfsHash: null,
      buffer: '',
      EncryptKey: [],
      ethAddress: '',
      Name: '',
      Description: '',
      blockNumber: '',
      transactionHash: '',
      gasUsed: '',
      txReceipt: '',
      account: '',
      balance: '',
      web3Provider: null,
      ContractInstance: '',
      DataList: [],

      IsForSale: false,
      PutItOnMarket: false,
      NameForSale: '',
      DescriptionForSale: '',
      IndexForSale: null,
      IdForSale: '',
      PriceForSell: null,
      DataType: null,
      OpenMyData: false,
      ImageCheck: true,
      GenomicCheck: true,
      FileExtension:'',
      DecryptedText:'',
      MarketImageCheck: true,
      MarketGenomicCheck: true,
      ShowDataMarket: false,
      ShowMainPage: true,
      ShowSubCategory: false,

      NameForDetail: '',
      CategoryForDetail: '',
      SubCategoryForDetail: '',
      DataTypeForDetail: '',
      PriceForDetail: '',
      SellerForDetail: '',
      DescriptionForDetail: '',
      ShowDetails: false,

      MyNameDetail: '',
      MyCategoryDetail: '',
      MySubCategoryDetail: '',
      MyDataTypeDetail: '',
      MyDescriptionDetail: '',
      ShowMyDetails: false,
      
      MainCategory: ["EMR", "Numerical Measurement", "Medical Imaging Data", "Genetic Data"],
      Categories: [
        ['Medical History', 'Diagnosis', 'Treatment'],
        ['Lab Test', 'Vital Sign', 'Other Measurement'],
        ['X-ray', 'CT', 'MRI', 'US'],
        ['Sequence', 'Annotations', 'Quantitative', 'Read Alignments']
      ],
      Category: [],
      SelectCategory: '',

      SubCategory: {
        BrainCheck: false,
        HeadCheck: false,
        ChestCheck: false,
        HeartCheck: false,
        AbdomenCheck: false,
        ExtremitiesCheck: false,
      },
      SelectSubCategory: '',

      mockDataForSale: [
        {
          NameForDetail: 'Image Data',
          CategoryForDetail: 'Image',
          SubCategoryForDetail: 'CT',
          DataTypeForDetail: 'Image data',
          PriceForDetail: '1 ETH',
          Seller: '0Xdfhjksahjkgjhgdahkjhkjdsasfsfdsfgsdfgsf',
          DescriptionForDetail: 'head and neck scan',
        },
      ],
      DataForSale: [],
      AllMyData: [],
      show: false
    };

    this.contract = TruffleContract(chainList);
    this.contract.setProvider(web3.currentProvider);
  }

  componentDidMount() {

    web3.eth.getCoinbase((err, account) => {
      //Initial Account and Get Balance
      this.setState({ account });
      web3.eth.getBalance(account, (err, balance) => {
        this.setState({ balance: Number(web3.utils.fromWei(balance, "ether")).toFixed(2) + " ETH" });
      })
      //Instantiate Contract
      this.contract.deployed().then((contractInstance) => {

        this.setState({ ContractInstance: contractInstance });
        console.log(contractInstance.getDataForSale());

        //Display all market data
        contractInstance.getDataForSale().then((dataIdList) => {
          console.log('All Market Data ID List --', dataIdList);

          for (let i = 0; i < dataIdList.length; i++) {
            var dataId = dataIdList[i];
            contractInstance.dataList(dataId.toNumber()).then((data) => {
              if (data[7] === true || data[7] === null) {
                console.log(data);
                const dataForSale = [];
                dataForSale.push({
                  Id: data[0],
                  Seller: data[1],
                  Buyer: data[2],
                  Name: data[3],
                  Description: data[4],
                  Price: web3.utils.fromWei(data[5].toString(), "ether"),
                  IsForSale: data[7],
                  DataType: data[8],
                  EncryptKey: JSON.parse("[" + data[9] + "]"),
                  FileExtension: data[10],
                  Category: data[11]
                })
                this.setState({ DataForSale: [...this.state.DataForSale, dataForSale] });
                console.log('Data for sale in state --', this.state.DataForSale[0])
              }
            });
          }
        })

        //Display ALL My Data
        console.log(this.state.account);
        contractInstance.getAllMyData(this.state.account).then((dataIdList) => {

          for (let i = 0; i < dataIdList.length; i++) {
            var dataId = dataIdList[i];

            contractInstance.dataList(dataId.toNumber()).then((data) => {
              console.log("TYPE OF ID---", data[0])
              console.log("TYPE OF PRICE--", data[5])
              if (data[1] === this.state.account) {
                console.log("My data --", data);
                const allMyData = [];
                allMyData.push({
                  Id: data[0],
                  Seller: data[1],
                  Buyer: data[2],
                  Name: data[3],
                  Description: data[4],
                  Price: web3.utils.fromWei(data[5].toString(), "ether"),
                  IpfsAddress: data[6],
                  IsForSale: data[7],
                  DataType: data[8],
                  EncryptKey: JSON.parse("[" + data[9] + "]"),
                  FileExtension: data[10],
                  Category:data[11]
                })

                this.setState({ AllMyData: [...this.state.AllMyData, allMyData] });
                console.log('All My Data in state --', this.state.AllMyData);
              }
            });
          }
        })
      })
    })
  }

  DataForSale = (dataforsale) => {
    let filteredData = dataforsale;
    if (this.state.MarketImageCheck === true && this.state.MarketGenomicCheck === false) {
      filteredData = dataforsale.filter(data => data[0].DataType.toNumber() === 0);
    }
    if (this.state.MarketImageCheck === false && this.state.MarketGenomicCheck === true) {
      filteredData = dataforsale.filter(data => data[0].DataType.toNumber() === 1);
    }
    if (this.state.MarketImageCheck === false && this.state.MarketGenomicCheck === false) {
      filteredData = [];
    }
    if (this.state.MarketImageCheck === true && this.state.MarketGenomicCheck === true) {
      filteredData = dataforsale;
    }
    return (
      filteredData ?
      filteredData.map((data, index) => {
        let userOwnData = data[0].Seller === this.state.account ? "can-not-buy" : "";
        let mainCategory = this.state.MainCategory[data[0].DataType.toNumber()];
        let category = this.state.Categories[data[0].DataType.toNumber()][data[0].Category];
        return (
          <tr key={index}>
            <td style={{textAlign:"center"}}>{data[0].Name}</td>
            <td style={{textAlign:"center"}}>{data[0].Description}</td>
            <td style={{textAlign:"center"}}>{mainCategory}</td>
            <td style={{textAlign:"center"}}>{category}</td>
            <td style={{textAlign:"center"}}>{data[0].Price}&nbsp;ETH</td>
            <td style={{textAlign:"center"}}>{data[0].Seller}</td>
            <td style={{textAlign:"center"}}>
              <span className="fa fa-star checked"></span>
              <span className="fa fa-star checked"></span>
              <span className="fa fa-star checked"></span>
              <span className="fa fa-star checked"></span>
              <span className="fa fa-star checked"></span>
            </td>
            <td style={{textAlign: "center" ,width: "100px"}} className={userOwnData}>
              <a onClick={() => this.openDetailModal(index)}>Show Details</a>
              <button className='btn btn-info' onClick={() => this.buyMarketData(index)} disabled={data[0].Seller === this.state.account}>Buy</button>
            </td>
          </tr>
        )
      }) : null
    )
  }

  AllMyData = (allmydata, isImageData) => {
    let filteredData;
    filteredData = allmydata.filter(data => data[0].DataType.toNumber() === isImageData);
    return (
      filteredData.map((data, index) => {
        return (
          <tr key={index}>
            <td style={{textAlign:"center"}}>{data[0].Name}</td>
            <td style={{textAlign:"center"}}>{data[0].Description}</td>
            <td style={{textAlign:"center"}}>{data[0].IpfsAddress}</td>
            <td style={{textAlign:"center"}}>
            <a onClick={() => this.openMyDataDetailsModal(index)}>Details</a>
            <button className='btn btn-primary' onClick={() => this.openSellModal(index)} disabled={data[0].IsForSale}>Sell</button>
            </td>
          </tr>
        )
      })
    )
  }

  openSellModal = (i) => {
    this.setState({
      NameForSale: this.state.AllMyData[i][0].Name,
      DescriptionForSale: this.state.AllMyData[i][0].Description,
      IdForSale: this.state.AllMyData[i][0].Id,
      IndexForSale: i,
      PutItOnMarket: true
    })
  }

  openMyDataDetailsModal = (i) => {
    const {
      Name,
      Category,
      SubCategory,
      DataType,
      Description
    } = this.state.AllMyData[i][0];
    
    this.setState({
      MyNameDetail: Name,
      MyCategoryDetail: Category,
      MySubCategoryDetail: SubCategory,
      MyDataTypeDetail: DataType,
      MyDescriptionDetail: Description,
      ShowMyDetails: true
    });
  }

  openDetailModal = (i) => {
    const {
      Name,
      Category,
      SubCategory,
      DataType,
      Price,
      Seller,
      Description
    } = this.state.DataForSale[i][0];

    this.setState({
      NameForDetail: Name,
      CategoryForDetail: Category,
      SubCategoryForDetail: SubCategory,
      DataTypeForDetail: DataType,
      PriceForDetail: Price,
      SellerForDetail: Seller,
      DescriptionForDetail: Description,
      ShowDetails: true
    })
  }

   
  decryptData = (data, key) => {
    // When ready to decrypt the hex string, convert it back to bytes
    console.log("encryptedIPFS",data)
    let encryptedBytes = aesjs.utils.hex.toBytes(data);

    // The counter mode of operation maintains internal state, so to
    // decrypt a new instance must be instantiated.
    let aesCtr = new aesjs.ModeOfOperation.ctr(key, new aesjs.Counter(5));
    let decryptedBytes = aesCtr.decrypt(encryptedBytes);

    // Convert our bytes back into text
    let decryptedText = aesjs.utils.utf8.fromBytes(decryptedBytes);
    console.log("Decrypted------", decryptedText);

    this.setState({DecryptedText: decryptedText})
    window.open(`https://ipfs.io/ipfs/${this.state.DecryptedText}`)
  }

  buyMarketData = async(index) => {

    console.log(this.state.DataForSale[index][0].Id.toNumber());
    await this.state.ContractInstance.buyData(
      this.state.DataForSale[index][0].Id,
      {
        from: this.state.account,
        value: web3.utils.toWei(this.state.DataForSale[index][0].Price)
      }
    );
    this.state.ContractInstance.dataList(this.state.DataForSale[index][0].Id.toNumber())
    .then(data => this.decryptData(data[6], this.state.DataForSale[index][0].EncryptKey));
    // .then(data => ipfs.files.get(data[6], (err, files) => this.decryptData(index,files[0].content, this.state.DataForSale[index][0].EncryptKey)));
    
  }

  sellMyData = () => {

    console.log('TYPE OF SELLING ID--', this.state.IdForSale);

    this.state.ContractInstance.sellData(
      this.state.IdForSale,
      web3.utils.toWei(this.state.PriceForSell, "ether"),
      { from: this.state.account, gas: 5000000 }
    ).then(this.setState({PutItOnMarket: false, OpenMyData: false}));
  }
  
  captureFile = (event) => {
    event.stopPropagation()
    event.preventDefault()
    const file = event.target.files[0]
    console.log('upload data type-------',this.state.DataType)
    let _validFileExtensions = [];
    if(this.state.DataType === "2") {
      _validFileExtensions = [".dcm", ".nii.gz", ".nii", ".img", ".doc"]
    } else if(this.state.DataType === "3") {
    _validFileExtensions = [".vcf", ".sam"];
    }
    var sFileName = event.target.value;
    var extension = sFileName.substring(sFileName.lastIndexOf('.')+1);
    this.setState({FileExtension: extension});
     if (sFileName.length > 0) {
        var blnValid = false;
        for (var j = 0; j < _validFileExtensions.length; j++) {
            var sCurExtension = _validFileExtensions[j];
            if (sFileName.substr(sFileName.length - sCurExtension.length, sCurExtension.length).toLowerCase() === sCurExtension.toLowerCase()) {
                blnValid = true;
                break;
            }
        }
        if (!blnValid) {
            alert("Sorry, " + sFileName + " is invalid, allowed extensions are: " + _validFileExtensions.join(", "));
            event.target.value = "";
            return false;
        }
    }
    let reader = new window.FileReader()
    console.log("reader:",reader);
    reader.readAsArrayBuffer(file)
    reader.onloadend = () => this.convertToBuffer(reader)
  };

  randomArray = (length, max) => [...new Array(length)]
    .map(() => Math.round(Math.random() * max));

  convertToBuffer = async (reader) => {
    //file is converted to a buffer to prepare for uploading to IPFS
    const buffer = await Buffer.from(reader.result);
    //set this buffer -using es6 syntax
    let key = this.randomArray(16, 100);
    console.log("KEY---", key);
    console.log("BUFFER---", buffer);
    // Convert text to bytes
    let textBytes = aesjs.utils.utf8.toBytes(buffer);

    // The counter is optional, and if omitted will begin at 1
    let aesCtr = new aesjs.ModeOfOperation.ctr(key, new aesjs.Counter(5));
    let encryptedBytes = aesCtr.encrypt(textBytes);

    // To print or store the binary data, you may convert it to hex
    let encryptedHex = aesjs.utils.hex.fromBytes(encryptedBytes);
    console.log("encryptionHEX-----", encryptedHex);
    //file is encrypted and convert to a new buffer to prepare for uploading for IPFS
    const encryptedBuffer = await Buffer.from(encryptedHex);
    console.log("EncryptBuffer----",encryptedBuffer);

    // this.setState({ buffer: encryptedBuffer, EncryptKey: key });
    this.setState({ buffer });
  };

  handleOpen = () => this.setState({ show: true });

  openImageData = () => {
    this.setState({
      DataType: 2, 
      OpenMyData: true
    });
  };

  openGenomicData = () => {
    this.setState({
      DataType: 3,
      OpenMyData: true
    });
  };

  handleMyDataClose = () => this.setState({OpenMyData: false, DataType: null});

  handleClose = () => this.setState({show: false, ShowSubCategory: false, DataType: ''});

  handleDetailModalClose = () => this.setState({ShowDetails: false});

  handleMyDetailModalClose = () => this.setState({ShowMyDetails: false});

  handleSellModalClose = () => this.setState({ PutItOnMarket: false });

  mapCategorySelection = (categories) => {
    return (
      categories.map((category, index) => <option value={index}>{category}</option>)
    )
  }

  onClick = async () => {

    try {
      this.setState({ blockNumber: "waiting.." });
      this.setState({ gasUsed: "waiting..." });

      // get Transaction Receipt in console on click
      // See: https://web3js.readthedocs.io/en/1.0/web3-eth.html#gettransactionreceipt
      await web3.eth.getTransactionReceipt(this.state.transactionHash, (err, txReceipt) => {
        console.log(err, txReceipt);
        this.setState({ txReceipt });
      }); //await for getTransactionReceipt

      await this.setState({ blockNumber: this.state.txReceipt.blockNumber });
      await this.setState({ gasUsed: this.state.txReceipt.gasUsed });
    } //try
    catch (error) {
      console.log(error);
    } //catch
  } //onClick

  handleEventChange = (e) => {
    const {BrainCheck, HeadCheck, ChestCheck, HeartCheck, AbdomenCheck, ExtremitiesCheck} = this.state.SubCategory;
    if (e.target.id === 'data_name') {
      this.setState({ Name: e.target.value });
    }
    if (e.target.id === 'data_description') {
      this.setState({ Description: e.target.value });
    }
    if (e.target.id === 'data_price') {
      this.setState({ PriceForSell: e.target.value });
    }
    if (e.target.id === 'data_type') { 
      this.setState({DataType: e.target.value, Category: this.state.Categories[e.target.value]});
      if (e.target.value === '2') {
        this.setState({ShowSubCategory: true});
      } else {
        this.setState({ShowSubCategory: false});
      }
    }
    if (e.target.id === 'category') {
      this.setState({SelectCategory: e.target.value});
    }
    if (e.target.id === 'sub_category') {
      this.setState({SubCategory: e.target.value});
    }
    if (e.target.id === 'image-check') {
      this.setState({ImageCheck: !this.state.ImageCheck});
    }
    if (e.target.id === 'genomic-check') {
      this.setState({GenomicCheck: !this.state.GenomicCheck});
    }
    if (e.target.id === 'market-image-check') {
      this.setState({MarketImageCheck: !this.state.MarketImageCheck});
    }
    if (e.target.id === 'market-genomic-check') {
      this.setState({MarketGenomicCheck: !this.state.MarketGenomicCheck});
    }
    if (e.target.id === 'head-check') {
      this.setState({SubCategory: {...this.state.SubCategory, HeadCheck: !HeadCheck}});
    }
    if (e.target.id === 'brain-check') {
      this.setState({SubCategory: {...this.state.SubCategory, BrainCheck: !BrainCheck}});
    }
    if (e.target.id === 'chest-check') {
      this.setState({SubCategory: {...this.state.SubCategory, ChestCheck: !ChestCheck}});
    }
    if (e.target.id === 'heart-check') {
      this.setState({SubCategory: {...this.state.SubCategory, HeartCheck: !HeartCheck}});
    }
    if (e.target.id === 'abdomen-check') {
      this.setState({SubCategory: {...this.state.SubCategory, AbdomenCheck: !AbdomenCheck}});
    }
    if (e.target.id === 'extremities-check') {
      this.setState({SubCategory: {...this.state.SubCategory, ExtremitiesCheck: !ExtremitiesCheck}});
    }
  }

  convertSubCategoryToString = () => {
    const {SubCategory} = this.state;
    let selectSubCategory =[];

    for (let key in SubCategory) {
      if (SubCategory.hasOwnProperty(key)) {
        if (SubCategory[key] === true) {
          switch(key) {
            case 'BrainCheck':
              selectSubCategory.push('Brain');
              break;
            case 'HeartCheck':
              selectSubCategory.push('Heart');
              break;
            case 'HeadCheck':
              selectSubCategory.push('Head and Neck');
              break;
            case 'ChestCheck':
              selectSubCategory.push('Chest');
              break;
            case 'AbdomenCheck':
              selectSubCategory.push('Abdomen');
              break;
            case 'ExtremitiesCheck':
              selectSubCategory.push('Extremities and Joints');
              break;
            default:
              selectSubCategory.push('');
          }         
        }
      }
    }
    this.setState({SelectSubCategory: selectSubCategory.join()})
  }

  onSubmit = async (event) => {
    event.preventDefault();
    this.convertSubCategoryToString();
    console.log("SelectSubCategory:", this.state.SelectSubCategory);

    await ipfs.add(this.state.buffer, (err, ipfsHash) => {
      console.log(err, ipfsHash);
      //setState by setting ipfsHash to ipfsHash[0].hash
      //set this buffer -using es6 syntax
    let key = this.randomArray(16, 100);
    console.log("KEY---", key);
    console.log("BUFFER---", ipfsHash[0].hash);
    // Convert text to bytes
    let textBytes = aesjs.utils.utf8.toBytes(ipfsHash[0].hash);

    // The counter is optional, and if omitted will begin at 1
    let aesCtr = new aesjs.ModeOfOperation.ctr(key, new aesjs.Counter(5));
    let encryptedBytes = aesCtr.encrypt(textBytes);

    // To print or store the binary data, you may convert it to hex
    let encryptedHex = aesjs.utils.hex.fromBytes(encryptedBytes);
    console.log("encryptionHEX-----", encryptedHex);

      this.setState({ ipfsHash: encryptedHex, EncryptKey: key });

      // call Ethereum contract method "sendHash" and .send IPFS hash to etheruem contract 
      //return the transaction hash from the ethereum contract
      //see, this https://web3js.readthedocs.io/en/1.0/web3-eth-contract.html#methods-mymethod-send
      console.log('State', this.state.Name, this.state.Description);
      console.log("DataType:",this.state.DataType, "Category:",this.state.SelectCategory.toString());
      console.log("ipfsHash:", this.state.ipfsHash)
      console.log("EncryptKey:", this.state.EncryptKey.toString());
      console.log("FileExtension:", this.state.FileExtension);

      this.state.ContractInstance.uploadData(
        this.state.Name,
        this.state.Description,
        this.state.DataType,
        this.state.SelectCategory.toString(),
        this.state.ipfsHash,
        this.state.EncryptKey.toString(),
        this.state.FileExtension,
        {
          from: this.state.account,
          gas: 5000000
        }).catch(err => console.log(err));
      this.setState({
        show: false,
        Name: '',
        Description: '',
        DataType: null,
        FileExtension:''
      });

    }) //await ipfs.add 
  }; //onSubmit 

  render() {
    const isEnabled =
      this.state.Name.length > 0 &&
      this.state.Description.length > 0;
    let showUploadImage = 
      this.state.DataType === "2" ?  "form-group" : "hide-upload-button";
    let showUploadGenomic = 
    this.state.DataType === "3" ? "form-group" : "hide-upload-button";

    let showMainPage = this.state.ShowMainPage ? '' : 'hide-content';
    let showDataMarket = this.state.ShowDataMarket ? '' : 'hide-content';
    let ShowSubCategory = this.state.ShowSubCategory ? '' : 'hide-content';

    const {BrainCheck, HeadCheck, ChestCheck, HeartCheck, AbdomenCheck, ExtremitiesCheck} = this.state.SubCategory;
return (
  <div>
    <header>		
			<nav className="navbar navbar-default navbar-static-top" role="navigation">
				<div className="navigation">				
						<div className="navbar-header">
							
							<button type="button" className="navbar-toggle collapsed" data-toggle="collapse" data-target=".navbar-collapse.collapse">
								<span className="sr-only">Toggle navigation</span>
								<span className="icon-bar"></span>
								<span className="icon-bar"></span>
								<span className="icon-bar"></span>
							</button>
            
							<a className="navbar-brand"><img src={logo} height="50" /></a>
						</div>
						
						<div className="navbar-collapse collapse">
							<form className="navbar-form navbar-left">
					        	<div className="form-group">
					          		<input type="text" className="form-control" id="search-form" />
					        	</div>
					        	<p className="padding-5 text-center border-radius-50" id="search-icon" ><i className="fa fa-search"></i></p>
					    </form>
					    <ul className="nav navbar-nav navbar-right">
								<li><a href="#" className="currency"><img src={currency} width="30" /> {this.state.balance}</a></li>
								<li className="dropdown">
									<a href="#" className="dropdown-toggle" data-tip="React-tooltip" data-toggle="dropdown" role="button" ><img src={profile} height="30" />
								  <p className="account-info"> {this.state.account} </p></a>
                  <ReactTooltip place="bottom" type="dark" effect="solid">
                    <span>{this.state.account}</span>
                  </ReactTooltip>
                  
								</li>
								<li><a href="#" id="messege"><i className="fa fa-comments"></i></a></li>
							</ul>
						</div>	
				</div>	
			</nav>

			<nav className="sub-navbar text-center">
			</nav>
			
		</header>


    <div className="container">
      <div className="row" id="section-2">

        <div className="col-md-3">
          <div className="btn text-center btn-lg upload-btn" onClick={this.handleOpen}>Upload</div>
          
          <div className="top-space-10">

          <div className="parent-image" onClick={this.openImageData}>
		        <div className="child-image bg-one overlay">
			         <a className="image-name"> Imaging Data</a>
		        </div>
	        </div>

          <div className="parent-image" onClick={this.openGenomicData}>
		        <div className="child-image bg-two">
			         <a className="image-name">Genetic Data</a>
		        </div>
	        </div>

          <div className="parent-image" onClick={this.openGenomicData}>
		        <div className="child-image bg-three">
			         <a className="image-name">EMR</a>
		        </div>
	        </div>

          <div className="parent-image" onClick={this.openGenomicData}>
		        <div className="child-image bg-four">
			         <a className="image-name">Numerical Measurement</a>
		        </div>
	        </div>

              {/* <div className="onClickTextOverImage-image" onClick={this.openImageData}>
                <div className="text">
                   <a>Image Data</a>
                </div>
            </div>

              <div className="onClickTextOverImage-genomic" onClick={this.openGenomicData}>
                <div className="text">
                   <a>Genetic Data</a>
                </div>
              </div> */}

        </div>
        </div>

        <div className={showDataMarket}>
        <div className="col-md-9">

          {/* <div className="box top-space-20 text-center">
            <p className="top-space-20">Lorem ipsum dolor sit amet, consectetur adipisicing</p>
            <p>Name</p>
            <p>Data</p>
            <p>1 ETH</p>
            <button className="btn btn-lg btn-blue">Buy</button>
          </div> */}
          {/* <div className='panel panel-default'>
            <div className='panel-head'>Market Data</div>
            <div className='panel-body'>{this.DataForSale(this.state.DataForSale)}</div>
          </div> */}
          <div className='market-header'>
            <div className="back-button" onClick={() => this.setState({ShowMainPage: true, ShowDataMarket: false})}>
              <span><i className="fa fa-chevron-left fa-lg" /></span>
              <span>Back</span>
            </div>

            <div>
            <span className='marketplace-label'>Data Marketplace</span>
            </div>
            
            <div className='filter-check-box'>
              <span>
                  <label>Image:</label>
                  <input type="checkbox" id="market-image-check" checked={this.state.MarketImageCheck} onChange={this.handleEventChange} />
              </span>
              <span>
                 <label>Gene:</label>
                 <input type="checkbox" id="market-genomic-check" checked={this.state.MarketGenomicCheck} onChange={this.handleEventChange} />
              </span>
            </div>
            
          </div>
          <table className="table table-striped">
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>Data Type</th>
              <th>Category</th>
              <th>Price</th>
              <th>Seller</th>
              <th>Rating</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {this.DataForSale(this.state.DataForSale)}
          </tbody>
        </table>
        </div>
        </div>

       <div className={showMainPage}>
        <div className="col-md-9 maincontent">

				<div className="entrance-image-container">
					<div className="box entrance entrance-data text-center">
						<a onClick={() => this.setState({ShowMainPage: false, ShowDataMarket: true})} style={{color:'white'}}><h1>Data Marketplace</h1></a>
					</div>
        </div>

        <div className="entrance-image-container">
					<div className="box top-space-10 entrance entrance-al text-center">
						<a style={{color: 'white'}}><h1>AI Marketplace</h1></a>
					</div>
				</div>
				</div>
        </div>

      </div>
    </div>

    <div className="footer">
      <div className="row">
        <div className="col-sm-8">
          <div className="col-sm-4">
            <div className="text-center">
              <h4>Amrita Network</h4>
              <ul className="footer-menu">
                <li>Amrita Network</li>
                <li>Amrita Network</li>
                <li>Amrita Network</li>
                <li>Amrita Network</li>
                <li>Amrita Network</li>
              </ul>
            </div>
          </div>
          <div className="col-sm-4">
            <div className="text-center">
              <h4>Amrita Network</h4>
              <ul className="footer-menu">
                <li>Amrita Network</li>
                <li>Amrita Network</li>
                <li>Amrita Network</li>
                <li>Amrita Network</li>
                <li>Amrita Network</li>
              </ul>
            </div>
          </div>
          <div className="col-sm-4">
            <div className="text-center">
              <h4>Amrita Network</h4>
              <ul className="footer-menu">
                <li>Amrita Network</li>
                <li>Amrita Network</li>
                <li>Amrita Network</li>
                <li>Amrita Network</li>
                <li>Amrita Network</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="col-sm-4 right-sidebar">
          <div className="col-sm-8 col-sm-offset-2">
            <div className="text-center">
              <h4>Amrita Network</h4>
              <p>Amrita MVP</p>
            </div>
          </div>
        </div>
         
      </div>
    </div>

    <Modal show={this.state.OpenMyData} onHide={this.handleMyDataClose}>
      <Modal.Header closeButton>
        <Modal.Title>{this.state.MainCategory[this.state.DataType]} Data</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <table className="table table-hover">
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>Ipfs Address</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {this.AllMyData(this.state.AllMyData, this.state.DataType)}
          </tbody>
        </table>
      </Modal.Body>
    </Modal>

    <Modal show={this.state.show} onHide={this.handleClose} className={Modal}>
          <Modal.Header closeButton>
            <Modal.Title>Upload Your Data</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={this.onSubmit}>
              <div className='form-group'>
                <label>Data name</label>
                <input type="text" className='form-control' id="data_name" onChange={this.handleEventChange} placeholder="Enter the name of your article" required/>
              </div>
              <div className='form-group'>
                <label>Description</label>
                <textarea type="text" className='form-control vresize' id="data_description" onChange={this.handleEventChange} placeholder="Describe your article" maxLength="255" required></textarea>
              </div>
              <div className='form-group'>
                <label>Storage Type</label>
                <select className="form-control" id="storage_type" onChange={this.handleEventChange} placeholder="Please select Upload Data Type" required>
                  <option value="" disabled selected>Please Select Storage Type</option>
                  <option value="0">IPFS</option>
                  <option value="1">StorJ</option>
                  <option value="2">AWS</option>
                  <option value="3">Google Cloud</option>
                  <option value="4">Microsoft Azure</option>
                </select>
              </div>
              <div className='form-group'>
                <label>Data Type</label>
                <select className="form-control" id="data_type" onChange={this.handleEventChange} placeholder="Please select Upload Data Type" required>
                  <option value="" disabled selected>Please Select Upload Data Type</option>
                  <option value="0">EMR</option>
                  <option value="1">Numerical Measurement</option>
                  <option value="2">Medical Imaging Data</option>
                  <option value="3">Genetic Data</option>
                </select>
              </div>
              <div className='form-group'>
                <label>Category</label>
                <select className="form-control" id="category" onChange={this.handleEventChange} placeholder="Please select a category" required>
                  <option value="" disabled selected>Please Select A Category</option>
                  {this.mapCategorySelection(this.state.Category)}
                </select>
              </div>
              <div className={`form-group ${ShowSubCategory}`}>
                <label>SubCategory</label>
                {/* <select className="form-control" id="sub_category" onChange={this.handleEventChange} placeholder="Please select Upload Data Type" required>
                  <option value="" disabled selected>Please Select A SubCategory</option>
                  <option value="0">Brain</option>
                  <option value="1">Head and Neck</option>
                  <option value="2">Chest</option>
                  <option value="3">Heart</option>
                  <option value="4">Abdomen</option>
                  <option value="5">Extremities and Joint</option>
                </select> */}
                <div>
                  <input type="checkbox" id="brain-check" checked={BrainCheck} onChange={this.handleEventChange} />
                  <label className="checkbox-label-spacing">Brain</label>
                </div>
                <div>
                  <input type="checkbox" id="head-check" checked={HeadCheck} onChange={this.handleEventChange} />
                  <label className="checkbox-label-spacing">Head and Neck</label>
                </div>
                <div>
                  <input type="checkbox" id="chest-check" checked={ChestCheck} onChange={this.handleEventChange} />
                  <label className="checkbox-label-spacing">Chest</label>
                </div>
                <div>
                  <input type="checkbox" id="heart-check" checked={HeartCheck} onChange={this.handleEventChange} />
                  <label className="checkbox-label-spacing">Heart</label>
                </div>
                <div>
                  <input type="checkbox" id="abdomen-check" checked={AbdomenCheck} onChange={this.handleEventChange} />
                  <label className="checkbox-label-spacing">Abdomen</label>
                </div>
                <div>
                  <input type="checkbox" id="extremities-check" checked={ExtremitiesCheck} onChange={this.handleEventChange} />
                  <label className="checkbox-label-spacing">Extremities and Joints</label>
                </div>
              </div>
              <div className={showUploadImage}>
                <input type='file' onChange={this.captureFile} disabled={(this.state.DataType === "")} required/>
              </div>
              <div className={showUploadGenomic}>
                <input type='file' onChange={this.captureFile} disabled={(this.state.DataType === "")} required/>
              </div>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <button className='btn btn-primary' type='submit' onClick={this.onSubmit} disabled={!isEnabled}>Submit</button>
            <button className='btn btn-default' onClick={this.handleClose}>Close</button>
          </Modal.Footer>
        </Modal>

        <Modal show={this.state.PutItOnMarket} onHide={this.handleSellModalClose}>
          <Modal.Header closeButton>
            <Modal.Title>Put Your Data On The Market</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={this.sellMyData}>
              <div className='form-group'>
                <label>Data name:&nbsp;&nbsp;</label>
                <label>{this.state.NameForSale}</label>
              </div>
              <div className='form-group'>
                <label>Description:&nbsp;&nbsp;</label>
                <label>{this.state.DescriptionForSale}</label>
              </div>
              <div className="form-group">
                <label>Price in ETH</label>
                <input type="number" className="form-control" id="data_price" onChange={this.handleEventChange} placeholder="1" pattern="[0-9]+([\.,][0-9]+)?" step="0.01" />
              </div>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <button className='btn btn-primary' type='submit' onClick={this.sellMyData}>Submit</button>
            <button className='btn btn-default' onClick={this.handleSellModalClose}>Close</button>
          </Modal.Footer>
        </Modal>

        <Modal show={this.state.ShowDetails} onHide={this.handleDetailModalClose}>
          <Modal.Header closeButton>
            <Modal.Title>Details</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <div className='form-group'>
                <label>Name:&nbsp;&nbsp;</label>
                <label>{this.state.NameForDetail}</label>
              </div>
              <div className='form-group'>
                <label>Data Type:&nbsp;&nbsp;</label>
                <label>{this.state.DataTypeForDetail}</label>
              </div>
              <div className='form-group'>
                <label>Category:&nbsp;&nbsp;</label>
                <label>{this.state.CategoryForDetail}</label>
              </div>
              <div className='form-group'>
                <label>Sub Category:&nbsp;&nbsp;</label>
                <label>{this.state.SubCategoryForDetail}</label>
              </div>
              <div className='form-group'>
                <label>Price:&nbsp;&nbsp;</label>
                <label>{this.state.PriceForDetail}</label>
              </div>
              <div className='form-group'>
                <label>Seller:&nbsp;&nbsp;</label>
                <label>{this.state.SellerForDetail}</label>
              </div>
              <div className='form-group'>
                <label>Rating:&nbsp;&nbsp;</label>
                <label></label>
              </div>
              <div className='form-group'>
                <label>Description:&nbsp;&nbsp;</label>
                <label>{this.state.DescriptionForDetail}</label>
              </div>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <button className='btn btn-default' onClick={this.handleSellModalClose}>Close</button>
          </Modal.Footer>
        </Modal>

        <Modal show={this.state.ShowMyDetails} onHide={this.handleMyDetailModalClose}>
          <Modal.Header closeButton>
            <Modal.Title>Details</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <div className='form-group'>
                <label>Name:&nbsp;&nbsp;</label>
                <label>{this.state.MyNameDetail}</label>
              </div>
              <div className='form-group'>
                <label>Data Type:&nbsp;&nbsp;</label>
                <label>{this.state.MyDataTypeDetail}</label>
              </div>
              <div className='form-group'>
                <label>Category:&nbsp;&nbsp;</label>
                <label>{this.state.MyCategoryDetail}</label>
              </div>
              <div className='form-group'>
                <label>Sub Category:&nbsp;&nbsp;</label>
                <label>{this.state.MySubCategoryDetail}</label>
              </div>
              <div className='form-group'>
                <label>Description:&nbsp;&nbsp;</label>
                <label>{this.state.MyDescriptionDetail}</label>
              </div>
            </Form>
          </Modal.Body> 
        </Modal>
    </div>
    )
  } //render
}

export default App;
