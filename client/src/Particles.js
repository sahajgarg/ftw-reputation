import React, { Component } from 'react';

class Particles extends Component {
  // constructor(props) {
  //   super(props);
  // }
  shouldComponentUpdate() {
    return false;
  }
  componentDidMount() {

    let ParticleNetwork = window.ParticleNetwork;
    var options = {
      particleColor: '#c3e9c5',
      background: '#fff',
      interactive: false,
      speed: 'fast',
      density: 5000,
    };
    var particleCanvas = new ParticleNetwork(document.getElementById('particle-canvas'), options);
  }
  render() {

    return (
      <div id="particle-canvas"></div>
    );
  }
}

export default Particles;
