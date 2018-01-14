# Flexible Trust Web. Live app: [https://FTWreputation.com/](https://ftwreputation.com/)


[![image](https://user-images.githubusercontent.com/5728307/34919861-33042930-f91e-11e7-846c-c0fff21ea139.png)](https://ftwreputation.com/)

## Running the project locally
First, spin up a local testnet with 100 accounts, running:

testrpc --accounts 30

To compile and migrate the solidity contracts, run

npm run deploy

The command will output some text. Within it will be TrustGraph: <address of contract on chain>. Copy this address into two files, App.js and trustgraph.js, under the name contract_address. To generate an initial graph for testdata, run the below command. This will generate a graph randomly.

truffle test

## Running the client
Go to the client folder

## License
Code is licensed under Apache-2.0. All dependencies in this project are also licensed under compatible open source licenses.
