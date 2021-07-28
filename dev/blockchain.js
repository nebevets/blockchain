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

  chainIsValid(blockchain) {
    // check blockchain block integrity, except the genesis block
    for (let i = 1; i < blockchain.length; i++) {
      const previousBlock = blockchain[i - 1];
      const currentBlock = blockchain[i];
      if (currentBlock.previousBlockHash !== previousBlock.hash) {
        return false;
      }
      const blockHash = this.hashBlock(
        previousBlock.hash,
        { index: currentBlock.index, transactions: currentBlock.transactions },
        currentBlock.nonce
      );
      if (blockHash.substring(0, 4) !== "0000") {
        return false;
      }
    }
    // check the genesis block integrity
    const [{ hash, nonce, previousBlockHash, transactions }] = blockchain;

    return (
      hash === "0" &&
      nonce === 0 &&
      previousBlockHash === "0" &&
      transactions.length === 0
    );
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
