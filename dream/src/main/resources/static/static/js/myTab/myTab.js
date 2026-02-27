var nowUserId = 1;//当前用户ID
var nowTabType = "home";
// 定义颜色列表（对应你展示的颜色）
const colors = [
    '#f4ab12', '#4ac55c', '#23cfa8','#4385f1', // 第1行
    '#3864ff', '#7621f9', '#e04e96', '#e04e4e',
    '#fd5a5a', '#b7a396', '#795548', '#7dab88' // 第2行
];
var currentAppDiv;//选中的图标对象
var nowAppId = "";//当前选中图标id
window.onload = function () {
    // 获取用户ID
    // nowUserId = parseInt(getParameterByName('userId'));
    loadMyTab();
    // 获取DOM元素
    const colorPreview = document.getElementById('colorPreview');
    const colorPanel = document.getElementById('colorPanel');


    // 初始化颜色面板
    colors.forEach((color, index) => {
        const colorOption = document.createElement('div');
        colorOption.className = 'color-option';
        colorOption.style.backgroundColor = color;
        colorOption.dataset.color = color;

        // 默认选中第5个颜色（对应示例中的蓝色）
        if (index === 3) {
            colorOption.classList.add('selected');
            colorPreview.style.backgroundColor = color;
        }

        // 点击颜色选项切换选中状态
        colorOption.addEventListener('click', () => {
            // 移除所有选项的选中状态
            document.querySelectorAll('.color-option').forEach(opt => {
                opt.classList.remove('selected');
            });
            // 设置当前选项为选中状态
            colorOption.classList.add('selected');
            // 更新预览颜色
            colorPreview.style.backgroundColor = color;
        });
        colorPanel.appendChild(colorOption);
    });
    // 添加自定义颜色图标到颜色面板
    const customColorContainer = document.createElement('div');
    customColorContainer.className = 'custom-color-icon';
    customColorContainer.innerHTML = `
      <input type="color" class="custom-color-picker" id="customColorPicker" value="#4080ff">
    `;
    colorPanel.appendChild(customColorContainer);
    const customColorPicker = document.getElementById('customColorPicker');
    // 监听自定义颜色选择器变化
    customColorPicker.addEventListener('input', (e) => {
        const selectedColor = e.target.value;
        // 更新预览颜色
        colorPreview.style.backgroundColor = selectedColor;
        // 移除所有预设颜色的选中状态
        document.querySelectorAll('.color-option').forEach(opt => {
            opt.classList.remove('selected');
        });
    });

    addClickEventListener();
}
/**
 * 页面要素点击监听
 */
function addClickEventListener() {
    /**
     * 完成按钮 点击监听
     */
    $("#add_ok").on("click", function () {
        let name = $("#add_name").val();
        let color = $("#colorPreview").css("background-color");
        let info = $("#add_info").val();
        //TODO 获取图标类型  IMAGE COLOR
        let iconType = "COLOR";
        let iconUrl="";
        let url = $("#add_url").val();
        let type = $(".menu-item.active").attr("data-type");
        if (url === "") {
            showToast("请填写正确的url!", 'error');
            return;
        } else if (nowAppId !== "") {//当前为编辑
            axios.post('/myTab/updateMyTab',
                'id=' + nowAppId + '&name=' + name + '&color=' + color + '&info=' + info + '&url=' + url+'&iconType='+iconType+'&iconUrl='+iconUrl)
                .then(res => {
                    if (res.status === 200) {
                        $(".addAppArea").css("display", "none");
                        let info = res.data.data;
                        currentAppDiv.attr("data-url",info.url);
                        currentAppDiv.find(".icon_name").eq(0).html(info.name);
                        if(info.iconType=="COLOR"){
                            if(info.info.length>=2){
                                currentAppDiv.find(".icon-box").eq(0).find("div").eq(0).removeClass("oneText");
                                currentAppDiv.find(".icon-box").eq(0).find("div").eq(0).addClass("twoText");
                                currentAppDiv.find(".icon-box").eq(0).find("div").eq(0).html(info.info.substring(0,2));
                            }else{
                                currentAppDiv.find(".icon-box").eq(0).find("div").eq(0).removeClass("twoText");
                                currentAppDiv.find(".icon-box").eq(0).find("div").eq(0).addClass("oneText");
                                currentAppDiv.find(".icon-box").eq(0).find("div").eq(0).html(info.info);
                            }
                            currentAppDiv.find(".icon-box").eq(0).css("background-image","");
                            currentAppDiv.find(".icon-box").eq(0).css("background-color",info.color);
                        }else{
                            //TODO 回显图片图标
                            // currentAppDiv.find(".icon-box").eq(0).find("div").eq(0).removeClass("oneText");
                            // currentAppDiv.find(".icon-box").eq(0).find("div").eq(0).removeClass("twoText");
                            currentAppDiv.find(".icon-box").eq(0).html("");
                            currentAppDiv.find(".icon-box").eq(0).css("background-color","#fff0");
                            currentAppDiv.find(".icon-box").eq(0).css("background-image",info.iconUrl);
                        }
                        showToast("更新成功", 'success');
                        clearAppArea();
                    }
                })
        } else {
            axios.post('/myTab/addMyTab',
                'userId=1&name=' + name + '&color=' + color + '&info=' + info + '&url=' + url + '&type=' + type+'&iconType='+iconType+'&iconUrl='+iconUrl)
                .then(res => {
                    if (res.status === 200) {
                        let info = res.data.data;
                        showToast("添加成功", 'success');
                        $(".addAppArea").css("display", "none");
                        let appHtml = "";
                        if(info.iconType==="COLOR"){
                            if(info.info.length>=2){
                                appHtml+='<div class="appDiv" data-id="'+info.id+'" data-url="' + info.url + '"><div class="icon-box bg-cover pointer twoText" style="background-color:' + info.color + '"><div>' + info.info.substring(0,2) + '</div><div class="absolute removeIcon"><i class="fa fa-minus"></i></div></div><div class="icon_name">'+info.name+'</div></div>';
                            }else{
                                appHtml+='<div class="appDiv" data-id="'+info.id+'" data-url="' + info.url + '"><div class="icon-box bg-cover pointer oneText" style="background-color:' + info.color + '"><div>' + info.info + '</div><div class="absolute removeIcon"><i class="fa fa-minus"></i></div></div><div class="icon_name">'+info.name+'</div> </div>';
                            }
                        }else {
                            appHtml+='<div class="appDiv" data-id="'+info.id+'" data-url="' + info.url + '"><div class="icon-box bg-cover pointer" style="background-image:url(' + info.iconUrl + ')"><div class="absolute removeIcon"><i class="fa fa-minus"></i></div></div><div class="icon_name">'+info.name+'</div></div>';
                        }
                        $(".addAppDiv").before(appHtml);
                        clearAppArea();
                    }
                })
        }
        //重置编辑页面
        nowAppId = "";
    })
    /**
     * 点击添加按钮
     */
    $(".add-icon-box").on("click", function () {
        //TODO 展示添加要素类型菜单
        $(".addAppArea").css("display", "block");
        clearAppArea();
    })
    /**
     * 点击返回按钮
     */
    $("#btn_back").on("click", function () {
        nowAppId = "";
        $(".addAppArea").css("display", "none");
    })
    /**
     * 图标点击监听
     */
    $(".contentBar").on("click", ".appDiv", function () {
        let url = $(this).attr("data-url");
        window.open(url);
    })
    /**
     * 菜单标签点击监听
     */
    $(".menuList").on("click", ".menu-item", function () {
        $(".menu-item").removeClass("active");
        $(this).addClass("active");
        loadMyTab();
    })

    // 绑定到 document，监听全局右键
    $(document).on('contextmenu', '.appDiv', function (event) {
        event.preventDefault();
        const $targetAppDiv = $(event.target).closest(".appDiv");
        // 如果找到符合条件的 .appDiv
        if ($targetAppDiv.length) {
            currentAppDiv = $targetAppDiv; // 存储当前 .appDiv 供菜单使用
            // 定位菜单到鼠标点击位置
            $('#appMenu').css({
                left: event.clientX + 'px',
                top: event.clientY + 'px'
            }).show(); // 显示菜单
//            // 输出点击信息（jQuery 获取目标元素：$(event.target)）
//            console.log('全局右键点击位置：', event.clientX, event.clientY);
//            console.log('被点击元素：', $(event.target).prop('tagName')); // 获取标签名
        }
    });

    // 2. 点击页面空白处，隐藏菜单
    $(document).on('click', function (e) {
        // 判断点击的不是.appDiv和菜单本身
        if (!$(e.target).closest('.appDiv').length && !$(e.target).closest('.context-menu').length) {
            $('#appMenu').hide(); // 隐藏菜单
            $(".shake").removeClass("shake");
        }
    });
    // 3. 点击菜单项（可选：添加菜单点击逻辑）
    $('#appMenu').on('click', '.context-menu-item', function () {
        const optionId = $(this).attr("id");
        let url = "";
        let id = "";
        switch (optionId) {
            case "openPage"://当前页面打开
                url = currentAppDiv.attr("data-url");
                window.location.href = url;
                break;
            case "openNewTab"://新标签打开
                url = currentAppDiv.attr("data-url");
                window.open(url);
                break;
            case "editIcon"://编辑图标
                id = currentAppDiv.attr("data-id");
                nowAppId = id;
                //信息回显
                axios.get('/myTab/getMyTabById?id=' + id)
                    .then(res => {
                        console.log(res);
                        console.log(res.data);
                        if (res.status === 200) {
                            let info = res.data.data;
                            $("#add_name").val(info.name);
                            $("#colorPreview").css("background-color", info.color);
                            $("#add_info").val(info.info);
                            $("#add_url").val(info.url);
                            if(info.iconType==="COLOR"){
                                $("#colorPreview").html(info.info.substring(0,2));
                            }
                            $(".color-option").removeClass("selected");
                            for(let i=0;i<$(".color-option").length;i++){
                                if(info.color===$(".color-option").eq(i).css("background-color")){
                                    $(".color-option").eq(i).addClass("selected");
                                    break;
                                }
                            }
                            $(".addAppArea").css("display", "block");
                        }
                    })
                break;
            case "deleteIcon"://删除图标
                id = currentAppDiv.attr("data-id");
                axios.post('/myTab/deleteMyTab',
                    'id=' + id)
                    .then(res => {
                        console.log(res);
                        console.log(res.data);
                        if (res.status === 200) {
                            currentAppDiv.remove();
                            showToast("删除成功", 'success');
                        }
                    })
                break;
            case "editHome":
                $(".appDiv").addClass("shake");
                break;
        }
        $('#appMenu').hide(); // 点击后隐藏菜单
    });
    /**
     * 图标内容输入变化监听
     */
    $("#add_info").on("input propertychange", function () {
        let value=$(this).val();
        if(value.length>=2){
            value=value.substring(0,2);
//    		$("#colorPreview").css("font-size","24px");
            $("#colorPreview").removeClass("oneText");
            $("#colorPreview").addClass("twoText");
        }else{
//        	$("#colorPreview").css("font-size","36px");
            $("#colorPreview").removeClass("twoText");
            $("#colorPreview").addClass("oneText");
        }
        $("#colorPreview").html(value);
    })

    $(".icon-img-type").on("click", function () {
        $(".icon-img-type").removeClass("active");
        $(this).addClass("active");
        if($(this).attr("data-type")==="color"){
            $(".icon-url-input").css("display","none");
            $(".icon-upload").css("display","none");
            $(".color-picker").css("display","flex");
        }else if($(this).attr("data-type")==="url"){
            $(".icon-url-input").css("display","flex");
            $(".icon-upload").css("display","none");
            $(".color-picker").css("display","none");
        }else{
            $(".icon-url-input").css("display","none");
            $(".icon-upload").css("display","flex");
            $(".color-picker").css("display","none");
        }
    })
    $(".contentBar").on("click", ".removeIcon",function (event) {
        event.preventDefault();
        let id = $(this).parent().parent().attr("data-id");
        axios.post('/myTab/deleteMyTab',
            'id=' + id)
            .then(res => {
                if (res.status === 200) {
                    $(this).parent().parent().remove();
                    showToast("删除成功", 'success');
                }
            })
    })
}
//清空编辑模块
function clearAppArea(){
    $("#add_name").val("");
    $("#add_info").val("");
    $("#add_url").val("");
    $("#colorPreview").html("");
    //TODO 将图标选项重置到文字图标
}
/**
 * 加载当前菜单对应的Tab信息
 */
function loadMyTab() {
    // addLoading();
    nowTabType = $(".menu-item.active").attr("data-type");
    axios.get('/myTab/searchMyTab?userId=' + nowUserId + "&type=" + nowTabType)
        .then(res => {
            // removeLoading();
            if (res.status === 200) {
                $(".appDiv").remove();
                let infoData= res.data.data;
                for (let i = 0; i < infoData.length; i++) {
                    let info = infoData[i];
                    let appHtml = "";
                    if(info.iconType=="COLOR"){
                        if(info.info.length>=2){
                            appHtml+='<div class="appDiv" data-id="'+info.id+'" data-url="' + info.url + '"><div class="icon-box bg-cover pointer twoText" style="background-color:' + info.color + '"><div>' + info.info.substring(0,2) + '</div><div class="absolute removeIcon"><i class="fa fa-minus"></i></div></div><div class="icon_name">'+info.name+'</div> </div>';
                        }else{
                            appHtml+='<div class="appDiv" data-id="'+info.id+'" data-url="' + info.url + '"><div class="icon-box bg-cover pointer oneText" style="background-color:' + info.color + '"><div>' + info.info + '</div><div class="absolute removeIcon"><i class="fa fa-minus"></i></div></div><div class="icon_name">'+info.name+'</div> </div>';
                        }
                    }else {
                        appHtml+='<div class="appDiv" data-id="'+info.id+'" data-url="' + info.url + '"><div class="icon-box bg-cover pointer" style="background-image:url(' + info.iconUrl + ')"><div class="absolute removeIcon"><i class="fa fa-minus"></i></div></div><div class="icon_name">'+info.name+'</div></div>';
                    }
                    $(".addAppDiv").before(appHtml);
                }
            }
        })
        .catch(error => {
            // removeLoading();
            console.error('查询失败:', error);
        });
}


// 显示提示消息
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');
    const toastIcon = document.getElementById('toast-icon');

    // 重置状态
    toast.className = 'fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2';
    toastMessage.textContent = message;

    // 设置类型样式
    if (type === 'success') {
        toast.classList.add('bg-green-50', 'text-green-800');
        toastIcon.className = 'fa fa-check-circle text-secondary';
    } else if (type === 'error') {
        toast.classList.add('bg-red-50', 'text-red-800');
        toastIcon.className = 'fa fa-exclamation-circle text-danger';
    } else if (type === 'info') {
        toast.classList.add('bg-blue-50', 'text-blue-800');
        toastIcon.className = 'fa fa-info-circle text-primary';
    }
    // 显示提示
    setTimeout(() =>{
        // toast.classList.add('show')
    }, 10);
    // 3秒后隐藏
    setTimeout(() => {
        // toast.classList.remove('show');
        toast.classList.add('hide')
    }, 3000);
}

async function getWebsiteInfo(url) {
    try {
        // 获取网页 HTML
        const response = await fetch(url, {
            mode: 'cors', // 注意：需要目标网站允许跨域，否则会失败
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        const html = await response.text();

        // 解析 HTML
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        // 获取标题
        const title = doc.querySelector('title')?.textContent || '无标题';

        // 获取图标（优先取 rel="icon"，其次 rel="shortcut icon"）
        const iconLink = doc.querySelector('link[rel="icon"]') || doc.querySelector('link[rel="shortcut icon"]');
        let favicon = iconLink?.getAttribute('href') || '';

        // 处理相对路径的图标 URL
        if (favicon) {
            favicon = new URL(favicon, url).href; // 转换为绝对路径
        }
        return {title, favicon};
    } catch (error) {
        console.error('获取网页信息失败:', error);
        return {title: '获取失败', favicon: ''};
    }
}