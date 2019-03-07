pragma solidity >=0.4.21 <0.6.0;

contract TrustGraph {

    address contractowner;

    mapping (address => uint) public addressToId;
    mapping (uint => address) public idToAddress;

    //Number of nodes, except one node that created this contract
    uint public numNodes;
    //Node struct to simplify future features
    struct Node {
      address owner;
      uint trusterInd;
      uint trusteeInd;
      uint rating;
    }
    //Array of Nodes structs
    Node[] public nodes;

    event Rating(uint trusterIndex, uint trusteeIndex, uint rating);
    event NewNode(uint id, address indexed owner, uint trusterInd, uint trusteeInd, uint rating);

    constructor() public {
        contractowner = msg.sender;
        numNodes = 0;
        nodes.push(Node(contractowner, 0, 0, 5)) - 1;
        idToAddress[numNodes] = contractowner;
        addressToId[contractowner] = numNodes;

    }
    /* Who have permissions to add nodes? Is it only function "addEdge"?
    Or the address that deployed this contract too? Or every address can call the function below? */
    function _addNode(address _owner) internal {
      require(addressToId[_owner] == 0);
      require(contractowner != _owner);
      uint id = nodes.push(Node(_owner, 0, 0, 0)) - 1;
      nodes[id].trusterInd = id;
      nodes[id].trusteeInd = id;
      numNodes++;
      idToAddress[numNodes] = _owner;
      addressToId[_owner] = numNodes;
      emit NewNode(id, _owner, id, id, 0);
   }

//This function allows every address (except the address that deployed contract)
//to add new Node and add rating to this Node or to the Node that already exists
// (except the address that deployed the contract)
//It is still WIP (TODO: eliminate the same truster to add rating to the trustee infinite times; update the expression that calcutes final trustee rating)
    function addEdge(address _trustee, uint _rating) public {
        require(_rating <= 5);
        address _truster = msg.sender;

        require(_truster != _trustee);

        uint trusterIndex = nodes[addressToId[_truster]].trusterInd;
        uint trusteeIndex = nodes[addressToId[_trustee]].trusteeInd;

        if (trusterIndex == 0) {
            _addNode(_truster);
        }

        if (trusteeIndex == 0) {
            _addNode(_trustee);
        }

        nodes[addressToId[_trustee]].rating = (nodes[addressToId[_trustee]].rating + _rating) / 2; // maybe rating for trustee?? add mapping

        emit Rating(addressToId[_truster], addressToId[_trustee], nodes[addressToId[_trustee]].rating);

    }
//Function returns the array of all addresses that have node
    function getNodeList() external view returns(address[] memory) {
      address[] memory result = new address[](numNodes + 1);
      uint counter = 0;
      for (uint i = 0; i < nodes.length; i++) {

        result[counter] = nodes[counter].owner;
        counter++;
      }

      return result;
    }

//Function returns the array of all trusterIndexes
    function getTrusterList() external view returns(uint[] memory) {
      uint[] memory result = new uint[](numNodes + 1);
      uint counter = 0;
      for (uint i = 0; i < nodes.length; i++) {

        result[counter] = nodes[counter].trusterInd;
        counter++;
      }

      return result;
    }
//Function returns the array of all trusteeIndexes
    function getTrusteeList() external view returns(uint[] memory) {
      uint[] memory result = new uint[](numNodes + 1);
      uint counter = 0;
      for (uint i = 0; i < nodes.length; i++) {

        result[counter] = nodes[counter].trusteeInd;
        counter++;
      }

      return result;
    }
//Function returns the array of all ratings
    function getRatingList() external view returns(uint[] memory) {
      uint[] memory result = new uint[](numNodes + 1);
      uint counter = 0;
      for (uint i = 0; i < nodes.length; i++) {

        result[counter] = nodes[counter].rating;
        counter++;
      }

      return result;
    }

    // function getEdgeList() public constant returns(uint[], uint[], uint[]) {

    //     return (trusterArr, trusteeArr, ratingArr);
    // }
}
