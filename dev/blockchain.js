const sha256 = require("sha256");
const DOMAIN = process.argv[3];
const PORT = process.argv[2];

class Blockchain {
  constructor() {
    this.chain = [];
    this.currentNodeURL = `http://${DOMAIN}:${PORT}`;
    console.log(this.currentNodeURL);
    this.networkNodes = [];
    this.pendingTransactions = [];
    // create genesis block
    this.createNewBlock(0, "0", "0");
  }

  createNewBlock(nonce, previousBlockHash, hash) {
    const newBlock = {
      hash,
      index: this.chain.length + 1,
      nonce,
      previousBlockHash,
      timestamp: Date.now(),
      transactions: [...this.pendingTransactions],
    };
    this.chain.push(newBlock);
    this.pendingTransactions = [];

    return newBlock;
  }

  createNewTransaction(amount, sender, recipient) {
    const newTransaction = {
      amount,
      recipient,
      sender,
    };
    this.pendingTransactions.push(newTransaction);

    return this.getLastBlock()["index"] + 1;
  }

  getLastBlock() {
    return this.chain[this.chain.length - 1];
  }

  hashBlock(previousBlockHash, currentBlockData, nonce) {
    const dataString =
      previousBlockHash + nonce.toString() + JSON.stringify(currentBlockData);
    return sha256(dataString);
  }

  proofOfWork(previousBlockHash, currentBlockData) {
    let nonce = 0,
      hash;
    do {
      hash = this.hashBlock(previousBlockHash, currentBlockData, nonce++);
    } while (hash.substring(0, 4) !== "0000");

    return nonce - 1;
  }
}

module.exports = Blockchain;
