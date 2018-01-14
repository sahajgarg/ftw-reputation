import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      page: 'overview', // overview, explorer
    };
  }
  render() {
    let headerNavOverviewClass = this.state.page === 'overview' ? 'active' : '';
    let headerNavExplorerClass = this.state.page === 'explorer' ? 'active' : '';
    return (
      <div className="App">
        <header className="AppHeader">
          <div className="AppHeader__top">
            <a href="#" className="AppHeader__top__titleLink"><h1 className="AppHeader__titleLink"><span className="letter">F</span>lexible<br /><span className="letter">T</span>rust<br /><span className="letter">W</span>eb</h1></a>
            <nav>
              <a href="#" className={headerNavOverviewClass}  onClick={() => {this.setState({page: 'overview'})}}>Overview</a>
              <a href="#" className={headerNavExplorerClass}  onClick={() => {this.setState({page: 'explorer'})}}>Explorer</a>
            </nav>
          </div>
          <div className="AppHeader__bottom">
            <div className="AppHeader__bottom__links">
              <a className="TODO">Github</a>
            </div>
          </div>
        </header>

        <div className="App-content">
          Page: {this.state.page}
        </div>
      </div>
    );
  }
}

export default App;
