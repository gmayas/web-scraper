const validateIpProxy = async (url) => {
    try {
      const proxy = getProxyData();
      const urlProxy = `http://${proxy.username}:${proxy.password}@${proxy.ip}:${proxy.port}`;
   
      const response = await axios({
        method: "get",
        url: url,
        headers: header.headers,
        proxy: {
          host: proxy.ip,
          port: proxy.port,
          auth: { username: proxy.username, password: proxy.password },
        },
      });
      const result = response.data;
      console.log(result);
      return result;
    } catch (error) {
      return error;
    }
  };