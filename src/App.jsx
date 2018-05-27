import {Table, Grid, Button, Form, Modal} from 'react-bootstrap';
import React, { Component } from 'react';
//import logo from './logo.svg';
import './App.css';
import web3 from './web3';
import ipfs from './ipfs';
import storehash from './storehash';
//import TruffleContract from './truffle-contract'
import chainList from './ChainList.json'
const TruffleContract = require("truffle-contract");

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      ipfsHash:null,
      buffer:'',
      ethAddress:'',
      name: '',
      dexcription: '',
      blockNumber:'',
      transactionHash:'',
      gasUsed:'',
      txReceipt: '',
      account: '',
      balance: '',
      web3Provider: null,
      ContractInstance: '',
      DataList:[],
      IsForSale: false,

      dataForSale: [
        {Id: '1', Seller: 'Jason', Buyer: 'Alex', Name: 'Data', Description: 'Health', Price: '100 ETH'},
        {Id: '2', Seller: 'Jason', Buyer: 'Alex', Name: 'Data', Description: 'Health', Price: '100 ETH'},
        {Id: '3', Seller: 'Jason', Buyer: 'Alex', Name: 'Data', Description: 'Health', Price: '100 ETH'},
        {Id: '4', Seller: 'Jason', Buyer: 'Alex', Name: 'Data', Description: 'Health', Price: '100 ETH'},
        {Id: '5', Seller: 'Jason', Buyer: 'Alex', Name: 'Data', Description: 'Health', Price: '100 ETH'}
      ],

      //DataForSale: [],
      AllMyData: [],
      show: false
    };

    this.contract = TruffleContract(chainList);
    this.contract.setProvider(web3.currentProvider);
  }

  componentDidMount() {

    web3.eth.getCoinbase((err, account) => {
      //Initial Account and Get Balance
      this.setState({account});
      web3.eth.getBalance(account, (err, balance) =>{
        this.setState({balance: web3.utils.fromWei(balance, "ether") + " ETH"});
      })
      // Instantiate Contract
      this.contract.deployed().then((contractInstance) => {
      this.setState({ContractInstance: contractInstance});
      console.log(contractInstance.getDataForSale());

      contractInstance.getDataForSale().then((dataIdList) => {
        console.log(dataIdList);
        for(let i = 0; i < dataIdList.length; i++) {
          var dataId = dataIdList[i];
          contractInstance.dataList(dataId.toNumber()).then(function(article){
            console.log(article[0], article[1], article[3], article[4], article[5]);

            const dataForSale = [...this.state.DataForSale];
            dataForSale.push( {
              Id: article[0],
              Seller: article[1],
              Buyer: article[2],
              Name: article[3],
              Description: article[4],
              Price: article[5],
              IsForSale: article[7]
            })

            if(article[1] === this.state.account) {
              const allMyData = [...this.state.AllMyData];
              allMyData.push({
                Id: article[0],
                Name: article[3],
                Description: article[4],
                Price: article[5],
                IsForSale: article[7]
              });
              this.setState({AllMyData: allMyData})
            }
            this.setState({DataForSale: dataForSale});
          });
        }
      })

      })
    })
  }

  DataForSale = (dataforsale) => {
    return (
      dataforsale.map((data, index) => {
        return(
        <div key={index} className= 'market-data-list'>
          <div className= 'market-data-list-item'>{data.Id}</div>
          <div className= 'market-data-list-item'>{data.Seller}</div>
          <div className= 'market-data-list-item'>{data.Buyer}</div>
          <div className= 'market-data-list-item'>{data.Name}</div>
          <div className= 'market-data-list-item'>{data.Description}</div>
          <div className= 'market-data-list-item'>{data.Price}</div>
        </div>
        )
      })
    )
  }

  AllMyData = (allmydata) => {
    return (
      allmydata.map((data, index) => {
        return(
        <div key={index} className= 'market-data-list'>
          <div className= 'market-data-list-item'>{data.Id}</div>
          <div className= 'market-data-list-item'>{data.Name}</div>
          <div className= 'market-data-list-item'>{data.Description}</div>
          <button class='btn btn-primary' onClick={() => this.sellMyData(data)} disabled={this.state.IsForSale}>Sell</button>
        </div>
        )
      })
    )
  }

  sellMyData = async(props) => {
    await this.contractInstance.sellData();
    this.setState({IsForSale: true});
  }

    captureFile =(event) => {
        event.stopPropagation()
        event.preventDefault()
        const file = event.target.files[0]
        let reader = new window.FileReader()
        reader.readAsArrayBuffer(file)
        reader.onloadend = () => this.convertToBuffer(reader)
      };

    convertToBuffer = async(reader) => {
      //file is converted to a buffer to prepare for uploading to IPFS
        const buffer = await Buffer.from(reader.result);
      //set this buffer -using es6 syntax
        this.setState({buffer});
    };

    handleOpen = () => this.setState({show: true});

    handleClose = () => this.setState({show: false});

    onClick = async () => {

    try{
        this.setState({blockNumber:"waiting.."});
        this.setState({gasUsed:"waiting..."});

        // get Transaction Receipt in console on click
        // See: https://web3js.readthedocs.io/en/1.0/web3-eth.html#gettransactionreceipt
        await web3.eth.getTransactionReceipt(this.state.transactionHash, (err, txReceipt)=>{
          console.log(err,txReceipt);
          this.setState({txReceipt});
        }); //await for getTransactionReceipt

        await this.setState({blockNumber: this.state.txReceipt.blockNumber});
        await this.setState({gasUsed: this.state.txReceipt.gasUsed});
      } //try
    catch(error){
        console.log(error);
      } //catch
  } //onClick


    onSubmit = async (event) => {
      event.preventDefault();

      //bring in user's metamask account address
      const accounts = await web3.eth.getAccounts();

      console.log('Sending from Metamask account: ' + accounts[0]);

      //obtain contract address from storehash.js
      const ethAddress= await storehash.options.address;
      this.setState({ethAddress});

      //save document to IPFS,return its hash#, and set hash# to state
      //https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/FILES.md#add
      await ipfs.add(this.state.buffer, (err, ipfsHash, name, description) => {
        console.log(err,ipfsHash);
        //setState by setting ipfsHash to ipfsHash[0].hash
        this.setState({ ipfsHash:ipfsHash[0].hash });

        // call Ethereum contract method "sendHash" and .send IPFS hash to etheruem contract
        //return the transaction hash from the ethereum contract
        //see, this https://web3js.readthedocs.io/en/1.0/web3-eth-contract.html#methods-mymethod-send

        storehash.methods.sendHash(this.state.ipfsHash).send({
          from: accounts[0]
        }, (error, transactionHash) => {
          console.log(transactionHash);
          this.setState({transactionHash});
        }); //storehash
      }) //await ipfs.add
    }; //onSubmit

    render() {

      return (
        <div className="App">
          <header className="App-header">
            <h1> Ethereum and InterPlanetary File System(IPFS) with Create React App</h1>
          </header>

          <hr />

        <Grid>
          <h3> Choose file to send to IPFS </h3>
          <div>
            <div>{this.state.account}</div>
            <div>{this.state.balance}</div>
            <div>{this.state.DataList}</div>
             <Button bsStyle="primary" type="submit" onClick={this.handleOpen}>
             Upload Data
             </Button>
             <div className='market-data'>{this.DataForSale(this.state.dataForSale)}</div>
             <div className='my-data'>{this.AllMyData(this.state.AllMyData)}</div>
          </div>

          <hr/>
            <Button onClick = {this.onClick}> Get Transaction Receipt </Button>

              <Table bordered responsive>
                <thead>
                  <tr>
                    <th>Tx Receipt Category</th>
                    <th>Values</th>
                  </tr>
                </thead>

                <tbody>
                  <tr>
                    <td>IPFS Hash # stored on Eth Contract</td>
                    <td>{this.state.ipfsHash}</td>
                  </tr>
                  <tr>
                    <td>Ethereum Contract Address</td>
                    <td>{this.state.ethAddress}</td>
                  </tr>

                  <tr>
                    <td>Tx Hash # </td>
                    <td>{this.state.transactionHash}</td>
                  </tr>

                  <tr>
                    <td>Block Number # </td>
                    <td>{this.state.blockNumber}</td>
                  </tr>

                  <tr>
                    <td>Gas Used</td>
                    <td>{this.state.gasUsed}</td>
                  </tr>
                </tbody>
            </Table>
        </Grid>

       <Modal show={this.state.show} onHide={this.handleClose}>
         <Modal.Header closeButton>
           <Modal.Title>Sell Your Data</Modal.Title>
         </Modal.Header>
         <Modal.Body>
            <Form onSubmit={this.onSubmit}>
              <div className= 'form-group'>
               <label>Data name</label>
               <input type="text" className={'form-control'} id="article_name" placeholder="Enter the name of your data" />
              </div>
              {/* <div class="form-group">
                <label for="price">Price in ETH</label>
                <input type="number" class="form-control" id="article_price" placeholder="1" pattern="[0-9]+([\.,][0-9]+)?" step="0.01" />
              </div> */}
              <div className= 'form-group'>
                <label>Description</label>
                <textarea type="text" className={'form-control vresize'} id="article_description" placeholder="Describe your data" maxLength="255"></textarea>
              </div>
              <input type = 'file' onChange = {this.captureFile}/>
            </Form>
         </Modal.Body>
         <Modal.Footer>
              <button className= 'btn btn-primary' type='submit' onClick={this.onSubmit}>Submit</button>
              <button className= 'btn btn-default' onClick={this.handleClose}>Close</button>
         </Modal.Footer>
       </Modal>
      </div>
    );
  } //render
}

export default App;
