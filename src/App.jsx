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

import chainList from './ChainList.json'
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

      dataForSale: [
        { Id: '1', Seller: 'Jason', Buyer: 'Alex', Name: 'Data', Description: 'Health', Price: '100 ETH' },
        { Id: '2', Seller: 'Jason', Buyer: 'Alex', Name: 'Data', Description: 'Health', Price: '100 ETH' },
        { Id: '3', Seller: 'Jason', Buyer: 'Alex', Name: 'Data', Description: 'Health', Price: '100 ETH' },
        { Id: '4', Seller: 'Jason', Buyer: 'Alex', Name: 'Data', Description: 'Health', Price: '100 ETH' },
        { Id: '5', Seller: 'Jason', Buyer: 'Alex', Name: 'Data', Description: 'Health', Price: '100 ETH' }
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
                  FileExtension: data[10]
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
                  FileExtension: data[10]
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
        return (
          <tr key={index}>
            <td style={{textAlign:"center"}}>{data[0].Name}</td>
            <td style={{textAlign:"center"}}>{data[0].Description}</td>
            <td style={{textAlign:"center"}}>{(data[0].DataType.toNumber()) ? "Genomic Data" : "Image Data"}</td>
            <td style={{textAlign:"center"}}>{data[0].Price}&nbsp;ETH</td>
            <td style={{textAlign:"center"}}>{data[0].Seller}</td>
            <td style={{textAlign:"center" ,width:"100px"}} className={userOwnData}><button className='btn btn-info' onClick={() => this.buyMarketData(index)} disabled={data[0].Seller === this.state.account}>Buy</button></td>
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

   
  decryptData = (data, key) => {
    //console.log("PASS IN DATA---", data.toString('hex'));
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
    //this.setState({FileExtension: this.state.DataForSale[index][0].FileExtension});
    //console.log("filename=====", `test.${this.state.FileExtension}`);

    // window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;
    // window.requestFileSystem(window.TEMPORARY, 1024*1024, this.onInitFs, err => err);
    //fs.writeFile("test.text", '1234124', err => err ? console.log(err) : null);
    //fs.writeFile(`.../downloads/test.${this.state.FileExtension}`, this.state.DecryptedText, err => err ? console.log(err) : null);
    window.open(`https://ipfs.io/ipfs/${this.state.DecryptedText}`)
    console.log("DONE!!!");
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

    //console.log('TYPE OF SELLING PRICE--', web3.toBigNumber(web3.utils.toWei(this.state.PriceForSell.toString(), "ether")));
    console.log('TYPE OF SELLING ID--', this.state.IdForSale);
    console.log(this.state.ContractInstance);

    this.state.ContractInstance.sellData(
      this.state.IdForSale,
      web3.utils.toWei(this.state.PriceForSell, "ether"),
      { from: this.state.account, gas: 5000000 }
    )
    .then(this.setState({PutItOnMarket: false, OpenMyData: false}), this.refreshMarket());
    console.log("Finished!!!!!!!!");
  }

  refreshMarket = () => {
    //Display all market data
    this.state.ContractInstance.getDataForSale().then((dataIdList) => {
      console.log('All Market Data ID List --', dataIdList);
      this.setState({DataForSale: ''});
      for (let i = 0; i < dataIdList.length; i++) {
        var dataId = dataIdList[i];
        this.state.ContractInstance.dataList(dataId.toNumber()).then((data) => {
          if (data[7] === true || data[7] === null) {
            console.log("!!!!", data);
            const dataForSale = [];
            dataForSale.push({
              Id: data[0],
              Seller: data[1],
              Buyer: data[2],
              Name: data[3],
              Description: data[4],
              Price: web3.utils.fromWei(data[5].toString(), "ether"),
              IsForSale: data[7],
              DataType: data[8]
            })
            this.setState({ DataForSale: [...this.state.DataForSale, dataForSale] });
            console.log('Data for sale in state --', this.state.DataForSale[0])
          }
        });
      }
    })

    //Display ALL My Data
    this.state.ContractInstance.getDataForSale().then((dataIdList) => {
      this.setState({AllMyData: ''});
      for (let i = 0; i < dataIdList.length; i++) {
        var dataId = dataIdList[i];

        this.state.ContractInstance.dataList(dataId.toNumber()).then((data) => {

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
              DataType: data[8]
            })

            this.setState({ AllMyData: [...this.state.AllMyData, allMyData] });
            console.log('All My Data in state --', this.state.AllMyData);
          }
        });
      }
    })

  }

  errorHandling = (err) => {
    if (err) {
      console.log(err);
    } else {
      //Display all market data
      this.state.ContractInstance.getDataForSale().then((dataIdList) => {
        console.log('All Market Data ID List --', dataIdList);

        for (let i = 0; i < dataIdList.length; i++) {
          var dataId = dataIdList[i];
          this.state.ContractInstance.dataList(dataId.toNumber()).then((data) => {
            if (data[7] === true || data[7] === null) {
              console.log("!!!!", data);
              const dataForSale = [];
              dataForSale.push({
                Id: data[0],
                Seller: data[1],
                Buyer: data[2],
                Name: data[3],
                Description: data[4],
                Price: web3.utils.fromWei(data[5].toString(), "ether"),
                IsForSale: data[7],
                DataType: data[8]
              })
              this.setState({ DataForSale: [...this.state.DataForSale, dataForSale] });
              console.log('Data for sale in state --', this.state.DataForSale[0])
            }
          });
        }
      })

      //Display ALL My Data
      this.state.ContractInstance.getDataForSale().then((dataIdList) => {

        for (let i = 0; i < dataIdList.length; i++) {
          var dataId = dataIdList[i];

          this.state.ContractInstance.dataList(dataId.toNumber()).then((data) => {

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
                DataType: data[8]
              })

              this.setState({ AllMyData: [...this.state.AllMyData, allMyData] });
              console.log('All My Data in state --', this.state.AllMyData);
            }
          });
        }
      })

    }
  }

  captureFile = (event) => {
    event.stopPropagation()
    event.preventDefault()
    const file = event.target.files[0]
    console.log('upload data type-------',this.state.DataType)
    let _validFileExtensions = [];
    if(this.state.DataType === "0") {
      _validFileExtensions = [".dcm", ".nii.gz", ".nii", ".img", ".doc"]
    } else if(this.state.DataType === "1") {
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
      DataType: 0, 
      OpenMyData: true
    });
    //this.refreshMarket();
  };

  openGenomicData = () => {
    this.setState({
      DataType: 1,
      OpenMyData: true
    });
    //this.refreshMarket();
  };

  handleMyDataClose = () => this.setState({OpenMyData: false, DataType: null});

  handleClose = () => this.setState({show: false});

  handleSellModalClose = () => this.setState({ PutItOnMarket: false });

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
      this.setState({DataType: e.target.value});
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
  }

  onSubmit = async (event) => {
    event.preventDefault();

    //bring in user's metamask account address
    // const accounts = await web3.eth.getAccounts();

    // console.log('Sending from Metamask account: ' + accounts[0]);

    //obtain contract address from storehash.js
    //const ethAddress = await storehash.options.address;
    //this.setState({ ethAddress });

    //save document to IPFS,return its hash#, and set hash# to state
    //https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/FILES.md#add
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

      
      console.log(this.state.DataType);
      console.log("=====web3 version", web3.version);
      console.log("EncryptKey", this.state.EncryptKey);
      this.state.ContractInstance.uploadData(
        this.state.Name,
        this.state.Description,
        this.state.DataType,
        this.state.ipfsHash,
        this.state.EncryptKey.toString(),
        this.state.FileExtension,
        {
          from: this.state.account,
          gas: 500000
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
      this.state.DataType === "0" ?  "form-group" : "hide-upload-button";
    let showUploadGenomic = 
    this.state.DataType === "1" ? "form-group" : "hide-upload-button";

    let showMainPage = this.state.ShowMainPage ? '' : 'hide-content';
    let showDataMarket = this.state.ShowDataMarket ? '' : 'hide-content';

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
          {/* <div className="box top-space-10">
            <div className="box-head">
              <h4 className="box-title">My Data 1</h4>
            </div>
            <div className="box-body">
              <p className="color-green">Address <button className="btn btn-primary btn-small pull-right">SELL</button></p>
              <p className="top-space-10">QWERTYUIOPSDFGHJKLVBNMHGJKLASDASD</p>
            </div>
          </div> */}
          <div className="top-space-10">
            <div className="onClickTextOverImage-image" onClick={this.openImageData}>
                <div className="text">
                  Image Data
                </div>
            </div>

              <div className="onClickTextOverImage-genomic" onClick={this.openGenomicData}>
                <div className="text">
                  Genetic Data
                </div>
              </div>
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
              <th>Price</th>
              <th>Seller</th>
              <th>
              </th>
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
					
					<div className="box entrance entrance-data text-center">
						<a onClick={() => this.setState({ShowMainPage: false, ShowDataMarket: true})} style={{color:'white'}}><h1>Data Market Place</h1></a>
					</div>

					<div className="box top-space-10 entrance entrance-al text-center">
						<a style={{color: 'white'}}><h1>Al Market Place</h1></a>
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
        <Modal.Title>{this.state.DataType === 1 ? 'Genomic' : 'Image'} Data</Modal.Title>
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
                <label>Data Type</label>
                <select className="form-control" id="data_type" onChange={this.handleEventChange} placeholder="Please select Upload Data Type" required>
                  <option value="" disabled selected>Please Select Upload Data Type</option>
                  <option value="0">Image</option>
                  <option value="1">Genomic</option>
                </select>
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
    </div>
    )
  } //render
}

export default App;
