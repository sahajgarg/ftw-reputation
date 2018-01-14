const Web3 = require('web3')
//const contractAbi = require('./abi.json')

var web3 = new Web3("http://localhost:8545");

//Replace address
//const WTFcontract = new web3.eth.Contract(contractAbi, "0xdd73bcaf6cd68884edf2be65afe0bc7241dc9fbb");
const { calculate } = require('./pagerank.js');

//NON PAGERANK RELATED THINGS
const handle_error = (error) => {
	if(error) {
		console.log(error);
		throw(error);
	}
}

const retreive = (callback) => {
	// Retreive adjacency list and rating list from contract
	WTFcontract.methods.get_node_list().call(function(error, response) {
		handle_error(erorr);
		node_list = response['1'];
		WTFcontract.methods.get_edge_list().call(function(error, response) {
			handle_error(error);
			truster_list = response['0'];
			trustee_list = response['1'];
			trust_rating_list = response['2'];
			if(callback) {
				return callback({'node_list': node_list, 'truster_list': truster_list, 
					'trustee_list': trustee_list, 'trust_rating_list': trust_rating_list});
			}
		});
	});
}

// Figure out what Iris is requesting from me -- for now, just compute and return 
// {node_list, node_trust_scores, ratings, truster_list, trustee_list}
const handler = (rank_source=null, pubkey_rank_source=null, personalization=0.15) => {
	retreive(function(data) {
		calculate(data, rank_source, pubkey_rank_source, personalization);
	});
}

const tester = (data, rank_source=null, pubkey_rank_source=null, personalization=0.15) => {
	calculate(data, rank_source, pubkey_rank_source, personalization);
}

node_list = ['0', '1', '2', '3', '4']
truster_list = [0, 0, 1, 3, 4]
trustee_list = [1, 2, 0, 4, 3]
trust_rating_list = [1, 1, 1, 1, 1, 1]

data = {'node_list': node_list, 'truster_list': truster_list, 
	'trustee_list': trustee_list, 'trust_rating_list': trust_rating_list};

tester(data, undefined, '0')
