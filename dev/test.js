const Blockchain = require("./blockchain");
const bitcoin = new Blockchain();

var chain1 = {
  chain: [
    {
      hash: "0",
      index: 1,
      nonce: 0,
      previousBlockHash: "0",
      timestamp: 1627426644805,
      transactions: [],
    },
    {
      hash: "00002b62f1205be4a02b5f13b07344e7dbbe80088ec44327c34971412405da12",
      index: 2,
      nonce: 5672,
      previousBlockHash: "0",
      timestamp: 1627426696779,
      transactions: [],
    },
    {
      hash: "00009c4c7225b5e6015395e6a537612cd83d4ee1ec5830ff2f914a48a4774666",
      index: 3,
      nonce: 8374,
      previousBlockHash:
        "00002b62f1205be4a02b5f13b07344e7dbbe80088ec44327c34971412405da12",
      timestamp: 1627426750472,
      transactions: [
        {
          amount: 50,
          recipient: "00",
          transactionID: "478b3cb83594422db3e588d8721c9a55",
        },
        {
          amount: 10,
          recipient: "steve",
          sender: "abhi",
          transactionID: "1ea4a808448a41249916f6b8e64b891b",
        },
        {
          amount: 20,
          recipient: "steve",
          sender: "abhi",
          transactionID: "05d33d14d71e4cdfaeec5970b601f6b1",
        },
        {
          amount: 30,
          recipient: "steve",
          sender: "abhi",
          transactionID: "0fcd67e9c5b54505a223bf8928e095ba",
        },
      ],
    },
    {
      hash: "00002c20ff5549daed33d78a050f0d9e76d7bf347aeeee2a8a44f5e6af1e9871",
      index: 4,
      nonce: 23393,
      previousBlockHash:
        "00009c4c7225b5e6015395e6a537612cd83d4ee1ec5830ff2f914a48a4774666",
      timestamp: 1627427998482,
      transactions: [
        {
          amount: 50,
          recipient: "00",
          transactionID: "78811c83ccba40c9956dac513b184825",
        },
        {
          amount: 40,
          recipient: "steve",
          sender: "abhi",
          transactionID: "4a3ea004ffc746db92a37ddaa011c69c",
        },
        {
          amount: 50,
          recipient: "steve",
          sender: "abhi",
          transactionID: "1b3308f007e247abacc26fcfa9cacae3",
        },
        {
          amount: 60,
          recipient: "steve",
          sender: "abhi",
          transactionID: "6a4a523521b640a38891fd8761811606",
        },
        {
          amount: 70,
          recipient: "steve",
          sender: "abhi",
          transactionID: "63c992bb9b4446858b5b95c492285bdc",
        },
      ],
    },
    {
      hash: "000037a6de56e9d669148e6ccd07f4f6f2767a6418736c78cdc782cbd6602d5d",
      index: 5,
      nonce: 136001,
      previousBlockHash:
        "00002c20ff5549daed33d78a050f0d9e76d7bf347aeeee2a8a44f5e6af1e9871",
      timestamp: 1627428010366,
      transactions: [
        {
          amount: 50,
          recipient: "00",
          transactionID: "5985d6382ddd41378c1660552fa0f98f",
        },
      ],
    },
    {
      hash: "0000d5aa529093a9d613d113d9039351b7a7731302c58d288b170865b3431c76",
      index: 6,
      nonce: 48068,
      previousBlockHash:
        "000037a6de56e9d669148e6ccd07f4f6f2767a6418736c78cdc782cbd6602d5d",
      timestamp: 1627428012342,
      transactions: [
        {
          amount: 50,
          recipient: "00",
          transactionID: "4f831fada7074955a4b5cb2999fa2a92",
        },
      ],
    },
  ],
  currentNodeURL: "http://localhost:3001",
  networkNodes: [],
  pendingTransactions: [
    {
      amount: 50,
      recipient: "00",
      transactionID: "7b6925b506bd4e1188f6a550815c5f7a",
    },
  ],
};

console.log(bitcoin.chainIsValid(chain1.chain));
