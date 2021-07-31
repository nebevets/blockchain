const { getFormattedUUID, sendError } = require("./helpers");
const axios = require("axios");
const Blockchain = require("./blockchain");
const express = require("express");

// maybe use this address to privatize endpoints?
const nodeAddress = getFormattedUUID();

const app = express();
const nebCoin = new Blockchain();

const PORT = process.argv[2];

const updateNetworkNodes = (nodeURL) => {
  if (
    nebCoin.currentNodeURL !== nodeURL &&
    !nebCoin.networkNodes.includes(nodeURL)
  ) {
    nebCoin.networkNodes.push(nodeURL);
  }
};

app.use(express.json());

app.get("/address/:address", ({ params: { address } }, res) => {
  const addressData = nebCoin.getAddress(address);

  res.status(200).send({
    ...addressData,
  });
});

app.get("/block/:blockHash", ({ params: { blockHash } }, res) => {
  const [block] = nebCoin.getBlock(blockHash);

  res.status(200).send({
    block: block ?? null,
  });
});

app.get("/blockchain", (_req, res) => {
  res.status(200).send({
    ...nebCoin,
  });
});

app.get("/consensus", async (_req, res) => {
  const blockchains = [];
  try {
    for (const networkNode of nebCoin.networkNodes) {
      const { data } = await axios.get(`${networkNode}/blockchain`);
      blockchains.push(data);
    }
    let maxChainLength = nebCoin.chain.length;
    let newLongestChain = null;
    let newPendingTransactions = null;

    blockchains.forEach(({ chain, pendingTransactions }) => {
      if (chain.length > maxChainLength) {
        maxChainLength = chain.length;
        newLongestChain = chain;
        newPendingTransactions = pendingTransactions;
      }
    });

    if (newLongestChain && nebCoin.isValidChain(newLongestChain)) {
      nebCoin.chain = newLongestChain;
      nebCoin.pendingTransactions = newPendingTransactions;
    }

    res.status(200).send({
      message: "longest valid chain is set",
    });
  } catch (err) {
    sendError(err, res);
  }
});

app.get("/mine", async (_req, res) => {
  const { hash: previousBlockHash, index } = nebCoin.getLastBlock();
  const currentBlockData = {
    index: index + 1,
    transactions: nebCoin.pendingTransactions,
  };
  const nonce = nebCoin.proofOfWork(previousBlockHash, currentBlockData);
  const newBlockHash = nebCoin.hashBlock(
    previousBlockHash,
    currentBlockData,
    nonce
  );
  const newBlock = nebCoin.createBlock(nonce, previousBlockHash, newBlockHash);

  try {
    const promises = nebCoin.networkNodes.map((networkNode) => {
      axios({
        data: {
          newBlock,
        },
        method: "post",
        url: `${networkNode}/broadcast-block`,
      });
    });
    await Promise.all(promises);
    await axios({
      data: {
        amount: 50,
        recipient: nodeAddress,
        sender: "00",
      },
      method: "post",
      url: `${nebCoin.currentNodeURL}/transaction/broadcast`,
    });
    res.status(200).send({
      block: newBlock,
      message: "new block mined and broadcast successfully",
    });
  } catch (err) {
    sendError(err, res);
  }
});

app.get("/transaction/:transactionID", ({ params: { transactionID } }, res) => {
  const transaction = nebCoin.getTransaction(transactionID);

  res.status(200).send({
    ...transaction,
  });
});

app.post("/broadcast-block", ({ body: { newBlock } }, res) => {
  try {
    if (newBlock == null) {
      throw new Error("no block to broadcast. please specify a block.");
    }
    const { hash: lastBlockHash, index: lastBlockIndex } =
      nebCoin.getLastBlock();
    if (
      lastBlockHash === newBlock.previousBlockHash &&
      lastBlockIndex + 1 === newBlock.index
    ) {
      nebCoin.chain.push(newBlock);
      nebCoin.pendingTransactions = [];
      res.status(200).send({
        message: "blockchain updated",
      });
    } else {
      res.status(422).send({
        message: "new block rejected",
      });
    }
  } catch (err) {
    sendError(err, res);
  }
});

app.post("/broadcast-node", async ({ body: { newNodeURL } }, res) => {
  try {
    // need a way to validate the url:
    //   1. make sure its a valid url
    //   2. make sure its really a node for these endpoints
    //   3. https support
    if (newNodeURL == null) {
      throw new Error("no network node specified.");
    }
    if (
      !nebCoin.networkNodes.includes(newNodeURL) &&
      newNodeURL !== nebCoin.currentNodeURL
    ) {
      nebCoin.networkNodes.push(newNodeURL);
      const promises = nebCoin.networkNodes.map((networkNode) => {
        axios({
          data: {
            newNodeURL,
          },
          method: "post",
          url: `${networkNode}/register-node`,
        });
      });
      await Promise.all(promises);
      await axios({
        data: {
          allNetworkNodes: [...nebCoin.networkNodes, nebCoin.currentNodeURL],
        },
        method: "post",
        url: `${newNodeURL}/update-nodes`,
      });
      res.status(200).send({
        message: "network node broadcast complete.",
      });
    } else {
      res.status(403).send({
        message: "this network node exists.",
      });
    }
  } catch (err) {
    sendError(err, res);
  }
});

app.post("/register-node", ({ body: { newNodeURL } }, res) => {
  try {
    if (newNodeURL == null) {
      throw new Error("no network node specified.");
    }
    updateNetworkNodes(newNodeURL);
    res.status(200).send({ message: "node registered." });
  } catch (err) {
    sendError(err, res);
  }
});

app.post(
  "/transaction",
  ({ body: { amount, recipient, sender, transactionID } }, res) => {
    try {
      if (
        [amount, recipient, sender, transactionID].some(
          (value) => value == null
        )
      ) {
        throw new Error("invalid data");
      }
      const blockIndex = nebCoin.addPendingTransaction({
        amount,
        recipient,
        sender,
        transactionID,
      });
      res.send({
        message: `transaction added to block: ${blockIndex}`,
        success: true,
      });
    } catch (err) {
      sendError(err, res);
    }
  }
);

app.post(
  "/transaction/broadcast",
  async ({ body: { amount, recipient, sender } }, res) => {
    try {
      if ([amount, recipient, sender].some((value) => value == null)) {
        throw new Error("invalid transaction data");
      }
      const newTransaction = nebCoin.createTransaction(
        amount,
        recipient,
        sender
      );
      nebCoin.addPendingTransaction(newTransaction);
      const promises = nebCoin.networkNodes.map((networkNode) => {
        axios({
          data: newTransaction,
          method: "post",
          url: `${networkNode}/transaction`,
        });
      });
      await Promise.all(promises);
      res.status(200).send({
        message: "transaction broadcast complete",
      });
    } catch (err) {
      sendError(err, res);
    }
  }
);

app.post("/update-nodes", ({ body: { allNetworkNodes } }, res) => {
  try {
    if (!Array.isArray(allNetworkNodes)) {
      throw new Error("invalid data");
    }
    allNetworkNodes.forEach((networkNode) => {
      updateNetworkNodes(networkNode);
    });
    res.status(200).send({ message: "nodes updated.", success: true });
  } catch (err) {
    sendError(err, res);
  }
});

app.listen(PORT, () => console.log(`listening on port: ${PORT}`));
