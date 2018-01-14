import React, { Component } from 'react';
import './App.css';
import './3d/3d-force-graph.css';
import Graph from './Graph.js';
import { Slider, Input } from 'antd';
import getWeb3 from './utils/getWeb3';
import TrustGraphContract from './TrustGraph.json';
const contractAddress = '0xb79d6277e32da0c9956d78c5366c82a6525c0945';


import ColorHash from 'color-hash';

let Color = new ColorHash({saturation: 0.5});
const Search = Input.Search;

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      page: 'explorer', // overview, explorer
      filterText: '',
      filterMin: 0,
      filterMax: 5,
    };
  }

  componentWillMount() {
    getWeb3
    .then(results => {
      this.setState({
        web3: results.web3
      })

      // Instantiate contract once web3 provided.
      this.instantiateContract();
    })
    .catch(() => {
      console.log('Error finding web3.')
    })
  }

  updateEdge(trustee, rating) {
    this.state.trustGraphInstance.addEdge(trustee, rating);
    console.log('completed')
  }

  instantiateContract() {

    const contract = require('truffle-contract')
    const trustGraph = contract(TrustGraphContract)
    trustGraph.setProvider(this.state.web3.currentProvider)

    // Declaring this for later so we can chain functions on TrustGraph.
    var trustGraphInstance
    
    // Get accounts.
    this.state.web3.eth.getAccounts((error, accounts) => {
      trustGraph.at(contractAddress).then((instance) => {
        trustGraphInstance = instance
        this.setState({trustGraphInstance: trustGraphInstance});

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

        console.log(ratingList);

        this.setState({ trusterList: trusterList, trusteeList: trusteeList, ratingList: ratingList })   
      }).then(()=> {
            //Temporary tester code
          console.log('about to update edge');
          console.log(trustGraphInstance)
          this.updateEdge('0xf7253aefa415ea790cdc946e171a361a1b5c9842', 2)
      });
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
          id: '0x81f4019579b012a28515aa8bf0ea44d66f38f73b',
          name: 'Name Is Super Long And Waaoowowwwowoigaods',
          rating: 5,
        },
        {
          id: 'me2',
          name: 'Name',
          rating: 4,
        },
        {
          id: 'me3',
          name: 'Name',
          rating: 3,
        },
        {
          id: 'me32',
          name: 'Name',
          rating: 2,
        },
        {
          id: 'me33',
          name: 'Name',
          rating: 0,
        },
        {
          id: 'me52',
          name: 'Name',
          rating: 0,
        },
        {
          id: 'me53',
          name: 'Name',
          rating: 0,
        }
      ];

      let peerItems = [];

      for (let index in peerObjs) {
        let peer = peerObjs[index];
        let show = false;

        if (this.state.filterText !== undefined) {
          if (peer.id.indexOf(this.state.filterText) !== -1) {
            show = true;
          } else if (peer.name.indexOf(this.state.filterText) !== -1) {
            show = true;
          }
        } else {
          show = true;
        }

        if (peer.rating < this.state.filterMin) {
          show = false;
        }
        if (peer.rating > this.state.filterMax) {
          show = false;
        }

        if (show) {
          let peerColor = Color.hex(peer.id)
          let peerColorRGB = Color.rgb(peer.id)

          let colorStyle = {
            borderColor: peerColor,
          };
          let lightBackgroundStyle = {
            background: `rgba(${peerColorRGB[0]}, ${peerColorRGB[1]}, ${peerColorRGB[2]}, 0.2)`,
          }
          peerItems.push(<div className="Peer" key={peer.id} style={colorStyle}>
            <div className="PeerContent" style={lightBackgroundStyle}>
              <div className="PeerContent__title">
                <div className="PeerContent__title__name">
                  {peer.name}
                </div>
                <div className="PeerContent__title__rating">
                  {peer.rating}/5
                </div>
              </div>
              <div className="PeerContent__id">
                {peer.id}
              </div>
              <div className="PeerContent__body">
                red
              </div>

            </div>

            <div className="PeerRating">
              Rate this user:
              <Slider style={{color: peerColor}} min={0} max={5} onAfterChange={(value) => {
                console.log('Setting peer ' + peer.id + ' to ' + value)
              }} />
            </div>
          </div>)
        }

      }

      const sliderMarks = {
        0: '0',
        1: '1',
        2: '2',
        3: '3',
        4: '4',
        5: '5',
      };

      content = <div className="Explorer">
        <div className="Explorer__content">
          <div className="Explorer__content__graph">
            <Graph />
          </div>
          <div className="Explorer__content__myTrust">
            <div className="PeerListContainer">
              <div className="PeerListSearch">
                <Search
                  placeholder="Filter peers by name"
                  value={this.state.filterText}
                  onChange={event => {
                    this.setState({
                      filterText: event.target.value
                    })
                  }}
                />
              </div>
              <div className="PeerListSlider">
                <Slider range min={0} max={5} defaultValue={[this.state.filterMin, this.state.filterMax]} marks={sliderMarks} onChange={(value) => {
                  this.setState({
                    filterMin: value[0],
                    filterMax: value[1],
                  })
                }} />
              </div>
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
