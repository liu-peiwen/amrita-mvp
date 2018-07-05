import { Form, Modal} from 'react-bootstrap';
import { Button, Checkbox, Input, Select, Upload, message, Icon, Pagination, Rate, Breadcrumb} from 'antd';
import React, { Component } from 'react';
import 'antd/dist/antd.css';
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
const Option = Select.Option;
const { TextArea } = Input;


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
      StorageType: '',
      FileExtension:'',
      DecryptedText:'',
      MarketImageCheck: true,
      MarketGenomicCheck: true,
      ShowDataMarket: false,
      ShowMainPage: true,
      ShowAIMarket: false,
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
      MyIPFSDetail: '',
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
          PriceForDetail: '1 AMN',
          Seller: '0Xdfhjksahjkgjhgdahkjhkjdsasfsfdsfgsdfgsf',
          DescriptionForDetail: 'head and neck scan',
        },
      ],
      ImageLinkDict: {
        'avaamo': '',
        'aviso':'',
        'aws-ml':'',
        'bayes':'',
        'berg':'',
        'clearstory-data':'',
        'cloudminds':'',
        'databricks':'',
        'datarpm':'',
        'deepgram':'',
        'descartes-labs':'',
        'general-vision':'',
        'infinigraph':'',
        'jask':'',
        'prodo':'',
        'signal-sense':'',
        'solvati':'',
        'swiftIQ':'',
        'drbrain':'http://www.drbrain.net/index.php/User/login.html'
      },
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
        this.setState({ balance: Number(web3.utils.fromWei(balance, "ether")).toFixed(2) + " AMN" });
      })
      //Instantiate Contract
      this.contract.deployed().then((contractInstance) => {
        this.setState({ ContractInstance: contractInstance });

        //Get all market data
        contractInstance.getDataForSale().then((dataIdList) => {

          for (let i = 0; i < dataIdList.length; i++) {
            var dataId = dataIdList[i];
            contractInstance.dataList(dataId.toNumber()).then((data) => {
              if (data[7] === true || data[7] === null) {

                const dataForSale = [];
                dataForSale.push({
                  Id: data[0],
                  Seller: data[1],
                  SubCategory: data[2],
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
              }
            });
          }
        })

        //Get ALL My Data);
        contractInstance.getAllMyData(this.state.account).then((dataIdList) => {

          for (let i = 0; i < dataIdList.length; i++) {
            var dataId = dataIdList[i];

            contractInstance.dataList(dataId.toNumber()).then((data) => {
              if (data[1] === this.state.account) {
                const allMyData = [];
                allMyData.push({
                  Id: data[0],
                  Seller: data[1],
                  SubCategory: data[2],
                  Name: data[3],
                  Description: data[4],
                  Price: web3.utils.fromWei(data[5].toString(), "ether"),
                  IpfsAddress: data[6],
                  IsForSale: data[7],
                  DataType: data[8],
                  EncryptKey: JSON.parse("[" + data[9] + "]"),
                  FileExtension: data[10],
                  Category: data[11]
                })
                this.setState({ AllMyData: [...this.state.AllMyData, allMyData] });
              }
            });
          }
        })
      })
    })
  }

  // Render Marketplace Data
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
            <td style={{textAlign:"center"}}>{mainCategory}</td>
            <td style={{textAlign:"center"}}>{category}</td>
            <td style={{textAlign:"center"}}>{data[0].Price}&nbsp;AMN</td>
            <td style={{textAlign:"center"}}>
            <Rate allowHalf defaultValue={4.5} />
            </td>
            <td style={{textAlign: "center" ,width: "150px"}} className={userOwnData}>
              <div>
              <span onClick={() => this.openDetailModal(index)}>Details</span>
              <Button type='primary' style={{marginLeft: '15px'}} onClick={() => this.buyMarketData(index)} disabled={data[0].Seller === this.state.account}>Buy</Button>
              </div>
            </td>
          </tr>
        )
      }) : null
    )
  }

  paginationBar = () => {
    return (
      <Pagination showQuickJumper defaultCurrent={2} total={500} />
    )
  }
  
  // Render All My Data
  AllMyData = (allmydata, isImageData) => {
    let filteredData;
    filteredData = allmydata.filter(data => data[0].DataType.toNumber() === isImageData);
    return (
      filteredData.map((data, index) => {
        return (
          <tr key={index}>
            <td style={{textAlign:"center"}}>{data[0].Name}</td>
            <td style={{textAlign:"center"}}>{this.showDecryptData(data[0].IpfsAddress, this.state.AllMyData[index][0].EncryptKey)}</td>
            <td style={{textAlign:"center"}}>
            <span onClick={() => this.openMyDataDetailsModal(index)} className='detail'>Details</span>
            <Button type="primary" onClick={() => this.openSellModal(index)} disabled={data[0].IsForSale}>Sell</Button>
            </td>
          </tr>
        )
      })
    )
  }

  renderAIMarketImage = (object) => {
    const imageComponent =[];

    for (const [key, value] of Object.entries(object)) {
      const images = require.context('./images/service-provider', true);
      const aiImage = images(`./${key}.png`);
      
      imageComponent.push(<img src={aiImage} onClick={() => window.location.assign(value)} className="ai-image"/>)
    };
    return imageComponent; 
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
      IpfsAddress,
      Description
    } = this.state.AllMyData[i][0];

    let mainCategory = this.state.MainCategory[DataType.toNumber()];
    let category = this.state.Categories[DataType.toNumber()][Category];
    let decryptIPFS = this.showDecryptData(IpfsAddress, this.state.AllMyData[i][0].EncryptKey);
    
    this.setState({
      MyNameDetail: Name,
      MyCategoryDetail: category,
      MySubCategoryDetail: SubCategory,
      MyDataTypeDetail: mainCategory,
      MyIPFSDetail: decryptIPFS,
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

    let mainCategory = this.state.MainCategory[DataType.toNumber()];
    let category = this.state.Categories[DataType.toNumber()][Category];

    this.setState({
      NameForDetail: Name,
      CategoryForDetail: category,
      SubCategoryForDetail: SubCategory,
      DataTypeForDetail: mainCategory,
      PriceForDetail: Price,
      SellerForDetail: Seller,
      DescriptionForDetail: Description,
      ShowDetails: true
    })
  }

  showDecryptData = (data, key) => {
    // When ready to decrypt the hex string, convert it back to bytes
    let encryptedBytes = aesjs.utils.hex.toBytes(data);

    // The counter mode of operation maintains internal state, so to
    // decrypt a new instance must be instantiated.
    let aesCtr = new aesjs.ModeOfOperation.ctr(key, new aesjs.Counter(5));
    let decryptedBytes = aesCtr.decrypt(encryptedBytes);

    // Convert our bytes back into text
    let decryptedText = aesjs.utils.utf8.fromBytes(decryptedBytes);
    
    return decryptedText;
  }

  decryptData = (data, key) => {
    // When ready to decrypt the hex string, convert it back to bytes
    let encryptedBytes = aesjs.utils.hex.toBytes(data);

    // The counter mode of operation maintains internal state, so to
    // decrypt a new instance must be instantiated.
    let aesCtr = new aesjs.ModeOfOperation.ctr(key, new aesjs.Counter(5));
    let decryptedBytes = aesCtr.decrypt(encryptedBytes);

    // Convert our bytes back into text
    let decryptedText = aesjs.utils.utf8.fromBytes(decryptedBytes);

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

    let _validFileExtensions = [];
    if(this.state.DataType === "2") {
      _validFileExtensions = [".dcm", ".nii.gz", ".nii", ".img", ".doc", ".png"]
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
            message.error("Sorry, " + sFileName + " is invalid, allowed extensions are: " + _validFileExtensions.join(", "));
            event.target.value = "";
            return false;
        }
    }
    let reader = new window.FileReader()
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

    // Convert text to bytes
    let textBytes = aesjs.utils.utf8.toBytes(buffer);

    // The counter is optional, and if omitted will begin at 1
    let aesCtr = new aesjs.ModeOfOperation.ctr(key, new aesjs.Counter(5));
    let encryptedBytes = aesCtr.encrypt(textBytes);

    // To print or store the binary data, you may convert it to hex
    let encryptedHex = aesjs.utils.hex.fromBytes(encryptedBytes);

    //file is encrypted and convert to a new buffer to prepare for uploading for IPFS
    const encryptedBuffer = await Buffer.from(encryptedHex);

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

  openEMRData = () => {
    this.setState({
      DataType: 0,
      OpenMyData: true
    });
  };

  openNumericalData = () => {
    this.setState({
      DataType: 1,
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
      categories.map((category, index) => <Option value={index}>{category}</Option>)
    )
  }

  onClick = async () => {

    try {
      this.setState({ blockNumber: "waiting.." });
      this.setState({ gasUsed: "waiting..." });

      // get Transaction Receipt in console on click
      // See: https://web3js.readthedocs.io/en/1.0/web3-eth.html#gettransactionreceipt
      await web3.eth.getTransactionReceipt(this.state.transactionHash, (err, txReceipt) => {
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

  handleStorageTypeChange = value => this.setState({StorageType: value});
  
  handleDataTypeChange = value => {
    this.setState({DataType: value, Category: this.state.Categories[value]});
    if (value === '2') {
      this.setState({ShowSubCategory: true});
    } else {
      this.setState({ShowSubCategory: false});
    }
  }

  handleCategoryChange = value => this.setState({SelectCategory: value});


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

    await ipfs.add(this.state.buffer, (err, ipfsHash) => {
    //setState by setting ipfsHash to ipfsHash[0].hash
    //set this buffer -using es6 syntax
    let key = this.randomArray(16, 100);

    // Convert text to bytes
    let textBytes = aesjs.utils.utf8.toBytes(ipfsHash[0].hash);

    // The counter is optional, and if omitted will begin at 1
    let aesCtr = new aesjs.ModeOfOperation.ctr(key, new aesjs.Counter(5));
    let encryptedBytes = aesCtr.encrypt(textBytes);

    // To print or store the binary data, you may convert it to hex
    let encryptedHex = aesjs.utils.hex.fromBytes(encryptedBytes);

      this.setState({ ipfsHash: encryptedHex, EncryptKey: key });

      // call Ethereum contract method "sendHash" and .send IPFS hash to etheruem contract 
      //return the transaction hash from the ethereum contract
      //see, this https://web3js.readthedocs.io/en/1.0/web3-eth-contract.html#methods-mymethod-send

      this.state.ContractInstance.uploadData(
        this.state.Name,
        this.state.Description,
        this.state.DataType,
        this.state.SelectCategory.toString(),
        this.state.SelectSubCategory,
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
    let showAIMarket = this.state.ShowAIMarket ? '' : 'hide-content';
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
            
							<a className="navbar-brand"onClick={() => window.location.reload()} ><img src={logo} height="50" /></a>
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

        <div className="col-md-3 my-data-place">
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

          <div className="parent-image" onClick={this.openEMRData}>
		        <div className="child-image bg-three">
			         <a className="image-name">EMR</a>
		        </div>
	        </div>

          <div className="parent-image" onClick={this.openNumericalData}>
		        <div className="child-image bg-four">
			         <a className="image-name">Numerical Measurement</a>
		        </div>
	        </div>
        </div>
      </div>

      <div className={showAIMarket}>
        <div className="col-md-9 data-market" style={{display: "relative"}}>
          <div className='market-header'>
            <div className='bread-crumb'>
            <Breadcrumb>
                <Breadcrumb.Item><a href="">Home</a></Breadcrumb.Item>
                <Breadcrumb.Item>AI Marketplace</Breadcrumb.Item>
              </Breadcrumb>
            </div>
            <div className='market-header-title'> 
              <h1 className='marketplace-label'>AI Marketplace</h1>
              <Button onClick={() => this.setState({ShowMainPage: true, ShowDataMarket: false, ShowAIMarket: false})}>Back</Button>
            </div>
          </div>
          { this.renderAIMarketImage(this.state.ImageLinkDict)}
        </div>
      </div>

      <div className={showDataMarket}>
        <div className="col-md-9 data-market" style={{display: "relative"}}>
          <div className='market-header'>
            <div className='bread-crumb'>
            <Breadcrumb>
                <Breadcrumb.Item>Home</Breadcrumb.Item>
                <Breadcrumb.Item><a href="">Data Marketplace</a></Breadcrumb.Item>
              </Breadcrumb>
          </div>
            <div className='market-header-title'> 
              <h1 className='marketplace-label'>Data Marketplace</h1>
              <Button onClick={() => this.setState({ShowMainPage: true, ShowDataMarket: false, ShowAIMarket: false})}>Back</Button>
            </div>
        </div>

          <span style={{marginRight: '10px', marginTop: '15px'}}> 
              <label style={{margin: '0 10px'}}>Image:</label>
              <Checkbox id="market-image-check" checked={this.state.MarketImageCheck} onChange={this.handleEventChange} />
          </span>
          <span>
              <label style={{margin: '0 10px'}}>Gene:</label>
              <Checkbox id="market-genomic-check" checked={this.state.MarketGenomicCheck} onChange={this.handleEventChange} />
          </span>
          <div className='table-wrapper'>
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Data Type</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Rating</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {this.DataForSale(this.state.DataForSale)}
              </tbody>
            </table>
        </div>
        <div style={{width: "100%", margin: "0 auto", position:"absolute", left:"28%"}}>
            {this.paginationBar()}
        </div>
      </div>
    </div>

       <div className={showMainPage}>
        <div className="col-md-9 maincontent">

				<div className="entrance-image-container">
					<div className="box entrance entrance-data text-center">
						<a onClick={() => this.setState({ShowMainPage: false, ShowDataMarket: true, ShowAIMarket: false})} style={{color:'white'}}><h1>Data Marketplace</h1></a>
					</div>
        </div>

        <div className="entrance-image-container">
					<div className="box top-space-10 entrance entrance-al text-center">
						<a onClick={() => this.setState({ShowMainPage: false, ShowDataMarket: false, ShowAIMarket: true})}style={{color: 'white'}}><h1>AI Marketplace</h1></a>
					</div>
				</div>
				</div>
        </div>

      </div>
    </div>

    <div className="footer-amrita">
      <div>Copyright ©2011-2018 AMRITA NETWORK ALL RIGHTS RESERVED</div>
    </div>

    <Modal show={this.state.OpenMyData} onHide={this.handleMyDataClose}>
      <Modal.Header closeButton>
        <Modal.Title>{this.state.MainCategory[this.state.DataType]}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Name</th>
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
                <Input type="text" className='form-control' id="data_name" onChange={this.handleEventChange} placeholder="Enter the name of your article" required/>
              </div>
              <div className='form-group'>
                <label>Description</label>
                <TextArea type="text" className='form-control vresize' id="data_description" onChange={this.handleEventChange} placeholder="Describe your article" maxLength="255" required></TextArea>
              </div>
              <div className='form-group'>
                <label>Storage Type</label>
                <Select className="form-control" onChange={this.handleStorageTypeChange} placeholder="Please select Upload Data Type" required>
                  <Option value="0">IPFS</Option>
                  <Option value="1">StorJ</Option>
                  <Option value="2">AWS</Option>
                  <Option value="3">Google Cloud</Option>
                  <Option value="4">Microsoft Azure</Option>
                </Select>
              </div>
              <div className='form-group'>
                <label>Data Type</label>
                <Select className="form-control" onChange={this.handleDataTypeChange} placeholder="Please select Upload Data Type" required>
                  <Option value="2">Medical Imaging Data</Option>
                  <Option value="3">Genetic Data</Option>
                  <Option value="0">EMR</Option>
                  <Option value="1">Numerical Measurement</Option>
                </Select>
              </div>
              <div className='form-group'>
                <label>Category</label>
                <Select className="form-control" onChange={this.handleCategoryChange} placeholder="Please select a category" required>
                  {this.mapCategorySelection(this.state.Category)}
                </Select>
              </div>
              <div className={`form-group ${ShowSubCategory}`}>
                <label>SubCategory</label>
                <div>
                  <Checkbox type="checkbox" id="brain-check" checked={BrainCheck} onChange={this.handleEventChange} />
                  <label className="checkbox-label-spacing">Brain</label>
                </div>
                <div>
                  <Checkbox type="checkbox" id="head-check" checked={HeadCheck} onChange={this.handleEventChange} />
                  <label className="checkbox-label-spacing">Head and Neck</label>
                </div>
                <div>
                  <Checkbox type="checkbox" id="chest-check" checked={ChestCheck} onChange={this.handleEventChange} />
                  <label className="checkbox-label-spacing">Chest</label>
                </div>
                <div>
                  <Checkbox type="checkbox" id="heart-check" checked={HeartCheck} onChange={this.handleEventChange} />
                  <label className="checkbox-label-spacing">Heart</label>
                </div>
                <div>
                  <Checkbox type="checkbox" id="abdomen-check" checked={AbdomenCheck} onChange={this.handleEventChange} />
                  <label className="checkbox-label-spacing">Abdomen</label>
                </div>
                <div>
                  <Checkbox type="checkbox" id="extremities-check" checked={ExtremitiesCheck} onChange={this.handleEventChange} />
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
            <Button type="primary" onClick={this.onSubmit} disabled={!isEnabled}>Submit</Button>
            <Button type="default" style={{marginLeft:'10px'}} onClick={this.handleClose}>Close</Button>
          </Modal.Footer>
        </Modal>

        <Modal show={this.state.PutItOnMarket} onHide={this.handleSellModalClose}>
          <Modal.Header closeButton>
            <Modal.Title>Put Your Data On The Market</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={this.sellMyData}>
              <div className='form-group sell-data-modal'>
                <label>Data name:&nbsp;&nbsp;</label>
                <span>{this.state.NameForSale}</span>
              </div>
              <div className='form-group sell-data-modal'>
                <label>Description:&nbsp;&nbsp;</label>
                <span>{this.state.DescriptionForSale}</span>
              </div>
              <div className="form-group sell-data-modal">
                <label style={{paddingRight: '7px'}}>Price in AMN:</label>
                <input type="number" className="form-control" id="data_price" onChange={this.handleEventChange} placeholder="1" pattern="[0-9]+([\.,][0-9]+)?" step="0.01" />
              </div>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button style={{marginRight: "10px"}} type='primary' onClick={this.sellMyData}>Submit</Button>
            <Button onClick={this.handleSellModalClose}>Close</Button>
          </Modal.Footer>
        </Modal>

        <Modal show={this.state.ShowDetails} onHide={this.handleDetailModalClose}>
          <Modal.Header closeButton>
            <Modal.Title>Details</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <div className='form-group show-details'>
                <label>Name:&nbsp;&nbsp;</label>
                <label style={{color:'#1890FF', textAlign:'left'}}>{this.state.NameForDetail}</label>
              </div>
              <div className='form-group show-details'>
                <label>Data Type:&nbsp;&nbsp;</label>
                <span>{this.state.DataTypeForDetail}</span>
              </div>
              <div className='form-group show-details'>
                <label>Category:&nbsp;&nbsp;</label>
                <span>{this.state.CategoryForDetail}</span>
              </div>
              <div className='form-group show-details'>
                <label>Sub Category:&nbsp;&nbsp;</label>
                <span>{this.state.SubCategoryForDetail}</span>
              </div>
              <div className='form-group show-details'>
                <label>Price:&nbsp;&nbsp;</label>
                <span>{this.state.PriceForDetail}&nbsp;&nbsp;AMN</span>
              </div>
              <div className='form-group show-details'>
                <label>Seller:&nbsp;&nbsp;</label>
                <span>{this.state.SellerForDetail}</span>
              </div>
              <div className='form-group show-details'>
                <label>Rating:&nbsp;&nbsp;</label>
                <Rate allowHalf defaultValue={4.5} />
              </div>
              <div className='form-group show-details'>
                <label>Description:&nbsp;&nbsp;</label>
                <span>{this.state.DescriptionForDetail}</span>
              </div>
            </Form>
          </Modal.Body>
        </Modal>

        <Modal show={this.state.ShowMyDetails} onHide={this.handleMyDetailModalClose}>
          <Modal.Header closeButton>
            <Modal.Title>Details</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <div className='form-group show-details'>
                <label>Name:&nbsp;&nbsp;</label>
                <label style={{color:'#1890FF', textAlign:'left'}}>{this.state.MyNameDetail}</label>
              </div>
              <div className='form-group show-details'>
                <label>Data Type:&nbsp;&nbsp;</label>
                <span>{this.state.MyDataTypeDetail}</span>
              </div>
              <div className='form-group show-details'>
                <label>Category:&nbsp;&nbsp;</label>
                <span>{this.state.MyCategoryDetail}</span>
              </div>
              <div className='form-group show-details'>
                <label>Sub Category:&nbsp;&nbsp;</label>
                <span>{this.state.MySubCategoryDetail}</span>
              </div>
              <div className='form-group show-details'>
                <label>IPFS Address:&nbsp;&nbsp;</label>
                <span>{this.state.MyIPFSDetail}</span>
              </div>
              <div className='form-group show-details'>
                <label>Description:&nbsp;&nbsp;</label>
                <span>{this.state.MyDescriptionDetail}</span>
              </div>
            </Form>
          </Modal.Body> 
        </Modal>
    </div>
    )
  } //render
}

export default App;
