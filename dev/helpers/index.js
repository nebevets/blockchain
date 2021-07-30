const { v4: uuidv4 } = require("uuid");

const getFormattedUUID = () => uuidv4().replace(/-/g, "");

const sendError = (error, res) => {
  console.log(error);
  res.status(500).send({
    ...error,
    message: error.message,
  });
};

module.exports = {
  getFormattedUUID,
  sendError,
};
