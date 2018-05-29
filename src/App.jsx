import { Grid, Button, Form, Modal } from 'react-bootstrap';
import React, { Component } from 'react';
// import {BigNumber} from 'bignumber.js';
//import logo from './logo.svg';
import './App.css';
//import web3 from './web3';

import ipfs from './ipfs';
//import storehash from './storehash';
//import TruffleContract from './truffle-contract'
import chainList from './ChainList.json'
const TruffleContract = require("truffle-contract");
const Web3 = require('web3');
const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
//var BigNumber = require('bignumber.js')

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      ipfsHash: null,
      buffer: '',
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
        this.setState({ balance: web3.fromWei(balance, "ether") + " ETH" });
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
                  Price: web3.fromWei(data[5].toString(),"ether"),
                  IsForSale: data[7]
                })
                this.setState({ DataForSale: [...this.state.DataForSale, dataForSale] });
                console.log('Data for sale in state --', this.state.DataForSale[0])
              }
            });
          }
        })

        //Display ALL My Data
        contractInstance.getDataForSale().then((dataIdList) => {

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
                  Price: web3.fromWei(data[5].toString(),"ether"),
                  IpfsAddress: data[6],
                  IsForSale: data[7]
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
    return (
      dataforsale.map((data, index) => {
        return (
          <div key={index} className='market-data-list'>
            <div className='market-data-list-item'>{data[0].Seller}</div>
            <div className='market-data-list-item'>{data[0].Name}</div>
            <div className='market-data-list-item'>{data[0].Description}</div>
            <div className='market-data-list-item'>{web3.fromWei(data[0].Price, "ether")}</div>
            <button className='btn btn-primary' onClick={() => this.buyMarketData(index)} disabled={data[0].Seller === this.account}>Buy</button>
          </div>
        )
      })
    )
  }

  AllMyData = (allmydata) => {
    return (
      allmydata.map((data, index) => {
        return (
          <div key={index} className='my-data-list'>
            <div className='my-data-list-item'>{data[0].IpfsAddress}</div>
            <div className='my-data-list-item'>{data[0].Name}</div>
            <div className='my-data-list-item'>{data[0].Description}</div>
            <button className='btn btn-primary' onClick={() => this.openSellModal(index)} disabled={data[0].IsForSale}>Sell</button>
          </div>
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

  buyMarketData = (index) => {

    console.log(this.state.DataForSale[index][0].Id.toNumber());
    this.state.ContractInstance.buyData(this.state.DataForSale[index][0].Id)
    // .then(ipfsHash => window.location.replace(`www.ipfs.io/ipfs/${ipfsHash}`))
    .then(ipfsHash => console.log(ipfsHash))
    .catch(err => alert(err));

  }

  sellMyData = () => {

    console.log('TYPE OF SELLING PRICE--', web3.toBigNumber(web3.toWei(this.state.PriceForSell.toString(), "ether")));
    console.log('TYPE OF SELLING ID--', this.state.IdForSale);
    console.log(this.state.ContractInstance);

    this.state.ContractInstance.sellData(
      this.state.IdForSale,
      web3.fromWei(this.state.PriceForSell, "ether"), 
      { from: this.state.account, gas: 500000 }
      ).catch((err) => console.log(err));
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
        if(data[7] === true || data[7] === null) {
          console.log("!!!!", data);
          const dataForSale = [];
          dataForSale.push({
            Id: data[0],
            Seller: data[1],
            Buyer: data[2],
            Name: data[3],
            Description: data[4],
            Price: web3.fromWei(data[5].toString(),"ether"),
            IsForSale: data[7]
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
              Price: web3.fromWei(data[5].toString(),"ether"),
              IpfsAddress: data[6],
              IsForSale: data[7]
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
    let reader = new window.FileReader()
    reader.readAsArrayBuffer(file)
    reader.onloadend = () => this.convertToBuffer(reader)
  };

  convertToBuffer = async (reader) => {
    //file is converted to a buffer to prepare for uploading to IPFS
    const buffer = await Buffer.from(reader.result);
    //set this buffer -using es6 syntax
    this.setState({ buffer });
  };

  handleOpen = () => this.setState({ show: true });

  handleClose = () => this.setState({ show: false });

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
    await ipfs.add(this.state.buffer, (err, ipfsHash, name, description) => {
      console.log(err, ipfsHash);
      //setState by setting ipfsHash to ipfsHash[0].hash
      this.setState({ ipfsHash: ipfsHash[0].hash });

      // call Ethereum contract method "sendHash" and .send IPFS hash to etheruem contract 
      //return the transaction hash from the ethereum contract
      //see, this https://web3js.readthedocs.io/en/1.0/web3-eth-contract.html#methods-mymethod-send
      console.log('State', this.state.Name, this.state.Description);

      // this.contract.deployed().then((contractInstance) => {
      // console.log(contractInstance)
      // contractInstance.uploadData(this.state.Name,this.state.Description,ipfsHash[0].hash,{
      // from: this.state.account,
      // gas: 500000
      // });
      // })
      console.log("=====web3 version", web3.version)
      this.state.ContractInstance.uploadData(
        this.state.Name,
        this.state.Description,
        ipfsHash[0].hash,
        {
          from: this.state.account,
          gas: 500000
        });
      this.setState({
        show: false,
        Name: '',
        Description: ''
      });


      // storehash.methods.sendHash(this.state.ipfsHash).send({
      // from: accounts[0]
      // }, (error, transactionHash) => {
      // console.log(transactionHash);
      // this.setState({transactionHash});
      // }); //storehash 

    }) //await ipfs.add 
  }; //onSubmit 

  render() {
    const isEnabled =
      this.state.Name.length > 0 &&
      this.state.Description.length > 0;

    return (
      <div className="App">
        <header className="App-header">
          <h1> Ethereum and InterPlanetary File System(IPFS) with Create React App</h1>
        </header>

        <Grid>
          <h3> Choose file to send to IPFS </h3>
          <div>
            <div>{this.state.account}</div>
            <div>{this.state.balance}</div>
            <div>{this.state.DataList}</div>
            <Button bsStyle="primary" type="submit" onClick={this.handleOpen}>
              Upload Data
 </Button>
            <div className='market-data'>{this.DataForSale(this.state.DataForSale)}</div>
            <div className='my-data'>{this.AllMyData(this.state.AllMyData)}</div>
          </div>

          <hr />
        </Grid>

        <Modal show={this.state.show} onHide={this.handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>Sell Your Data</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={this.onSubmit}>
              <div className='form-group'>
                <label>Data name</label>
                <input type="text" className='form-control' id="data_name" onChange={this.handleEventChange} placeholder="Enter the name of your article" />
              </div>
              {/* <div class="form-group">
 <label for="price">Price in ETH</label>
 <input type="number" class="form-control" id="article_price" placeholder="1" pattern="[0-9]+([\.,][0-9]+)?" step="0.01" />
 </div> */}
              <div className='form-group'>
                <label>Description</label>
                <textarea type="text" className={'form-control vresize'} id="data_description" onChange={this.handleEventChange} placeholder="Describe your article" maxLength="255"></textarea>
              </div>
              <input type='file' onChange={this.captureFile} />
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
                <label>Data name</label>
                <label>{this.state.NameForSale}</label>
              </div>
              <div className='form-group'>
                <label>Description</label>
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
    );
  } //render
}

export default App;
