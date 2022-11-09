const axios = require('axios').default;
const cheerio = require('cheerio');
const randomUseragent = require('random-useragent');
const proxyList = require('../../proxy/proxyList');
const proxyListUS = require('../../proxy/proxyListUS');
const superUrlBase = `https://www.soriana.com`;
const { HttpsProxyAgent } = require('hpagent');
//const proxy_api = 'http://34.148.154.185/soriana';

const extraction = async (data) => {
	const resultProducts = data.data;
	const productCategory = await getProductsByCategory(data.data);
	const productSubCategory = await getProductsBySubCategory(data.data);
	const products = await mergeProducts(productCategory, productSubCategory);
	resultProducts.products = products;
	return resultProducts;
};

const mergeProducts = async (productCategory, productSubCategory) => {
	const products = [];
	const cookie = await getCookie();
	for (let i = 0; i < productSubCategory.length; i++) {
		const product = productSubCategory[i];
		const categoryPosition = productCategory.find((p) => p.productId == product.productId);
		const urlProductDetail = `${superUrlBase}/on/demandware.store/Sites-Soriana-Site/default/Product-ShowQuickView?pid=${product.productId}`;
		const productDetail = await getPetitionFromProxyAPI(urlProductDetail, '');
		if (productDetail) {
			product.detail = getJsonFormatFromString(productDetail);
		} else {
			product.detail = [];
		}
		if (categoryPosition) {
			product.categoryPosition = categoryPosition.position;
		} else {
			product.categoryPosition = 0;
		}
		products.push(product);
	}
	return products;
};

const getProductsByCategory = async (data) => {
	try {
		if (!data.categoryUrl.includes('https://www.soriana.com')) {
			const url = `${superUrlBase}${data.categoryUrl}`;
			const categoryProducts = await getProducts(url);
			//const categoryProductsFormat = formatProducts(categoryProducts);
			const categoryProductPosition = productsPosition(categoryProducts);
			return categoryProductPosition;
		} else {
			return [];
		}
	} catch (error) {
		return [];
	}
};

const getProductsBySubCategory = async (data) => {
	try {
		const cleanSubCategory = data.subCategoryUrl.replace('https://www.soriana.com', '');
		const url = `${superUrlBase}${cleanSubCategory}`;
		const subCategoryProducts = await getProducts(url);
		//const subCategoryProductsFormat = formatProducts(subCategoryProducts);
		const subCategoryProductPosition = productsPosition(subCategoryProducts);
		return subCategoryProductPosition;
	} catch (error) {
		return [];
	}
};

const productsPosition = (productsData) => {
	const products = [];
	try {
		if (productsData.length > 0) {
			for (let i = 0; i < productsData.length; i++) {
				const position = i + 1;
				const product = productsData[i];
				product.position = position;
				products.push(product);
			}
		}
	} catch (error) {
		//console.log(error);
	}
	return products;
};

const formatProducts = (productsData) => {
	const products = [];
	try {
		if (productsData) {
			if (productsData.length > 0) {
				for (let i = 0; i < productsData.length; i++) {
					const pageProducts = productsData[i];
					if (pageProducts.length > 0) {
						for (let j = 0; j < pageProducts.length; j++) {
							const product = pageProducts[j];
							products.push(product);
						}
					}
				}
			}
		}
	} catch (error) {
		console.error('error:', error.message);
	}
	return products;
};

const getProducts = async (url) => {
	try {
		const page = 20;
		const randomAgent = randomUseragent.getRandom();
		const headers = {
			'user-Agent': randomAgent,
			'content-Type': 'application/json',
			origin: 'https://www.soriana.com/',
			referer: url, //'https://www.soriana.com/',
			connection: 'keep-alive',
			cookie: '', //`${Cookie}`,
			host: 'www.soriana.com',
		};
		//do {
		const urlPetition = `${url}?page=${page}`; //&cgid=accesorios-de-bebe&view=grid`;
		const response = await getPetitionFromProxy(urlPetition, headers);
		const products = await getProductData(response);
		/*if (page > 10) {
				moreProducts = false;
			}
			console.log('moreProducts:', moreProducts);
			page += 1;
		//} while (moreProducts);*/
		return products;
	} catch (error) {
		console.error('error:', error.message);
		return [];
	}
};

const getProductsNo = async (url, Cookie, category) => {
	try {
		let start = 0;
		let allProducts = [];
		let moreProducts = true;
		const randomAgent = randomUseragent.getRandom();
		const headers = {
			'user-Agent': randomAgent,
			'content-Type': 'application/json',
			origin: 'https://www.soriana.com/',
			referer: url, //'https://www.soriana.com/',
			connection: 'keep-alive',
			cookie: '', //`${Cookie}`,
			host: 'www.soriana.com',
		};
		const response = await getPetitionFromProxy(url, headers);
		const initialProducts = await getProductData(response);
		//const $ = cheerio.load(response);
		//const gridFooter = $('.grid-footer').attr('data-sort-options');
		//const urlMoreProducts = $$('input[name^=.permalink').attr('value');
		//const jsonGridData = JSON.parse(gridFooter);
		//let nextUrl = jsonGridData.options[0].url;
		let nextUrl = `${url}`;
		//https://www.soriana.com/bebes/accesorios-de-bebe/?page=7&cref=1&cgid=accesorios-de-bebe&view=grid
		//nextUrl = nextUrl.replace('pmin=0.01', 'pmin=0%2e01').replace('&srule=own-brand-sorting', '');
		if (initialProducts.length == 0) {
			return undefined;
		}
		//allProducts.push(initialProducts);
		if (initialProducts.length > 0) {
			while (moreProducts) {
				if (moreProducts) {
					const responseNextPage = await paginationProducts(nextUrl, Cookie);
					const products = await getProductData(responseNextPage);
					const $$ = cheerio.load(responseNextPage);
					//const urlMoreProducts = $$('input[name^=.permalink').attr('value');
					const urlMoreProducts = $$("input[name^='dinamicLink']").attr('value');
					nextUrl = urlMoreProducts;
					if (urlMoreProducts == '') {
						moreProducts = false;
					}
					if (products) {
						if (products.length > 0) {
							allProducts.push(products);
						} else {
							moreProducts = false;
						}
					} else {
						moreProducts = false;
					}
				} else {
					moreProducts = false;
				}
				start = start + 15;
				nextUrl = nextUrl.replace(`start=${start - 15}`, `start=${start}`);
			}
		}
		return allProducts;
	} catch (error) {
		console.error('error', error.message);
		return [];
	}
};

const getProductData = async (response) => {
	try {
		const products = [];
		const $ = cheerio.load(response);
		const productsRaw = $('.product-tile--wrapper');
		for (let i = 0; i < productsRaw.length; i++) {
			const product = productsRaw[i];
			const productId = $(product).find('.product').attr('data-pid');
			const productName = $(product).find('.product-tile--name a').text().trim();
			products.push({ position: i, productId, productName });
		}
		return products;
	} catch (error) {
		return undefined;
	}
};

const paginationProducts = async (url, cookie) => {
	try {
		//const cleanKeyword = keyword.replace("&pmin=0%2e01&start=15&sz=15", "");
		//const urlPetition = `${superUrlBase}/on/demandware.store/Sites-Soriana-Site/default/Search-UpdateGrid?cgid=${cleanKeyword}&pmin=0%2e01&start=${start}&sz=15`;
		//const urlPetitionEncode = `${urlPetition}&selectedUrl=${urlPetition}`;

		const headers = {
			authority: 'www.soriana.com',
			accept: '*/*',
			'accept-language': 'es-ES,es;q=0.9',
			//referer: 'https://www.soriana.com/despensa/cremas-sopas-y-pures/?page=1',
			'sec-ch-ua': '"Google Chrome";v="105", "Not)A;Brand";v="8", "Chromium";v="105"',
			'sec-ch-ua-mobile': '?0',
			'sec-ch-ua-platform': '"Windows"',
			'sec-fetch-dest': 'empty',
			'sec-fetch-mode': 'cors',
			'sec-fetch-site': 'same-origin',
			'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36',
			'x-requested-with': 'XMLHttpRequest',
			cookie: `${cookie}`,
		};
		const response = await getPetitionFromProxyAPI(url, headers);
		return response;
	} catch (error) {
		return [];
	}
};

const getCookie = async (url) => {
	try {
		let cookie = '';
		const petition = await axios.get(superUrlBase);
		if (petition) {
			cookie = petition.headers['set-cookie'].join(';');
		}
		return cookie;
	} catch (error) {
		return '';
	}
};

const getPetitionFromProxy = async (urlAxios, headers) => {
	try {
		const proxy = await getProxyData();
		const urlProxy = `http://${proxy.username}:${proxy.password}@${proxy.ip}:${proxy.port}`;
		console.log('urlPetition:', urlAxios);
		sleep(350);
		const response = await axios({
			method: 'get',
			url: urlAxios,
			headers,
			agent: { https: new HttpsProxyAgent({ keepAlive: true, proxy: urlProxy }) },
		});
		/*const response = await axios({
			method: 'get',
			url: urlAxios,
			headers,
			/*proxy: {
				host: 'p.webshare.io',
				port: 80,
				auth: { username: 'ownudlvd-us-65', password: 'nbvxvjpa8cgx' },
			},*/
		/*	proxy: {
				host: proxy.ip,
				port: proxy.port,
				auth: { username: proxy.username, password: proxy.password },
			},
			/*agent: {
				https: new HttpsProxyAgent({
					keepAlive: true,
					proxy: urlProxy,
				}),
			},*/
		//});

		if (response.data && response.status == 200) {
			console.log('response status:', response.status);
			return response?.data;
		}
		return undefined;
	} catch (error) {
		console.error('error:', error.message);
		return await getPetitionFromProxy(urlAxios, headers);
	}
};

const getPetitionFromProxyAPI = async (urlAxios, headers) => {
	try {
		const proxy = await getProxyData();
		const urlProxy = `http://${proxy.username}:${proxy.password}@${proxy.ip}:${proxy.port}`;
		console.log('urlPetition:', urlAxios);
		sleep(350);
		const response = await axios({
			method: 'get',
			url: urlAxios,
			headers,
			agent: { https: new HttpsProxyAgent({ keepAlive: true, proxy: urlProxy }) },
		});
		/*const response = await axios({
			method: 'get',
			url: urlAxios,
			headers,
			/*proxy: {
				host: 'p.webshare.io',
				port: 80,
				auth: { username: 'ownudlvd-us-65', password: 'nbvxvjpa8cgx' },
			},*/
		/*	proxy: {
				host: proxy.ip,
				port: proxy.port,
				auth: { username: proxy.username, password: proxy.password },
			},
			/*agent: {
				https: new HttpsProxyAgent({
					keepAlive: true,
					proxy: urlProxy,
				}),
			},*/
		//});

		if (response.data && response.status == 200) {
			console.log('response status:', response.status);
			return response?.data;
		}
		return undefined;
	} catch (error) {
		console.error('error:', error.message);
		return await getPetitionFromProxyAPI(urlAxios, headers);
	}
};

const getProxyData = async () => {
	let proxy = '';
	//const proxies = proxyList;
	const proxies = proxyListUS;
	let randomNumber = Math.floor(Math.random() * proxies.length);
	proxy = {
		ip: proxies[randomNumber].ip,
		port: proxies[randomNumber].port,
		username: proxies[randomNumber].username,
		password: proxies[randomNumber].password,
	};
	return proxy;
};

const getJsonFormatFromString = (data) => {
	try {
		const dataFormat = JSON.parse(data);
		return dataFormat;
	} catch (error) {
		return {};
	}
};

const arrayEmptyContent = (dataIn) => {
	try {
		return (
			typeof dataIn.result.appendix.SearchResults.content === 'undefined' ||
			dataIn.result.appendix.SearchResults.content === '' ||
			dataIn.result.appendix.SearchResults.content === null ||
			dataIn.result.appendix.SearchResults.content.length === 0
		);
	} catch (error) {
		console.log('error:', error.message);
		return true;
	}
};

const sleep = (ms) => {
	return new Promise((resolve) => {
		setTimeout(resolve, ms);
	});
};

module.exports = async (request) => {
	return await extraction(request);
};
