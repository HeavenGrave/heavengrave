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
 * 调用AI的通用方法
 */
// function askAIForAnAnswer(question) {
//     let data = JSON.stringify({
//         "model": "deepseek/deepseek-chat:free",
//         "messages": [
//             {
//                 "role": "user",
//                 "content":question
//             }
//         ]
//     });
//     axios.post('https://openrouter.ai/api/v1/chat/completions',
//         data,  // 请求体数据
//         {
//             headers: {  // 正确的headers设置位置
//                 "Authorization": "Bearer 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",
//                 "Content-Type": "application/json"
//             }
//         }
//     )
//         .then(response => {
//             console.log('API响应:', response.data);
//             const aiResponse = response.data.choices[0]?.message?.content || "未获取到有效响应";
//             return aiResponse;
//         })
//         .catch(error => {
//             console.log('API请求错误:', error);
//             return `请求失败: ${error.response?.data?.error?.message || error.message}`;
//         });
// }

function askAIForAnAnswer(question) {
    return new Promise((resolve, reject) => {
        let data = JSON.stringify({
            "model": "deepseek/deepseek-chat:free",
            "messages": [
                {
                    "role": "user",
                    "content": question
                }
            ]
        });
        axios.post('https://openrouter.ai/api/v1/chat/completions',
            data,
            {
                headers: {
                    "Authorization": "Bearer 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",
                    "Content-Type": "application/json"
                }
            }
        )
            .then(response => {
                console.log('API Response:', response.data);
                const aiResponse = response.data.choices[0]?.message?.content || "未获取到有效响应!";
                resolve(aiResponse);
            })
            .catch(error => {
                console.log('API Request Error:', error);
                reject(`Request failed: ${error.response?.data?.error?.message || error.message}`);
            });
    });
}
