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
	x = [];
	sums = [];
	for(var col = 0; col < m[0].length; col++) {
		numeric._getCol(m, col, x);
		sum = numeric.sum(x);
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
	matrix = zeros(node_list.length, node_list.length);
	for(i = 0; i < truster_list.length; i++) {
		matrix[trustee_list[i]][truster_list[i]] = trust_rating_list[i];
	}
	colsum_and_norm(matrix, true, rank_source);

	return matrix;
}

const compute_page_rank = (adj_matrix, rank_source, personalization) => {
	rank_source_matrix = numeric.dot(numeric.transpose([rank_source]), 
		[new Array(adj_matrix.length).fill(1)]);

	pagerank_matrix = numeric.add(numeric.mul((1-personalization), adj_matrix), 
		numeric.mul(personalization, rank_source_matrix));

	eig_ans = numeric.eig(pagerank_matrix);
	real_condition = numeric.leq(numeric.abs(numeric.sub(eig_ans['lambda']['x'],1)), 0.01);
	if(eig_ans['lambda']['y'] == undefined) {
		index = real_condition.indexOf(true);
	} else {
		imag_condition = numeric.leq(numeric.abs(eig_ans['lambda']['y']), 0.01);
		index = numeric.and(real_condition, imag_condition).indexOf(true);
	}
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

	if (pubkey_rank_source == null && rank_source == null) 
	{
		rank_source = new Array(node_list.length).fill(1.0/node_list.length);
	}
	else if (pubkey_rank_source != null)
	{
		rank_source = new Array(node_list.length).fill(0);
		rank_source[node_list.indexOf(pubkey_rank_source)] = 1
	}

	adj_matrix = construct_graph(node_list, truster_list, trustee_list, trust_rating_list, rank_source);
	console.log(adj_matrix)
	trust_values = compute_page_rank(adj_matrix, rank_source, personalization);
	console.log(trust_values);
	
	//ratings = compute_overall_ratings(global_rating_list, trust_values)

}

module.exports = { calculate };
