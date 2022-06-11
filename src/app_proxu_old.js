const getPetitionFromProxy = async (url, cookie) => {
    const proxy = await getProxyData();
    const randomAgent = randomUseragent.getRandom();
    const urlProxy = `http://${proxy.username}:${proxy.password}@${proxy.ip}:${proxy.port}`;
    //sleep(350);
    try {
        const headers = {
            'User-Agent': randomAgent,
            'Content-Type': 'application/json',
            origin: 'https://www.soriana.com/',
            referer: 'https://www.soriana.com/',
            Connection: 'keep-alive',
            Cookie: `${cookie}`
        };
        const response = await axios({
            method: 'get',
            url: url,
            headers: headers,
            agent: {
                https: new HttpsProxyAgent({
                    keepAlive: true,
                    proxy: urlProxy,
                }),
            },
        }).catch((e) => {
            return e.response;
        });
        if (response.data && response.status == 200) {
            return response.data;
        }
        return undefined;
    } catch (error) {
        console.error('error:', error.message)
        sleep(350);
        return await getPetitionFromProxy(url, cookie);
    }
};