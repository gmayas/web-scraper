An example code:

       const axiosResponse = await axios.get(url, {
            headers: {
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.83 Safari/537.36'
            },
            proxy: false,
            httpsAgent: new HttpsProxyAgent.HttpsProxyAgent(`https://${process.env.luminatiUsername}:${process.env.luminatiPassword}@zproxy.lum-superproxy.io:22225`)
        });
    }




    const response = await axios.get(urlAxios, {
        headers: {
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.83 Safari/537.36'
        },
        proxy: false,
        httpsAgent: new HttpsProxyAgent.HttpsProxyAgent(`http://${proxy.username}:${proxy.password}@${proxy.ip}:${proxy.port}`)
    });



    const urlProxy = `http://${proxy.username}:${proxy.password}@${proxy.ip}:${proxy.port}`;