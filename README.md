# Flexible Trust Web. Live app: [https://FTWreputation.com/](https://ftwreputation.com/)
**The world's first sybil resistant, fully decentralized reputation protocol.**

To view our story in the highest quality, check out our overview on [FTWreputation.com](FTWreputation.com)

Here's a version of the same content in markdown:

##Every decentralized app needs sybil-resistant reputation.
Consider two examples: OpenBazaar and Propy. In any such decentralized marketplace, we need a way for buyers to rate sellers.

The core challenge? Sybil attacks.
- What if a scammer creates a hundred fake identities that all rate him highly?
- Traditional systems solve it through centralized identity verification.
- For decentralized, pseudononymous systems, we need something better.

##Our Solution: **Personalized** Reputation
We personalize reputation:
- We create a web of trust on the blockchain by asssigning trust to my friends (and indirectly their friends, etc).
- Use a modified version of Google's PageRank algorithm that we implemented to calculate trust ratings based on who you trust.

We put it on the Ethereum and POA Network blockchains. That way, there's no centralized repository that may have conflicts of interest. On top of it, we build a NodeJS library through which arbitrary dapps can interact with reputation.

##Reflections: What we built at this hackathon
We had a blast during this hackathon. This is what we built:
- Flexible reputation system usable by any decentralized application
- Ethereum Solidity smart contract to manage a decentralized trust graph
- Backend implementation of personalized PageRank from scratch in NodeJS
- Metamask integration with injected web3 to guarantee transaction security
- Created an API that any other Dapp can use to take advantage of reputation
- Web client to manage trusted nodes with the reputation system built using React
- 3D visualization of the reputation graph using D3
- Deployed application on Ropsten TestNet
- Hosted at FTWreputation.com

##Future Directions
- Perform PageRank computation using TrueBit for fully verifiable, decentralized computation that still occurs off chain.
- Build arbitrary rating abstraction (smart contract) on top of reputation graphs to rate anything.
- Add ability to distrust a node and anyone that references it -- automatically clean up your network if someone accidentally points to a scammer.
- Build some dapps to show the potential of our platform and get other people to dev with our API!

##Papers Referenced in Literature Review
We read a lot of papers to devise the best method for this project. Here are the most important:
- The PageRank Citation Ranking: Bringing Order to the Web
- Manipulability of PageRank under Sybil Strategies
- Survey of Sybil Attacks in Social Networks
- A physical model for efficient ranking in networks


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
