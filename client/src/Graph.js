import React, { Component } from 'react';
import ForceGraph3D from './3d/index';

class Graph extends Component {
  constructor(props) {
    super(props);

    this.myGraph;
    this.initted = false;

    this.init = () => {
      let data = {
          "nodes": [],
          "links": []
      };

      this.myGraph = ForceGraph3D();

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
      this.myGraph.graphData(data);
      this.myGraph.nodeRelSize(5)

      this.myGraph.nodeColor(node => {
        if (node.color) {
          return node.color;
        }
        return '#f00';
      })
    }

    this.props.graphAPIObj.updateTo = (data) => {
      if (!this.initted) {
        this.init();
        this.initted = true;
      }
      console.log('ACTUALLLY to updating')
      console.log('ACTUALLLY to updating')
      console.log('ACTUALLLY to updating')
      console.log('ACTUALLLY to updating')
      console.log('ACTUALLLY to updating')
      console.log(data)
      this.myGraph.graphData(data);
    }
  }
  shouldComponentUpdate() {
    return false;
  }
  componentDidMount() {
    this.container = document.getElementById('Graph__container');
    window.addEventListener("resize", function () {
      try {
        this.myGraph.width(this.container.offsetWidth)
        this.myGraph.height(this.container.offsetHeight)
      } catch(e) {
      }
    });
  }
  render() {

    return (
      <div className="Graph">
        <div id="Graph__container">

          D3 graph here
        </div>
      </div>
    );
  }
}

export default Graph;
