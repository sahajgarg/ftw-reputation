const numeric = require('numeric')

const zeros = (nrows, ncols) => {
	var x = new Array(nrows);
	for (var i = 0; i < nrows; i++) {
		x[i] = new Array(ncols).fill(0);
	}
	return x;
}

//Take the sum over columns and optionally normalize that sum
const colsum_and_norm = (m, normalize=false, replace_col=null) => {
	var x = [];
	var sums = [];
	for(var col = 0; col < m[0].length; col++) {
		numeric._getCol(m, col, x);
		var sum = numeric.sum(x);
		sums.push(sum);

		if(normalize) {
			for(var row = 0; row < m.length; row++) {
				if(sum != 0) {
					m[row][col] /= sum;
				} else {
					m[row][col] = replace_col[row];
				}
			}
		}
	}
	return sums;
}

//In a graph, each row corresponds to someone you are trusting, and each column corresponds to a truster
const construct_graph = (node_list, truster_list, trustee_list, trust_rating_list, rank_source) => {
	var matrix = zeros(node_list.length, node_list.length);
	for(var i = 0; i < truster_list.length; i++) {
		matrix[trustee_list[i]][truster_list[i]] = trust_rating_list[i];
	}
	colsum_and_norm(matrix, true, rank_source);

	return matrix;
}

const compute_page_rank = (adj_matrix, rank_source, personalization) => {
	var rank_source_matrix = numeric.dot(numeric.transpose([rank_source]), 
		[new Array(adj_matrix.length).fill(1)]);

	var pagerank_matrix = numeric.add(numeric.mul((1-personalization), adj_matrix), 
		numeric.mul(personalization, rank_source_matrix));

	var eig_ans = numeric.eig(pagerank_matrix);
	var real_condition = numeric.leq(numeric.abs(numeric.sub(eig_ans['lambda']['x'],1)), 0.01);

	//Declare in advance
	var index;
	if(eig_ans['lambda']['y'] == undefined) {
		index = real_condition.indexOf(true);
	} else {
		var imag_condition = numeric.leq(numeric.abs(eig_ans['lambda']['y']), 0.01);
		index = numeric.and(real_condition, imag_condition).indexOf(true);
	}
	var principal = [];
	numeric._getCol(eig_ans['E']['x'], index, principal);
	principal = numeric.div(principal, numeric.sum(principal))

	return principal;
}

const calculate_trust = (data, rank_source=null, pubkey_rank_source=null, personalization=0.15) => {
	var node_list = data['node_list'];
	var truster_list = data['truster_list'];
	var trustee_list = data['trustee_list'];
	var trust_rating_list = data['trust_rating_list'];
	var rank_source;

	if (pubkey_rank_source == null && rank_source == null) 
	{
		rank_source = new Array(node_list.length).fill(1.0/node_list.length);
	}
	else if (pubkey_rank_source != null)
	{
		rank_source = new Array(node_list.length).fill(0);
		rank_source[node_list.indexOf(pubkey_rank_source)] = 1
	}

	var adj_matrix = construct_graph(node_list, truster_list, trustee_list, trust_rating_list, rank_source);
	console.log(adj_matrix)
	var trust_values = compute_page_rank(adj_matrix, rank_source, personalization);
	
	return trust_values;
}

module.exports = { calculate_trust };
