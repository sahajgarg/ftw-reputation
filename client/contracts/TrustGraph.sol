pragma solidity ^0.4.4;

contract TrustGraph {

    mapping (address => uint) public nodes;
    address[] public nodeList;

    uint public numNodes;

    uint[] public trusterArr;
    uint[] public trusteeArr;
    uint[] public ratingArr;

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

        trusterArr.push(trusterIndex);
        trusteeArr.push(trusteeIndex);
        ratingArr.push(rating);

        Rating(trusterIndex, trusteeIndex, rating);

    }

    function getNodeList() public constant returns(address[]) {
        return nodeList;
    }

    function getEdgeList() public constant returns(uint[], uint[], uint[]) {

        return (trusterArr, trusteeArr, ratingArr);
    }
}
