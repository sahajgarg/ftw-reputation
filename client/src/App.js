import React, { Component } from 'react';
import './App.css';
import './3d/3d-force-graph.css';
import Graph from './Graph.js';
import { Slider } from 'antd';
import getWeb3 from './utils/getWeb3';

import TrustGraphContract from './TrustGraph.json';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      page: 'explorer', // overview, explorer
    };
  }

  componentWillMount() {
    getWeb3
    .then(results => {
      this.setState({
        web3: results.web3
      })

      // Instantiate contract once web3 provided.
      this.instantiateContract()
    })
    .catch(() => {
      console.log('Error finding web3.')
    })
  }

  instantiateContract() {

    const contract = require('truffle-contract')
    const trustGraph = contract(TrustGraphContract)
    trustGraph.setProvider(this.state.web3.currentProvider)

    // Declaring this for later so we can chain functions on TrustGraph.
    var trustGraphInstance
    

    // Get accounts.
    this.state.web3.eth.getAccounts((error, accounts) => {
      trustGraph.at('0xb9a6fd9c1bcc651e0dc9b9ca666983f435f2c22e').then((instance) => {
        trustGraphInstance = instance

        // Stores a given value, 5 by default.
        return trustGraphInstance.getNodeList.call()
      }).then((result) => {
        this.setState({ nodeList: result })
        return trustGraphInstance.getEdgeList.call()
      }).then((result) => {
        var trusterList = result[0];
        var trusteeList = result[1];
        var ratingList = result[2];


        for (var i = 0; i < trusterList.length; i++) {
          trusterList[i] = trusterList[i].toNumber();
          trusteeList[i] = trusteeList[i].toNumber();
          ratingList[i] = ratingList[i].toNumber();
        }

        trusterList.shift();
        trusteeList.shift();
        ratingList.shift();

        console.log(ratingList);

        return this.setState({ trusterList: trusterList, trusteeList: trusteeList, ratingList: ratingList })
      })
    })
  }

  render() {
    let headerNavOverviewClass = this.state.page === 'overview' ? 'active' : '';
    let headerNavExplorerClass = this.state.page === 'explorer' ? 'active' : '';

    let header = (
      <header className="AppHeader">
        <div className="AppHeader__top">
          <a href="#" className="AppHeader__top__titleLink" onClick={() => {this.setState({page: 'overview'})}}><h1 className="AppHeader__titleLink"><span className="letter">F</span>lexible<br /><span className="letter">T</span>rust<br /><span className="letter">W</span>eb</h1></a>
          <nav>
            <div><a href="#" className={headerNavOverviewClass} onClick={() => {this.setState({page: 'overview'})}}>Overview</a></div>
            <div><a href="#" className={headerNavExplorerClass} onClick={() => {this.setState({page: 'explorer'})}}>Explorer</a></div>
          </nav>
        </div>
        <div className="AppHeader__bottom">
          <div className="AppHeader__bottom__links">
            <a className="TODO">Github</a>
          </div>
        </div>
      </header>
    );

    let content = <div>Unknown page: {this.state.page}</div>

    if (this.state.page === 'overview') {
      content = <div>overview</div>
    } else if (this.state.page === 'explorer') {
      // let sink = <div className="Explorer__sink">
      //   Options
      //     - Sybil: [toggle]
      //     -
      // </div>

      // let results =  <div className="Explorer__content__results">
      //   results
      // </div>

      let peerObjs = [
        {
          id: 'me'
        },
        {
          id: 'me2'
        },
        {
          id: 'me3'
        },
        {
          id: 'me32'
        },
        {
          id: 'me33'
        },
        {
          id: 'me52'
        },
        {
          id: 'me53'
        }
      ];

      let peerItems = [];

      for (let index in peerObjs) {
        let peer = peerObjs[index];
        console.log(peer)
        peerItems.push(<div className="Peer" key={peer.id}>
          <div className="PeerContent">
            {peer.id}

          </div>

          <div className="PeerRating">
            Rate this user:
            <Slider min={0} max={5} onAfterChange={(value) => {
              console.log('Setting peer ' + peer.id + ' to ' + value)
            }} />
          </div>
        </div>)
      }

      content = <div className="Explorer">
        <div className="Explorer__content">
          <div className="Explorer__content__graph">
            <Graph />
          </div>
          <div className="Explorer__content__myTrust">
            <div className="PeerListContainer">
              <div className="PeerList">
                {peerItems}
              </div>
            </div>
          </div>
        </div>
      </div>
    }


    return (
      <div className="App">
        {header}
        <div className="App-content">
          {content}
        </div>
      </div>
    );
  }
}

export default App;
