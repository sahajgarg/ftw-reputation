# Flexible Trust Web. Live app: [https://FTWreputation.com/](https://ftwreputation.com/)
**The world's first sybil resistant, fully decentralized reputation protocol.**

To view our story in the highest quality, check out our overview on [FTWreputation.com](FTWreputation.com)

Here's a version of the same content in markdown:

## Every decentralized app needs sybil-resistant reputation.
Consider two examples: OpenBazaar and Propy. In any such decentralized marketplace, we need a way for buyers to rate sellers.

The core challenge? Sybil attacks.
- What if a scammer creates a hundred fake identities that all rate him highly?
- Traditional systems solve it through centralized identity verification.
- For decentralized, pseudononymous systems, we need something better.

## Our Solution: **Personalized** Reputation
We personalize reputation:
- We create a web of trust on the blockchain by asssigning trust to my friends (and indirectly their friends, etc).
- Use a modified version of Google's PageRank algorithm that we implemented to calculate trust ratings based on who you trust.

We put it on the Ethereum and POA Network blockchains. That way, there's no centralized repository that may have conflicts of interest. On top of it, we build a NodeJS library through which arbitrary dapps can interact with reputation.

## Reflections: What we built at this hackathon
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

## Future Directions
- Perform PageRank computation using TrueBit for fully verifiable, decentralized computation that still occurs off chain.
- Build arbitrary rating abstraction (smart contract) on top of reputation graphs to rate anything.
- Add ability to distrust a node and anyone that references it -- automatically clean up your network if someone accidentally points to a scammer.
- Build some dapps to show the potential of our platform and get other people to dev with our API!

## Papers Referenced in Literature Review
We read a lot of papers to devise the best method for this project. Here are the most important:
- The PageRank Citation Ranking: Bringing Order to the Web
- Manipulability of PageRank under Sybil Strategies
- Survey of Sybil Attacks in Social Networks
- A physical model for efficient ranking in networks


[![image](https://user-images.githubusercontent.com/5728307/34919861-33042930-f91e-11e7-846c-c0fff21ea139.png)](https://ftwreputation.com/)

## Running the project locally
Navigate to the client directory, then follow the next three steps. 

1. First, spin up a local testnet with 50 accounts, running:

```
testrpc --accounts 50
```

2. To compile and migrate the solidity contracts, then generate a 'real' network for the first half of the accounts and a 'sybil attack' subgraph for the second half of the accounts, run the following command. Some errors might pop up, that's likely because we're sending too many requests to testrpc to create connections. 

```
npm run deploy
```

3. Finally, to launch the application, run:

```
npm start
```

If you want to interact with the application in dev mode, you'll need the Metamask chrome extension. Make sure it's set to using LocalHost for testing using testrpc, and then import the first private key outputted by testprc as the account to simulate who 'you' are. 

## License
Code is licensed under Apache-2.0. All dependencies in this project are also licensed under compatible open source licenses.
