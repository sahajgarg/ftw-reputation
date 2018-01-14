var TrustGraph = artifacts.require("./TrustGraph.sol");

contract_address = '0xf941bf092778900b20d08cd44f0950df6af4b9f7';

contract('TrustGraph', function(accounts) {
  it("should do a couple links", function() {

    var graph;

    var nodeList;
    var edgeList;

    return TrustGraph.at(contract_address).then(function(instance) {
        graph = instance;
        console.log(graph.address);

        for(var i = 0; i < accounts.length; i++) {
            numTrusted = Math.floor(Math.random()*accounts.length/6)
            for(var trusted = 0; trusted < numTrusted; trusted++) 
            {
                graph.addEdge(accounts[Math.floor(Math.random()*accounts.length)], 
                                            Math.floor(Math.random()*5), {from: accounts[i]});
            }
        }

    }).then(function() {
        return graph.getNodeList.call();
    }).then(function(nl) {
        nodeList = nl;
        return graph.getEdgeList.call();
    }).then(function(el) {
        edgeList = el;
        console.log(nodeList)
        console.log(edgeList);
    });
  });
});
