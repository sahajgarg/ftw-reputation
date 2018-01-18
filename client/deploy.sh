#!/bin/bash

truffle compile
echo -n 'module.exports = { contractAddress: "' > ./src/contractAddress.js
truffle migrate | grep TrustGraph: | awk 'NF>1{print $NF}' | tr -d '\n' >> ./src/contractAddress.js
echo '"}' >> ./src/contractAddress.js

truffle test ./test/init.js
truffle test ./test/sybil-attack.js