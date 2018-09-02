var script = document.createElement("script");
script.type = "text/javascript";
script.src = location.href.replace(/config\.html$/, '') + "detector.js";
document.getElementsByTagName("head")[0].appendChild(script);