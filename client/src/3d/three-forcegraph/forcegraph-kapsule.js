// Code by Vasco Asturiano
// Code at https://github.com/vasturiano/three-forcegraph
// Licensed under MIT license

import {
  SphereGeometry,
  IcosahedronGeometry,
  BufferGeometry,
  BufferAttribute,
  Mesh,
  MeshLambertMaterial,
  MeshPhysicalMaterial,
  DoubleSide,
  Vector3,
  Line,
  LineBasicMaterial
} from 'three';

import {
  forceSimulation as d3ForceSimulation,
  forceLink as d3ForceLink,
  forceManyBody as d3ForceManyBody,
  forceCenter as d3ForceCenter
} from 'd3-force-3d';

import graph from 'ngraph.graph';
import forcelayout from 'ngraph.forcelayout';
import forcelayout3d from 'ngraph.forcelayout3d';

import Kapsule from 'kapsule';
import qwest from 'qwest';
import accessorFn from 'accessor-fn';

import { autoColorObjects, colorStr2Hex } from './color-utils';


const three = window.THREE
  ? window.THREE // Prefer consumption from global THREE, if exists
  : {
    SphereGeometry,
    IcosahedronGeometry,
    BufferGeometry,
    BufferAttribute,
    Mesh,
    MeshLambertMaterial,
    MeshPhysicalMaterial,
    DoubleSide,
    Vector3,
    Line,
    LineBasicMaterial
  };
const ngraph = { graph, forcelayout, forcelayout3d };

//

// var texture = new three.TextureLoader().load( "./checker.png" );
// texture.wrapS = three.RepeatWrapping;
// texture.wrapT = three.RepeatWrapping;
// texture.repeat.set( 4, 4 );



export default Kapsule({

  props: {
    jsonUrl: {},
    graphData: {
      default: {
        nodes: [],
        links: []
      },
      onChange(_, state) { state.onFrame = null; } // Pause simulation
    },
    numDimensions: {
      default: 3,
      onChange(numDim, state) {
        if (numDim < 3) { eraseDimension(state.graphData.nodes, 'z'); }
        if (numDim < 2) { eraseDimension(state.graphData.nodes, 'y'); }

        function eraseDimension(nodes, dim) {
          nodes.forEach(d => {
            delete d[dim];     // position
            delete d[`v${dim}`]; // velocity
          });
        }
      }
    },
    nodeRelSize: { default: 4 }, // volume per val unit
    nodeId: { default: 'id' },
    nodeVal: { default: 'val' },
    nodeResolution: { default: 8 }, // how many slice segments in the sphere's circumference
    nodeColor: { default: 'color' },
    nodeAutoColorBy: {},
    nodeOpacity: { default: 0.9 },
    nodeThreeObject: {},
    linkSource: { default: 'source' },
    linkTarget: { default: 'target' },
    linkColor: { default: 'color' },
    linkAutoColorBy: {},
    linkOpacity: { default: 0.2 },
    forceEngine: { default: 'd3' }, // d3 or ngraph
    d3AlphaDecay: { default: 0.0228 },
    d3VelocityDecay: { default: 0.4 },
    warmupTicks: { default: 0 }, // how many times to tick the force engine at init before starting to render
    cooldownTicks: { default: Infinity },
    cooldownTime: { default: 15000 }, // ms
    onLoading: { default: () => {}, triggerUpdate: false },
    onFinishLoading: { default: () => {}, triggerUpdate: false }
  },

  aliases: {
    autoColorBy: 'nodeAutoColorBy'
  },

  methods: {
    // Expose d3 forces for external manipulation
    d3Force: function(state, forceName, forceFn) {
      if (forceFn === undefined) {
        return state.d3ForceLayout.force(forceName); // Force getter
      }
      state.d3ForceLayout.force(forceName, forceFn); // Force setter
      return this;
    },
    tickFrame: function(state) {
      if(state.onFrame) state.onFrame();
      return this;
    }
  },

  stateInit: () => ({
    d3ForceLayout: d3ForceSimulation()
      .force('link', d3ForceLink())
      .force('charge', d3ForceManyBody())
      .force('center', d3ForceCenter())
      .stop()
  }),

  init(threeObj, state) {
    // Main three object to manipulate
    state.graphScene = threeObj;
  },

  update(state) {
    state.onFrame = null; // Pause simulation
    state.onLoading();

    if (state.graphData.nodes.length || state.graphData.links.length) {
      // console.info('force-graph loading', state.graphData.nodes.length + ' nodes', state.graphData.links.length + ' links');
    }

    if (!state.fetchingJson && state.jsonUrl && !state.graphData.nodes.length && !state.graphData.links.length) {
      // (Re-)load data
      state.fetchingJson = true;
      qwest.get(state.jsonUrl).then((_, json) => {
        state.fetchingJson = false;
        state.graphData = json;
        state._rerender();  // Force re-update
      });
    }

    if (state.nodeAutoColorBy !== null) {
      // Auto add color to uncolored nodes
      autoColorObjects(state.graphData.nodes, accessorFn(state.nodeAutoColorBy), state.nodeColor);
    }
    if (state.linkAutoColorBy !== null) {
      // Auto add color to uncolored links
      autoColorObjects(state.graphData.links, accessorFn(state.linkAutoColorBy), state.linkColor);
    }

    // parse links
    state.graphData.links.forEach(link => {
      link.source = link[state.linkSource];
      link.target = link[state.linkTarget];
    });

    // Add WebGL objects
    while (state.graphScene.children.length) { state.graphScene.remove(state.graphScene.children[0]) } // Clear the place

    const customNodeObjectAccessor = accessorFn(state.nodeThreeObject);
    const valAccessor = accessorFn(state.nodeVal);
    const colorAccessor = accessorFn(state.nodeColor);
    const sphereGeometries = {}; // indexed by node value
    const sphereMaterials = {}; // indexed by color
    state.graphData.nodes.forEach(node => {
      const customObj = customNodeObjectAccessor(node);

      let obj;
      if (customObj) {
        obj = customObj.clone();
      } else { // Default object (sphere mesh)
        let val = valAccessor(node) || 1;

        // if (window.currentHover) {
        //   val = node.id === window.currentHover ? 2 : val;
        // }

        if (!sphereGeometries.hasOwnProperty(val)) {
          let size = Math.cbrt(val) * state.nodeRelSize
          // sphereGeometries[val] = new three.SphereGeometry(size, state.nodeResolution, state.nodeResolution);
          sphereGeometries[val] = new three.IcosahedronGeometry(size, 1);//state.nodeResolution);
          sphereGeometries[val].computeFlatVertexNormals();//state.nodeResolution);
        }

        const color = colorAccessor(node);
        if (!sphereMaterials.hasOwnProperty(color)) {
          let thisNodeOpacity = node.opacity ? node.opacity : state.nodeOpacity;
          console.log(thisNodeOpacity)
          if (window.currentHover) {
            console.log(window.currentHover)
            thisNodeOpacity = node.id === window.currentHover ? 1.0 : thisNodeOpacity;
          }
          sphereMaterials[color] = new three.MeshLambertMaterial({
            color: colorStr2Hex(color || '#ffffaa'),
            transparent: true,
            opacity: thisNodeOpacity,
            // side: three.DoubleSide
          });


          // sphereMaterials[color] = new three.MeshPhysicalMaterial( {
          //   // map: null,
          //   color: colorStr2Hex(color || '#ffffaa'),
          //   metalness: 0.6,
          //   roughness: 0.8,
          //   opacity: thisNodeOpacity,
          //   // side: three.DoubleSide,
          //   transparent: true,
          //   // envMapIntensity: 5,
          //   // premultipliedAlpha: true
          //   // TODO: Add custom blend mode that modulates background color by this materials color.
          // } );
        }

        obj = new three.Mesh(sphereGeometries[val], sphereMaterials[color]);
      }

      obj.__graphObjType = 'node'; // Add object type
      obj.__data = node; // Attach node data

      state.graphScene.add(node.__threeObj = obj);
    });

    const linkColorAccessor = accessorFn(state.linkColor);
    const lineMaterials = {}; // indexed by color
    state.graphData.links.forEach(link => {
      const color = linkColorAccessor(link);
      if (!lineMaterials.hasOwnProperty(color)) {
        lineMaterials[color] = new three.LineBasicMaterial({
          color: colorStr2Hex(color || '#f0f0f0'),
          transparent: true,
          opacity: state.linkOpacity,
          linewidth: 1,
        });
      }

      const geometry = new three.BufferGeometry();
      geometry.addAttribute('position', new three.BufferAttribute(new Float32Array(2 * 3), 3));
      const lineMaterial = lineMaterials[color];

      const line1 = new three.Line(geometry, lineMaterial);
      line1.renderOrder = 10; // Prevent visual glitches of dark lines on top of nodes by rendering them last
      line1.__graphObjType = 'link'; // Add object type
      line1.__data = link; // Attach link data


      state.graphScene.add(link.__lineObj = line1);
    });

    // Feed data to force-directed layout
    const isD3Sim = state.forceEngine !== 'ngraph';
    let layout;
    if (isD3Sim) {
      // D3-force
      (layout = state.d3ForceLayout)
        .stop()
        .alpha(1)// re-heat the simulation
        .alphaDecay(state.d3AlphaDecay)
        .velocityDecay(state.d3VelocityDecay)
        .numDimensions(state.numDimensions)
        .nodes(state.graphData.nodes)
        .force('link')
          .id(d => d[state.nodeId])
          .links(state.graphData.links);
    } else {
      // ngraph
      const graph = ngraph.graph();
      state.graphData.nodes.forEach(node => { graph.addNode(node[state.nodeId]); });
      state.graphData.links.forEach(link => { graph.addLink(link.source, link.target); });
      layout = ngraph['forcelayout' + (state.numDimensions === 2 ? '' : '3d')](graph);
      layout.graph = graph; // Attach graph reference to layout
    }

    for (let i=0; i<state.warmupTicks; i++) { layout[isD3Sim?'tick':'step'](); } // Initial ticks before starting to render

    let cntTicks = 0;
    const startTickTime = new Date();
    state.onFrame = layoutTick;
    state.onFinishLoading();

    //

    function layoutTick() {
      if (++cntTicks > state.cooldownTicks || (new Date()) - startTickTime > state.cooldownTime) {
        state.onFrame = null; // Stop ticking graph
      } else {
        layout[isD3Sim ? 'tick' : 'step'](); // Tick it
      }

      // Update nodes position
      state.graphData.nodes.forEach(node => {
        const obj = node.__threeObj;
        if (!obj) return;

        const pos = isD3Sim ? node : layout.getNodePosition(node[state.nodeId]);

        obj.position.x = pos.x;
        obj.position.y = pos.y || 0;
        obj.position.z = pos.z || 0;
      });

      // Update links position
      state.graphData.links.forEach(link => {
        const line = link.__lineObj;
        if (!line) return;

        const pos = isD3Sim
            ? link
            : layout.getLinkPosition(layout.graph.getLink(link.source, link.target).id),
          start = pos[isD3Sim ? 'source' : 'from'],
          end = pos[isD3Sim ? 'target' : 'to'],
          linePos = line.geometry.attributes.position;

        linePos.array[0] = start.x;
        linePos.array[1] = start.y || 0;
        linePos.array[2] = start.z || 0;
        linePos.array[3] = end.x;
        linePos.array[4] = end.y || 0;
        linePos.array[5] = end.z || 0;

        linePos.needsUpdate = true;
        line.geometry.computeBoundingSphere();
      });
    }
  }
});
