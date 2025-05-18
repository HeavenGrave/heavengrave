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

/**
 * 判断是否是手机端
 */
function isMobile() {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    return /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
}

/**
 * toast提示
 */
class Toast {
    constructor() {
        this.toastContainer = null;
        this.toastTimeout = null;
    }

    init() {
        if (!this.toastContainer) {
            this.toastContainer = document.createElement('div');
            this.toastContainer.classList.add('toast-container');
            document.body.appendChild(this.toastContainer);
        }
    }

    show(message, duration = 2000) {
        this.init();

        const toast = document.createElement('div');
        toast.classList.add('toast');
        toast.textContent = message;

        this.toastContainer.appendChild(toast);

        // 动画进入
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);

        // 自动关闭
        this.toastTimeout = setTimeout(() => {
            toast.classList.remove('show');
            // 动画结束后再移除元素
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, duration);

        return toast;
    }

    close(toast) {
        if (toast) {
            toast.classList.remove('show');
            // 动画结束后再移除元素
            // setTimeout(() => {
            //     toast.remove();
            // }, 300);
        } else {
            // 关闭当前显示的所有toast
            const toasts = this.toastContainer.children;
            for (let i = toasts.length - 1; i >= 0; i--) {
                toasts[i].classList.remove('show');
                // 动画结束后再移除元素
                setTimeout(() => {
                    toasts[i].remove();
                }, 300);
            }
        }
    }
}


/**
 * rgb 转 hex
 * @param rgb
 * @returns {*|string}
 */
function rgbToHex(rgb) {
    // 如果是 # 开头（已经是16进制），直接返回
    if (rgb.startsWith("#")) return rgb;
    // 提取 rgb/rgba 中的数值
    const match = rgb.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*\d+\.?\d*)?\)$/);
    if (!match) return rgb; // 如果格式不符，原样返回
    // 将 r, g, b 转为 16进制
    const hex = (x) => {
        const hex = parseInt(x).toString(16);
        return hex.length === 1 ? "0" + hex : hex;
    };
    return "#" + hex(match[1]) + hex(match[2]) + hex(match[3]);
}
/**
 * 判断数组是否包含重复元素（基于双指针查找）
 * @param {Array} arr - 要检查的数组
 * @returns {boolean} - true表示有重复，false表示无重复
 */
function hasDuplicates(arr) {
    return arr.some((item, index) => arr.indexOf(item) !== index);
}