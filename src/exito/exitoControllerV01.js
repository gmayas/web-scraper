"use strict";
const Piscina = require("piscina");
const path = require("path");

const workerPath = path.resolve(__dirname, "../../workers/exito/exitoV01.js");
const piscina = new Piscina({
  filename: workerPath,
  concurrentTasksPerWorker: 1,
  minThreads: 1,
});

const exitoWorker = async (req, res) => {
  const url = req.body.url;
  const sha256Hash = req.body.sha256Hash;
  const departmentName = req.body.departmentName;

  if (url && sha256Hash) {
    const result = await piscina.runTask({
      url: url,
      sha256Hash: sha256Hash,
      departmentName: departmentName,
    });

    res.send(result);
  } else {
    res.status(400).send({
      message: "Send in all the fields",
    });
  }
};

module.exports = {
  exitoWorker,
};
