import numpy as np

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
		adjacency_matrix[:,key_mapping[key]] = row

	# print(adjacency_matrix)
	return key_mapping, adjacency_matrix

def compute_page_rank(key_mapping, adjacency_matrix, rank_source, weighting):
	rank_source = np.array(rank_source)
	size = len(rank_source)

	# Validity
	assert(size == np.shape(adjacency_matrix)[0] == np.shape(adjacency_matrix)[1])
	assert(all(sum(adjacency_matrix) == np.ones(size)))
	assert(0 <= weighting <= 1)

	rank_matrix = (1.0 - weighting) * adjacency_matrix + weighting * np.outer(rank_source, np.ones((1,size)))
	lambd, v = np.linalg.eig(rank_matrix)
	assert(abs(lambd.real[0] - 1.) < 0.2)
	principal = v[:,0]
	assert(sum(abs(principal.imag)) < 0.01)
	principal = principal.real/sum(principal.real)*size
	
	trust_values = {key: principal[key_mapping[key]] for key in key_mapping}
	print(trust_values)
	return trust_values

def retreive_web_of_trust():
	pass

#Data is {'pubkey': pubkey, 
#		  'new_trusted_edges': [list of trusted edges]}
def new_edges(data, signature):
	# TODO: Verify signature



	if pubkey not in adj_list: 
		adj_list[pubkey] = new_trusted_edges




	pass

def remove_edge():
	pass

def remove_node():
	pass

def new_rating():
	pass

def udpate_rating():
	pass

def remove_rating():
	pass

# Ratings is a dictionary, {pubkey_being_rated: {pubkeys -> ratings of pubkey_being_rated}}
def compute_trust_ratings(all_ratings, trust_values):
	aggregated_ratings = {}

	for reviewed in all_ratings:
		rating = 0
		total_trust = 0
		for rater in all_ratings[reviewed]: 
			rating += all_ratings[reviewed][rater] * trust_values[rater]
			total_trust += trust_values[rater]

		if(total_trust != 0): 
			rating /= total_trust
		
		aggregated_ratings[reviewed] = (rating, total_trust)

	print(aggregated_ratings)

def simulate_attack():
	pass


# Adjacency list: specified by dict: {pubkey --> [list of pubkeys it trusts]}
adj_list = {'1': ['2', '3'],
'2': ['1'],
'3': ['2'], 
'4': ['5'],
'5': ['4']}

ratings = {'3': {'2': '1'}, 
'5': {'1', '0'}, 
'4': {'1', '0'}}

key_mapping, matrix = construct_graph(adj_list)
rank_source = np.array([1, 0, 0, 0, 0])

trust_values = compute_page_rank(key_mapping, matrix, rank_source, 0.2)
compute_trust_ratings(ratings, trust_values)


