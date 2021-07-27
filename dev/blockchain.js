const { getFormattedUUID } = require("./helpers");
const sha256 = require("sha256");
const DOMAIN = process.argv[3];
const PORT = process.argv[2];

class Blockchain {
  constructor() {
    this.chain = [];
    this.currentNodeURL = `http://${DOMAIN}:${PORT}`;
    this.networkNodes = [];
    this.pendingTransactions = [];
    // create genesis block
    this.createBlock(0, "0", "0");
  }

  createBlock(nonce, previousBlockHash, hash) {
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

  createTransaction(amount, sender, recipient) {
    return {
      amount,
      recipient,
      sender,
      transactionID: getFormattedUUID(),
    };
  }

  addPendingTransaction(transaction) {
    this.pendingTransactions.push(transaction);
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
