const { tester } = require('./pagerank.js');

node_list = ['0', '1', '2', '3', '4']
truster_list = [0, 0, 1, 2, 3, 4]
trustee_list = [1, 2, 0, 1, 4, 3]
trust_rating_list = [1, 1, 1, 1, 1, 1]

data = {'node_list': node_list, 'truster_list': truster_list, 
	'trustee_list': trustee_list, 'trust_rating_list': trust_rating_list};

tester(data)

