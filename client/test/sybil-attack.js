var TrustGraph = artifacts.require("./TrustGraph.sol");

contract_address = '0x93dec6b8d0b48ef028200e35fdd6b218ddab2e81';

contract('TrustGraph', function(accounts) {
  it("sybil attack", function() {

    var graph;

    var nodeList;
    var edgeList;

    return TrustGraph.at(contract_address).then(function(instance) {
        graph = instance;
        console.log(graph.address);
        num_nodes = Math.floor(accounts.length/2);

        for(var i = num_nodes; i < accounts.length; i++) {
            numTrusted = Math.floor(Math.random()*num_nodes/6)
            for(var trusted = 0; trusted < numTrusted; trusted++) 
            {
                graph.addEdge(accounts[Math.floor(Math.random()*num_nodes) + num_nodes], 
                                            Math.floor(Math.random()*5), {from: accounts[i]});
            }
        }

    });
  });
});
