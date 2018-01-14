const numeric = require('numeric')
const Web3 = require('web3')
//const contractAbi = require('./abi.json')

var web3 = new Web3("http://localhost:8545");

//Replace address
//const WTFcontract = new web3.eth.Contract(contractAbi, "0xdd73bcaf6cd68884edf2be65afe0bc7241dc9fbb");

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

const zeros = (nrows, ncols) => {
	var x = new Array(nrows);
	for (var i = 0; i < nrows; i++) {
		x[i] = new Array(ncols).fill(0);
	}
	return x;
}

//Take the sum over columns and optionally normalize that sum
const colsum_and_norm = (m, normalize=false) => {
	x = [];
	sums = [];
	for(var col = 0; col < m[0].length; col++) {
		numeric._getCol(m, col, x);
		sum = numeric.sum(x);
		sums.push(sum);

		if(normalize && sum != 0) {
			for(var row = 0; row < m.length; row++) {
				m[row][col] /= sum;
			}
		}
	}
	return sums;
}

//In a graph, each row corresponds to someone you are trusting, and each column corresponds to a truster
const construct_full_graph = (node_list, truster_list, trustee_list, trust_rating_list) => {
	matrix = zeros(node_list.length, node_list.length);
	for(i = 0; i < truster_list.length; i++) {
		matrix[trustee_list[i]][truster_list[i]] = trust_rating_list[i];
	}
	colsum_and_norm(matrix, true);

	return matrix;
}

const compute_page_rank = (adj_matrix, rank_source, personalization) => {
	rank_source_matrix = numeric.dot(numeric.transpose([rank_source]), 
		[new Array(adj_matrix.length).fill(1)]);

	pagerank_matrix = numeric.add(numeric.mul((1-personalization), adj_matrix), 
		numeric.mul(personalization, rank_source_matrix));

	eig_ans = numeric.eig(pagerank_matrix);
	real_condition = numeric.leq(numeric.abs(numeric.sub(eig_ans['lambda']['x'],1)), 0.01);
	imag_condition = numeric.leq(numeric.abs(eig_ans['lambda']['y']), 0.01);
	index = numeric.and(real_condition, imag_condition).indexOf(true);
	principal = [];
	numeric._getCol(eig_ans['E']['x'], index, principal);
	principal = numeric.div(principal, numeric.sum(principal))

	return principal;
}

const calculate = (data, rank_source=null, pubkey_rank_source=null, personalization=0.15) => {
	node_list = data['node_list'];
	truster_list = data['truster_list'];
	trustee_list = data['trustee_list'];
	trust_rating_list = data['trust_rating_list'];
	adj_matrix = construct_full_graph(node_list, truster_list, trustee_list, trust_rating_list);

	if (pubkey_rank_source == null && rank_source == null) 
	{
		rank_source = new Array(node_list.length).fill(1.0/node_list.length);
	}
	else if (pubkey_rank_source != null)
	{
		rank_source = new Array(node_list.length).fill(0);
		rank_source[node_list.indexOf(pubkey_rank_source)] = 1
	}

	trust_values = compute_page_rank(adj_matrix, rank_source, personalization);
	console.log(trust_values);
	//console.log(rank_source)
	
	//ratings = compute_overall_ratings(global_rating_list, trust_values)

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

module.exports = { tester };
