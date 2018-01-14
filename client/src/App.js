import React, { Component } from 'react';
import './App.css';
import './3d/3d-force-graph.css';
import Graph from './Graph.js';
import Particles from './Particles.js';
import { Slider, Input } from 'antd';
import getWeb3 from './utils/getWeb3';
import TrustGraphContract from './TrustGraph.json';
import ColorHash from 'color-hash';
import { calculate_trust } from './pagerank.js'

const contractAddress = '0xd52d80cefbd2696082d3b32cd15ea26a98740fe4';



let Color = new ColorHash({saturation: 0.5});
const Search = Input.Search;

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      page: window.location.hash.replace('#',''), // '' (overview), explorer
      filterText: '',
      filterMin: 0,
      filterMax: 5,
      peerObjs: [
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
      ]
    };
  }

  componentWillMount() {
    window.addEventListener("hashchange", (event) => {
      this.setState({
        page: window.location.hash.replace('#','')
      })
    }, false);

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

    setInterval(() => {
      this.retrieve();
    }, 5000)
  }

  updateEdge(trustee, rating) {
    this.state.trustGraphInstance.addEdge(trustee, rating, {from: this.state.web3.eth.defaultAccount}).then(() => {
      console.log('updated')
    });
  }

  // Set state -- node_list, truster_list, trustee_list, rating_list, trust_score_list
  retrieve(callback) {
    console.log('starting reteival');
    var nodeList;
    var trustGraphInstance = this.state.trustGraphInstance;
    trustGraphInstance.getNodeList.call().then((result) => {
      nodeList = result;
      return trustGraphInstance.getEdgeList.call();
    }).then((result) => {
      var trusterList = result[0];
      var trusteeList = result[1];
      var ratingList = result[2];

      for (var i = 0; i < trusterList.length; i++) {
        trusterList[i] = trusterList[i].toNumber();
        trusteeList[i] = trusteeList[i].toNumber();
        ratingList[i] = ratingList[i].toNumber();
      }

      //console.log(ratingList);

      // Compute pagerank
      var data = {'node_list': nodeList, 'truster_list': trusterList,
        'trustee_list': trusteeList, 'trust_rating_list': ratingList};

      //console.log(nodeList);
      let trustValues = calculate_trust(data, this.state.rankSource, this.state.pubkeyRankSource);
      console.log(trustValues);
      this.setState({nodeList: nodeList, trusterList: trusterList, trusteeList: trusteeList, ratingList: ratingList, trustValues: trustValues});

      console.log('done retreiving and calculating pagerank!!')
    });

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

        this.state.web3.eth.defaultAccount = accounts[0];
      }).then(() => {
        this.retrieve(() => {
          console.log('done');
        })
      })
    })
  }
  render() {
    let headerNavOverviewClass = this.state.page === '' ? 'active' : '';
    let headerNavExplorerClass = this.state.page === 'explorer' ? 'active' : '';

    let header = (
      <header className="AppHeader">
        <div className="AppHeader__top">
          <a href="#" className="AppHeader__top__titleLink" onClick={() => {this.setState({page: 'overview'})}}><h1 className="AppHeader__titleLink"><span className="letter">F</span>lexible<br /><span className="letter">T</span>rust<br /><span className="letter">W</span>eb</h1></a>
          <nav>
            <div><a href="#" className={headerNavOverviewClass}>Overview</a></div>
            <div><a href="#explorer" className={headerNavExplorerClass}>Explorer</a></div>
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

    if (this.state.page === '') {
      content = <div>
        <div className="Page PageIntro">
          <Particles />
          <div className="VertCenter Page__content PageIntro__content">
              <div className="Intro">
                <div className="Intro__content">
                  <div className="Intro__content_FTW">FTW</div>
                  <div className="Intro__content__line">Decentralized reputation on Ethereum.</div>
                  <div className="Intro__content__line">We solve the problem of trustable ratings in a fully decentralized manner.</div>
                </div>
              </div>
          </div>
        </div>

        <div className="Page Page--paper PageTeam">
          <div className="TwoBy TeamContainer">
            <div className="TwoBy__40 TeamSection__Name VertCenter">
            </div>
            <div className="Team TwoBy__60 VertCenter">
              <div className="PlainTitle PageTeam__Title">
                Team
              </div>
            </div>
          </div>
          <div className="TwoBy TeamContainer">
            <div className="TwoBy__40 TeamSection__Name VertCenter">
              <div className="TeamSection__Name__text">Sunny<br /> Aggarwal</div>
            </div>
            <div className="Team TwoBy__60 VertCenter">
              <div className="TeamSection">
                <div className="TeamSection__line">Research Scientist at Tendermint/Cosmos</div>
                <div className="TeamSection__line">Co-founder of Blockchain at Berkeley</div>
                <div className="TeamSection__line">UC Berkeley Computer Science</div>
              </div>
            </div>
          </div>

          <div className="TwoBy TeamContainer">
            <div className="TwoBy__40 TeamSection__Name VertCenter">
              <div className="TeamSection__Name__text">Iris<br /> Li</div>
            </div>
            <div className="Team TwoBy__60 VertCenter">
              <div className="TeamSection">
                <div className="TeamSection__line">Former Software Engineer at Stellar</div>
                <div className="TeamSection__line">Co-founder of Bitcoin at Berkeley</div>
                <div className="TeamSection__line">UC Berkeley Computer Science</div>
              </div>
            </div>
          </div>

          <div className="TwoBy TeamContainer">
            <div className="TwoBy__40 TeamSection__Name VertCenter">
              <div className="TeamSection__Name__text">Sahaj<br /> Garg</div>
            </div>
            <div className="Team TwoBy__60 VertCenter">
              <div className="TeamSection">
                <div className="TeamSection__line">Machine Learning Researcher at Google</div>
                <div className="TeamSection__line">Previously Quant Intern at Jane Street</div>
                <div className="TeamSection__line">Stanford Computer Science</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    } else if (this.state.page === 'explorer') {
      // let sink = <div className="Explorer__sink">
      //   Options
      //     - Sybil: [toggle]
      //     -
      // </div>

      // let results =  <div className="Explorer__content__results">
      //   results
      // </div>

      let peerItems = [];

      for (let index in this.state.peerObjs) {
        let peer = this.state.peerObjs[index];
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

                this.updateEdge(peer.id, value);

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
