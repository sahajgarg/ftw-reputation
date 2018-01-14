pragma solidity ^0.4.4;

contract TrustGraph {

    mapping (address => uint) public nodes;
    address[] public nodeList;

    uint public numNodes;

    struct Edge {
        uint trusterIndex;
        uint trusteeIndex;
        uint rating;
    }

    Edge[] public edges;

    event Rating(uint trusterIndex, uint trusteeIndex, uint rating);

    function TrustGraph() {

        numNodes = 0;

    }

    function addNode(address addr) returns(uint) {
        
        //require(nodes[node] != 0);

        nodeList.push(addr);
        numNodes++;
        nodes[addr] = numNodes;
        return numNodes - 1;

    }

    function addEdge(address trustee, uint rating) public {
        
        address truster = msg.sender;

        //require(truster != trustee);

        uint trusterIndex = nodes[truster];
        uint trusteeIndex = nodes[trustee];

        if (trusterIndex == 0) {
            trusterIndex = addNode(truster);
        }

        if (trusteeIndex == 0) {
            trusteeIndex = addNode(trustee);
        }

        edges.push(Edge(trusterIndex, trusteeIndex, rating));

        Rating(trusterIndex, trusteeIndex, rating);


    }

    function getNodeList() public constant returns(address[]) {
        return nodeList;
    }

    function getEdgeList() public constant returns(uint[], uint[], uint[]) {
        uint[] memory trusterList = new uint[](edges.length);
        uint[] memory trusteeList = new uint[](edges.length);
        uint[] memory ratingList = new uint[](edges.length);

        for(uint i = 0; i < edges.length; i++) {
            trusterList[i] = edges[i].trusterIndex;
            trusteeList[i] = edges[i].trusteeIndex;
            ratingList[i] = edges[i].rating;
        }

        return (trusterList, trusteeList, ratingList);
    }
}
