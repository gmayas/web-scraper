//const scraperapiClient = require('scraperapi-sdk')('51d5aa11c839a3f5b61bd6b245967206')
const { default: axios } = require("axios");
let request = require("request-promise");
const proxyList = require("./proxy/proxyList");
const urlPetition = 'https://www.bodegaaurrera.com.mx';
//
const getProxyData = () => {
    const proxies = proxyList;
    const randomNumber = Math.floor(Math.random() * proxies.length);
    const proxyItem = proxies[randomNumber];
    const proxy = {
        ip: proxyItem.ip,
        port: proxyItem.port,
        username: proxyItem.username,
        password: proxyItem.password,
    };
    return proxy;
};

const gerCookies = async (urlAxios) => {
    try {
        
        const cookieJar = request.jar();
        const proxy = getProxyData();
        const urlProxy = `http://${proxy.username}:${proxy.password}@${proxy.ip}:${proxy.port}`;
        request = request.defaults({
            method: 'GET',
            proxy: urlProxy,
            jar: cookieJar
        })
        const result = await request(urlAxios)
        const cookies = cookieJar.getCookieString(urlAxios);
        return cookies;
    }
    catch (error) {
        console.error('error:', error.message)
        return ""
    }
}

const getPetitionFromProxyApi = async (urlAxios, counter = 0) => {
    try {
        const proxy = getProxyData();
        const cookies = await gerCookies(urlAxios);
        console.log('cookies:', cookies);  
        const headers = {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "es-ES,es;q=0.9",
            "Connection": "keep-alive",
            "Host": "www.bodegaaurrera.com.mx",
            "Referer": "https://www.bodegaaurrera.com.mx/",
            cookie: cookies,
            "sec-ch-ua-platform": "Windows",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-origin",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.5005.62 Safari/537.36"
        };
        console.log("urlAxios:", urlAxios);
        const response = await axios({
            method: "get",
            url: urlAxios,
            headers,
            proxy: {
                host: proxy.ip,
                port: proxy.port,
                auth: { username: proxy.username, password: proxy.password }
            }
        });
        console.log("response code:", response.status);
        const result = response.data;
        return {
            Ok: true,
            message: "Valid get Bodega Aurrera",
            status: response.status,
            result,
            resultError: ""
        };
    } catch (error) {
        console.log('error:', error.message);
        let resultError = "", status = "";
        if (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT') {
            status = 502;
            resultError = error.message;
        } else {
            console.log('response code:', error.response.status);
            status = error.response.status;
            resultError = error.response.data;
        };
        counter += 1;
        if (counter <= 10) {
            return await getPetitionFromProxyApi(urlAxios, counter);
        }
        return {
            Ok: false,
            message: `Error get Bodega Aurrera: ${error.message}`,
            status,
            result: [],
            resultError
        };
    }
};
//
const getProductsDetail = async (products) => {
    try {
        for (let i = 0; i < products.length; i++) {
            const product = products[i];
            const productDetailUrl = `https://www.bodegaaurrera.com.mx/api/rest/model/atg/commerce/catalog/ProductCatalogActor/getProduct?id=${product.id}`
            const productDetail = await getPetitionFromProxyApi(productDetailUrl);
            product.detail = productDetail;
        }
        return products;
    } catch (error) {
        console.log('error:', error.message);
        return products;
    }
}
// 
const getPromotions = async (products) => {
    if (products.length > 0) {
        try {
            const promotionList = [];
            const productsIds = await getProductIds(products);
            const groupedProductsIds = productsIds.map((e, i) => {
                return i % 20 === 0 ? productsIds.slice(i, i + 20) : null;
            }).filter(e => { return e; });
            for (let i = 0; i < groupedProductsIds.length; i++) {
                const productIds = groupedProductsIds[i].splice(0, 20).join(',');
                const response = await getProductPromotion(productIds, products);
                const productPromo = response.result;
                promotionList.push(productPromo);
            }
            const promotions = formatPromotions(promotionList);
            return mapProductsPromotions(promotions, products);
        } catch (error) {
            console.log('error:', error.message);
            return products;
        }
    }
};
// 
const getProductIds = async (products) => {
    const productsIds = [];
    for (let i = 0; i < products.length; i++) {
        try {
            const { id } = products[i];
            productsIds.push(id);
        } catch (error) {
            //return undefined;
            console.log('error:', error.message);
        }
    }
    return productsIds;
};
// 
const getProductsByBrand = (products) => {
    const productsGroupByBrand = groupBy('brandName');
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
//
const mapProductsPromotions = (promotions, products) => {
    for (let i = 0; i < products.length; i++) {
        try {
            const product = products[i];
            const productPromotion = promotions.find(p => p.skuId == product.id);
            if (productPromotion) {
                product.promotions = productPromotion;
            } else {
                product.promotions = {};
            }
        } catch (error) {
            console.log('error:', error.message);
            return {};
        }
    }
    return products;
}
//
const formatPromotions = (productPromotions) => {
    const promotions = [];
    if (productPromotions) {
        for (let i = 0; i < productPromotions.length; i++) {
            const promos = productPromotions[i].priceAndPromotions;
            for (var promo in promos) {
                const productPromotion = promos[promo];
                if (productPromotions) {
                    productPromotion.skuId = promo;
                    promotions.push(productPromotion);
                }
            }
        }
        return promotions
    }
}
//
const groupBy = (key) => (array) =>
    array.reduce((objectsByKeyValue, obj) => {
        const value = obj[key];
        objectsByKeyValue[value] = (objectsByKeyValue[value] || []).concat(obj);
        return objectsByKeyValue;
    }, {});
//
const getProductPromotion = async (productIds) => {
    try {
        const productsPromotionsUrl = `https://www.bodegaaurrera.com.mx/api/rest/model/atg/commerce/catalog/ProductCatalogActor/getPriceAndPromotions?skuIds=${product.id}`;
        const productsPromotionsResponse = await getPetitionFromProxyApi(productsPromotionsUrl);
        return productsPromotionsResponse;
    } catch (error) {
        console.error('error:', error.message)
        return [];
    }
}
//
const arrayEmptyContent = (dataIn) => {
    try {
        return (typeof dataIn.appendix.SearchResults.content === 'undefined' || dataIn.appendix.SearchResults.content === '' || dataIn.appendix.SearchResults.content === null || dataIn.appendix.SearchResults.content.length === 0)
    } catch (error) {
        console.log('error:', error.message)
        return true;
    };
};
//
const getData = async () => {
    try {
        const url = "/cervezas-vinos-y-licores/licores-y-destilados/sakes";
        let productsCategory = [], products = [], response, dataReturn, moreProducts = true, page = 0;
        do {
            console.log('...')
            console.log('href:', url);
            console.log(`Index: ${page} - Page: ${page + 1}`);
            const urlPetition = `https://www.bodegaaurrera.com.mx/api/v2/page/browse${url}?page=${page}&size=48&siteId=bodega`;
            const response = await getPetitionFromProxyApi(urlPetition)
            const arrayEmpty = arrayEmptyContent(response);
            if (!arrayEmpty) {
                products = response.appendix.SearchResults.content;
                products = await getProductsDetail(products);
                products = await getPromotions(products);
                products = getProductsByBrand(products);
                productsCategory.push(...products);
                page = response.appendix.SearchResults.number + 1;
            } else {
                moreProducts = false;
            }
            console.log('moreProducts:', moreProducts);
        } while (moreProducts);
        console.log('...')
    }
    catch (error) {
        console.error('error:', error.message);
        console.error('error ...');
    };
}
//
getData();