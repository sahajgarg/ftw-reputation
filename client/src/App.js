import React, { Component } from 'react';
import './App.css';
import './3d/3d-force-graph.css';
import Graph from './Graph.js';
import Particles from './Particles.js';
import { Slider, Input, Button } from 'antd';
import getWeb3 from './utils/getWeb3';
import TrustGraphContract from './TrustGraph.json';
import ColorHash from 'color-hash';
import { calculate_trust } from './pagerank.js';
import random_name from 'node-random-name';
import ImgOpenBazaar from'./openBazaar.png';
import ImgLedgerNano from'./ledgerNano.png';
import ImgPropy from'./propy.jpg';

var contractAddress = '0x93dec6b8d0b48ef028200e35fdd6b218ddab2e81';


let Color = new ColorHash({saturation: 0.5});
const Search = Input.Search;

class App extends Component {
  constructor(props) {
    super(props);

    this.graphAPI = {
      updateTo: (data) => {}, // This will get updated with a function from Graph.js
    };


    this.state = {
      page: window.location.hash.replace('#',''), // '' (overview), explorer
      filterText: '',
      filterMin: 0,
      filterMax: 5,
      newSlider: 5,
      newPeerAddress: '',
      explorerState: 'loading', // 'error', 'loaded'
      initialLoaded: false,
      peerObjs: [
        // {
        //   id: '0x81f4019579b012a28515aa8bf0ea44d66f38f73b',
        //   name: 'Name Is Super Long And Waaoowowwwowoigaods',
        //   rating: 5,
        // },
        // {
        //   id: 'me2',
        //   name: 'Name',
        //   rating: 4,
        // },
        // {
        //   id: 'me3',
        //   name: 'Name',
        //   rating: 3,
        // },
        // {
        //   id: 'me32',
        //   name: 'Name',
        //   rating: 2,
        // },
        // {
        //   id: 'me33',
        //   name: 'Name',
        //   rating: 0,
        // },
        // {
        //   id: 'me52',
        //   name: 'Name',
        //   rating: 0,
        // },
        // {
        //   id: 'me53',
        //   name: 'Name',
        //   rating: 0,
        // }
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
        web3: results.web3,
        provider: results.provider
      })
      window.web3 = results.web3;
      // Instantiate contract once web3 provided.
      this.instantiateContract();
    })
    .catch((e) => {
      console.error(e)
    })

    setInterval(() => {
      try {
        this.retrieve();
      } catch(e) {
        console.log('Retrieve ',e)
        this.setState({
          explorerState: 'error',
        })
      }
    }, 1000)
  }

  updateEdge(trustee, rating) {
    if (!this.state.trustGraphInstance) {
      return;
    }
    this.state.trustGraphInstance.addEdge(trustee, rating, {from: this.state.web3.eth.defaultAccount, gas: 1000000}).then((error, response) => {
      console.log('updated')
      console.log(error)
      console.log(response)
    });
  }

  // Set state -- node_list, truster_list, trustee_list, rating_list, trust_score_list
  retrieve(callback) {
    console.log('Starting retrieval');
    var nodeList;
    var trusterList;
    var trusteeList;
    var ratingList;

    if (!this.state.trustGraphInstance) {
      console.log('Ending retrieval')
      return;
    }

    var trustGraphInstance = this.state.trustGraphInstance;
    trustGraphInstance.getNodeList.call().then((result) => {
      nodeList = result;
      console.log(result);
      return trustGraphInstance.getTrusterList.call();
    }).then((result) => {
      trusterList = result;
      return trustGraphInstance.getTrusteeList.call()
    }).then((result) => {
      trusteeList = result;
      return trustGraphInstance.getRatingList.call()
    }).then((result) => {
      ratingList = result;

      let peerObjs = [];
      let graphData = {"nodes": [], "links": []};

      for (var i = 0; i < trusterList.length; i++) {
        trusterList[i] = trusterList[i].toNumber();
        trusteeList[i] = trusteeList[i].toNumber();
        ratingList[i] = ratingList[i].toNumber();

        graphData.links.push({
          "source": nodeList[trusterList[i]],
          "target": nodeList[trusteeList[i]]
        });
      }

      //console.log(ratingList);

      // Compute pagerank
      var data = {'node_list': nodeList, 'truster_list': trusterList,
        'trustee_list': trusteeList, 'trust_rating_list': ratingList};

      //console.log(nodeList);
      console.log(this.state.rankSource);
      console.log(this.state.web3.eth.defaultAccount);
      let trustValues = calculate_trust(data, this.state.rankSource, this.state.web3.eth.defaultAccount);
      console.log(trustValues);

      var randomName;
      for (i = 0; i < nodeList.length; i++) {
        randomName = random_name({ seed: i+1 });
        peerObjs.push({
          id: nodeList[i],
          name: randomName,
          rating: (trustValues[i]*5).toFixed(3)
        });

        graphData.nodes.push({
          "id": nodeList[i],
          "name": randomName,
          "val": trustValues[i]*5,
          "color": Color.hex(nodeList[i]),
          "opacity": 0.9,
        })
      }

      console.log('Close to updating')

      let setInitialUpdated = false;

      if (!this.state.initialUpdated && this.state.page === 'explorer') {
        setInitialUpdated = true;
        this.graphAPI.updateTo(graphData);
      } else if (!this.state.trusterList) {
        this.graphAPI.updateTo(graphData);
      } else if (this.state.trusterList.length != trusterList.length) {
        this.graphAPI.updateTo(graphData);
      }

      this.setState({
        nodeList: nodeList,
        trusterList: trusterList,
        trusteeList: trusteeList,
        ratingList: ratingList,
        trustValues: trustValues,
        explorerState: 'loaded',
        initialUpdated: setInitialUpdated || this.state.initialUpdated,
        peerObjs: peerObjs
      });

      console.log('done retreiving and calculating pagerank!!')
    });
  }

  instantiateContract() {
    const contract = require('truffle-contract')
    const trustGraph = contract(TrustGraphContract)
    window.web3 = this.state.web3;
    // if(this.state.provider) {
    //   trustGraph.setProvider(this.state.provider.currentProvider)
    // } else {
      trustGraph.setProvider(this.state.web3.currentProvider)
    //}


    // Declaring this for later so we can chain functions on TrustGraph.
    var trustGraphInstance

    // Get accounts.

    this.state.web3.version.getNetwork((error, id) => {
      if (id == '3') {
        contractAddress = '0x59F06FB20057142E6996a530FaFe928E151d36EE'
      }
      try {
        trustGraph.at(contractAddress).then((instance) => {
          trustGraphInstance = instance
          this.setState({trustGraphInstance: trustGraphInstance});
        }).then(() => {
          this.retrieve(() => {
            console.log('done');
          })
        })
        .catch((e) => {
          console.log('Promise error')
          console.error(e)
        })
      } catch(e) {
        setTimeout(() => {
          console.log('Retrying instantiateContract()')
          this.instantiateContract();
        }, 2500)

      }
    })

    try {
      this.state.web3.eth.getAccounts((error, accounts) => {
        if (error) {
          throw error;
        }
        this.state.web3.eth.defaultAccount = accounts[0];
      })
    } catch(e) {}
  }


  componentDidMount() {
    console.log('hi')
    window.$(document).keydown(e => {
      if (this.state.page !== '') {
        return;
      }
      if (e.keyCode !== 39 && e.keyCode !== 37 ) {
        return;
      }

      let pages = document.getElementsByClassName('Page')
      let currentPage = 0;
      for (let i = 0; i < pages.length; i++) {
        let pageOffset = window.$(pages[i]).offset().top;
        if (pageOffset < -400) {
          currentPage += 1;
        }
      }

      let targetPage = currentPage;

      if (e.keyCode === 39) {
        // right
        targetPage += 1;
        if (targetPage >= pages.length) {
          targetPage = pages.length - 1;
        }
      } else if (e.keyCode === 37) {
        // left
        targetPage -= 1;
        if (targetPage < 0) {
          targetPage = 0;
        }
      }

      window.$('#App-content').animate({
        scrollTop: window.$('#App-content').scrollTop() + window.$(pages[targetPage]).offset().top + 1
      }, 200);
  });
  }

  render() {
    let headerNavOverviewClass = this.state.page === '' ? 'active' : '';
    let headerNavExplorerClass = this.state.page === 'explorer' ? 'active' : '';

    let header = (
      <header className="AppHeader">
        <div className="AppHeader__top">
          <a href="#" className="AppHeader__top__titleLink"><h1 className="AppHeader__titleLink"><span className="letter">F</span>lexible<br /><span className="letter">T</span>rust<br /><span className="letter">W</span>eb</h1></a>
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
      content = <div id="Overview">
        <div className="Page PageIntro">
          <Particles />
          <div className="VertCenter Page__content PageIntro__content">
              <div className="Intro">
                <div className="Intro__content">
                  <div className="Intro__content_FTW">FTW</div>
                  <div className="Intro__content__line">Decentralized reputation on Ethereum.</div>
                  <div className="Intro__content__line">The world's first fully <b>sybil resistant</b>, truly decentralized reputation protocol.</div>
                </div>
              </div>
          </div>
        </div>

        <div className="Page Page--paper PageTeam PageFillScreen">
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
                <div className="TeamSection__line">Former Quant Intern at Jane Street</div>
                <div className="TeamSection__line">Stanford Computer Science</div>
              </div>
            </div>
          </div>
        </div>

        <div className="Page PageFillScreen PageProblem Page--bordered">
          <div className="SlideTitle">Every decentralized app needs sybil-resistant reputation.</div>
          <div className="ContentFrame">
            <div className="TwoBy">
              <div className="ProblemExample TwoBy__45">
                <div className="Height90px">
                  <img src={ImgOpenBazaar} />
                </div>
                <div className="BoringContent">
                  <div className="VertPad">
                    <ul>
                      <li>Reputation accumulated through on-chain transactions</li>
                      <li>Uses expensive BTC fees as as sybil mitigation</li>
                      <li>Especially not feasible for helping the poor and unbanked</li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="ProblemExample TwoBy__45">
                <div className="Height90px" style={{paddingTop: '10px'}}>
                  <img src={ImgPropy}  width="300"/>
                </div>
                <div className="BoringContent">
                  <div className="VertPad">
                    <ul>
                      <li>Marketplace/registry for title deeds</li>
                      <li>High value exchanges need trusted reputation</li>
                      <li>Marketplace ratings are spoofable</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            <br />
            <div className="BoringContent">
              <p>The problem: <strong>sbyil attacks</strong>. </p>
              <p>What if a scammer creates a hundred fake identities that all rate him/her highly?</p>
            </div>
          </div>
        </div>

        <div className="Page PageFillScreen Page--gray">
          <div className="SlideTitle">Our Solution: <strong>Personalized</strong> Reputation</div>
          <div className="BoringContent ContentFrame">
            <p>Avoid global ratings that are centralized, expensive, and/or cheatable</p>
            <br />
            <p>We <strong>personalize</strong> reputation:</p>
            <ul>
              <li>Create a <strong>web of trust</strong> by asssigning trust to my friends (and indirectly their friends, etc).</li>
              <li>Implemented a modified version of Google's PageRank algorithm to calculate trust ratings based on who I trust.</li>
            </ul>
            <br />
            <p>We put it on the Ethereum and POA Network blockchains:</p>
            <ul>
              <li>No centralized repository that may have conflicts of interest.</li>
              <li>Use a modified version of Google's PageRank algorithm to calculate trust ratings based on who I trust.</li>
            </ul>
          </div>
        </div>

        <div className="Page PageFillScreen Page--graph">
          <div className="SlideTitle">Reflections: What we built at this hackathon</div>
          <div className="BoringContent ContentFrame">
            <p>We had a blast during this hackathon. This is what we built:</p>
            <br />
            <ul>
              <li>Flexible reputation system usable by any decentralized application</li>
              <li>Ethereum Solidity smart contract to manage a decentralized trust graph</li>
              <li>Backend implementation of personalized PageRank from scratch in NodeJS</li>
              <li>Metamask integration with injected web3 to guarantee transaction security</li>
              <li>Created an API that any other Dapp can use to take advantage of reputation</li>
              <li>Web client to manage trusted nodes with the reputation system built using React</li>
              <li>3D visualization of the reputation graph using D3</li>
              <li>Deployed application on Ropsten TestNet</li>
              <li>Hosted at FTWreputation.com</li>
            </ul>
          </div>
        </div>

        <div className="Page PageFillScreen">
          <div className="SlideTitle">Demo!</div>
          <div className="BoringContent ContentFrame">
            <p>Lets actually see WTF this FTW thing does!</p>
            <br />
            <p><strong>Future Directions</strong></p>
            <ul>
              <li>Perform PageRank computation using TrueBit for fully verifiable, decentralized computation that still occurs off chain.</li>
              <li>Build arbitrary rating abstraction (smart contract) on top of reputation graphs to rate anything.</li>
              <li>Add ability to distrust a node and anyone that references it -- automatically clean up your network if someone accidentally points to a scammer.</li>
              <li>Build some dapps to show the potential of our platform and get other people to dev with our API!</li>
            </ul>
          </div>
        </div>

        <div className="Page PageFillScreen">
          <div className="SlideTitle">Papers Referenced in Literature Review</div>
          <div className="BoringContent ContentFrame">
            <p>We read a lot of papers to devise the best method for this project. Here are the most important:</p>
            <ol>
              <li>The PageRank Citation Ranking: Bringing Order to the Web</li>
            </ol>
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
          if (peer.id.toLowerCase().indexOf(this.state.filterText.toLowerCase()) !== -1) {
            show = true;
          } else if (peer.name.toLowerCase().indexOf(this.state.filterText.toLowerCase()) !== -1) {
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

      let errorText = 'loading...';
      let errorContent;
      if (this.state.explorerState === 'error') {
        errorText = 'Error: Unable to reach network';
        errorContent = <div className="Explorer__error">
          <div className="Explorer__error__text">
            {errorText}
          </div>
        </div>
      } else if (this.state.explorerState === 'loading') {
        errorContent = <div className="Explorer__error">
          <div className="Explorer__error__text">
            loading...
          </div>
        </div>
      }

      let peerNewDisabled = this.state.newPeerAddress.length === 42 ? false : true;
      let peerNewButtonType = this.state.newPeerAddress.length === 42 ? 'primary': 'dashed';
      content = <div className="Explorer">
        {errorContent}
        <div className="Explorer__content">
          <div className="Explorer__content__graph">
            <Graph graphAPIObj={this.graphAPI} />
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
              <div className="PeerNew">
                <div className="PeerNew__text">Add reputation to new account</div>
                <Input size="small" placeholder="Address. E.g.: 0xD9c93AaFB0f23Bf7CaF9637D707883f33eF90f1C" value={this.state.newPeerAddress} onChange={event => {
                  this.setState({
                    newPeerAddress: event.target.value.trim()
                  })
                }} />
                <Slider min={0} max={5} defaultValue={1} marks={sliderMarks} onChange={(value) => {
                  this.setState({
                    newSlider: value
                  })
                }} />
                <Button type={peerNewButtonType} disabled={peerNewDisabled} onClick={() => {
                  console.log('Submit new peer ' + this.state.newPeerAddress)
                  // PEER ADDRESS: this.state.newPeerAddress
                  // PEER RATING: this.state.newSlider

                  this.updateEdge(this.state.newPeerAddress, this.state.newSlider);


                  this.setState({
                    newPeerAddress: '', // Reset the address
                  })
                }}>Add rating</Button>
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
        <div id="App-content">
          {content}
        </div>
      </div>
    );
  }
}

export default App;
