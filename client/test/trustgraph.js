var TrustGraph = artifacts.require("./TrustGraph.sol");

contract_address = '0x94f90ba9390c5fb4f662913d594b004d2f7e8e8c';

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
