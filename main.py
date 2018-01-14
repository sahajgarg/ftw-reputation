import numpy as np
import web3

from web3 import Web3, HTTPProvider, TestRPCProvider
web3 = Web3(HTTPProvider('http://localhost:8545'))

# Adjacency list: specified by dict: {pubkey --> [list of pubkeys it trusts]}
global_adj_list = {'1': ['2', '3'],
'2': ['1'],
'3': ['2'], 
'4': ['5'],
'5': ['4']}

global_rating_list = {'chocl': {'2': 5}, 
'5': {'1': 0, '3': 3}, 
'4': {'1': 0}}

# Currently, removes all dangling links
# Later features: allow variable trust ratings
# TODO: Dangling, variable trust
def construct_graph(adjacency_list):
	keys = list(adjacency_list.keys())
	key_mapping = {keys[i]: i for i in range(len(keys))}
	adjacency_matrix = np.zeros((len(keys), len(keys)))	
	for key, value in adjacency_list.items():
		row = np.zeros(len(keys))
		for edge in value:
			if edge in key_mapping:
				row[key_mapping[edge]] = 1
		row /= np.sum(row)
		adjacency_matrix[:,key_mapping[key]] = 

	# print(adjacency_matrix)
	return key_mapping, adjacency_matrix

def compute_page_rank(key_mapping, adjacency_matrix, rank_source, weighting=0.15):
	rank_source = np.array(rank_source)
	size = len(rank_source)

	# Validity
	assert(size == np.shape(adjacency_matrix)[0] == np.shape(adjacency_matrix)[1])
	assert(all(sum(adjacency_matrix) == np.ones(size)))
	assert(0 <= weighting <= 1)

	rank_matrix = (1.0 - weighting) * adjacency_matrix + weighting * np.outer(rank_source, np.ones((1,size)))
	lambd, v = np.linalg.eig(rank_matrix)
	index = ((abs(lambd.imag) < 0.001) & (abs(lambd.real - 1.0) < 0.001)).nonzero()[0][0]

	principal = v[:,index].real
	principal = principal/sum(principal)*size
	
	trust_values = {key: principal[key_mapping[key]] for key in key_mapping}
	print(trust_values)
	return trust_values

def retreive_web_of_trust():
	pass

def verify_signature(data, signature, pubkey): 
	pass

#Data is {'pubkey': pubkey, 
#		  'new_trusted_edges': [list of trusted edges]}
def new_edges(data, signature):
	assert(verify_signature(data, signature, data['pubkey']))
	global global_adj_list

	pubkey = data['pubkey']
	new_trusted_edges = data['new_trusted_edges']
	if pubkey not in global_adj_list: 
		global_adj_list[pubkey] = new_trusted_edges
	else:
		global_adj_list[pubkey] += new_trusted_edges

def remove_edge(data, signature):
	assert(verify_signature(data, signature, data['pubkey']))
	global global_adj_list

	pubkey = data['pubkey']
	no_longer_trusted = data['new_trusted_edges']
	if pubkey in global_adj_list: 
		for not_trusted in no_longer_trusted:
			global_adj_list[pubkey].remove(not_trusted)

		if len(global_adj_list[pubkey]) == 0:
			del global_adj_list[pubkey]

def remove_node():
	pass

def new_rating():
	pass

def udpate_rating():
	pass

def remove_rating():
	pass

# Ratings is a dictionary, {pubkey_being_rated: {pubkeys -> ratings of pubkey_being_rated}}
def compute_overall_ratings(all_ratings, trust_values):
	aggregated_ratings = {}

	for reviewed in all_ratings:
		rating = 0
		total_trust = 0
		for rater in all_ratings[reviewed]: 
			#print(all_ratings[reviewed][rater])
			#print(trust_values[rater])
			rating += all_ratings[reviewed][rater] * trust_values[rater]
			total_trust += trust_values[rater]

		if(total_trust != 0): 
			rating /= total_trust
		
		aggregated_ratings[reviewed] = (rating, total_trust)

	print(aggregated_ratings)

def simulate_attack():
	pass

def compute(pull_from_eth=False, rank_source=None, pubkey_rank_source=None, personalization=0.15):
	global global_adj_list, global_rating_list
	print(global_adj_list)
	if pull_from_eth:
		global_adj_list = retreive_web_of_trust()
		global_rating_list = retreive_rating_list()

	key_mapping, adj_matrix = construct_graph(global_adj_list)

	if pubkey_rank_source == None and rank_source == None:
		rank_source = np.ones(len(key_mapping))/len(key_mapping)
	elif pubkey_rank_source != None:
		rank_source = np.zeros(len(key_mapping))
		rank_source[key_mapping[pubkey_rank_source]] = 1

	trust_values = compute_page_rank(key_mapping, adj_matrix, rank_source, personalization)
	ratings = compute_overall_ratings(global_rating_list, trust_values)


compute(pubkey_rank_source=None)