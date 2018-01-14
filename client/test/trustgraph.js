var TrustGraph = artifacts.require("./TrustGraph.sol");

contract_address = '0x688770523a8f74f7438b83c62b56056d69af461b';

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

    });
  });
});
