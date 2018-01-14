import React, { Component } from 'react';
import ForceGraph3D from './3d/index';

let latestData = {
  "nodes": [],
  "links": []
};

class Graph extends Component {
  constructor(props) {
    super(props);

    this.myGraph;
    this.initted = false;
    window.currentHover = null;

    this.myGraph = ForceGraph3D();

    this.init = () => {
      let data = {
          "nodes": [],
          "links": []
      };


      this.myGraph.width(this.container.offsetWidth)
      this.myGraph.height(this.container.offsetHeight)
      this.myGraph.linkOpacity(1)

      this.myGraph.linkColor('#ffffff')
      this.myGraph.backgroundColor('#000000');


      // this.myGraph.linkColor(() => {
      //   return '#000000'
      // })
      // this.myGraph.backgroundColor('#ffffff');

      this.myGraph.nodeResolution(24);
      this.myGraph(this.container);
      this.myGraph.graphData(latestData);
      this.myGraph.nodeRelSize(5)

      this.myGraph.nodeColor(node => {
        if (node.color) {
          return node.color;
        }
        return '#f00';
      })
    }

    window.addEventListener("resize",  () => {
      try {
        this.myGraph.width(this.container.offsetWidth)
        this.myGraph.height(this.container.offsetHeight)
      } catch(e) {
        console.log('Unable to work')
      }
    });

    this.props.graphAPIObj.updateTo = (data) => {
      if (!this.initted) {
        this.init();
        this.initted = true;
      }
      console.log('ACTUALLLY to updating')
      latestData = data;
      this.myGraph.graphData(latestData);
    }
    this.props.graphAPIObj.hover = id => {
      window.currentHover = id;
      this.myGraph.graphData(latestData);
    }
    this.props.graphAPIObj.offHover = id => {
      if (window.currentHover === id) {
        window.currentHover = null;
      }
      this.myGraph.graphData(latestData);
    }
  }
  shouldComponentUpdate() {
    return false;
  }
  componentDidMount() {
    this.container = document.getElementById('Graph__container');
    this.myGraph.graphData(latestData);
    if (!this.initted) {
      this.init();
      this.initted = true;
    }
  }
  render() {

    return (
      <div className="Graph">
        <div id="Graph__container">
        </div>
      </div>
    );
  }
}

export default Graph;
