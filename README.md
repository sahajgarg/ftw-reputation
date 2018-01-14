# project-nosedive


# Running the project locally
First, spin up a local testnet with 100 accounts, running: 

testrpc --accounts 30

To compile and migrate the solidity contracts, run

npm run deploy

The command will output some text. Within it will be TrustGraph: <address of contract on chain>. Copy this address into two files, App.js and trustgraph.js, under the name contract_address. To generate an initial graph for testdata, run the below command. This will generate a graph randomly. 

truffle test

