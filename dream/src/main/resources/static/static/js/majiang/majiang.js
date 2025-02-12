//游戏开始
var stompClient;
window.onload = function() {
    const socket = new SockJS('http://localhost:8099/stomp-websocket');
    stompClient = Stomp.over(socket);
    // 连接成功后的回调
    stompClient.connect({}, () => {
        stompClient.subscribe('/topic/messages', (response) => {
            // console.log('收到 JSON 对象:', JSON.parse(response.body))
            let jsonData = JSON.parse(response.body);
            let info = jsonData;
            if(jsonData.received) {
                // 1. 提取 received 字段
                let base64String = jsonData.received;
                // 2. 解码 Base64 字符串
                let decodedString = atob(base64String); // 输出: {"key":"value","list":[1,2,3]}
                // 3. 解析为 JSON 对象
                info = JSON.parse(decodedString);
            }
            console.log(info);
            switch (info.type) { //当前操作类型
                case 'addGame': //加入游戏
                    addGame(info);
                    break;
                case 'distributedCard': //发牌
                    distributedCard(info);
                    break;
                case "lightSan":
                    lightSan(info);
                    break;
                case "outNext":
                    outNextOne(info);
                    break;
                case "PlayerWin":
                    PlayerWin(info);
                    break;
            }
        });
        // // 发送任意 JSON 对象
        // stompClient.send('/app/sendMessage', {}, JSON.stringify({
        //     key: "value",
        //     list: [1, 2, 3]
        // }));
    });
    $("#gameInfo").html(howBig);
    var device = navigator.userAgent.toLowerCase();
    if (/ipad|iphone|midp|rv:1.2.3.4|ucweb|android|windows ce|windows mobile/.test(device)) {
        //移动端
        // alert("手机端");
        console.log("手机端");
        //加载一套移动端css
    } else {
        //pc端
        console.log("PC端");
    }
}
/**
 * 创建游戏
 */
$("#createGame").on("click", function() {
    if($(".createGameDiv").css("display")==="none"){
        $(".createGameDiv").css("display","flex");
    }else {
        $(".createGameDiv").css("display","none");
    }
})
/**
 * 根据选择人数创建游戏
 */
$(".createGame").on("click", function() {
    let num=$(this).data("num");
    $(".createGameDiv").css("display","none");
    axios.post('/mj/create', 'userNum='+parseInt(num))
        .then(res => {
            console.log(res);
            console.log(res.data);
            if (res.status===200) {
                let info = res.data.data;
                //返回主页隐藏  退出房间显示
                $("#exitPage").css("display", "none");
                $("#exitGame").css("display", "block");
                //在右上角显示房间号
                $("#roomDiv").css("display", "flex");
                $("#thisRoomId").html(info.roomId);
                //记录当前房间id
                roomId = info.roomId;
                //记录当前用户编号
                myNum = 1;
                // 加载用户名  加载准备哆啦爱梦图标
                //隐藏创建游戏按钮
                $("#createDiv").css("display", "none");
                //展示准备人数，以及开始按钮
                $("#gameShowDiv").css("display", "flex");
                $("#playerTotal").html(info.maJiang.nowNum);
                //给玩家排桌次
                addPlayerName(info.maJiang);
                //获取当前用户名称
                myName = info.maJiang.createUserName;
            } else {
                alert("创建房间失败! <br>(请重新登录后,尝试再次创建..)");
            }
        })
        .catch(error => {
            console.error('创建失败:', error);
            alert("创建游戏时产生未知的异常" + error);
        });
})
//加入游戏
$("#addGame").on("click", function() {
    let nowRoomId = $("#roomId").val();
    if (nowRoomId === "") {
        alert("请先输入房间号！");
    } else {
        // axios.post('/mj/add','roomId='+nowRoomId)
        //     .then(res => {
        //         console.log(res);
        //         console.log(res.data);
        //         if (res.status===200) {
        //             let info = res.data.data;
        //             if(info.type==="addGameError"){
        //                 alert("当前房间人数已满,等下一局吧！");
        //                 return;
        //             }
        //             //返回主页隐藏  退出房间显示
        //             $("#exitPage").css("display", "none");
        //             $("#exitGame").css("display", "block");
        //             //展示当前加入的房间号
        //             $("#roomDiv").css("display", "flex");
        //             $("#thisRoomId").html(info.maJiang.id);
        //             //给房间号赋值
        //             roomId = info.maJiang.id;
        //             myNum = info.maJiang.playerNum;
        //             myName = info.maJiang["player" + myNum];
        //             console.log("玩家座位号：" + myNum);
        //             console.log("玩家名称：" + myName);
        //             //隐藏创建游戏按钮
        //             $("#createDiv").css("display", "none");
        //             //展示准备人数，以及开始按钮
        //             $("#gameShowDiv").css("display", "flex");
        //             //根据游戏信息加载座位表
        //             addPlayerName(info.maJiang);
        //         } else {
        //             alert("加入失败");
        //         }
        //     })
        //     .catch(error => {
        //         console.error('加入游戏异常:', error);
        //         alert("加入游戏时产生未知的异常" + error);
        //     });
        axios.post('/mj/add','roomId='+nowRoomId)
            .then(res => {
                console.log(res);
                console.log(res.data);
                if (res.status===200) {
                    let info = res.data.data;
                    if(info.type==="addGameError"){
                        alert("当前房间人数已满,等下一局吧！");
                        return;
                    }
                    //返回主页隐藏  退出房间显示
                    $("#exitPage").css("display", "none");
                    $("#exitGame").css("display", "block");
                    //展示当前加入的房间号
                    $("#roomDiv").css("display", "flex");
                    $("#thisRoomId").html(info.maJiang.id);
                    //给房间号赋值
                    roomId = info.maJiang.id;
                    myNum = info.maJiang.playerNum;
                    myName = info.maJiang["player" + myNum];
                    console.log("玩家座位号：" + myNum);
                    console.log("玩家名称：" + myName);
                    //隐藏创建游戏按钮
                    $("#createDiv").css("display", "none");
                    //展示准备人数，以及开始按钮
                    $("#gameShowDiv").css("display", "flex");
                    //根据游戏信息加载座位表
                    addPlayerName(info.maJiang);
                } else {
                    alert("加入失败");
                }
            })
            .catch(error => {
                console.error('加入游戏异常:', error);
                alert("加入游戏时产生未知的异常" + error);
            });
    }
})
//开始游戏
$("#startGame").on("click", function() {
    if($("#startGame").attr("disabled")=="disabled"){
        return;
    }else {
        axios.put('/mj/start',"roomId="+roomId)
        .then(res => {
            console.log(res);
            console.log(res.data);
            if (res.status===200) {
                let info = res.data.data;
            } else {
                alert("加入失败");
            }
        })
        .catch(error => {
            console.error('开始游戏异常:', error);
            alert("开始游戏时产生未知的异常" + error);
        });
    }
})

/**
 * 给玩家排桌次
 */
function addPlayerName(data) {
    //我的编号为空时，代表我还未加入游戏，不需要加载其他用户信息
    if(!myNum){
        return;
    }
    //根据当前用户编号，获取当前用户视角位次数组
    let nowTableNum = tableNums[myNum];
    for (let i = 1; i <= 5; i++) {
        let name = data["player" + i]; //获取i号玩家的名称
        //当前玩家不为空(当前玩家已经加入了游戏,需要显示他的坐次)
        if (name != null && name !== "null" && name !== ""&& name !== undefined) {
            $("#player" + nowTableNum[i - 1]).data("name", name); //给座位贴名字
            $("#playerName" + nowTableNum[i - 1]).html(name); //给座位贴名字
            //给亮三标签区域贴名字
            $(".playerLight" + nowTableNum[i - 1]).data("name", name);
            //出牌提示头像 贴对应的玩家号  方便后续显示到谁出牌了
            $(".time" + nowTableNum[i - 1]).attr("id", "time_" + i);
        }
    }
}

/**
 * 出牌
 * @param type 操作类型  outCard
 * @param cards 出牌信息 passCard
 * @param name 出牌用户
 */
function outCard(type, cards, name) {
    $.ajax({
        url : '/game/outCard',
        method : 'POST', // 请求方法，可以是 'GET', 'POST', 'PUT', 'DELETE' 等
        dataType : 'json', // 响应数据的格式，可以是 'json', 'xml', 'text' 等
        data : {
            // 请求参数 (可选)
            type : type,
            cards : JSON.stringify(cards),
            // cards: cards,
            num : myNum,
            name : name
        },
        success : function(response) {
            //请求成功时的处理函数
            console.log('请求成功:', response);
        },
        error : function(xhr, status, error) {
            // 请求失败时的处理函数
            console.log('请求失败:', error);
        }
    });
}

//----------------------------------------------------------websocket相关方法开始----------------------------------------
/**
 * websocket 有新用户加入游戏
 * @param data
 */
function addGame(data) {
    //通过json转对象的方法，获取当前游戏数据
    let maJiang = data.maJiang;
    maJiang.playerNum = data.playerNum;//第几个加入的人
    //显示游戏组人进度  n/x
    $("#nowPlayerNum").html(data.playerNum);
    $("#playerTotal").html(maJiang.nowNum);
    //判断人数是否满足当前对局需要的人数了，开启房主开启游戏的权限
    if (data.playerNum ===maJiang.nowNum && maJiang.createUserName === myName) {
        //移除按钮的不可点击逻辑
        $("#startGame").attr("disabled", false);
        //添加按钮高亮
        $("#startGame").addClass("active");
    }
    //备份当前游戏数据
    nowMaJiangData = maJiang;
    //我的游戏编号 与当前新加入用户不同  加载这个新用户的座位信息
    if (myNum !== maJiang.playerNum) {
        //加载用户座位信息
        addPlayerName(maJiang);
    }
}

/**
 * websocket 发牌
 * @param data
 */
function distributedCard(data) {
    //隐藏开始按钮区域Div
    $("#gameShowDiv").css("display", "none");
    //根据我的玩家编号获取我的手牌
    myCards = data["player" + myNum];
    //将我的手牌排序展示
    myCards.sort(function(a, b) {
        if (a.decor === b.decor) {
            return a.size - b.size;
        }else{
            let decorListNum={"Characters":1,"Bamboos":2,"Dots":3,"Winds":4,"Dragon":5};
            let aNum=decorListNum[a.decor];
            let bNum=decorListNum[b.decor];
            return aNum-bNum;
        }
    });
    //拼接手牌展示
    let hmtl = '';
    //遍历我的手牌
    for (let i = 0; i < myCards.length; i++) {
        let nowHtml =loadCard(myCards[i]);
        hmtl += nowHtml;
    }
    //将手牌区域的牌背图片清空
    $("#player1").empty();
    //显示刚刚发到手的手牌
    $("#player1").append(hmtl);
    //判断我当前是不是庄家
    if(myCards.length===14) {
        //出牌倒计时
        addTimeOut();
    }
    //添加手牌点击监听
    $(".thisCard").on("click", function() {
        if ($(this).hasClass("active")) {
            $(this).removeClass("active");
            $(this).removeClass("next_out_card");
            let nowCardId = parseInt($(this).attr("data-id"));
            for (let i = 0; i < myClickCard.length; i++) {
                if (nowCardId === myClickCard[i].id) {
                    //从我选中的牌的数组中移除当前这张牌
                    myClickCard.splice(i, 1);
                    break;
                }
            }
        } else {
            $(this).addClass("active");
            $(this).addClass("next_out_card");
            let nowCardId = parseInt($(this).attr("data-id"));
            for (let i = 0; i < myCards.length; i++) {
                if (myCards[i].id === nowCardId) {
                    //将这张牌加入到我选择的牌中
                    myClickCard.push(myCards[i]);
                    break;
                }
            }
        }
    })
    // 双击出牌监听
    $(".thisCard").on("dblclick", function() {
        $(this).data(name);
        //告诉大家出完了
        $.ajax({
            url : '/game/win',
            method : 'POST', // 请求方法，可以是 'GET', 'POST', 'PUT', 'DELETE' 等
            dataType : 'json', // 响应数据的格式，可以是 'json', 'xml', 'text' 等
            data : {
                // 请求参数 (可选)
                num : myNum,
                name : myName,
                type : type
            },
            success : function(response) {
                // 请求成功时的处理函数
                console.log('请求成功:', response);
            },
            error : function(xhr, status, error) {
                // 请求失败时的处理函数
                console.log('请求失败:', error);
            }
        });
    })

    //让步监听
    $("#passCards").on("click", function() {
        if (outName == myName) {
            alert("该你了!还让步呢？");
            return;
        }
        $("#myCardOut").css("display", "none");
        //清除定时器,隐藏倒计时
        clearInterval(timer);
        $("#time").css("display", "none");
        nowTime = 15;
        //把点的牌收回去,把点击牌数组清空
        $(".next_out_card").removeClass("next_out_card");
        myClickCard = [];
        //发送websocket
        outCard("passCard", lastCards, outName);
    })
    //花色点击监听
    $(".lightCard").on("click", function() {
        if (!ifStart) {
            let type = $(this).attr("data-type");
            if (!ifHaveSan(type)) {
                return;
            }
            if (!$(this).hasClass("active")) {
                $(this).addClass("active");
                //daosan type
                $.ajax({
                    url : '/game/lightSan',
                    method : 'POST', // 请求方法，可以是 'GET', 'POST', 'PUT', 'DELETE' 等
                    dataType : 'json', // 响应数据的格式，可以是 'json', 'xml', 'text' 等
                    data : {
                        // 请求参数 (可选)
                        type : type,
                        num : myNum,
                        name : myName
                    },
                    success : function(response) {
                        // 请求成功时的处理函数
                        console.log('请求成功:', response);
                    },
                    error : function(xhr, status, error) {
                        // 请求失败时的处理函数
                        console.log('请求失败:', error);
                    }
                });
            }
        }
    })
}

/**
 * 过牌
 */
function passCard(){
    outCard("outCard", [], myName);
}


//亮三
function lightSan(data) {
    if (!$("#" + data.decor + "_" + data.player).hasClass("active")) {
        $("#" + data.decor + "_" + data.player).addClass("active");
        if (!ifStart) {
            if (data.decor == "RedHearts") {
                lightSanNum = lightSanNum + 2;
            } else {
                lightSanNum++;
            }
        }
    }
}




//有人出完了
function PlayerWin(data) {
    //将出完了的人加入胜者组
    winers.push(parseInt(data.playerNum));
    //隐藏赢者手牌
    let userNum=parseInt(data.playerNum);//获取当前用户id;
    console.log(userNum+"号玩家出完了");
    $("#player"+(tableNums[myNum].indexOf(userNum)+1)).empty();
    //展示赢家宣言
    if (winers.length===1){
        $("#winer"+(tableNums[myNum].indexOf(userNum)+1)).html("大油！！！<br>（啊，你么牌了？）");
    }else if (winers.length===2){
        $("#winer"+(tableNums[myNum].indexOf(userNum)+1)).html("二油！！！<br>（唉，看看能白拦不？）");
    }else if (winers.length===3){
        $("#winer"+(tableNums[myNum].indexOf(userNum)+1)).html("三油！！！<br>（我尽力，你们挣展哇？）");
    }
    //判断大油是啥成色
    if (data.playerType == "black") {
        blackWin.push("black");
        if (winers.length == 1) {
            oneWiner = "black";
        }
    } else if (data.playerType == "red1") {
        redWin.push("RedHearts");
        if (winers.length == 1) {
            oneWiner = "RedHearts";
        }
    } else if (data.playerType == "red2") {
        redWin.push("Square");
        if (winers.length == 1) {
            oneWiner = "Square";
        }
    } else if (data.playerType == "red3") {
        redWin.push("RedHearts");
        redWin.push("Square");
        if (winers.length == 1) {
            oneWiner = "DoubleSan";
        }
    }
    //判断游戏是否结束
    if ((redWin.length == 2 && oneWiner != "black") || (blackWin.length == 3 && oneWiner == "black")) {
        //看一下你的身份
        var youType = "black";
        for (var i = 0;i<myCards.length; i++) {
            if (myCards[i].number == "3" && myCards[i].decor == "RedHearts") {
                youType = "red1";
            }
            if (myCards[i].number == "3" && myCards[i].decor == "Square") {
                if (youType == "red1") {
                    youType = "red3";
                } else {
                    youType = "red2";
                }
            }
        }
        //判断一下,亮了几个三  逮了几个人
        var arrestNum=0;
        //判断展示输赢的结算
        var result = 0;
        if (redWin.length == 2) {
            arrestNum=3-blackWin.length;
            if (youType == "red1") {
                result = (lightSanNum+arrestNum) * baseNum * 2;
            } else if (youType == "red2") {
                result = (lightSanNum+arrestNum) * baseNum;
            } else if (youType == "red3") {
                arrestNum=4-blackWin.length;
                result = (lightSanNum+arrestNum) * baseNum * 4;
            } else if (youType == "black") {
                result = -(lightSanNum+arrestNum) * baseNum ;
            }
        } else if (blackWin.length == 3) {
            if(redWin.indexOf("RedHearts")>=0){
                arrestNum=2;
                if(redWin.indexOf("Square")>=0){
                    arrestNum=3;
                }
            }else{
                arrestNum=1;
            }
            if (youType == "red1") {
                result = -(lightSanNum+arrestNum) * baseNum * 2;
            } else if (youType == "red2") {
                result = -(lightSanNum+arrestNum) * baseNum;
            } else if (youType == "red3") {
                result = -(lightSanNum+arrestNum) * baseNum * 4;
            } else if (youType == "black") {
                result = (lightSanNum+arrestNum) * baseNum ;
            }
        }
        //在结算页面展示
        if(result>0){//赢了
            $("#result-msg").html("赢了!");
            $("#result-money").html("+"+result);
        }else{//输了
            $("#result-msg").html("输了!");
            $("#result-money").html(result);
        }

        $(".result-Div").css("display","block");
        //传给后端数据库存储，当前用户积分
        $.ajax({
            url : '/game/updateUserScore',
            method : 'POST', // 请求方法，可以是 'GET', 'POST', 'PUT', 'DELETE' 等
            dataType : 'json', // 响应数据的格式，可以是 'json', 'xml', 'text' 等
            data : {
                // 请求参数 (可选)
                result : result,
                name : myName
            },
            success : function(response) {
                // 请求成功时的处理函数
                console.log('请求成功:', response);
            },
            error : function(xhr, status, error) {
                // 请求失败时的处理函数
                console.log('请求失败:', error);
            }
        });
    } else if ((redWin.length == 2 && oneWiner == "black") || (blackWin.length == 3 && oneWiner != "black")) {
        //白拦了  在结算页面展示
        $("#result-msg").html("白拦了!");
        $("#result-money").html(0);
    }
}

//
//----------------------------------------------------------websocket相关方法结束----------------------------------------
//工具类
function parseMaJiang(maJiangStr) {
    const obj = {};
    const regex = /(\w+)='([^']*)'/g;
    let match;
    while (match = regex.exec(maJiangStr)) {
        obj[match[1]] = match[2];
    }
    return obj;
}


/**
 * 下家请出牌
 * @param data
 */
function outNextOne(data) {
    $(".duola").css("display", "none");
    if (data.nextNum === myNum) {
        //判断当前是否出完牌了
        if (winers.indexOf(myNum) < 0) {
            //显示出牌的按钮  加载哆啦A梦
            $(".time4").css("display", "block");
            $("#myCardOut").css("display", "flex");
            //开始倒计时
            addTimeOut();
            //超时自动让步
            // setTimeout(function() {
            //     $(".time4").css("display", "block");
            //     $("#myCardOut").css("display", "flex");
            // }, 15500); // 15.5秒后执行
        } else {
            if(outName == myName) {//喝风
                //发送websocket
                outCard(roomId, [], myName);
            }else{//让步
                outCard("passCard", lastCards, data.outName);
            }
        }
    } else {
        $("#time_" + data.nextNum).css("display", "block");
    }
    outName = data.outName;
    if (outName == myName && data.nextNum == myNum) {
        lastCards = [];
    } else {
        lastCards = data.outCards;
    }
    $("#outCards").empty();
    var html = "";
    for (var i = 0; i < lastCards.length; i++) {
        // ifStart=true;
        html += '<div class="outCard" ><img style="width:100%;height:100%;" src="' + lastCards[i].imgUrl + '" /></div>';
    }
    $("#outCards").append(html);
    if (html!="") {
        $("#outUserName").html("出牌人:  "+outName);
    }else{
        $("#outUserName").html("");
    }
}
/**
 * 开始倒计时
 */
function addTimeOut() {
    $("#time").html(nowTime);
    $("#time").css("display", "block");
    // 延迟 1000 毫秒后执行 timeOut
    timer = setInterval(timeOut, 1000);
}

/**
 * 倒计时数字变换逻辑
 */
function timeOut() {
    $("#time").html(--nowTime);
    if (nowTime == 0) { //倒计时归零
        // 取消定时器
        clearInterval(timer);
        $("#time").css("display", "none");
        nowTime = 10;
        //隐藏亮三哇
        $("#lightSanWa").css("display","none");
        //对局是否开始的标识
        ifStart=true;
    }
}

/**
 * 点击继续游戏
 */
$("#continueGame").on("click",function (){
    //重新访问倒三游戏
    location.href="/daosan";
})

//退出房间
$("#exitGame").on("click",function (){
    //重新访问倒三游戏
    location.href="/daosan";
})
//返回主页
$("#exitPage").on("click",function (){
    //返回到主页
    location.href="/welcome";
})

/**
 * 判断是不是出了红三
 * @param nowOutCard
 */
function ifHaveRedSan(nowOutCard){
    var ifHaveRedHearts=false;
    for (var i=0;i<nowOutCard.length; i++){
        if (nowOutCard[i].decor==="RedHearts"&&nowOutCard[i].lenght===19&&nowOutCard[i].number==="3"){
            ifHaveRedHearts=true;
            break;
        }
    }
    if (ifHaveRedHearts) {
        $.ajax({
            url: '/game/lightSan',
            method: 'POST', // 请求方法，可以是 'GET', 'POST', 'PUT', 'DELETE' 等
            dataType: 'json', // 响应数据的格式，可以是 'json', 'xml', 'text' 等
            data: {
                // 请求参数 (可选)
                type: "RedHearts",
                num: myNum,
                name: myName
            },
            success: function (response) {
                // 请求成功时的处理函数
                console.log('亮红三请求成功:', response);
            },
            error: function (xhr, status, error) {
                // 请求失败时的处理函数
                console.log('亮红三请求失败:', error);
            }
        });
    }
}

/**
 * 加载牌
 * @param data
 * @returns {string}
 */
function loadCard(data){
    let html='';
    let wName=["无","一","二","三","四","五","六","七","八","九"];
    if(data.decor==="Characters"){//萬字
        html+='<div class="thisCard Characters'+data.size+'" data="'+data.name+'"></div>';
    }else if(data.decor==="Bamboos"){//条子
        html+='<div class="thisCard Bamboos'+data.size+'" data="'+data.name+'"></div>';
    }else if(data.decor==="Dots"){//筒子
        html+='<div class="thisCard Dots'+data.size+'" data="'+data.name+'"></div>';
    }else{
        if(data.name=="中"){
            html+='<div class="thisCard  Dragon_zhong"></div>';
        }else if(data.name=="發"){
            html+='<div class="thisCard  Dragon_fa"></div>';
        }else if(data.name=="白") {
            html += '<div class="thisCard  Dragon_bai"></div>';
        }
    }
    return html;
}