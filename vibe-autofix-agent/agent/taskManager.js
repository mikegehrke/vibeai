const { v4: uuidv4 } = require("uuid");

exports.createTask = function (type, file, description) {
  return {
    id: uuidv4(),
    type,
    file,
    description,
    status: "pending"
  };
};
