export let newBaseUrl = "Live";

const baseUrlMap = {
  Dev: "http://173.249.23.108:7073/",
  Live: "http://173.249.23.108:7073/",
  Testing: "http://173.249.23.108:7073/",
};

newBaseUrl = baseUrlMap[newBaseUrl] || newBaseUrl;
