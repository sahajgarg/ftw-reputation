var TrustGraph = artifacts.require("./TrustGraph.sol");

contract_address = '0xf991cb7f62d85bdb6b2cc55235d1fc2d73fb7a90';

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
        //console.log([accounts[0], accounts[1], accounts[2]]);
        console.log(edgeList);
    });
  });
});
