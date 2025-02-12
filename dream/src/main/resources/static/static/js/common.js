/**
 * 根据url获取参数值
 * @param name
 * @returns {string|null}
 */
function getParameterByName(name) {
    name = name.replace(/[[]]/g, '\$&');
    var url = window.location.href;
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)');
    var results = regex.exec(url);
    if (!results) {
        return null;
    }
    if (!results[2]) {
        return '';
    }
    return decodeURIComponent(results[2].replace('/+/g', ' '));
}

/**
 * 根据css的url在当前页面添加css
 */
function loadCSS(url,successFun,errorFun) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = url; // 替换为你自己的CSS文件路径
    // 监听CSS加载完成事件
    link.onload = successFun;
    // 监听CSS加载错误事件
    link.onerror = errorFun
    document.head.appendChild(link);
}

//判断是否是手机端
function isMobile() {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    return /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
}