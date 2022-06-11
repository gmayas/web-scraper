const scraperapiClient = require('scraperapi-sdk')('51d5aa11c839a3f5b61bd6b245967206')
//
const getPetitionFromProxyApi = async (urlPetition, counter = 0) => {
    try {
        console.log('urlPetition', urlPetition);
        const response = await scraperapiClient.get(urlPetition);
        const dataReturn = JSON.parse(response);
        console.error('Ok ...');
        return dataReturn;
    } catch (error) {
        console.log('error:', error.message);
        counter += 1;
        console.error('counter:', counter);
        //if (counter <= 10) {
        return await getPetitionFromProxyApi(urlPetition, counter);
        //}
        //return {};
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