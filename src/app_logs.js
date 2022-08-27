const fs = require("fs");
const path = require("path");
const dateExtraccion = require("../src/utils/dateExtraction"); 

const saveLog = async (data) => {
    try {
      if (data) {
        const fileName = `Carulla_errors.log`;
        const content = `${data} - ${dateExtraccion()}\n`
        //const filePath = path.join("/home/software/files/logs/", fileName);
        const filePath = path.join(__dirname, `/filesLogs/${fileName}`);
        fs.appendFileSync(filePath, content, "utf-8");
      }; 
    } catch (error) {
      console.log("error:", error.message);
    }
  };

  (async () => {
    let index = 21;
    do {
     const data = `Mesaje error - ${index}`;
     await saveLog(data);
     index += 1;
    } while (index <= 40)
  })()


