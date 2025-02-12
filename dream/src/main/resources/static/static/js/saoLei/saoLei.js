var ifStart = false;
var daAn;
var lastClickId="";
//配置数据
var row=30;
var col=30;
var sikpNum=90;
var bugNum=340;
window.onload = function () {
    /**
     * 生成一个空白的扫雷页面
     */
    addSL_Z(row,col,bugNum,sikpNum);
    /**
     * 确认，并开始新的对局
     */
    $("#okBtn").on("click", function() {
        ifStart=false;
        //隐藏确实提示框
        $(".tipDiv").css("display","none");
        //生成一个空白的扫雷页面
        addSL_Z(row,col,bugNum,sikpNum);
    });
}


function generateArray(i, j, n) {
    // 创建一个 i 行 j 列的二维数组，并初始化所有位置为 0
    const array = Array.from({
        length : i
    }, () => Array(j).fill(0));


    // 计算二维数组的总元素数量
    const totalElements = i * j;


    // 确保 n 不超过数组的总元素数量
    if (n > totalElements) {
        console.error('n 不能大于数组的总元素数量');
        return array;
    }


    // 生成一个包含所有索引的数组
    const indices = Array.from({
        length : totalElements
    }, (_, index) => index);


    // 随机打乱索引数组
    for (let k = indices.length - 1; k > 0; k--) {
        const randomIndex = Math.floor(Math.random() * (k + 1));
        [indices[k], indices[randomIndex]] = [ indices[randomIndex], indices[k] ];
    }


    // 取前 n 个索引，并将对应位置设置为 -1
    for (let k = 0; k < n; k++) {
        const index = indices[k];
        const row = Math.floor(index / j);
        const col = index % j;
        array[row][col] = -1;
    }
    return array;
}


function create(i, j, n){
    let array = generateArray(i, j, n);
    for(let m=0;m<i;m++){
        for(let n=0;n<j;n++){
            let num=0;
            if(array[m][n]==-1){
                continue;
            }
            if(array[m-1]&&array[m-1][n-1]&&array[m-1][n-1]==-1){
                num++;
            }
            if(array[m-1]&&array[m-1][n]&&array[m-1][n]==-1){
                num++;
            }
            if(array[m-1]&&array[m-1][n+1]&&array[m-1][n+1]==-1){
                num++;
            }
            if(array[m]&&array[m][n-1]&&array[m][n-1]==-1){
                num++;
            }
            if(array[m]&&array[m][n+1]&&array[m][n+1]==-1){
                num++;
            }
            if(array[m+1]&&array[m+1][n-1]&&array[m+1][n-1]==-1){
                num++;
            }
            if(array[m+1]&&array[m+1][n]&&array[m+1][n]==-1){
                num++;
            }
            if(array[m+1]&&array[m+1][n+1]&&array[m+1][n+1]==-1){
                num++;
            }
            array[m][n]=num;
        }
    }
//	console.log(array);
    return array;
}


// x,y
function start(a=50,b=50,c=999,x=26,y=9){
    let start = performance.now(); // 获取开始时间
    daAn=create(a,b,c);
    let count=1;
    while(daAn[x][y]!=0){
        count++;
        daAn=create(a,b,c);
    }
    let end = performance.now(); // 获取结束时间
    let time = end - start; // 计算运行时间
    console.log("someFunction 运行时间: " + time + " 毫秒");
    console.log(daAn);
    console.log("生成了"+count+"次");
}

function  start_new(m,n,x,ok_num){
    let start = performance.now(); // 获取开始时间
    daAn=create(m,n,x);
    let count=1;
    while(count<=ok_num){
        //生产一个1-(m*n)的随机数
        let a=Math.floor(Math.random()*(m*n))+1;
        let index=getIndexOfNthElement(daAn,a);
        if(index!=null) {
            let i = parseInt(index.split("_")[0]);
            let j = parseInt(index.split("_")[1]);
            if (daAn[i][j] != -1) {
                count++;
                $("#" + i + "_" + j).click();
            }
        }
    }
    let end = performance.now(); // 获取结束时间
    let time = end - start; // 计算运行时间
    ifStart=true;
    for(let i=0; i<m; i++){
        for(let j = 0; j<n; j++) {
            $("#"+i+"_"+j).attr("data-value",daAn[i][j]);
        }
    }
    console.log("someFunction 运行时间: " + time + " 毫秒");
    console.log(daAn);
}
//获取一个二维数组中第n个元素的下标,返回格式为i_j
function getIndexOfNthElement(matrix, n) {
    let count = 0;

    for (let i = 0; i < matrix.length; i++) {
        for (let j = 0; j < matrix[i].length; j++) {
            if (count === n) {
                return `${i}_${j}`;
            }
            count++;
        }
    }
    return null; // 如果n超过数组的元素个数，返回null
}

function  addSL_Z(m,n,x,ok_num){
    let html="";
    for(let i=0; i<m; i++){
        for(let j = 0; j<n; j++) {
            if(!ifStart) {
                html += "<div class='sl_div' id=" + i + "_" + j + "></div>";
            }else {
                html += "<div class='sl_div' id=" + i + "_" + j + ">daAn[i][j]</div>";
            }
        }
    }
    $("#saoLeiCanvas").css("width",m*38+1+"px");
    $("#saoLeiCanvas").css("height",n*38+"px");
    $("#saoLeiCanvas").empty();
    $("#saoLeiCanvas").append(html);

    let clickTimer = null;
    //鼠标左键点击监听
    $(".sl_div").on("click",function(){
        if (clickTimer !== null&&$(this).attr("id")==lastClickId){
            clearTimeout(clickTimer);
            clickTimer = null;
        } else {
            clickTimer = setTimeout(() => {
                if($(this).hasClass("active")){
                    return;
                }
                if($(this).hasClass("flag")){
                    return;
                }
                let value=parseInt($(this).data('value'));
                let a=parseInt($(this).attr("id").split("_")[0]);
                let b=parseInt($(this).attr("id").split("_")[1]);
                if(!ifStart){
                    // start(m,n,x,a,b);
                    ifStart=true;
                    for(let i=0; i<m; i++){
                        for(let j = 0; j<n; j++) {
                            $("#"+i+"_"+j).attr("data-value",daAn[i][j]);
                        }
                    }
                    $(this).addClass("active");
                    value=parseInt($(this).data('value'));
                    if(value!=0) {
                        $(this).html(value);
                    }
                }else{
                    if(value==-1){
                        $(this).addClass("bug");
                        $(this).append(`<?xml version="1.0" encoding="UTF-8"?><svg width="24" height="24" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M24 42C36 42 38 31.5324 38 28C38 24.8379 38 20.1712 38 14H10C10 17.4423 10 22.109 10 28C10 31.4506 12 42 24 42Z" fill="#ff0000" stroke="#333" stroke-width="4" stroke-linejoin="round"/><path d="M4 8L10 14" stroke="#333" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M44 8L38 14" stroke="#333" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M4 27H10" stroke="#333" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M44 27H38" stroke="#333" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M7 44L13 38" stroke="#333" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M41 44L35 38" stroke="#333" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M24 42V14" stroke="#333" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M14.9204 39.0407C17.0024 40.783 19.9244 41.9998 23.9999 41.9998C28.1112 41.9998 31.0487 40.7712 33.1341 39.0137" stroke="#333" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M32 12.3333C32 7.73096 28.4183 4 24 4C19.5817 4 16 7.73096 16 12.3333V14H32V12.3333Z" fill="#ff0000" stroke="#333" stroke-width="4" stroke-linejoin="round"/></svg>`);
                        $(".tipDiv").css("display","flex");
                        $("#resultInfo").html("抱歉，你被炸到了！");
                        return;
                    }
                    $(this).addClass("active");
                    if(value!=0) {
                        $(this).html(value);
                    }
                    //如果周围为0，则翻开,直到周围不为0
                }
                value=parseInt($(this).data('value'));
                if(value==0) {
                    openOther($(this).attr("id"));
                }
                clickTimer = null;
            }, 300);  // 设置一个300毫秒的延迟来区分单击和双击
        }
        lastClickId=$(this).attr("id");
    });
    //鼠标右键点击监听
    $(".sl_div").on("contextmenu",function(event){
        event.preventDefault(); // 阻止默认的右键菜单
        if($(this).hasClass("active")){
            return;
        }else if($(this).hasClass("flag")){
            $(this).removeClass("flag");
            $(this).empty();
        }else{
            $(this).addClass("flag");
            $(this).append(`<?xml version="1.0" encoding="UTF-8"?><svg width="24" height="24" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 44H12H16" stroke="#333" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 44V4" stroke="#333" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M40 6H12V22H40L36 14L40 6Z" fill="#ff0000" stroke="#333" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>`);
        }
    });
    //鼠标双击监听
    $(".sl_div").on("dblclick",function(event){
        if (clickTimer !== null) {
            clearTimeout(clickTimer);
            clickTimer = null;
        }
        //判断当前单元格周围9个单元格是否含有
        let i=parseInt($(this).attr("id").split("_")[0]);
        let j=parseInt($(this).attr("id").split("_")[1]);
        let value=parseInt($(this).attr('data-value'));
        let nowDivId=(i-1)+"_"+(j-1);
        let flagNums=0;
        let noBugId=[];
        if($("#"+nowDivId).hasClass("flag")){
            flagNums++;
        }else if(!$("#"+nowDivId).hasClass("active")) {
            noBugId.push(nowDivId);
        }
        nowDivId=(i-1)+"_"+j;
        if($("#"+nowDivId).hasClass("flag")){
            flagNums++;
        }else if(!$("#"+nowDivId).hasClass("active")) {
            noBugId.push(nowDivId);
        }
        nowDivId=(i-1)+"_"+(j+1);
        if($("#"+nowDivId).hasClass("flag")){
            flagNums++;
        }else if(!$("#"+nowDivId).hasClass("active")) {
            noBugId.push(nowDivId);
        }
        nowDivId=i+"_"+(j-1);
        if($("#"+nowDivId).hasClass("flag")){
            flagNums++;
        }else if(!$("#"+nowDivId).hasClass("active")) {
            noBugId.push(nowDivId);
        }
        nowDivId=i+"_"+(j+1);
        if($("#"+nowDivId).hasClass("flag")){
            flagNums++;
        }else if(!$("#"+nowDivId).hasClass("active")) {
            noBugId.push(nowDivId);
        }
        nowDivId=(i+1)+"_"+(j-1);
        if($("#"+nowDivId).hasClass("flag")){
            flagNums++;
        }else if(!$("#"+nowDivId).hasClass("active")) {
            noBugId.push(nowDivId);
        }
        nowDivId=(i+1)+"_"+j;
        if($("#"+nowDivId).hasClass("flag")){
            flagNums++;
        }else if(!$("#"+nowDivId).hasClass("active")) {
            noBugId.push(nowDivId);
        }
        nowDivId=(i+1)+"_"+(j+1);
        if($("#"+nowDivId).hasClass("flag")){
            flagNums++;
        }else if(!$("#"+nowDivId).hasClass("active")) {
            noBugId.push(nowDivId);
        }
        if(flagNums==value){
            //如果周围有相同数量，则全部选中
            for(let i=0;i<noBugId.length;i++){
                $("#"+noBugId[i]).click();
            }
        }
    });
    //加载初始空缺
    start_new(m,n,x,ok_num);
}

function openOther(id){
    let i=parseInt($("#"+id).attr("id").split("_")[0]);
    let j=parseInt($("#"+id).attr("id").split("_")[1]);
    let nowDivId=(i-1)+"_"+(j-1);
    // let value=parseInt($("#"+nowDivId).data('value'));
    commonOption(nowDivId);
    nowDivId=(i-1)+"_"+j;
    commonOption(nowDivId);
    nowDivId=(i-1)+"_"+(j+1);
    commonOption(nowDivId);
    nowDivId=i+"_"+(j-1);
    commonOption(nowDivId);
    nowDivId=i+"_"+(j+1);
    commonOption(nowDivId);
    nowDivId=(i+1)+"_"+(j-1);
    commonOption(nowDivId);
    nowDivId=(i+1)+"_"+j;
    commonOption(nowDivId);
    nowDivId=(i+1)+"_"+(j+1);
    commonOption(nowDivId);
}

function  commonOption(nowDivId){
    let value=parseInt($("#"+nowDivId).data('value'));
    if(value==0){
        if(!$("#"+nowDivId).hasClass("active")){
            $("#"+nowDivId).addClass("active");
            openOther(nowDivId);
        }
    }else {
        $("#"+nowDivId).addClass("active");
        $("#"+nowDivId).html(value);
    }
}

