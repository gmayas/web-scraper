const axios = require('axios').default;
const randomUseragent = require('random-useragent');
const proxyList = require('../../proxy/proxyList');
const { HttpsProxyAgent } = require('hpagent');

const baseApiUrl = 'https://www.exito.com/_v/segment/graphql/v1?';

const extraction = async (url, sha256Hash, deparmentPath) => {
  console.log('deparmentPath:', deparmentPath);
  const productsDepartment = await getExitoProducts(deparmentPath, sha256Hash); // OBTENEMOS LOS PRODUCTOS POR DEPARTAMENTO
  const productsDepartmentWithOrder = getDepartmentPosition(productsDepartment);
  const products = await getProductsByUrl(url, sha256Hash, productsDepartmentWithOrder);
  return products;
};

getProductsByUrl = async (path, sha256Hash, listProductDeparment) => {
  try {
    const productDepartment = listProductDeparment.products;
    let data = await getExitoProducts(path, sha256Hash);
    const breadcrumb = data.breadcrumb;
    if (data) {
      if (data.products.length > 0) {
        for (let i = 0; i < data.products.length; i++) {
          const subCategoryPosition = i + 1;
          const product = data.products[i];
          const productId = product.productId;
          const productDepartmentPosition = productDepartment.find((p) => p.productId == productId);
          product.departmentPosition = productDepartmentPosition ? productDepartmentPosition.departmentPosition : 0;
          product.subCategoryPosition = subCategoryPosition;
        }
      }
    }

    const products = getProductsByBrand(data.products);
    const subCategory = {
      breadcrumb: breadcrumb,
      products: products,
    };

    return subCategory;
  } catch (error) {
    console.log(error);
  }
};

getExitoProducts = async (path, sha256Hash) => {
  let from = 0;
  let to = 0;
  let totalProducts = 1000;

  let data = [];
  let breadcrumb = [];
  let listProductsPetitions = [];

  try {
    const pathUrl = getPathDepartment(path);
    const queryTotalProducts = generateQueryString(pathUrl, 0, 20);
    const responseTotalProducts = await getTotalExitoProducts(queryTotalProducts, sha256Hash);

    if (responseTotalProducts) {
      totalProducts = responseTotalProducts.data.productSearch.recordsFiltered;
      breadcrumb = responseTotalProducts.data.productSearch.breadcrumb;

      if (totalProducts > 10000) { //EXITO NO REGRESA MAS DE 10,000 PRODUCTOS EN PAGINACION
        totalProducts = 1000;
      }

      while (to <= totalProducts) {
        let paginationTotal = 20;
        const restProducts = totalProducts - to;

        if (restProducts < 10) {
          paginationTotal = restProducts + 1;
        }

        //ASIGNAMOS LA PAGINACION
        from = to;
        to = to + paginationTotal;

        const queryBase64 = generateQueryString(path, from, to);
        const productsPetition = getDataExitoProducts(queryBase64, sha256Hash);
        listProductsPetitions.push(productsPetition);
      }

      const products = await Promise.allSettled(listProductsPetitions);
      const productsFormat = getExitoProductsFormat(products);
      data.products = productsFormat;
      data.breadcrumb = breadcrumb;

      return data;
    }
  } catch (error) {
    return undefined;
  }
  return undefined;
};

const getExitoProductsFormat = (productsPetitions) => {
  const listProducts = [];
  if (productsPetitions) {
    for (let i = 0; i < productsPetitions.length; i++) {
      try {
        const productPetition = productsPetitions[i].value.data;
        const allProducts = productPetition.data.productSearch.products;
        breadcrumb = productPetition.data.productSearch.breadcrumb;

        for (let i = 0; i < allProducts.length; i++) {
          const position = i + 1;
          const product = allProducts[i];
          product.subCategoryPosition = position;
          product.dateExtraccion = convertDate(new Date());
          listProducts.push(product);
        }
      } catch (error) {
        //console.log("No contiene Productos");
        //break;
      }
    }
  }

  return listProducts;
};

convertDate = (inputFormat) => {
  function pad(s) {
    return s < 10 ? '0' + s : s;
  }
  var d = new Date(inputFormat);
  var date = [pad(d.getDate()), pad(d.getMonth() + 1), d.getFullYear()].join('/');
  var hours = [pad(d.getHours()), pad(d.getMinutes()), pad(d.getSeconds())].join(':');

  return date + ' ' + hours;
};

generateQueryString = (path, from, to) => {
  try {
    let query = '';

    if (path.includes('?map=c,c')) {
      path = path.split('?')[0];
    }

    if (path.includes('productClusterIds')) {
      const cleanUrl = path.split('?');
      const clusterId = cleanUrl[0].replace('/', '').replace(' ', '');
      const maps = 'productClusterIds';
      const facets = [{ key: 'productClusterIds', value: clusterId }];
      query = getQueryString(facets, clusterId, maps, from, to);
    } else {
      const pathArray = path.split('/');
      const facets = [];
      const maps = [];

      for (let i = 0; i < pathArray.length; i++) {
        if (pathArray[i] != '') {
          const facet = {
            key: 'c',
            value: pathArray[i],
          };
          maps.push('c');
          facets.push(facet);
        }
      }

      query = getQueryString(facets, path, JSON.stringify(maps), from, to);
    }

    let bufferObj = Buffer.from(JSON.stringify(query), 'utf8');
    let base64String = bufferObj.toString('base64');

    return base64String;
  } catch (error) {
    //console.log('No se logro obtener una el querystring');
    return '';
  }
};

getQueryString = (facets, path, map, from, to) => {

  const map2 = map.replace("[", "").replace("]", "").replace(/"/g, "");

  const query = {
    hideUnavailableItems: true,
    skusFilter: 'ALL_AVAILABLE',
    simulationBehavior: 'default',
    installmentCriteria: 'MAX_WITHOUT_INTEREST',
    productOriginVtex: false,
    map: map2,
    query: path,
    orderBy: 'OrderByScoreDESC',
    from: from,
    to: to,
    selectedFacets: facets,
    operator: 'and',
    fuzzy: '0',
    facetsBehavior: 'dynamic',
    categoryTreeBehavior: 'default',
    withFacets: false,
  };

  return query;
};

getDataExitoProducts = (query, sha256Hash) => {
  const parameters = 'workspace=master&maxAge=short&appsEtag=remove&domain=store&locale=es-CO&__bindingId=2f829b4f-604f-499c-9ffb-2c5590f076db&operationName=productSearchV3&variables=%7B%7D&';
  let body = {
    persistedQuery: {
      version: 1,
      sha256Hash: sha256Hash, //'79856e9e1696c9936223883a8769d932ad0ef09cc7f08f05488e7ceb8301ecec',
      sender: 'vtex.store-resources@0.x',
      provider: 'vtex.search-graphql@0.x',
    },
    variables: query,
  };

  const url = encodeURI(baseApiUrl + parameters + `extensions=${JSON.stringify(body)}`);

  try {
    const response = getPetitionFromProxy(url);
    return response;
  } catch (err) {
    //console.log('el endpoint no respondió');
    return [];
  }
};

getTotalExitoProducts = async (query, sha256Hash) => {
  const parameters = 'workspace=master&maxAge=short&appsEtag=remove&domain=store&locale=es-CO&__bindingId=2f829b4f-604f-499c-9ffb-2c5590f076db&operationName=productSearchV3&variables=%7B%7D&';
  let body = {
    persistedQuery: {
      version: 1,
      sha256Hash: sha256Hash, //'79856e9e1696c9936223883a8769d932ad0ef09cc7f08f05488e7ceb8301ecec',
      sender: 'vtex.store-resources@0.x',
      provider: 'vtex.search-graphql@0.x',
    },
    variables: query,
  };

  const url = encodeURI(baseApiUrl + parameters + `extensions=${JSON.stringify(body)}`);

  try {
    const response = await getPetitionFromProxy(url);

    if (response.status == 200) {
      return response.data;
    }

    return response;
  } catch (err) {
    //console.log('el endpoint no respondió');
    return [];
  }
};

getPathDepartment = (department) => {
  let pathUrl = '';
  if (department > 0) {
    pathUrl = `/${department}?map=productClusterIds`;
  } else {
    pathUrl = `/${department}`;
  }

  return pathUrl;
};

getDepartmentPosition = (productsDepartment) => {
  try {
    const data = productsDepartment;
    if (data) {
      if (data.products.length > 0) {
        for (let i = 0; i < data.products.length; i++) {
          const departmentPosition = i + 1;
          const product = data.products[i];
          product.departmentPosition = departmentPosition;
        }
      }
    }
    return data;
  } catch (error) {
    console.log(error);
  }
};

const getPetitionFromProxy = async (url) => {
  const proxy = await getProxyData();
  const randomAgent = randomUseragent.getRandom();
  const urlProxy = `http://${proxy.username}:${proxy.password}@${proxy.ip}:${proxy.port}`;

  try {
    const headers = {
      'User-Agent': randomAgent,
      'Content-Type': 'application/json',
      origin: 'https://www.exito.com/',
      referer: 'https://www.exito.com/',
      Connection: 'keep-alive',
    };

    const response = await axios({
      url: url,
      method: 'get',
      headers: headers,
      agent: {
        https: new HttpsProxyAgent({
          keepAlive: true,
          proxy: urlProxy,
        }),
      },
    });

    if (response) {
      return response;
    }

    return undefined;
  } catch (error) {
    //console.log(error);
    return undefined;
  }
};

sleep = (ms) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

formatDateWithZone = () => {
  var s = new Date().toLocaleString('es-MX', { timeZone: 'America/Mexico_City' });
  var a = s.split(/\D/);
  return a[1] + '/' + a[0] + '/' + a[2] + ' ' + a[3] + ':' + a[4] + ':' + a[5];
};

getProductsByBrand = (products) => {
  const productsGroupByBrand = groupBy('brand');
  const productsByBrand = productsGroupByBrand(products);

  for (let brand in productsByBrand) {
    for (let i = 0; i < productsByBrand[brand].length; i++) {
      const position = i + 1;
      const product = productsByBrand[brand][i];
      product.brandPosition = position;
    }
  }

  return products;
};

const getProxyData = async () => {
  let proxy = '';
  const proxies = proxyList;
  let randomNumber = Math.floor(Math.random() * proxies.length);

  proxy = {
    ip: proxies[randomNumber].ip,
    port: proxies[randomNumber].port,
    username: proxies[randomNumber].username,
    password: proxies[randomNumber].password,
  };

  return proxy;
};

groupBy = (key) => (array) =>
  array.reduce((objectsByKeyValue, obj) => {
    const value = obj[key];
    objectsByKeyValue[value] = (objectsByKeyValue[value] || []).concat(obj);
    return objectsByKeyValue;
  }, {});

module.exports = async (request) => {
  return await extraction(request.url, request.sha256Hash, request.departmentName);
};
