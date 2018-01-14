// Code by Vasco Asturiano
// Code at https://github.com/vasturiano/three-forcegraph
// Licensed under MIT license

import { Group as ThreeGroup } from 'three';
import ForceGraph from './forcegraph-kapsule.js';
import fromKapsule from './kapsule-class.js';

export default fromKapsule(ForceGraph, ThreeGroup, true);
