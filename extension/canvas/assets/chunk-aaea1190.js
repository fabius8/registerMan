var t;if(ignoredSites=["https://www.google.com/maps","https://accounts.google.com","www.figma.com","www.canva.com","designer.microsoft.com","create.vista.com","console.aws.amazon.com","www.coze.com"].some(e=>window.location.href.startsWith(e)||window.location.host.endsWith(e)))chrome.runtime.sendMessage({action:"resetDetection"},function(){});else if(document.documentElement.getAttribute("randFingerprintInjected")===null){chrome.runtime.sendMessage({action:"resetDetection"},function(){});try{(t=window.top)==null||t.postMessage("injectFrameFingerprint","*")}catch{}}else document.documentElement.removeAttribute("randFingerprintInjected");window.location.host&&chrome.runtime.sendMessage({action:"scriptLoaded",host:window.location.host},function(){});
