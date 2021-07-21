const PORT = 3000;
const Blockchain = require("./blockchain");
const express = require("express");
const { v4: uuidv4 } = require("uuid");

const app = express();
const nebCoin = new Blockchain();
const nodeAddress = uuidv4().split("-").join("");

app.use(express.json());

app.get("/blockchain", (req, res) => {
  res.send(nebCoin);
});

app.post("/transaction", ({ body: { amount, recipient, sender } }, res) => {
  const blockIndex = nebCoin.createNewTransaction(amount, recipient, sender);
  res.send({ note: `transaction to be added to block ${blockIndex}` });
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

app.listen(PORT, () => console.log(`listening on port: ${PORT}`));
