var socket;
var roomId;//当前房间id
var ifStart=false;
var myNum;//当前用户编号  一共5位用户
var myName;//当前用户名称
var nowDaoSanData;//当前对局游戏数据
//不同情况下人员位次表
var tableNums={
    1:[4,3,2,1,5],
    2:[5,4,3,2,1],
    3:[1,5,4,3,2],
    4:[2,1,5,4,3],
    5:[3,2,1,5,4]
}
var myCards=[];
var lastCards=[];
var myClickCard=[];
var outName;
var winers=[];//出完的用户id
var redWin =[];//红三胜者组
var blackWin=[];//黑三胜者组
var lightSanNum=0;//亮三数
var nowTime = 10;//到计时时间
var ifRedFive = false;//是不是红5
var oneWiner;//大游
var baseNum = 0.5;//几毛的胡
var timer;//定时器
var howBig="五毛滴。"
//游戏开始
window.onload = function() {
    //根据设备类型添加样式文件
    if (isMobile()) {
        loadCSS("static/css/daoSan/daosan_mobile.css", function () {
            // $(".bodyLoading").css("display","none");
        });
    } else {
        loadCSS("static/css/daoSan/daosan_pc.css", function () {
            // $(".bodyLoading").css("display","none");
        });
    }
    //连接webSocket
    if (typeof (WebSocket) == "undefined") { //判断 WebSocket 是否存在
        console.log("当前环境不支持WebSocket！！！");
    } else {
        // const socket = new SockJS('https://heavengrave.top/stomp-websocket');
        const socket = new SockJS('http://192.168.31.110:8086/stomp-websocket');
        stompClient = Stomp.over(socket);
        // 连接成功后的回调
        stompClient.connect({}, () => {
            stompClient.subscribe('/topic/messages', (response) => {
                // console.log('收到 JSON 对象:', JSON.parse(response.body))
                let jsonData = JSON.parse(response.body);
                let info = jsonData;
                if (jsonData.received) {
                    // 1. 提取 received 字段
                    let base64String = jsonData.received;
                    // 2. 解码 Base64 字符串
                    let decodedString = atob(base64String); // 输出: {"key":"value","list":[1,2,3]}
                    // 3. 解析为 JSON 对象
                    info = JSON.parse(decodedString);
                }
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
        });
    }
    $("#gameInfo").html(howBig);
}
//创建游戏
$("#createGame").on("click", function() {
    axios.post('/daoSan/create')
        .then(res => {
            //console.log(res.data);
            if (res.status === 200) {
                let info = res.data.data;
                //返回主页隐藏  退出房间显示
                $("#exitPage").css("display", "none");
                $("#exitGame").css("display", "block");
                //在左上角显示房间号
                $("#roomDiv").css("display", "flex");
                $("#thisRoomId").html(info.roomId);
                //记录当前房间id
                roomId = info.roomId;
                //记录当前用户编号
                myNum = 1;
                //加载用户名  加载准备哆啦爱梦图标
                //隐藏创建游戏按钮
                $("#createDiv").css("display", "none");
                //展示准备人数，以及开始按钮
                $("#gameShowDiv").css("display", "flex");
                //给玩家排桌次
                addPlayerName(info.daoSan);
                //获取当前用户名称
                myName = info.daoSan.createUserName;
                nowDaoSanData = info.daoSan;
            } else {
                alert("创建房间失败! <br>(请重新登录后,尝试再次创建..)");
            }
        })
        .catch(error => {
            console.error('创建失败:', error);
            alert("创建游戏时产生未知的异常" + error);
        });
})
/**
 * 点击房间号
 */
$("#roomId").on("click", function () {
    $("#room_list").css("display", "flex"); //展示房间列表
    axios.get('/daoSan/getRoom')
        .then(res => {
            if (res.status === 200) {
                let info = res.data.data; //当前活跃的房间信息
                $("#room_list").empty(); //清空列表
                for (let i = 0; i < info.length; i++) {
                    let html = '<div class="room_info" data-id="' + info[i].id + '">' + info[i].id + '【' + info[i].createUserName + '】' + '</div>';
                    $("#room_list").append(html);
                }
                //添加房间信息点击监听
                $(".room_info").on("click", function () {
                    let nowClickRoomId = $(this).attr("data-id");
                    $("#roomId").html(nowClickRoomId);
                    $("#roomId").val(nowClickRoomId);
                    $("#room_list").css("display", "none");
                })
            }
        })
        .catch(error => {
            console.error('创建失败:', error);
            alert("创建游戏时产生未知的异常" + error);
        });
});
//加入游戏
$("#addGame").on("click", function() {
    let nowRoomId = $("#roomId").val();
    if (nowRoomId === "") {
        alert("请先选择房间！");
    } else {
        axios.post('/daoSan/add', 'roomId=' + nowRoomId)
            .then(res => {
                //console.log(res.data);
                if (res.status === 200) {
                    let info = res.data.data;
                    if (info.type === "addGameError") {
                        alert("当前房间人数已满,等下一局吧！");
                        return;
                    }
                    //返回主页隐藏  退出房间显示
                    $("#exitPage").css("display", "none");
                    $("#exitGame").css("display", "block");
                    //展示当前加入的房间号
                    $("#roomDiv").css("display", "flex");
                    $("#thisRoomId").html(info.daoSan.id);
                    //给房间号赋值
                    roomId = info.daoSan.id;
                    myNum = info.daoSan.playerNum;
                    myName = info.daoSan["player" + myNum];
                    //隐藏创建游戏按钮
                    $("#createDiv").css("display", "none");
                    //展示准备人数，以及开始按钮
                    $("#gameShowDiv").css("display", "flex");
                    //根据游戏信息加载座位表
                    addPlayerName(info.maJiang);
                    //初始化所有用户准备状态 以及筹码
                    // for (let i = 1; i <= info.maJiang.nowNum; i++) {
                    //     areYouReady[i] = false;
                    //     playerWorth[i] = info.maJiang.price;
                    //     gangInfo[i] = 0;
                    //     winInfo[i] = 0;
                    // }
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
    if ($("#startGame").attr("disabled") == "disabled") {
        return;
    } else {
        axios.put('/daoSan/start', "roomId=" + roomId)
            .then(res => {
                if (res.status === 200) {
                    let info = res.data.data;
                } else {
                    alert("开始失败!");
                }
            })
            .catch(error => {
                console.error('开始游戏异常:', error);
                alert("开始游戏时产生未知的异常" + error);
            });
    }
})

//给玩家排桌次
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
            let html = '<div id="RedHearts_' + name + '" data-type="RedHearts" class="RedSan lightCard" style="">♥</div>\n' +
                '            <div id="Square_' + name + '" data-type="Square" class="RedSan lightCard" style="">♦</div>\n' +
                '            <div id="Spades_' + name + '" data-type="Spades" class="BlackSan lightCard" style="">♠</div>\n' +
                '            <div id="ThePlumBlossom_' + name + '" data-type="ThePlumBlossom" class="BlackSan lightCard" style="">♣</div>';
            $(".playerLight" + nowTableNum[i - 1]).empty();
            $(".playerLight" + nowTableNum[i - 1]).append(html);
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
    let daoSan = parseDaoSan(data.daoSan);
    daoSan.playernum = data.playernum;//第几个加入的人
    //显示游戏组人进度  n/5
    $("#nowPlayerNum").html(data.playernum);
    //判断人数是否满足五个人了，开启房主开启游戏的权限
    if (data.playernum === 5 && daoSan.createuser === myName) {
        //移除按钮的不可点击逻辑
        $("#startGame").attr("disabled", false);
        //添加按钮高亮
        $("#startGame").addClass("active");
    }
    //备份当前游戏数据
    nowDaoSanData = daoSan;
    //我的游戏编号 与当前新加入用户不同  加载这个新用户的座位信息
    if (myNum !== daoSan.playernum) {
        //加载用户座位信息
        addPlayerName(daoSan);
    }
}

/**
 * websocket 发牌
 * @param data
 */
function distributedCard(data) {
    //隐藏开始按钮区域Div
    $("#gameShowDiv").css("display", "none");
    //展示亮三哇  提示游戏玩家亮三
    $("#lightSanWa").css("display","block");
    //根据我的玩家编号获取我的手牌
    myCards = data["player" + myNum];
    //将我的手牌排序展示
    myCards.sort(function(a, b) {
        return a.size - b.size;
    });
    //校验我的身份是不是片三
    let hmtl = '';
    //遍历我的手牌
    for (let i = 0; i < myCards.length; i++) {
        //判断我的牌花色为方片 数字为3时
        if (myCards[i].decor === "Square" && myCards[i].size === 3) {
            //亮片三
            $("#Square_" + myName).addClass("active");
            //这局游戏亮三数加一
            lightSanNum++;
            $.ajax({
                url : '/game/lightSan',
                method : 'POST', // 请求方法，可以是 'GET', 'POST', 'PUT', 'DELETE' 等
                dataType : 'json', // 响应数据的格式，可以是 'json', 'xml', 'text' 等
                data : {
                    // 请求参数 (可选)
                    type : 'Square',
                    num : myNum,
                    name : myName
                },
                success : function(response) {
                    // 请求成功时的处理函数
                    console.log('亮三请求成功:', response);
                },
                error : function(xhr, status, error) {
                    // 请求失败时的处理函数
                    console.log('亮三请求失败:', error);
                }
            });
        }else if (myCards[i].decor ==="RedHearts" && myCards[i].size === 5) {
            ifRedFive=true;
            //如果我是红五，加载哆啦爱梦
            setTimeout(function() {
                $(".time4").css("display", "block");
                //显示出牌 让步 按钮
                $("#myCardOut").css("display", "flex");
            }, 15600); // 15.6秒后执行   有15秒的亮三时间  有红分发文本socket的时间
        }
        //显示手牌
        hmtl += '<div class="card4 mycard" data-id="' + myCards[i].id + '"><img class="img_size" src="' + myCards[i].imgUrl + '" /></div>';
    }
    //将手牌区域的牌背图片清空
    $("#player4").empty();
    //显示刚刚发到手的手牌
    $("#player4").append(hmtl);
    //判断我当前是不是红5
    if (ifRedFive) {
        //亮三倒计时
        addTimeOut();
        setTimeout(function() {
            //通过喝风的逻辑，让红5拿到牌权
            passCard();
        }, 15200); // 15.2秒后执行
    } else {
        //亮三倒计时
        addTimeOut();
    }
    //添加手牌点击监听
    $(".mycard").on("click", function() {
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
    //添加出牌按钮点击监听
    $("#outMyCards").on("click", function() {
        //判断你出的排是否符合规则
        if (myClickCard.length > 4 || myClickCard.length === 0) {
            alert("哎哎哎，好好出！");
            return;
        }
        //上家出牌的数量不为0
        if (lastCards.length > 0) {
            //判断你出的牌是否比上家大
            let ifPass = compareDX();
            if (ifPass) {
                //你的牌比上家的牌大,打出你的牌
                outCard("outCard", myClickCard, myName);
                //判断是不是出了红三  出了红三就亮三
                 ifHaveRedSan(myClickCard);
                //将你选择中的牌移除你手牌
                $(".next_out_card").remove();
                //清空你的选牌数组
                myClickCard = [];
            } else {
                alert("哎哎哎，好好出！");
                return;
            }
        } else { //上家么出牌  证明该你出了不出也得出
            let ifPass = compareDX();
            if (ifPass) {
                //判断是不是红5的第一手牌
                if (ifRedFive && $(".mycard").length === 10) {
                    var ifOut5 = false;
                    for (var kk = 0; kk < myClickCard.length; kk++) {
                        if (myClickCard[kk].decor === "RedHearts" && myClickCard[kk].size === 5) {
                            ifOut5 = true;
                        }
                    }
                    if (!ifOut5) {
                        alert("出5哇！");
                        return;
                    }
                }
                outCard("outCard", myClickCard, myName);
                //判断是不是出了红三
                ifHaveRedSan(myClickCard);
                //移除你手牌
                $(".next_out_card").remove();
                myClickCard = [];
            } else {
                alert("好好出？");
                return;
            }
        }
        $(".time4").css("display", "none");
        $("#myCardOut").css("display", "none");
        //清除定时器,隐藏倒计时
        clearInterval(timer);
        $("#time").css("display", "none");
        nowTime = 15;
        if ($(".mycard").length == 0) {
            //看看你的身份
            var type = "black";
            for (var i = 0;i< myCards.length; i++) {
                if (myCards[i].number === "3" && myCards[i].decor === "RedHearts") {
                    type = "red1";
                    // redWin.push("RedHearts");
                }
                if (myCards[i].number === "3" && myCards[i].decor === "Square") {
                    if (type === "red1") {
                        type = "red3";
                    } else {
                        type = "red2";
                    }
                    // redWin.push("Square");
                }
            }
            // if (type == "black") {
            //     blackWin.push(type);
            // }
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
        }
    })
    //让步监听
    $("#passCards").on("click", function() {
        if (outName === myName) {
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
            if (data.decor === "RedHearts") {
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
    if (data.playerType === "black") {
        blackWin.push("black");
        if (winers.length == 1) {
            oneWiner = "black";
        }
    } else if (data.playerType === "red1") {
        redWin.push("RedHearts");
        if (winers.length === 1) {
            oneWiner = "RedHearts";
        }
    } else if (data.playerType === "red2") {
        redWin.push("Square");
        if (winers.length === 1) {
            oneWiner = "Square";
        }
    } else if (data.playerType === "red3") {
        redWin.push("RedHearts");
        redWin.push("Square");
        if (winers.length === 1) {
            oneWiner = "DoubleSan";
        }
    }
    //判断游戏是否结束
    if ((redWin.length === 2 && oneWiner !== "black") || (blackWin.length === 3 && oneWiner === "black")) {
        //看一下你的身份
        var youType = "black";
        for (var i = 0;i<myCards.length; i++) {
            if (myCards[i].number === "3" && myCards[i].decor === "RedHearts") {
                youType = "red1";
            }
            if (myCards[i].number === "3" && myCards[i].decor === "Square") {
                if (youType === "red1") {
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
        if (redWin.length === 2) {
            arrestNum=3-blackWin.length;
            if (youType === "red1") {
                result = (lightSanNum+arrestNum) * baseNum * 2;
            } else if (youType === "red2") {
                result = (lightSanNum+arrestNum) * baseNum;
            } else if (youType === "red3") {
                arrestNum=4-blackWin.length;
                result = (lightSanNum+arrestNum) * baseNum * 4;
            } else if (youType === "black") {
                result = -(lightSanNum+arrestNum) * baseNum ;
            }
        } else if (blackWin.length === 3) {
            if(redWin.indexOf("RedHearts")>=0){
                arrestNum=2;
                if(redWin.indexOf("Square")>=0){
                    arrestNum=3;
                }
            }else{
                arrestNum=1;
            }
            if (youType === "red1") {
                result = -(lightSanNum+arrestNum) * baseNum * 2;
            } else if (youType === "red2") {
                result = -(lightSanNum+arrestNum) * baseNum;
            } else if (youType === "red3") {
                result = -(lightSanNum+arrestNum) * baseNum * 4;
            } else if (youType === "black") {
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
    } else if ((redWin.length === 2 && oneWiner === "black") || (blackWin.length === 3 && oneWiner !== "black")) {
        //白拦了  在结算页面展示
        $("#result-msg").html("白拦了!");
        $("#result-money").html(0);
    }
}

//
//----------------------------------------------------------websocket相关方法结束----------------------------------------
//工具类
function parseDaoSan(daoSanStr) {
    const obj = {};
    const regex = /(\w+)='([^']*)'/g;
    let match;
    while (match = regex.exec(daoSanStr)) {
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


//判断是否有对应花色的3
function ifHaveSan(type) {
    let have = false;
    for (var i = 0; i < myCards.length; i++) {
        if (myCards[i].number == "3" && myCards[i].decor == type) {
            have = true;
            break;
        }
    }
    return have;
}


/**
 * 比较你选的牌，是否比上家的大。size 代表牌面数字  decor 代表花色  lenght 带表权重值
 */
function compareDX() {
    let ifD = false;
    //上家么出牌，证明该你出了不出也不行
    if (lastCards.length === 0) {
        //要判断你出的牌合不合理
        if (myClickCard.length === 2) {
            //选了两张牌得看看是不是对 或者双王
            if ((myClickCard[0].size === myClickCard[1].size) || (myClickCard[0].size === 14 && myClickCard[1].size === 15) || (myClickCard[0].size === 15 && myClickCard[1].size === 14)) {
                ifD = true;
            }
        } else if (myClickCard.length === 3) {
            //选了三张牌 判断一下是不是炸弹
            if (myClickCard[0].size === myClickCard[1].size&& myClickCard[1].size=== myClickCard[2].size) {
                ifD = true;
            }
        } else if (myClickCard.length === 4) {
            //选了四张牌 判断一下是不是四轮
            if (myClickCard[0].size === myClickCard[1].size && myClickCard[1].size=== myClickCard[2].size && myClickCard[2].size=== myClickCard[3].size) {
                ifD = true;
            }
        } else { //已经过滤的0张 牌和四张以上才清空   这个就是出一张牌  可以随便出了
            ifD = true;
        }
    } else if (lastCards.length === 1) { //上家出了一张牌
        if (myClickCard.length === 1) {
            //判断你出的一张是不是比他大
            if (myClickCard[0].lenght > lastCards[0].lenght) {
                ifD = true;
            }
        } else if (myClickCard.length === 2) {
            //你出两张  这种情况只能出双三或者双王
            if ((myClickCard[0].size === 14 && myClickCard[1].size === 15) || (myClickCard[0].size === 15 && myClickCard[1].size === 14)) {
                //你是双王
                ifD = true;
            } else if ((myClickCard[0].lenght ===18 && myClickCard[1].lenght === 19)||(myClickCard[0].lenght ===19 && myClickCard[1].lenght === 18)) {
                //你是双三
                ifD = true;
            }
        } else if (myClickCard.length === 3) {
            //你选了三张牌  判断一下是不是炸弹
            if (myClickCard[0].size === myClickCard[1].size&& myClickCard[1].size=== myClickCard[2].size) {
                ifD = true;
            }
        } else if (myClickCard.length === 4) {
            //你选了四张牌 判断一下是不是四轮
            if (myClickCard[0].size === myClickCard[1].size && myClickCard[1].size=== myClickCard[2].size && myClickCard[2].size=== myClickCard[3].size) {
                ifD = true;
            }
        }
    } else if (lastCards.length === 2) {//上家出了一对
        if (myClickCard.length === 2) {
            //你选了两张牌 判断一下是不是双王  双三  或者大对
            if ((myClickCard[0].size === 14 && myClickCard[1].size === 15) || (myClickCard[0].size === 15 && myClickCard[1].size === 14)) {
                //你是双王
                ifD = true;
            } else if ((myClickCard[0].lenght ===18 && myClickCard[1].lenght === 19)||(myClickCard[0].lenght ===19 && myClickCard[1].lenght === 18)) {
                //你是双三 判断上家是不是双王
                if (!(lastCards[0].size === 14 && lastCards[1].size === 15) && !(lastCards[0].size === 15 && lastCards[1].size === 14)) {
                    ifD = true;
                }
            } else if ((myClickCard[0].size === myClickCard[1].size) && myClickCard[0].lenght > lastCards[0].lenght) {
                //你是大对 判断对面是不是双三
                if (!(myClickCard[0].lenght ===18 && myClickCard[1].lenght === 19)&&!(myClickCard[0].lenght ===19 && myClickCard[1].lenght === 18)) {
                        ifD = true;
                }
            }
        } else if (myClickCard.length === 3) {
            //你选了三张牌  判断一下是不是炸弹
            if (myClickCard[0].size === myClickCard[1].size&& myClickCard[1].size=== myClickCard[2].size) {
                //判断上家是不是双王 或者双三
                if (!(lastCards[0].size === 14 && lastCards[1].size === 15) && !(lastCards[0].size === 15 && lastCards[1].size === 14)) {
                    if (!(myClickCard[0].lenght ===18 && myClickCard[1].lenght === 19)&&!(myClickCard[0].lenght ===19 && myClickCard[1].lenght === 18)) {
                        ifD = true;
                    }
                }
            }
        } else if (myClickCard.length === 4) {
            //你选了四张牌 判断一下是不是四轮
            if (myClickCard[0].size === myClickCard[1].size && myClickCard[1].size=== myClickCard[2].size && myClickCard[2].size=== myClickCard[3].size) {
                //判断上家是不是双王 或者双三
                if (!(lastCards[0].size === 14 && lastCards[1].size === 15) && !(lastCards[0].size === 15 && lastCards[1].size === 14)) {
                    if (!(myClickCard[0].lenght ===18 && myClickCard[1].lenght === 19)&&!(myClickCard[0].lenght ===19 && myClickCard[1].lenght === 18)) {
                        ifD = true;
                    }
                }
            }
        }
    } else if (lastCards.length === 3) {//上家出了一副炸弹
        if (myClickCard.length === 2) {
            //你选了两张牌 判断是不是双王或者双三
            if ((myClickCard[0].size === 14 && myClickCard[1].size === 15) || (myClickCard[0].size === 15 && myClickCard[1].size === 14)) {
                //你是双王
                ifD = true;
            } else if ((myClickCard[0].lenght ===18 && myClickCard[1].lenght === 19)||(myClickCard[0].lenght ===19 && myClickCard[1].lenght === 18)) {
                //你是双三
                ifD = true;
            }
        } else if (myClickCard.length === 3) {
            //你选了三张牌  判断一下是不是炸弹 看看是不是比上家大
            if ((myClickCard[0].size === myClickCard[1].size&& myClickCard[1].size=== myClickCard[2].size) && myClickCard[0].lenght > lastCards[0].lenght) {
                ifD = true;
            }
        } else if (myClickCard.length ===4) {
            //你选了四张牌 判断一下是不是四轮
            if (myClickCard[0].size === myClickCard[1].size && myClickCard[1].size=== myClickCard[2].size && myClickCard[2].size=== myClickCard[3].size) {
                ifD = true;
            }
        }
    } else if (lastCards.length === 4) {//上家出了个四轮
        if (myClickCard.length === 2) {
            //你选了两张牌 判断是不是双王或者双三
            if ((myClickCard[0].size === 14 && myClickCard[1].size === 15) || (myClickCard[0].size === 15 && myClickCard[1].size === 14)) {
                //你是双王
                ifD = true;
            } else if ((myClickCard[0].lenght ===18 && myClickCard[1].lenght === 19)||(myClickCard[0].lenght ===19 && myClickCard[1].lenght === 18)) {
                //你是双三
                ifD = true;
            }
        } else if (myClickCard.length === 4) {
            //你选了四张牌 判断一下是不是四轮 看看是不是比上家大
            if ((myClickCard[0].size === myClickCard[1].size && myClickCard[1].size=== myClickCard[2].size && myClickCard[2].size=== myClickCard[3].size) && myClickCard[0].lenght > lastCards[0].lenght) {
                ifD = true;
            }
        }
    }
    return ifD;
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
 * 返回大厅
 */
$("#backHall").on("click", function () {
    $(".gameInfo-Div").css("display", "none");
})