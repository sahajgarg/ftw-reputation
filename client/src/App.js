import React, { Component } from 'react';
import './App.css';
import './3d/3d-force-graph.css';
import Graph from './Graph.js';
import { Slider } from 'antd';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      page: 'explorer', // overview, explorer
    };
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
