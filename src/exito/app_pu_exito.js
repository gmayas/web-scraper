const puppeteer = require('puppeteer');
const proxyList = require("../proxy/proxyList");
const fs = require("fs");
const path = require("path");
const getVariables = require("./utils/app_pu");
const categories = require('./filesJson/categoriesExito.json');

const saveLog = async (data) => {
  try {
    const fileName = `PU-mercado-lacteos-huevos-y-refrigerados-huevos.log`;
    const content = `${data}\n`;
    const filePath = path.join(__dirname, `/logs/${fileName}`);
    fs.appendFileSync(filePath, content, "utf-8");
  } catch (error) {
    console.error('error:', error.message);
  };
};

const saveFileLinks = async (data) => {
  try {
    const fileName = 'categoriesExitoV021.json';
    const filePath = path.join(__dirname, `/filesJson/${fileName}`);
    fs.writeFileSync(filePath, JSON.stringify(data), 'utf-8');
  } catch (error) {
    console.error('error:', error.message);
  }
};

const setVariables = async (dataDeparment) => {
  try {
    let urlPetition = "", variables = "", hRef = "";
    let { department, category, subCategory } = dataDeparment;
    //
    const departmentName = checkCategoryName(department);
    department.variables = "";
    if (!departmentName) {
      hRef = department.href;
      urlPetition = `https://www.exito.com${hRef}`;
      console.log("Get Variables:", urlPetition);
      variables = await getVariables(urlPetition);
      console.log("Variables:", variables);
      department.variables = variables;
    }
    const categoryName = checkCategoryName(category);
    category.variables = "";
    if (!categoryName) {
      hRef = category.href;
      urlPetition = `https://www.exito.com${hRef}`;
      console.log("Get Variables:", urlPetition);
      variables = await getVariables(urlPetition);
      console.log("Variables:", variables);
      category.variables = variables;
    }
    const subCategoryName = checkCategoryName(subCategory);
    subCategory.variables = "";
    if (!subCategoryName) {
      hRef = subCategory.href;
      urlPetition = `https://www.exito.com${hRef}`;
      console.log("Get Variables:", urlPetition);
      variables = await getVariables(urlPetition);
      console.log("Variables:", variables);
      subCategory.variables = variables;
    }
    dataDeparment = { department, category, subCategory };
    return dataDeparment;
  }
  catch (error) {
    console.error("error:", error.message);
    return dataDeparment;
  }
}

const checkCategoryName = (str) => {
  try {
    if (str !== "") {
      return typeof str.name === "undefined" || str.name === "" || str.name === null || str.name.length === 0;
    }
    return false;
  } catch (error) {
    console.log("error:", error);
    return false;
  }
};

(async () => {
  const links = [];
  for (let i = 0; i < categories.length; i++) {
    let  dataDeparment = categories[i]
    dataDeparment = await setVariables(dataDeparment);
    links.push(dataDeparment);
    console.log('dataDeparment:', dataDeparment);
    console.log('...');
  }
  await saveFileLinks(links);
  console.log('...');
})()