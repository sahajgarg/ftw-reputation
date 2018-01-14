import React, { Component } from 'react';
import ForceGraph3D from './3d/index';

class Graph extends Component {
  // constructor(props) {
  //   super(props);
  // }
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
              "val": 1,
              color: '#ff0',
              opacity: 0.8,
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
        ]
    };
    var myGraph = ForceGraph3D();

    myGraph.width(container.offsetWidth)
    myGraph.height(container.offsetHeight)
    myGraph.linkOpacity(1)

    myGraph.linkColor('#ffffff')
    myGraph.backgroundColor('#000000');

    myGraph.nodeResolution(24);
    myGraph(container);
    myGraph.graphData(data);

    myGraph.nodeColor(node => {
      console.log(node)
      if (node.color) {
        return node.color;
      }
      return '#f00';
    })



      setInterval(() => {
        myGraph.width(container.offsetWidth)
        myGraph.height(container.offsetHeight)

        data.nodes.push({
          "id": 'a' + Math.random(),
          "name": 'a' + Math.random(),
          "val": 10
        });
        // myGraph(container).graphData(data);
      },1000)

      window.addEventListener("resize", function () { // Watch for browser/canvas resize events
        myGraph.width(container.offsetWidth)
        myGraph.height(container.offsetHeight)
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
