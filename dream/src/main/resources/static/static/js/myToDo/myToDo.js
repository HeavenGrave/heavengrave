//http://localhost:8080/myToDo?userId=1
var nowUserId = 1;
var nowToDay = formatDate(new Date(),"yyyy-MM-dd");
var ifAddClickFinish = false;
var nowType="MONTH";//月
var nowCheckYear=2024;
var nowCheckMonth=12;
var nowCheckDay=1;
window.onload = function() {
    // 计算时间差生成当月日历, 并加载数据
    nowCheckYear=parseInt(formatDate( new Date(),"yyyy" ));
    nowCheckMonth=parseInt(formatDate( new Date(),"MM" ));
    nowCheckDay=parseInt(formatDate( new Date(),"dd" ));
    //生成日历页面
    createDayPage();
    nowUserId = parseInt(getParameterByName('userId'));
    //加载我的待办
    loadMyToDo();
}

function createDayPage() {
    //展示当前年月信息
    $("#timeText").html(nowCheckYear+"年"+nowCheckMonth+"月");
    // 创建一个新的Date对象
    let nowMonthOneDay = new Date(nowCheckYear +"-" + nowCheckMonth + "-01");
    // 使用自定义函数格式化日期
    let startDay = nowMonthOneDay.getDay()==0?6:nowMonthOneDay.getDay()-1;
    // 清除之前的日期
    $(".dayDiv").empty();
    // 生成空白日期
    for (let i = 0; i < startDay; i++) {
        let html = '<div class=""></div>';
        $(".dayDiv").append(html);
    }
    let dayNumber = getDaysInCurrentMonth(nowMonthOneDay);//获取当前月有多少天
    let nowYearAndMonth = formatDate(new Date(),"yyyy-MM-");
    for (let i = 1; i <=dayNumber; i++) {
        let value = nowYearAndMonth+i;
        if(i<10){
            value = nowYearAndMonth+'0'+i;
        }
        if(i==nowCheckDay){
            let html = '<div class="dayCell dayActive" data-value="'+value+'">'+i+'</div>';
            $(".dayDiv").append(html);
        }else {
            let html = '<div class="dayCell" data-value="'+value+'">'+i+'</div>';
            $(".dayDiv").append(html);
        }
    }
}

$(".dayType").on("click",".typeCell",function () {
    if(!$(this).hasClass("typeActive")){
        $(".typeActive").removeClass("typeActive");
        $(this).addClass("typeActive");
        let nowId = $(this).attr("id");
        if (nowId==="trash"){
            $(".dayShow").css("display","none");
            $(".weekDiv").css("display","none");
            $(".dayDiv").css("display","none");
            $(".toDoShow").css("display","none");
            $(".listToDoShow").css("display","none");
            $(".deleteToDoShow").css("display","flex");
            //加载我删除的代办
            loadDeleteToDo();
        }else if (nowId==="calendar"){
            $(".dayShow").css("display","flex");
            $(".weekDiv").css("display","grid");
            $(".dayDiv").css("display","grid");
            $(".toDoShow").css("display","flex");
            $(".listToDoShow").css("display","none");
            $(".deleteToDoShow").css("display","none");
            //加载我的待办
            loadMyToDo();
        }else if (nowId==="nowList"){//当前所有的代办
            $(".dayShow").css("display","none");
            $(".weekDiv").css("display","none");
            $(".dayDiv").css("display","none");
            $(".toDoShow").css("display","none");
            $(".deleteToDoShow").css("display","none");
            $(".listToDoShow").css("display","flex");
            //根据实际排序将完成的待办放前面
            loadToDoList();
        }
    }
});



function loadDeleteToDo() {
    addLoading();
    axios.get('/todo/showMyToDo?userId='+nowUserId+'&ifShow='+false)
        .then(res => {
            removeLoading();
            console.log(res);
            console.log(res.data);
            if(res.status===200){
                let nowMyToDoList = res.data.data;
                console.log(nowMyToDoList);
                //清空之前的数据
                $(".deleteToDoShow").empty();
                for (let i = 0; i < nowMyToDoList.length; i++) {
                    let nowToDo = nowMyToDoList[i];
                    let html='<div class="toDoCell" id="'+nowToDo.id+'">';
                    if(nowToDo.ifFinish){
                        html+= '<input type="checkbox" class="checkBtn" checked disabled>';
                        html+= '<div class="toDoContent active completed">'+nowToDo.info;
                    }else{
                        html+= '<input type="checkbox" class="checkBtn" disabled>';
                        html+= '<div class="toDoContent active">'+nowToDo.info;
                    }
                    html+= '</div>  <input  class="toDoInput"  value="'+nowToDo.info+'" /> ';
                    html+=`<div  class="toDoRestoreBtn" style="display:flex;">
                                <?xml version="1.0" encoding="UTF-8"?><svg width="22" height="22" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11.2721 36.7279C14.5294 39.9853 19.0294 42 24 42C33.9411 42 42 33.9411 42 24C42 14.0589 33.9411 6 24 6C19.0294 6 14.5294 8.01472 11.2721 11.2721C9.61407 12.9301 6 17 6 17" stroke="#000000" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M6 9V17H14" stroke="#000000" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>
                                 </div>
                    </div>`;
                    $(".deleteToDoShow").append(html);
                }
            }
        })
        .catch(error => {
            removeLoading();
            alert("保存我的文档时产生未知的异常" +error);
        });
}

$(".dayShow").on("click",".dayChange",function () {
    let nowDivId=$(this).attr("id");
    if(nowDivId=="nextMonth"){
        let nowMonth = nowCheckMonth+1;
        if(nowMonth>12){
            nowCheckMonth=1;
            nowCheckYear=nowCheckYear+1;
        }else{
            nowCheckMonth=nowMonth;
        }
        updatePageInfo();
    }else if(nowDivId=="nextYear"){
        nowCheckYear=nowCheckYear+1;
        updatePageInfo();
    }else if(nowDivId=="beforeYear"){
        nowCheckYear=nowCheckYear-1;
        updatePageInfo();
    }else if(nowDivId=="beforeMonth"){
        let nowMonth = nowCheckMonth-1;
        if(nowMonth==0){
            nowCheckMonth=12;
            nowCheckYear=nowCheckYear-1;
        }else{
            nowCheckMonth=nowMonth;
        }
        updatePageInfo();
    }
});

function updatePageInfo() {
    createDayPage();
    nowToDay=nowCheckYear+"-"+nowCheckMonth+"-"+nowCheckDay;
    //加载我的待办
    loadMyToDo();
}

/**
 * 获取传入日期所在月有多少天
 * @returns {number}
 */
function getDaysInCurrentMonth(currentDate) {
    let currentYear = currentDate.getFullYear();
    let currentMonth = currentDate.getMonth();
    // 创建一个代表下个月第一天的日期对象
    let nextMonthFirstDay = new Date(currentYear, currentMonth + 1, 1);
    // 将日期减去1天，得到当前月的最后一天
    let lastDayOfCurrentMonth = new Date(nextMonthFirstDay - 1);
    return lastDayOfCurrentMonth.getDate();
}

/**
 * 格式化日期
 * @param date
 * @param format
 * @returns {*}
 */
function formatDate(date, format) {
    let year = date.getFullYear();
    let month = (date.getMonth() + 1).toString().padStart(2, '0'); // 月份从0开始，需要加1
    let day = date.getDate().toString().padStart(2, '0');
    let hours = date.getHours().toString().padStart(2, '0');
    let minutes = date.getMinutes().toString().padStart(2, '0');
    let seconds = date.getSeconds().toString().padStart(2, '0');
    return format
        .replace(/yyyy/g, year)
        .replace(/MM/g, month)
        .replace(/dd/g, day)
        .replace(/hh/g, hours)
        .replace(/mm/g, minutes)
        .replace(/ss/g, seconds);
}

function addLoading() {
   $(".loading").css("display","block");
}
function removeLoading() {
    $(".loading").css("display","none");
}
function loadMyToDo() {
    addLoading();
    axios.get('/todo/showMyToDo?userId='+nowUserId+'&ifShow='+true+'&startDay='+nowToDay+'&endDay='+nowToDay)
        .then(res => {
            removeLoading();
            console.log(res);
            console.log(res.data);
            if(res.status===200){
                let info = res.data;
                let nowMyToDoList = info.data;
                console.log(nowMyToDoList);
                //清空之前的数据
                $(".toDoShow").empty();
                for (let i = 0; i < nowMyToDoList.length; i++) {
                    let nowToDo = nowMyToDoList[i];
                    let html='<div class="toDoCell" id="'+nowToDo.id+'">';
                    if(nowToDo.ifFinish){
                        html+= '<input type="checkbox" class="checkBtn" checked>';
                        html+= '<div class="toDoContent active completed">'+nowToDo.info;
                    }else{
                        html+= '<input type="checkbox" class="checkBtn">';
                        html+= '<div class="toDoContent active">'+nowToDo.info;
                    }
                    html+= '</div>  <input  class="toDoInput"     value="'+nowToDo.info+'" /> ';
                    // html+= '</div>  <textarea  class="toDoInput" rows="5"   value="">'+nowToDo.info+'</textarea>';
                    if(nowToDo.ifFinish){
                         html+= '<div  class="toDoEditBtn" style="display:none;">';
                    }else{
                         html+= '<div class="toDoEditBtn" >';
                    }
                    html+=`<?xml version="1.0" encoding="UTF-8"?>
                                <svg width="22" height="22" viewBox="0 0 48 48" fill="none"
                                     xmlns="http://www.w3.org/2000/svg">
                                    <path d="M7 42H43" stroke="#333" stroke-width="4" stroke-linecap="round"
                                          stroke-linejoin="round"/>
                                    <path d="M11 26.7199V34H18.3172L39 13.3081L31.6951 6L11 26.7199Z" fill="#333"
                                          stroke="#333" stroke-width="4" stroke-linejoin="round"/>
                                </svg>
                            </div>
                            <div  class="toDoDelBtn" style="display:flex;">
                                <?xml version="1.0" encoding="UTF-8"?><svg width="22" height="22" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15 12L16.2 5H31.8L33 12" stroke="#000000" stroke-width="4" stroke-linejoin="round"/><path d="M6 12H42" stroke="#000000" stroke-width="4" stroke-linecap="round"/><path fill-rule="evenodd" clip-rule="evenodd" d="M37 12L35 43H13L11 12H37Z" fill="#ff0000" stroke="#000000" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M19 35H29" stroke="#000000" stroke-width="4" stroke-linecap="round"/></svg> </div>
                            <div style="" class="toDoOkBtn">
                                <?xml version="1.0" encoding="UTF-8"?>
                                <svg width="22" height="22" viewBox="0 0 48 48" fill="none"
                                     xmlns="http://www.w3.org/2000/svg">
                                    <path fill-rule="evenodd" clip-rule="evenodd"
                                          d="M4 24L9 19L19 29L39 9L44 14L19 39L4 24Z" fill="#333" stroke="#333"
                                          stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                            </div>
                    </div>`;
                    $(".toDoShow").append(html);
                }
                addNewToDo();
                if(!ifAddClickFinish){
                    ifAddClickFinish = true;
                    //添加点击事件
                    addBtnClick();
                }
            }
        })
        .catch(error => {
            removeLoading();
            console.error('查询失败:', error);
        });
}
/**
 * 添加按钮点击监听事件
 * */
function addBtnClick() {
    //点击勾选按钮
    $(".toDoShow").on("click",".checkBtn",function() {
        if($(this).parent().find(".active").hasClass("toDoContent")) {
            $(this).parent().find(".toDoContent").toggleClass("completed");
            let nowToDoId = $(this).parent().attr("id");
            let ifFinish= $(this).prop("checked");
            if (nowToDoId != "") {
                //更新数据
                axios.put('/todo/updateToDoStatus','myToDoId='+ nowToDoId+'&ifFinish='+ifFinish)
                    .then(res => {
                        console.log(res);
                        console.log(res.data);
                        if(res.status===200){
                            console.error('更新todo成功:', error);
                        }
                    })
                    .catch(error => {
                        console.error('更新todo失败:', error);
                    });
            }
            if(ifFinish){
                $(this).parent().find(".toDoEditBtn").css("display","none");
            }else{
                $(this).parent().find(".toDoEditBtn").css("display","flex");
            }
        }else{
            alert('当前代办正在编辑中。。。 ');
            $(this).prop("checked", false);
        }
    });
    //点击编辑按钮
    $(".toDoShow").on("click",".toDoEditBtn",function() {
        let nowInfo = $(this).parent().find(".toDoContent").html();
        if($(this).parent().find(".active").hasClass("toDoContent")){
            $(this).parent().find(".active").removeClass("active");
            $(this).parent().find(".toDoInput").addClass("active");
            $(this).parent().find(".toDoDelBtn").css("display","none");
            $(this).parent().find(".toDoEditBtn").css("display","none");
            $(this).parent().find(".toDoOkBtn").css("display","flex");
        }
        // if(nowInfo != ""){
        //     $(this).parent().find(".toDoContent").html(nowInfo);
        // }
    });
    //点击完成按钮
    $(".toDoShow").on("click",".toDoOkBtn",function() {
        let nowInfo = $(this).parent().find(".toDoInput").val();
        if($(this).parent().find(".active").hasClass("toDoInput")){
            $(this).parent().find(".active").removeClass("active");
            $(this).parent().find(".toDoContent").addClass("active");
            $(this).parent().find(".toDoOkBtn").css("display","none");
            $(this).parent().find(".toDoEditBtn").css("display","flex");
        }else{
            return;
        }
        if(nowInfo != "") {
            $(this).parent().find(".toDoDelBtn").css("display","flex");//展示删除按钮
            $(this).parent().find(".toDoContent").html(nowInfo);
            let nowToDoId = $(this).parent().attr("id");
            let toDoCellDiv = $(this).parent();
            if (nowToDoId == "") {
                //新增数据
                axios.post('/todo/addToDo','userId='+nowUserId+'&info='+nowInfo+'&toDay='+nowToDay)
                    .then(res => {
                        console.log(res);
                        console.log(res.data);
                        if(res.status===200){
                            let info=res.data;
                            let nowMyToDo = info.data;
                            console.log(nowMyToDo);
                            toDoCellDiv.attr("id", nowMyToDo.id);
                            toDoCellDiv.find(".toDoDelBtn").css("display","flex");
                            addNewToDo();
                        }
                    })
                    .catch(error => {
                        console.error('登录失败:', error);
                    });
            } else {
                //更新数据
                axios.put('/todo/updateToDo','myToDoId='+ parseInt(nowToDoId+"")+'&info='+nowInfo)
                    .then(res => {
                        console.log(res);
                        console.log(res.data);
                        if(res.status===200){
                            console.error('更新todo成功:', error);
                        }
                    })
                    .catch(error => {
                        console.error('更新todo失败:', error);
                    });
            }
        }
    });
    //点击删除按钮
    $(".toDoShow").on("click",".toDoDelBtn",function() {
        let nowToDoId = $(this).parent().attr("id");
        if(nowToDoId != ""){
            let toDoCellDiv = $(this).parent();
            axios.post('/todo/updateToDoIfShow','myToDoId='+ parseInt(nowToDoId+"")+'&ifShow='+false)
                .then(res => {
                    console.log(res);
                    console.log(res.data);
                    if(res.status===200){
                        toDoCellDiv.remove();
                    }
                })
                .catch(error => {
                    console.error('更新todo失败:', error);
                });
        }
    });
    //点击恢复按钮
    $(".deleteToDoShow").on("click",".toDoRestoreBtn",function() {
        let nowToDoId = $(this).parent().attr("id");
        if(nowToDoId != ""){
            let toDoCellDiv = $(this).parent();
            axios.post('/todo/updateToDoIfShow','myToDoId='+ parseInt(nowToDoId+"")+'&ifShow='+true)
                .then(res => {
                    console.log(res);
                    console.log(res.data);
                    if(res.status===200){
                        toDoCellDiv.remove();
                    }
                })
                .catch(error => {
                    console.error('更新todo失败:', error);
                });
        }
    });
    //点击日期
    $(".dayDiv").on("click",".dayCell",function() {
        let nowDay = $(this).attr("data-value");
        $(".dayActive").removeClass("dayActive");
        $(this).addClass("dayActive");
        nowCheckDay=parseInt($(this).html());
        console.log(nowDay);
        nowToDay = nowDay;
        //根据当前选中日期加载代办数据
        loadMyToDo();
    });


    //点击编辑按钮
    $(".listToDoShow").on("click",".toDoEditBtn",function() {
        let nowInfo = $(this).parent().find(".toDoContent").html();
        if($(this).parent().find(".active").hasClass("toDoContent")){
            $(this).parent().find(".active").removeClass("active");
            $(this).parent().find(".toDoInput").addClass("active");
            $(this).parent().find(".toDoDelBtn").css("display","none");
            $(this).parent().find(".toDoEditBtn").css("display","none");
            $(this).parent().find(".toDoOkBtn").css("display","flex");
        }
        // if(nowInfo != ""){
        //     $(this).parent().find(".toDoContent").html(nowInfo);
        // }
    });
    //点击删除按钮
    $(".listToDoShow").on("click",".toDoDelBtn",function() {
        let nowToDoId = $(this).parent().attr("id");
        if(nowToDoId != ""){
            let toDoCellDiv = $(this).parent();
            axios.post('/todo/updateToDoIfShow','myToDoId='+ parseInt(nowToDoId+"")+'&ifShow='+false)
                .then(res => {
                    console.log(res);
                    console.log(res.data);
                    if(res.status===200){
                        toDoCellDiv.remove();
                    }
                })
                .catch(error => {
                    console.error('更新todo失败:', error);
                });
        }
    });
    //点击完成按钮
    $(".listToDoShow").on("click",".toDoOkBtn",function() {
        let nowInfo = $(this).parent().find(".toDoInput").val();
        if($(this).parent().find(".active").hasClass("toDoInput")){
            $(this).parent().find(".active").removeClass("active");
            $(this).parent().find(".toDoContent").addClass("active");
            $(this).parent().find(".toDoOkBtn").css("display","none");
            $(this).parent().find(".toDoEditBtn").css("display","flex");
        }else{
            return;
        }
        if(nowInfo !== "") {
            $(this).parent().find(".toDoDelBtn").css("display","flex");//展示删除按钮
            $(this).parent().find(".toDoContent").html(nowInfo);
            let nowToDoId = $(this).parent().attr("id");
            let toDoCellDiv = $(this).parent();
            if (nowToDoId === "") {
                //新增数据
                axios.post('/todo/addToDo','userId='+nowUserId+'&info='+nowInfo+'&toDay='+nowToDay)
                    .then(res => {
                        console.log(res);
                        console.log(res.data);
                        if(res.status===200){
                            let info=res.data;
                            let nowMyToDo = info.data;
                            console.log(nowMyToDo);
                            toDoCellDiv.attr("id", nowMyToDo.id);
                            toDoCellDiv.find(".toDoDelBtn").css("display","flex");
                            addNewToDo();
                        }
                    })
                    .catch(error => {
                        console.error('登录失败:', error);
                    });
            } else {
                //更新数据
                axios.put('/todo/updateToDo','myToDoId='+ parseInt(nowToDoId+"")+'&info='+nowInfo)
                    .then(res => {
                        console.log(res);
                        console.log(res.data);
                        if(res.status===200){
                            console.error('更新todo成功:', error);
                        }
                    })
                    .catch(error => {
                        console.error('更新todo失败:', error);
                    });
            }
        }
    });
}

/**
 * 移除按钮点击监听
 */
function closeBtnClick() {
    $(".checkBtn").off("click");
    $(".toDoEditBtn").off("click");
    $(".toDoOkBtn").off("click");
}

function addNewToDo() {
    let html=`<div class="toDoCell" id="">
                <input type="checkbox" class="checkBtn">
                <div style=" " class="toDoContent active">
                </div>
                <input class="toDoInput"   />
<!--                <textarea class="toDoInput" rows="5" ></textarea>-->
                <div style="" class="toDoEditBtn">
                    <?xml version="1.0" encoding="UTF-8"?><svg width="22" height="22" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7 42H43" stroke="#333" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M11 26.7199V34H18.3172L39 13.3081L31.6951 6L11 26.7199Z" fill="#333" stroke="#333" stroke-width="4" stroke-linejoin="round"/></svg>
                </div>
                 <div style="" class="toDoDelBtn">
                               <?xml version="1.0" encoding="UTF-8"?><svg width="22" height="22" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15 12L16.2 5H31.8L33 12" stroke="#000000" stroke-width="4" stroke-linejoin="round"/><path d="M6 12H42" stroke="#000000" stroke-width="4" stroke-linecap="round"/><path fill-rule="evenodd" clip-rule="evenodd" d="M37 12L35 43H13L11 12H37Z" fill="#ff0000" stroke="#000000" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M19 35H29" stroke="#000000" stroke-width="4" stroke-linecap="round"/></svg>           </div>
                <div style="" class="toDoOkBtn">
                    <?xml version="1.0" encoding="UTF-8"?><svg width="22" height="22" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M4 24L9 19L19 29L39 9L44 14L19 39L4 24Z" fill="#333" stroke="#333" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </div>
            </div>`;
    $(".toDoShow").append(html);
    // closeBtnClick();
    // addBtnClick();
}

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


function loadToDoList(){
    addLoading();
    axios.get('/todo/getToDoList?userId='+nowUserId+'&ifShow='+true)
        .then(res => {
            removeLoading();
            console.log(res);
            console.log(res.data);
            if(res.status===200){
                let info = res.data;
                let nowMyToDoList = info.data;
                //清空之前的数据
                $(".listToDoShow").empty();
                //根据ctime和ifFinish排序
                nowMyToDoList.sort(function(a,b){
                    if(a.ifFinish===b.ifFinish){
                        return new Date(b.ctime)-new Date(a.ctime);
                    }else {
                        if(a.ifFinish===true){
                            return 1;
                        }else{
                            return -1;
                        }
                    }
                })
                for (let i = 0; i < nowMyToDoList.length; i++) {
                    let nowToDo = nowMyToDoList[i];
                    let html='<div class="toDoCell" id="'+nowToDo.id+'">';
                    if(nowToDo.ifFinish){
                        html+= '<input type="checkbox" class="checkBtn" checked>';
                        html+= '<div class="toDoContent active completed">'+nowToDo.info;
                    }else{
                        html+= '<input type="checkbox" class="checkBtn">';
                        html+= '<div class="toDoContent active">'+nowToDo.info;
                    }
                    html+= '</div>  <input  class="toDoInput"     value="'+nowToDo.info+'" /> ';
                    // html+= '</div>  <textarea  class="toDoInput" rows="5"   value="">'+nowToDo.info+'</textarea>';
                    if(nowToDo.ifFinish){
                        html+= '<div  class="toDoEditBtn" style="display:none;">';
                    }else{
                        html+= '<div class="toDoEditBtn" >';
                    }
                    html+=`<?xml version="1.0" encoding="UTF-8"?>
                                <svg width="22" height="22" viewBox="0 0 48 48" fill="none"
                                     xmlns="http://www.w3.org/2000/svg">
                                    <path d="M7 42H43" stroke="#333" stroke-width="4" stroke-linecap="round"
                                          stroke-linejoin="round"/>
                                    <path d="M11 26.7199V34H18.3172L39 13.3081L31.6951 6L11 26.7199Z" fill="#333"
                                          stroke="#333" stroke-width="4" stroke-linejoin="round"/>
                                </svg>
                            </div>
                            <div  class="toDoDelBtn" style="display:flex;">
                                <?xml version="1.0" encoding="UTF-8"?><svg width="22" height="22" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15 12L16.2 5H31.8L33 12" stroke="#000000" stroke-width="4" stroke-linejoin="round"/><path d="M6 12H42" stroke="#000000" stroke-width="4" stroke-linecap="round"/><path fill-rule="evenodd" clip-rule="evenodd" d="M37 12L35 43H13L11 12H37Z" fill="#ff0000" stroke="#000000" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M19 35H29" stroke="#000000" stroke-width="4" stroke-linecap="round"/></svg> </div>
                            <div style="" class="toDoOkBtn">
                                <?xml version="1.0" encoding="UTF-8"?>
                                <svg width="22" height="22" viewBox="0 0 48 48" fill="none"
                                     xmlns="http://www.w3.org/2000/svg">
                                    <path fill-rule="evenodd" clip-rule="evenodd"
                                          d="M4 24L9 19L19 29L39 9L44 14L19 39L4 24Z" fill="#333" stroke="#333"
                                          stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                            </div>
                    </div>`;
                    $(".listToDoShow").append(html);
                }
                addNewToDo();
                if(!ifAddClickFinish){
                    ifAddClickFinish = true;
                    //添加点击事件
                    addBtnClick();
                }
            }
        })
        .catch(error => {
            removeLoading();
            console.error('查询失败:', error);
        });
}