var TrustGraph = artifacts.require("./TrustGraph.sol");

contract('TrustGraph', function(accounts) {
  it("should do a couple links", function() {

    var graph;

    var nodeList;
    var edgeList;

    return TrustGraph.at('0xb9a6fd9c1bcc651e0dc9b9ca666983f435f2c22e').then(function(instance) {
        graph = instance;
        console.log(graph.address);
        return graph.addEdge(accounts[1], 5, {from: accounts[0]});
    }).then(function() {
        return graph.addEdge(accounts[2], 3, {from: accounts[0]});
    }).then(function() {
        return graph.getNodeList.call();
    }).then(function(nl) {
        nodeList = nl;
        nodeList.shift();
        return graph.getEdgeList.call();
    }).then(function(el) {
        edgeList = el;
        console.log(nodeList)
        //console.log([accounts[0], accounts[1], accounts[2]]);

        console.log(edgeList);


        assert.deepEqual(nodeList, [accounts[0], accounts[1], accounts[2]]);

    });
  });
});
