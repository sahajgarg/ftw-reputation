import React, { Component } from 'react';
import ForceGraph3D from './3d/index';

class Graph extends Component {
  constructor(props) {
    super(props);

    this.myGraph = ForceGraph3D();

    this.props.graphAPIObj.updateTo = (data) => {
      this.myGraph.graphData(data);
    }
  }
  shouldComponentUpdate() {
    return false;
  }
  componentDidMount() {
    let container = document.getElementById('Graph__container');
    let data = {
        "nodes": [
            {
              "id": "id1",
              "name": "name 1 ",
              "val": 3,
              color: '#ff0',
              opacity: 0.9,
            },
            {
              "id": "id2",
              "name": "name2",
              "val": 10
            },
        ],
        "links": [
            {
                "source": "id1",
                "target": "id2"
            },
            {
                "source": "id1",
                "target": "id2"
            },
        ]
    };

    this.myGraph.width(container.offsetWidth)
    this.myGraph.height(container.offsetHeight)
    this.myGraph.linkOpacity(1)

    this.myGraph.linkColor('#ffffff')
    this.myGraph.backgroundColor('#000000');


    // this.myGraph.linkColor(() => {
    //   return '#000000'
    // })
    // this.myGraph.backgroundColor('#ffffff');

    this.myGraph.nodeResolution(24);
    this.myGraph(container);
    this.myGraph.graphData(data);
    this.myGraph.nodeRelSize(5)

    this.myGraph.nodeColor(node => {
      if (node.color) {
        return node.color;
      }
      return '#f00';
    })



      setInterval(() => {
        this.myGraph.width(container.offsetWidth)
        this.myGraph.height(container.offsetHeight)

        // data.nodes.push({
        //   "id": 'a' + Math.random(),
        //   "name": 'a' + Math.random(),
        //   "val": 2
        // });

        this.myGraph.graphData(data);

        // this.myGraph(container).graphData(data);
      },1000)

      window.addEventListener("resize", function () { // Watch for browser/canvas resize events
        this.myGraph.width(container.offsetWidth)
        this.myGraph.height(container.offsetHeight)
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
