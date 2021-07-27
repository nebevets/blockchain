const { v4: uuidv4 } = require("uuid");

const getFormattedUUID = () => uuidv4().split("-").join("");

module.exports = {
  getFormattedUUID,
};
