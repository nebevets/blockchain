const axios = require("axios");
const Blockchain = require("./blockchain");
const express = require("express");
const { v4: uuidv4 } = require("uuid");

const app = express();
const nebCoin = new Blockchain();
const nodeAddress = uuidv4().split("-").join("");

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

app.get("/blockchain", (req, res) => {
  res.send(nebCoin);
});

app.get("/mine", (req, res) => {
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
  nebCoin.createNewTransaction(50, "00", nodeAddress);
  const newBlock = nebCoin.createNewBlock(
    nonce,
    previousBlockHash,
    newBlockHash
  );

  res.send({ note: "new block mined successfully", block: newBlock });
});

app.post("/broadcast-node", ({ body: { newNodeURL } }, res) => {
  if (!nebCoin.networkNodes.includes(newNodeURL)) {
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
    Promise.all(promises)
      .then(() => {
        axios({
          data: {
            allNetworkNodes: [...nebCoin.networkNodes, nebCoin.currentNodeURL],
          },
          method: "post",
          url: `${newNodeURL}/update-nodes`,
        })
          .then(() => {
            res.send({
              message: "network node broadcast complete.",
              success: true,
            });
          })
          .catch((err) => console.log(err.message));
      })
      .catch((err) => console.log(err.message));
  }
});

app.post("/register-node", ({ body: { newNodeURL } }, res) => {
  updateNetworkNodes(newNodeURL);
  res.send({ message: "new node registered.", success: true });
});

app.post("/update-nodes", ({ body: { allNetworkNodes } }, res) => {
  allNetworkNodes.forEach((networkNode) => {
    updateNetworkNodes(networkNode);
  });
  res.send({ message: "nodes updated", success: true });
});

app.post("/transaction", ({ body: { amount, recipient, sender } }, res) => {
  const blockIndex = nebCoin.createNewTransaction(amount, recipient, sender);
  res.send({ note: `transaction to be added to block ${blockIndex}` });
});

app.listen(PORT, () => console.log(`listening on port: ${PORT}`));
