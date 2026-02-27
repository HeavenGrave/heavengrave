/*init*/
var roomId; //当前房间id
//let ifStart = false;
var myNum; //当前用户编号  第几位用户
var myName; //当前用户名称
var nowMaJiangData; //当前对局游戏数据
//不同情况下人员位次表
var tableNums = {
    1: [1, 2, 3, 4], //这个数字代表座位编号
    2: [4, 1, 2, 3], //在二号玩家的眼中，一号玩家为4号桌
    3: [3, 4, 1, 2],
    4: [2, 3, 4, 1],
}
var myCards = []; //我的手牌
var otherCards = []; //剩余牌
//用于掉线后，恢复游戏 TODO
var myShowCards_1 = []; //1号玩家的牌河
var myShowCards_2 = []; //2号玩家的牌河
var myShowCards_3 = []; //3号玩家的牌河
var myShowCards_4 = []; //4号玩家的牌河
//var lastCards = [];
//var myClickCard = [];
//var outName;
//var winers = []; //出完的用户id
var nowTime = 10; //到计时时间
//var baseNum = 0.5; //几毛的胡
var timer; //定时器
var howBig = "五毛滴。"
var keyHot; //金牌
//var nextCanOut = false;
var areYouReady = {}
var nowOutPlayer = 1; //当前出牌人
var nowOutInfo = {};
//游戏开始
var stompClient;
var nowDealerNum = 1; //庄
var gangInfo = {};
var winInfo = {}
var winNum = 1;
var nowGamePlay; //玩法

var ContinuousDealNum = 1; //连庄数
var quanTotal = 4; //总圈数
var nowQuan = 1; //当前圈数

var playerWorth = {};//玩家资金信息
/*js*/
window.onload = function () {
    //根据设备类型添加样式文件
    if (isMobile()) {
        loadCSS("static/css/majiang/majiang_mobile.css", function () {
            // $(".bodyLoading").css("display","none");
        });
    } else {
        loadCSS("static/css/majiang/majiang_pc.css", function () {
            // $(".bodyLoading").css("display","none");
        });
    }
    const socket = new SockJS('http://8.141.4.23:8086/stomp-websocket');
    // const socket = new SockJS('http://192.168.10.110:8086/stomp-websocket');
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
            // console.log("websocket:" + info);
            // if (isMobile()) {
            //     // alert(info);
            // }
            switch (info.type) { //当前操作类型
                case 'addGame': //加入游戏
                    addGame(info);
                    break;
                case 'distributedCard': //发牌
                    distributedCard(info);
                    break;
                case "distributedCardNext":
                    distributedCardNext(info);
                    break;
                case "outCard":
                    outCard(info);
                    break;
                case "outNextOne":
                    outNextOne(info);
                    break;
                case "iReady":
                    iReady(info);
                    break
                case "iPeng":
                    iPeng(info);
                    break;
                case "iGang":
                case "anGang":
                    iGang(info);
                    break;
                case "iHu":
                case "ziMo":
                    PlayerWin(info);
                    break;
                case "readyNextGame":
                    readyNextGame(info);
                    break;
                case "startNextGame":
                    startNextGame(info);
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
}
/**
 * 点击创建游戏
 */
$("#createGame").on("click", function () {
    $("#room_list").css("display", "none"); //隐藏房间列表
    $(".gameInfo-Div").css("display", "flex"); //展示游戏配置
})
/**
 * 点击房间号
 */
$("#roomId").on("click", function () {
    $("#room_list").css("display", "flex"); //展示房间列表
    axios.get('/mj/getRoom')
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
/**
 * 返回大厅
 */
$("#backHall").on("click", function () {
    $(".gameInfo-Div").css("display", "none");
})
/**
 * 根据选择人数创建游戏
 */
$("#game_ok").on("click", function () {
    let num = $('input[name="person-group"]:checked').val(); //游戏人数
    let gamePlay = $('input[name="gamePlay-group"]:checked').val(); //游戏模式
    let quan = $('input[name="quan-group"]:checked').val(); //圈数
    let deal = $('input[name="deal-group"]:checked').val(); //坐庄
    let price = $('input[name="price-group"]:checked').val(); //资产(点数)
    $(".gameInfo-Div").css("display", "none");
    axios.post('/mj/create', 'userNum=' + parseInt(num) + "&gamePlay=" + gamePlay + "&quan=" + quan + "&deal=" + deal + "&price=" + price)
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
                $("#playerTotal").html(info.maJiang.nowNum);
                //给玩家排桌次
                addPlayerName(info.maJiang);
                //获取当前用户名称
                myName = info.maJiang.createUserName;
                nowMaJiangData = info.maJiang;
                nowGamePlay = info.maJiang.gamePlay; //游戏模式
                //初始化所有用户准备状态 以及筹码
                for (let i = 1; i <= info.maJiang.nowNum; i++) {
                    areYouReady[i] = false;
                    playerWorth[i] = info.maJiang.price;
                    gangInfo[i] = 0;
                    winInfo[i] = 0;
                }
                quanTotal = info.maJiang.quan; //记录总圈数
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
$("#addGame").on("click", function () {
    let nowRoomId = $("#roomId").val();
    if (nowRoomId === "") {
        alert("请先选择房间！");
    } else {
        axios.post('/mj/add', 'roomId=' + nowRoomId)
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
                    $("#thisRoomId").html(info.maJiang.id);
                    //给房间号赋值
                    roomId = info.maJiang.id;
                    nowGamePlay = info.maJiang.gamePlay; //游戏模式
                    myNum = info.maJiang.playerNum;
                    myName = info.maJiang["player" + myNum];
                    //隐藏创建游戏按钮
                    $("#createDiv").css("display", "none");
                    //展示准备人数，以及开始按钮
                    $("#gameShowDiv").css("display", "flex");
                    //根据游戏信息加载座位表
                    addPlayerName(info.maJiang);
                    //初始化所有用户准备状态 以及筹码
                    for (let i = 1; i <= info.maJiang.nowNum; i++) {
                        areYouReady[i] = false;
                        playerWorth[i] = info.maJiang.price;
                        gangInfo[i] = 0;
                        winInfo[i] = 0;
                    }
                    quanTotal = info.maJiang.quan; //记录总圈数
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
$("#startGame").on("click", function () {
    if ($("#startGame").attr("disabled") == "disabled") {
        return;
    } else {
        axios.put('/mj/start', "roomId=" + roomId)
            .then(res => {
                //				console.log(res.data);
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

/**
 * 开始倒计时
 */
function addTimeOut() {
    // 取消定时器
    if (timer) {
        clearInterval(timer);
        //展示时间耗尽
        nowTime = 10;
    }
    $("#time").html(nowTime);
    $("#time").css("display", "flex");
    // 延迟 1000 毫秒后执行 timeOut
    timer = setInterval(timeOut, 1000);
}

/**
 * 倒计时数字变换逻辑
 */
function timeOut() {
    $("#time").html(--nowTime);
    if (nowTime === 0) { //倒计时归零
        // 取消定时器
        clearInterval(timer);
        //展示时间耗尽
        nowTime = 10;
    }
}

/**
 * 点击碰杠胡
 */
$("#pengGangHu").on("click", ".pengGangHu", function () {
    if ($(this).hasClass("activeColor")) {
        let type = $(this).attr("id"); //判断当前点击的按钮类型
        if (type === "skip") {
            areYouReady[myNum] = true;
            //当前牌和我无关，告诉其他人我准备好了
            stompClient.send('/app/sendMessage', {}, JSON.stringify({
                type: "iReady",
                lastPlayerNum: nowOutPlayer, //出牌人
                playerNum: myNum //完成准备人
            }));
            //隐藏碰杠胡按钮
            $("#pengGangHu").css("display", "none");
            $(".activeColor").removeClass("activeColor"); //移除按钮高亮
            $("#skip").addClass("activeColor");
            return;
        }
        //判断是不是除了我所有人都已经准备好了
        let ifOk = true;
        for (let key in areYouReady) {
            if (key != myNum && areYouReady[key] != null && !areYouReady[key]) {
                ifOk = false;
            }
        }
        if (!ifOk) { //如果还有人没准备好
            //判断是不是胡牌,如果是胡牌，就直接胡牌
            //获取手牌区的牌
            let card_html = $("#player1").html();
            //获取pg区的牌
            let pg_html = $("#player1_pg").html();
            if (type === "hu") {
                addNewCard(nowOutInfo.card);
                card_html = $("#player1").html();
                winInfo[nowOutPlayer] = -winNum; //当前出牌的人 点炮了
                winInfo[myNum] = winNum; //当前胡牌的人赢了
            } else if (type === "ziMo") {
                winNum = winNum * 2;
                winInfo[myNum] = winNum * (nowMaJiangData.nowNum - 1); //当前胡牌的人赢了
                for (let i = 1; i <= nowMaJiangData.nowNum; i++) {
                    if (i !== myNum) {
                        winInfo[i] = -winNum; //一赢三家
                    }
                }
            }
            for (let i = 1; i <= nowMaJiangData.nowNum; i++) {
                winInfo[i] = winInfo[i] + gangInfo[i];
            }
            //告诉其他人我胡了
            stompClient.send('/app/sendMessage', {}, JSON.stringify({
                type: "iHu",
                playerCards: card_html, //手牌
                pgCards: pg_html, //碰、杠牌
                winInfo: winInfo, //每个人的得分情况
                playerNum: myNum, //胡牌人id
                playerName: myName //胡牌人名称
            }));
            $(".activeColor").removeClass("activeColor"); //移除按钮高亮
            $("#skip").addClass("activeColor");
            //隐藏碰杠胡按钮
            $("#pengGangHu").css("display", "none");
            return;
        }
        let html = "";
        switch (type) {
            case "peng": //碰牌
                //展示碰牌,移除手牌中的碰牌
                //获取上次出牌人的位置
                let weiZiNum = nowOutInfo.playerNum > myNum ? nowOutInfo.playerNum - myNum : nowOutInfo.playerNum + 4 - myNum;
                //判断打出牌的是对家还是上家还是下家.
                for (let i = 1; i <= 3; i++) { //遍历拼接三张牌碰牌
                    if (weiZiNum === 1 && i === 3) {
                        html += loadCard(nowOutInfo.card, true);
                    } else if (weiZiNum === 2 && i === 2) {
                        html += loadCard(nowOutInfo.card, true);
                    } else if (weiZiNum === 3 && i === 1) {
                        html += loadCard(nowOutInfo.card, true);
                    } else {
                        html += loadCard(nowOutInfo.card);
                    }
                }
                $("#player1_pg").append(html); //展示当前的碰牌
                //移除手牌中的碰牌
                let removeNum = 0;
                for (let i = 0; i < myCards.length; i++) {
                    if (removeNum === 2) {
                        break;
                    }
                    if (myCards[i].decor === nowOutInfo.card.decor && myCards[i].name === nowOutInfo.card.name) {
                        myCards.splice(i, 1);
                        i--;
                        removeNum++;
                    }
                }
                //展示最新的手牌
                showMyCards(); //刷新手牌
                //告诉其他人我碰了
                stompClient.send('/app/sendMessage', {}, JSON.stringify({
                    type: "iPeng",
                    card: nowOutInfo, //出牌信息
                    html: html,
                    playerCardNums: myCards.length,
                    playerNum: myNum //碰牌的人
                }));
                break;
            case "gang": //杠
                let nowGangCard = nowOutInfo.card;
                //1.我有三张，要杠当前出的牌
                if (nowOutPlayer !== myNum) {
                    //获取上次出牌人的位置
                    let weiZiNum = nowOutInfo.playerNum > myNum ? nowOutInfo.playerNum - myNum : nowOutInfo.playerNum + 4 - myNum;
                    //判断打出牌的是对家还是上家还是下家.
                    for (let i = 1; i <= 4; i++) {
                        if (weiZiNum === 1 && i === 3) {
                            html += loadCard(nowOutInfo.card, true);
                        } else if (weiZiNum === 2 && i === 2) {
                            html += loadCard(nowOutInfo.card, true);
                        } else if (weiZiNum === 3 && i === 1) {
                            html += loadCard(nowOutInfo.card, true);
                        } else {
                            html += loadCard(nowOutInfo.card);
                        }
                    }
                    $("#player1_pg").append(html); //展示当前的杠牌
                    gangInfo[myNum] = gangInfo[myNum] + 1;
                    gangInfo[nowOutPlayer] = gangInfo[nowOutPlayer] - 1;
                    //移除手牌中的杠牌
                    for (let i = 0; i < myCards.length; i++) {
                        if (myCards[i].decor === nowOutInfo.card.decor && myCards[i].name === nowOutInfo.card.name) {
                            myCards.splice(i, 1);
                            i--;
                        }
                    }
                    //展示最新的手牌
                    showMyCards(); //刷新手牌
                    //从后面补一张牌
                    let newCard = otherCards.pop();
                    //摸一张牌
                    myCards.push(newCard); //从最后面摸一张牌
                    addNewCard(newCard);
                    //告诉其他人我杠了
                    stompClient.send('/app/sendMessage', {}, JSON.stringify({
                        type: "iGang",
                        card: nowOutInfo.card, //出牌信息
                        cardType: "other",
                        html: html,
                        child_num: 0,
                        playerCardNums: myCards.length,
                        otherCards: otherCards,
                        playerNum: myNum //杠牌的人
                    }));
                } else { //当前我是出牌人，只能是补杠
                    //2.我摸到杠了
                    //判断是上家、下家、还是对家  遍历杠牌区的牌
                    let divs = $("#player1_pg").find(".thisCard");
                    let index_g = 1;
                    let name_g = "";
                    let child_num = 0;
                    for (let k = 0; k < divs.length; k++) {
                        if (k > 2 && divs[k].dataset.name !== divs[k - 1].dataset.name) {
                            index_g = 1;
                        }
                        if (divs[k].style.transform === "rotate(90deg)") {
                            gangInfo[tableNums[myNum][5 - index_g]] = gangInfo[tableNums[myNum][5 - index_g]] - 1;
                            gangInfo[myNum] = gangInfo[myNum] + 1;
                            name_g = divs[k].dataset.name;
                            child_num = k + 1;
                            break;
                        }
                        index_g++;
                    }
                    let card_g;
                    //移除手牌中的杠牌
                    for (let i = 0; i < myCards.length; i++) {
                        if (myCards[i].name === name_g) {
                            card_g = myCards[i];
                            html += loadCard(myCards[i]);
                            myCards.splice(i, 1);
                            i--;
                        }
                    }
                    document.getElementById('player1_pg').children[child_num].insertAdjacentHTML(
                        'afterend',
                        html
                    ); //展示当前补的杠牌
                    //展示最新的手牌
                    showMyCards(); //刷新手牌
                    //从后面补一张牌
                    let newCard = otherCards.pop();
                    //摸一张牌
                    myCards.push(newCard); //从最后面摸一张牌
                    addNewCard(newCard);
                    //告诉其他人我补杠了
                    stompClient.send('/app/sendMessage', {}, JSON.stringify({
                        type: "iGang",
                        card: card_g, //出牌信息
                        gangInfo: gangInfo,
                        cardType: "my",
                        html: html,
                        child_num: child_num,
                        playerCardNums: myCards.length,
                        otherCards: otherCards,
                        playerNum: myNum //杠牌的人
                    }));
                }
                break;
            case "anGang":
                let nowGangCard_An;
                //1.我有四张，暗杠
                if (nowOutPlayer === myNum) { //手中有可能有多对暗杠
                    let hm_card = {};
                    let hm_cardInfo = {};
                    let cards_an = [];
                    for (let i = 0; i < myCards.length; i++) {
                        let cardInfo = myCards[i];
                        hm_card[cardInfo.name] = (hm_card[cardInfo.name] || 0) + 1; // 直接统计所有牌的数量，不区分花色
                        hm_cardInfo[cardInfo.name] = cardInfo;
                    }
                    for (let key in hm_card) {
                        if (hm_card[key] === 4) {
                            nowGangCard_An = hm_cardInfo[key];
                            break;
                        }
                    }
                    if (nowGangCard_An) {
                        let name_g = nowGangCard_An.name;
                        let card_g;
                        //移除手牌中的杠牌
                        for (let i = 0; i < myCards.length; i++) {
                            if (myCards[i].name === name_g) {
                                card_g = myCards[i];
                                html += loadCard(myCards[i]);
                                myCards.splice(i, 1);
                                i--;
                            }
                        }
                        $("#player1_pg").append(html); //展示当前的杠牌
                        //展示最新的手牌
                        showMyCards(); //刷新手牌
                        //从后面补一张牌
                        let newCard = otherCards.pop();
                        //摸一张牌
                        myCards.push(newCard); //从最后面摸一张牌
                        addNewCard(newCard);
                        //3.我有四张，暗杠
                        for (let i = 1; i <= nowMaJiangData.nowNum; i++) {
                            if (i === myNum) {
                                gangInfo[i] = gangInfo[i] + nowMaJiangData.nowNum - 1;
                            } else {
                                gangInfo[i] = gangInfo[i] - 1;
                            }
                        }
                        //告诉其他人我杠了
                        stompClient.send('/app/sendMessage', {}, JSON.stringify({
                            type: "anGang",
                            card: card_g, //出牌信息
                            gangInfo: gangInfo,
                            cardType: "my",
                            child_num: 0,
                            html: html,
                            playerCardNums: myCards.length,
                            otherCards: otherCards,
                            playerNum: myNum //杠牌的人
                        }));
                    }
                }
                break;
            case "hu":
            case "ziMo":
                //获取手牌区的牌
                let card_html = $("#player1").html();
                //获取pg区的牌
                let pg_html = $("#player1_pg").html();
                if (type === "hu") {
                    addNewCard(nowOutInfo.card);
                    card_html = $("#player1").html();
                    winInfo[nowOutPlayer] = -winNum; //当前出牌的人 点炮了
                    winInfo[myNum] = winNum; //当前胡牌的人赢了
                } else if (type === "ziMo") {
                    winNum = winNum * 2;
                    winInfo[myNum] = winNum * (nowMaJiangData.nowNum - 1); //当前胡牌的人赢了
                    for (let i = 1; i <= nowMaJiangData.nowNum; i++) {
                        if (i !== myNum) {
                            winInfo[i] = -winNum; //一赢三家
                        }
                    }
                }
                for (let i = 1; i <= nowMaJiangData.nowNum; i++) {
                    winInfo[i] = winInfo[i] + gangInfo[i];
                }
                //告诉其他人我胡了
                stompClient.send('/app/sendMessage', {}, JSON.stringify({
                    type: "iHu",
                    playerCards: card_html, //手牌
                    pgCards: pg_html, //碰、杠牌
                    winInfo: winInfo, //每个人的得分情况
                    playerNum: myNum, //胡牌人id
                    playerName: myName //胡牌人名称
                }));
                break;
        }
        $(".activeColor").removeClass("activeColor"); //移除按钮高亮
        $("#skip").addClass("activeColor");
        //隐藏碰杠胡按钮
        $("#pengGangHu").css("display", "none");
    }
})
/*socket*/

//----------------------------------------------------------websocket相关方法开始----------------------------------------
/**
 * websocket 有新用户加入游戏
 * @param data
 */
function addGame(data) {
    //通过json转对象的方法，获取当前游戏数据
    let maJiang = data.maJiang;
    maJiang.playerNum = data.playerNum; //第几个加入的人
    //显示游戏组人进度  n/x
    $("#nowPlayerNum").html(data.playerNum);
    $("#playerTotal").html(maJiang.nowNum);
    //判断人数是否满足当前对局需要的人数了，开启房主开启游戏的权限
    if (data.playerNum === maJiang.nowNum && maJiang.createUserName === myName) {
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
 * 检查是否为暗杠或是天胡
 */
function checkForStart() {
    //判断有没有胡和杠
    let ifCanHu = checkCanHu();
    let ifCanGang = false;
    // 1. 统计每种牌的数量，并按花色分类
    const countMap = {};
    for (let i = 0; i < myCards.length; i++) {
        countMap[myCards[i].name] = (countMap[myCards[i].name] || 0) + 1; // 直接统计所有牌的数量，不区分花色
        if (countMap[myCards[i].name] === 4) {
            ifCanGang = true;
        }
    }
    if (ifCanHu || ifCanGang) {
        $("#pengGangHu").css("display", "flex");
        if (ifCanGang) {
            $("#anGang").addClass("activeColor");
        }
        if (ifCanHu) {
            $("#ziMo").addClass("activeColor");
        }
    }
}

/**
 * websocket 发牌
 * @param data
 */
function distributedCard(data) {
    nowDealerNum = data.nowDealerNum; //更新坐庄的人
    //隐藏开始按钮区域Div
    $("#gameShowDiv").css("display", "none");
    //根据我的玩家编号获取我的手牌
    myCards = data["player" + myNum];
    otherCards = data["other"]; //剩余牌
    //在金牌展示区域展示金牌
    $(".center").css("display", "flex");
    if (nowGamePlay === "daiJin") {
        keyHot = otherCards.pop();
        let nowHtml = loadCard(keyHot);
        $("#keyHot").html(nowHtml);
    }
    //将我的手牌排序展示
    showMyCards();
    //判断我当前是不是庄家
    //TODO 添加庄家按钮展示
    if (nowDealerNum === myNum) {
        $("#dealer_1").css("display", "block");
        $(".time1").css("display", "block");
        //判断是否有暗杠或是天胡
        checkForStart();
    } else {
        //根据当前用户编号，获取当前用户视角位次数组
        let nowTableNum = tableNums[myNum];
        $("#dealer_" + nowTableNum[0]).css("display", "block");
        $(".time" + nowTableNum[0]).css("display", "block"); //展示出牌标识
    }
    //出牌倒计时
    addTimeOut();
    let clickTimer = null;
    //添加手牌点击监听，选中
    $("#player1").on("click", ".thisCard", function (event) {
        const $element = $(this);
        // 清除之前的定时器（避免重复触发）
        if (clickTimer) {
            clearTimeout(clickTimer);
            clickTimer = null
        }
        // 设置新定时器，延迟执行单击逻辑
        clickTimer = setTimeout(() => {
            // 此处编写单击事件的实际逻辑
            if ($element.hasClass("active")) {
                $element.removeClass("active");
                $element.removeClass("next_out_card");
            } else {
                $element.addClass("active");
                $element.addClass("next_out_card");
            }
            clickTimer = null;
        }, 300); // 300ms 是典型双击间隔阈值，可根据需求调整
    })
    //双击已选中的牌，出牌
    $("#player1").on("dblclick", ".next_out_card", function (event) {
        // 清除单击事件的定时器（阻止单击逻辑执行）
        if (clickTimer) {
            clearTimeout(clickTimer);
            clickTimer = null;
        }
        event.stopPropagation();
        event.preventDefault();
        if (myNum !== nowOutPlayer) {
            return;
        }
        let cardInfo = {};
        cardInfo.id = $(this).data("id");
        cardInfo.name = $(this).data("name");
        cardInfo.size = $(this).data("size");
        cardInfo.decor = $(this).data("decor");
        for (let i = 0; i < myCards.length; i++) {
            if (myCards[i].id === cardInfo.id) {
                window["myShowCards_" + myNum].push(myCards[i]); //将当前牌加入我的牌河
                myCards.splice(i, 1); //移除当前手牌
                break;
            }
        }
        //将出牌动作广播给所有人
        stompClient.send('/app/sendMessage', {}, JSON.stringify({
            type: "outCard",
            playerNum: myNum,
            otherCards: otherCards,
            playerCardNums: myCards.length,
            card: cardInfo
        }));
        //移除当前手牌
        $(this).remove();
        //刷新我的手牌把 新摸的牌插进去
        showMyCards();
    })
}

/**
 * 下一局的发牌
 * @param data
 */
function distributedCardNext(data) {
    $(".dealerDiv").css("display", "none");
    $(".duoLa").css("display", "none"); //隐藏哆啦A梦
    $(".result-Div").css("display", "none"); //隐藏上一局的结果
    $("#continueGame").html("准备");
    for (let i = 0; i <= 4; i++) {
        $(".player-pg" + i).empty(); //清除碰杠牌展示
        $("#playerShowCards_" + i).empty(); //清除牌河展示
    }
    nowDealerNum = data.nowDealerNum; //更新坐庄的人
    nowOutPlayer = data.nowDealerNum; //更新出牌人，庄家为当前出牌人
    for (let i = 1; i <= nowMaJiangData.nowNum; i++) {
        gangInfo[i] = 0;
        winInfo[i] = 0;
    }
    //根据我的玩家编号获取我的手牌
    myCards = data["player" + myNum];
    otherCards = data["other"]; //剩余牌
    //在金牌展示区域展示金牌
    $(".center").css("display", "flex");
    if (nowGamePlay === "daiJin") {
        keyHot = otherCards.pop();
        let nowHtml = loadCard(keyHot);
        $("#keyHot").empty();
        $("#keyHot").html(nowHtml);
    }
    //将我的手牌排序展示
    showMyCards();
    //判断我当前是不是庄家
    //TODO 添加庄家按钮展示
    if (nowDealerNum === myNum) {
        $("#dealer_1").css("display", "block");
        $(".time1").css("display", "block");
        //判断是否有暗杠或是天胡
        checkForStart();
    } else {
        //根据当前用户编号，获取当前用户视角位次数组
        let nowTableNum = tableNums[myNum];
        $("#dealer_" + nowTableNum[nowOutPlayer - 1]).css("display", "block");
        $(".time" + nowTableNum[nowOutPlayer - 1]).css("display", "block"); //展示出牌标识
    }
    //出牌倒计时
    addTimeOut();
}

/**
 * 出牌
 * @param info
 */
function outCard(info) {
    // {"type":"outCard","playerNum":1,playerCardNums:13,//手牌长度
    //"card":{"id":"b0daa499-d436-470f-be6f-eeab0b724d44","name":"1万","size":1,"decor":"Characters"}
    nowOutInfo = info; //修改全局变量中的出牌信息
    clearReady(); //重置准备状态
    //根据当前用户编号，获取当前用户视角位次数组,在对应的牌河中展示出牌
    let nowTableNum = tableNums[myNum];
    let html = "";
    const $element = $("#playerShowCards_" + nowTableNum[info.playerNum - 1]);
    html = loadCard(info.card);
    $element.append(html);
    //判断我是不是出牌人
    if (info.playerNum === myNum) {
        //我是出牌人，不能再操作了
        //TODO 验证是否会发生逻辑错误
        nowOutPlayer = -1;
        areYouReady[myNum] = true; //我准备好了
        //等待其他人准备
    } else { //我不是出牌人
        //info.playerCardNums TODO 根据出牌人手牌数量 更新手牌展示
        areYouReady[info.playerNum] = true; //出牌人准备好了
        otherCards = info.otherCards; //更新剩余牌山信息
        //判断这张牌能不能让我胡
        let ifCanHu = checkCanHu(info.card);
        let ifCanPeng = false;
        let ifCanGang = false;
        // 1. 统计每种牌的数量
        const countMap = {};
        for (let i = 0; i < myCards.length; i++) {
            countMap[myCards[i].name] = (countMap[myCards[i].name] || 0) + 1; // 直接统计所有牌的数量，不区分花色
        }
        if (countMap[info.card.name] === 3) {
            ifCanGang = true;
            ifCanPeng = true;
        } else if (countMap[info.card.name] === 2) {
            ifCanPeng = true;
        }
        if (ifCanHu || ifCanPeng || ifCanGang) {
            $("#pengGangHu").css("display", "flex");
            if (ifCanPeng) {
                $("#peng").addClass("activeColor");
            }
            if (ifCanGang) {
                $("#gang").addClass("activeColor");
            }
            if (ifCanHu) {
                $("#hu").addClass("activeColor");
            }
        } else { //这张牌能不能让我碰、杠、胡
            areYouReady[myNum] = true; //我准备好了
            nowOutPlayer = -1; //TODO 验证是否会发生逻辑错误
            //当前牌和我无关，告诉其他人我准备好了
            stompClient.send('/app/sendMessage', {}, JSON.stringify({
                type: "iReady",
                lastPlayerNum: info.playerNum, //出牌人
                playerNum: myNum //完成准备人
            }));
        }
    }
}

/**
 * 有人广播他准备好了
 */
function iReady(info) {
    areYouReady[info.playerNum] = true;
    //检查我是不是上一个出牌的人，如果是的话，判断是否所有人都准备好了，准备好的话，广播让下家出牌
    if (info.lastPlayerNum === myNum) {
        //所有人都已经准备好了
        let ifOk = true;
        for (let key in areYouReady) {
            if (areYouReady[key] != null && !areYouReady[key]) {
                ifOk = false;
                break;
            }
        }
        if (ifOk) {
            //提醒下一个人摸牌，出牌
            stompClient.send('/app/sendMessage', {}, JSON.stringify({
                type: "outNextOne",
                nextPlayerNum: myNum === nowMaJiangData.nowNum ? 1 : myNum + 1,
            }));
        }
    }
}

/**
 * 下家请出牌
 * @param data
 */
function outNextOne(data) {
    //更新出牌人
    nowOutPlayer = data.nextPlayerNum;
    //隐藏哆啦A梦
    $(".duoLa").css("display", "none");
    //判断是否轮到我出牌了
    if (data.nextPlayerNum === myNum) {
        let newCard = otherCards.shift(); //从最前面摸一张牌
        //判断我是不是自摸和杠
        //判断这张牌能不能让我胡
        let ifCanZiMo = checkCanHu(newCard);
        let ifCanGang = false; //补杠
        let ifCanAnGang = false;
        //判断是上家、下家、还是对家  遍历杠牌区的牌
        let divs = $("#player1_pg").find(".thisCard");
        for (let k = 0; k < divs.length; k++) {
            if (divs[k].dataset.name === newCard.name) {
                ifCanGang = true;
                break;
            }
        }
        //将摸的牌放入我的手牌
        myCards.push(newCard);
        //展示我的手牌
        addNewCard(newCard);
        // 1. 统计每种牌的数量
        const countMap = {};
        for (let i = 0; i < myCards.length; i++) {
            countMap[myCards[i].name] = (countMap[myCards[i].name] || 0) + 1; // 直接统计所有牌的数量，不区分花色
        }
        if (countMap[newCard.name] === 4) {
            ifCanAnGang = true;
        }
        //判断
        if (ifCanZiMo || ifCanGang || ifCanAnGang) {
            $("#pengGangHu").css("display", "flex");
            if (ifCanGang) {
                $("#gang").addClass("activeColor");
            }
            if (ifCanAnGang) {
                $("#anGang").addClass("activeColor");
            }
            if (ifCanZiMo) {
                $("#ziMo").addClass("activeColor");
            }
        }
        //显示出牌的按钮  加载哆啦A梦
        $(".time1").css("display", "block");
    } else {
        //根据当前用户编号，获取当前用户视角位次数组
        let nowTableNum = tableNums[myNum];
        $(".time" + nowTableNum[data.nextPlayerNum - 1]).css("display", "block"); //展示出牌标识
    }
    //出牌倒计时
    addTimeOut();
}

/**
 * 有人碰牌了
 * @param data
 */
function iPeng(data) {
    //	{type : "iPeng",card:nowOutInfo, //出牌信息 html : html,//碰牌的div
    //	playerCardNums:myCards.length,//碰牌人的手牌数量 playerNum : myNum //碰牌的人}
    let card_out = data.card; //出牌信息
    // 根据当前用户编号，获取当前用户视角位次数组
    let nowTableNum = tableNums[myNum];
    //移除牌河中的被碰的牌
    // 获取父容器
    const container = document.getElementById('playerShowCards_' + nowTableNum[card_out.playerNum - 1]);
    // 找到最后一个子 div 并移除
    if (container.lastElementChild) {
        container.removeChild(container.lastElementChild);
    }
    //隐藏多啦A梦
    $(".duoLa").css("display", "none");
    //更新出牌人
    nowOutPlayer = data.playerNum;
    //为当前出牌人添加哆啦A梦
    $(".time" + nowTableNum[nowOutPlayer - 1]).css("display", "block");
    //出牌倒计时
    addTimeOut();
    //为碰牌的人展示碰牌    展示碰牌,移除手牌中的碰牌
    if (data.playerNum !== myNum) {
        $("#player" + nowTableNum[data.playerNum - 1] + "_pg").append(data.html); //展示碰牌
        //减少当前人的手牌长度
        removeBackCard("player" + nowTableNum[data.playerNum - 1], 2);
    }
}

/**
 * 减少手牌长度
 */
function removeBackCard(id, num) {
    // 获取目标元素集合
    const $cards = $("#" + id).find(".thisCard");
    // 计算实际需要移除的数量（防止n超过元素总数）
    const removeCount = Math.min(num, $cards.length);
    // 使用 slice 选择最后 N 个元素并移除
    $cards.slice(-removeCount).remove();
    // 返回被移除的元素集合（可选）
    return $cards.slice(-removeCount);
}

/**
 * 有人杠牌了
 * @param data
 */
function iGang(data) {
    //	{type : "iGang"/"anGang",card : nowOutInfo, //杠牌信息cardType:"other",//杠还是补杠
    //	html : html,child_num:child_num,playerNum : myNum //杠牌的人}
    //根据当前用户编号，获取当前用户视角位次数组
    let nowTableNum = tableNums[myNum];
    gangInfo = data.gangInfo;
    if (data.type === "iGang" && data.cardType === "other") {
        //移除牌河中的被碰的牌
        // 获取父容器
        const container = document.getElementById('playerShowCards_' + nowTableNum[nowOutInfo.playerNum - 1]);
        // 找到最后一个子 div 并移除
        if (container.lastElementChild) {
            container.removeChild(container.lastElementChild);
        }
    }
    //隐藏多啦A梦
    $(".duoLa").css("display", "none");
    //更新出牌人
    nowOutPlayer = data.playerNum;
    //为当前出牌人添加哆啦A梦
    $(".time" + nowTableNum[nowOutPlayer - 1]).css("display", "block");
    //出牌倒计时
    addTimeOut();
    //为杠牌的人展示杠牌
    //展示杠牌,移除手牌中的杠牌 TODO 仔细斟酌移除牌的数量
    if (data.type === "iGang") {
        if (data.cardType === "other" && data.playerNum !== myNum) { //当前
            $("#player" + nowTableNum[data.playerNum - 1] + "_pg").append(data.html); //展示杠牌
            //减少当前人的手牌长度
            removeBackCard("player" + nowTableNum[data.playerNum - 1], 2);
        } else if (data.cardType === "my" && data.playerNum !== myNum) {
            document.getElementById("player" + nowTableNum[data.playerNum - 1] + "_pg").children[data.child_num].insertAdjacentHTML(
                'afterend',
                data.html
            ); //展示当前补的杠牌
        }
    } else if (data.type === "anGang") {
        if (data.playerNum !== myNum) { //当前
            $("#player" + nowTableNum[data.playerNum - 1] + "_pg").append(data.html); //展示杠牌
            //减少当前人的手牌长度
            removeBackCard("player" + nowTableNum[data.playerNum - 1], 3);
        }
    }
}

/**
 * 结算
 */
function PlayerWin(data) {
    clearReady(); //清空准备信息
    //判断上庄方式
    if (nowMaJiangData.dealType === "win") {
        nowDealerNum = data.playerNum;
    } else { //轮庄
        //判断游戏类型
        if (nowDealerNum !== data.playerNum) {
            nowDealerNum++;
            if (nowDealerNum > nowMaJiangData.nowNum) {
                nowDealerNum = 1;
            }
        }
        if (nowMaJiangData.gamePlay === "kanDuiQue") {
            ContinuousDealNum++;
        }
        // TODO 判断圈数   如果完成了圈数   则结束游戏
        if (nowDealerNum !== data.playerNum && nowDealerNum === 1) {
            nowQuan++;
        }
    }
    let ifEndGame = false;
    // TODO 更新筹码信息
    for (let i = 1; i <= nowMaJiangData.nowNum; i++) {
        playerWorth[i] += data.winInfo[i];
        if (playerWorth[i] <= 0) {
            ifEndGame = true;
        }
    }
    if (nowQuan > quanTotal) {
        ifEndGame = true;
    }
    //根据胡牌信息  拼接结算页面
    let html = '<div>' + nowMaJiangData["player" + data.playerNum] + ' ' + (data.type === "iHu" ? "胡" : "自摸") + '了</div>'; //#303088
    html += '<div class="result_pai"  >' + data.playerCards + '</div>';
    html += '<div class="result_pai"  >' + data.pgCards + '</div>';
    // html += '<div>image</div><div>name</div>';//头像
    html += '<div style="display:flex;flex-direction: column;align-items: center;">';
    html += '<div style="display:flex;justify-content: space-around;width: 100%;"><div style="width:6rem;text-align:center;">玩家名称</div><div style="width:2rem;text-align:center;">胡</div><div style="width:2rem;text-align:center;">杠</div><div style="width:4rem;text-align:center;">当前积分</div></div>';
    html += '<div style="display:flex;justify-content: space-around;width: 100%;"><div style="width:6rem;text-align:center;">' + nowMaJiangData["player1"] + '</div><div style="width:2rem;text-align:center;">' + (data.winInfo[1]-gangInfo[1]) + '</div><div style="width:2rem;text-align:center;">' + gangInfo[1] + '</div><div style="width:4rem;text-align:center;">' + playerWorth[1] + '</div></div>';
    html += '<div style="display:flex;justify-content: space-around;width: 100%;"><div style="width:6rem;text-align:center;">' + nowMaJiangData["player2"] + '</div><div style="width:2rem;text-align:center;">' + (data.winInfo[2]-gangInfo[2]) + '</div><div style="width:2rem;text-align:center;">' + gangInfo[2] + '</div><div style="width:4rem;text-align:center;">' + playerWorth[2] + '</div></div>';
    html += '<div style="display:flex;justify-content: space-around;width: 100%;"><div style="width:6rem;text-align:center;">' + nowMaJiangData["player3"] + '</div><div style="width:2rem;text-align:center;">' + (data.winInfo[3]-gangInfo[3]) + '</div><div style="width:2rem;text-align:center;">' + gangInfo[3] + '</div><div style="width:4rem;text-align:center;">' + playerWorth[3] + '</div></div>';
    if (nowMaJiangData["player4"] != null) {
        html += '<div style="display:flex;justify-content: space-around;width: 100%;"><div style="width:6rem;text-align:center;">' + nowMaJiangData["player4"] + '</div><div style="width:2rem;text-align:center;">' + (data.winInfo[4]-gangInfo[4]) + '</div><div style="width:2rem;text-align:center;">' + gangInfo[4] + '</div><div style="width:4rem;text-align:center;">' + playerWorth[4] + '</div></div>';
    }
    html += '</div>';
    $("#result-cards").html(html);
    $(".result-Div").css("display", "flex");
    if (ifEndGame) {
        //TODO  结束游戏
        $("#continueGame").css("display", "none");
        $("#endGame").css("display", "flex");
    }
}

/**
 * 准备开始新的一局
 * 判断做庄方式
 * @param data
 */
function readyNextGame(data) {
    areYouReady[data.playerNum] = true;
    if (myNum === nowDealerNum) {
        let ifOk = true;
        for (let key in areYouReady) {
            if (areYouReady[key] != null && !areYouReady[key]) {
                ifOk = false;
                break;
            }
        }
        if (ifOk) {
            stompClient.send('/app/sendMessage', {}, JSON.stringify({
                type: "startNextGame",
                playerNum: myNum,
            }));
        }
    }
}

/**
 * 开始下一局
 * @param data
 */
function startNextGame(data) {
    if (nowDealerNum === myNum) {
        axios.put('/mj/startNext', "roomId=" + roomId + "&nowDealerNum=" + myNum)
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
}

//----------------------------------------------------------websocket相关方法结束----------------------------------------


/*=====================================tools=======================================*/
/**
 * 点击继续游戏
 */
$("#continueGame").on("click", function () {
    if (!($("#continueGame").html() === "待其他玩家确认。。。。")) {
        $("#continueGame").html("待其他玩家确认。。。。");
        //告诉其他人我准备好了,就等下一把了
        stompClient.send('/app/sendMessage', {}, JSON.stringify({
            type: "readyNextGame",
            playerNum: myNum,
        }));
    }
})
/**
 * 点击结束游戏
 */
$("#endGame").on("click",function(){
    //重新访问麻将游戏
    location.href = "/majiang";
})
/**
 * 退出房间
 */
$("#exitGame").on("click", function () {
    //更新当前用户房间状态
    if (myName === nowMaJiangData.createUserName) {
        axios.put('/mj/exitRoom', "userId=" + nowMaJiangData.createUserId)
            .then(res => {
                if (res.status === 200) {
                    let info = res.data.data;
                    $("#room_list").empty();
                    for (let i = 0; i < info.length; i++) {
                        let html = '<div class="room_info" data-id="' + info[i].id + '">' + info[i].id + '(' + info[i].createUserName + ')' + '</div>';
                        $("#room_list").append(html);
                    }
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
    }
    //重新访问麻将游戏
    location.href = "/majiang";
})
/**
 * 返回主页
 */
$("#exitPage").on("click", function () {
    //返回到主页
    location.href = "/myPage";
})

/**
 * 加载牌
 * @param data
 * @param ifFz 是否翻转
 * @returns {string}
 */
function loadCard(data, ifFz) {
    let html = '<div class="thisCard ';
    if (ifFz) {
        //牌高度 0.15*height  当前为 0.15*12vw=1.8vw
        html = '<div style="transform: rotate(90deg);" class="thisCard ';
        html += ' FzCard ';
    }
    html += SplicingCardInfo(data);
    return html;
}

/**
 * 拼接信息
 */
function SplicingCardInfo(data) {
    let html = '';
    // let wName=["无","一","二","三","四","五","六","七","八","九"];
    if (data.decor === "Characters") { //萬字
        html += '   Characters' + data.size + '"  ';
    } else if (data.decor === "Bamboos") { //条子
        html += '   myCard Bamboos' + data.size + '" ';
    } else if (data.decor === "Dots") { //筒子
        html += '  Dots' + data.size + '"  ';
    } else {
        if (data.name === "中") {
            html += '  Dragon_zhong"  ';
        } else if (data.name === "發") {
            html += '  Dragon_fa"  ';
        } else if (data.name === "白") {
            html += '  Dragon_bai"  ';
        }
    }
    html += ' data-id="' + data.id + '" data-decor="' + data.decor + '" data-name="' + data.name + '" data-size="' + data.size + '" >';
    if (keyHot && keyHot.decor === data.decor && keyHot.name === data.name) {
        html += '<div class="tag">金</div>';
    }
    html += "</div>";
    return html;
}

/**
 * 展示新上的
 */
function addNewCard(card) {
    let html = '<div style="margin-left:8vw;"  class="thisCard ';
    html += SplicingCardInfo(card);
    //显示刚刚最新的手牌
    $("#player1").append(html);
}


/**
 * 给玩家排桌次
 */
function addPlayerName(data) {
    //我的编号为空时，代表我还未加入游戏，不需要加载其他用户信息
    if (!myNum) {
        return;
    }
    //根据当前用户编号，获取当前用户视角位次数组
    let nowTableNum = tableNums[myNum];
    for (let i = 1; i <= 4; i++) {
        let name = data["player" + i]; //获取i号玩家的名称
        //当前玩家不为空(当前玩家已经加入了游戏,需要显示他的坐次)
        if (name != null && name !== "null" && name !== "" && name !== undefined) {
            $("#player" + nowTableNum[i - 1]).data("name", name); //给座位贴名字
            $("#playerName" + nowTableNum[i - 1]).html(name); //给座位贴名字
            //出牌提示头像 贴对应的玩家号  方便后续显示到谁出牌了
            $(".time" + nowTableNum[i - 1]).attr("id", "time_" + i);
        }
    }
}

/**
 * 判断手牌是否可以胡牌（支持花色和龙牌）  gamePlay_tuiDao gamePlay_daiJin gamePlay_kanDuiQue
 * @param {string[]} hand - 手牌数组，如 ["Characters_1", "Bamboos_5","Dots_6" "Dragon_zhong"]
 * @param {string} laiZi - 赖子牌标识，如 "Dragon_fa"
 * @returns {boolean} - 是否胡牌
 */
function canHuPai(hand, laiZi) {
    winNum = 1; // 每次判断前重置赢点数
    hand.sort(sortHands); //排序
    if (nowGamePlay == "tuiDao") {
        return checkHuPai_tuiDao(hand);
    } else if (nowGamePlay == "daiJin") {
        return checkHuPai_daiJin(hand, laiZi);
    } else if (nowGamePlay == "kanDuiQue") {
        return checkHuPai_kanDuiQue(hand);
    }
}

/**
 * 推到检查胡牌
 */
function checkHuPai_tuiDao(hand) {
    // 1. 统计每种牌的数量
    const countMap = {};
    for (const tile of hand) {
        countMap[tile] = (countMap[tile] || 0) + 1; // 直接统计所有牌的数量
    }
    // 2. 检查七对子（需排除龙牌的特殊性）
    if (isQiDuiZi_tuiDao(countMap)) {
        return true;
    }
    // 3. 检查基础牌型（刻子/顺子）和龙牌组合
    return isBaseHu_tuiDao(countMap);
}

/**
 * 推到检查七对
 */
function isQiDuiZi_tuiDao(countMap) {
    let ifQYS = true;
    // 判断手牌中有无字牌
    for (const honor of ['Dragon_zhong', 'Dragon_fa', 'Dragon_bai']) {
        const count = countMap[honor] || 0;
        if (count > 0) {
            ifQYS = false;
            break;
        }
    }
    if (ifQYS) {
        let oneType = Object.keys(countMap)[0].split("_")[0];
        for (let key in countMap) {
            if (key.split("_")[0] !== oneType) {
                ifQYS = false;
                break;
            }
        }
    }
    let pairs = 0; //对数
    let haoHua = 0; //豪华对数
    for (const tile in countMap) {
        const count = countMap[tile]; //此张牌数量
        if (count % 2 !== 0) {
            return false;
        } else {
            if (count === 4) {
                haoHua = haoHua + 1;
            }
        }
        pairs += Math.floor(count / 2); // 计算对子数
    }
    if (pairs === 7) {
        winNum = 2;
        if (haoHua > 0) {
            winNum = winNum * Math.pow(2, haoHua); //豪华指数对
        }
        if (ifQYS) {
            winNum = winNum * 2;
        }
    }
    return pairs === 7; // 严格7对
}

/**
 * 检查推到胡牌
 */
function isBaseHu_tuiDao(countMap) {
    const tiles = Object.keys(countMap); //获取所有类型
    let ifQYS = true;
    let ifYTL = true;
    let divs = $("#player1_pg").find(".thisCard");
    if (divs.length >= 6) {
        ifYTL = false;
    }
    // 判断手牌中有无字牌
    for (const honor of ['Dragon_zhong', 'Dragon_fa', 'Dragon_bai']) {
        const count = countMap[honor] || 0;
        if (count > 0) {
            ifQYS = false;
            break;
        }
    }
    if (ifQYS) {
        let oneType = Object.keys(countMap)[0].split("_")[0];
        for (let key in countMap) {
            if (key.split("_")[0] !== oneType) {
                ifQYS = false;
                break;
            }
        }
        for (let k = 0; k < divs.length; k++) {
            if (divs[k].dataset.decore !== oneType) {
                ifQYS = false;
                break;
            }
        }
    }
    let LColor = "";
    if (ifYTL) {
        ifYTL = false;
        for (const suit of ['Characters', 'Bamboos', 'Dots']) {
            let ifHave = true;
            for (let num = 1; num <= 9; num++) {
                const tile = `${suit}_${num}`;
                const count = countMap[tile] || 0;
                if (count === 0) {
                    ifHave = false;
                    break;
                }
            }
            if (ifHave) {
                ifYTL = true;
                LColor = suit;
                break;
            }
        }
    }
    if (ifYTL) {
        for (const tile of tiles) {
            const newCountMap = {
                ...countMap
            };
            for (let num = 1; num <= 9; num++) {
                const tile_more = `${LColor}_${num}`;
                newCountMap[tile_more] -= 1;
            }
            if (newCountMap[tile] >= 2) { //判断这张牌大于两张
                newCountMap[tile] -= 2; // 扣除将牌
                if (canFormSets_tuiDao(newCountMap)) {
                    winNum = winNum * 2;
                    if (ifQYS) {
                        winNum = winNum * 2;
                    }
                    return true;
                }
            }
        }
    }
    // 找一对牌作为将牌（对子）
    for (const tile of tiles) {
        const newCountMap = {
            ...countMap
        };
        if (newCountMap[tile] >= 2) { //判断这张牌大于两张
            newCountMap[tile] -= 2; // 扣除将牌
            if (canFormSets_tuiDao(newCountMap)) {
                if (ifQYS) {
                    winNum = winNum * 2;
                }
                return true;
            }
        }
    }
    return false;
}

/**
 * 检查剩余牌是否能组成刻子或顺子
 */
function canFormSets_tuiDao(countMap) {
    // 复制计数map以避免修改原数据
    const tempMap = {
        ...countMap
    };
    // 处理字牌（只能组成刻子）
    for (const honor of ['Dragon_zhong', 'Dragon_fa', 'Dragon_bai']) {
        const count = tempMap[honor] || 0;
        if (count > 0) {
            if (count % 3 !== 0) {
                return false;
            }
            tempMap[honor] = 0;
        }
    }
    // 处理万、条、筒
    for (const suit of ['Characters', 'Bamboos', 'Dots']) {
        for (let num = 1; num <= 9; num++) {
            const tile = `${suit}_${num}`;
            let count = tempMap[tile] || 0;
            if (count === 0) continue;
            // 尝试组成刻子
            if (count >= 3) {
                tempMap[tile] -= 3;
            }
            while (count >= 1) {
                // 尝试组成顺子（只对万条筒有效）
                if (num <= 7 &&
                    tempMap[`${suit}_${num + 1}`] > 0 &&
                    tempMap[`${suit}_${num + 2}`] > 0) {
                    tempMap[tile] -= 1;
                    tempMap[`${suit}_${num + 1}`] -= 1;
                    tempMap[`${suit}_${num + 2}`] -= 1;
                    count = tempMap[tile] || 0;
                } else {
                    count = 0;
                }
            }
        }
    }
    // 检查是否所有牌都已组成刻子或顺子
    for (const tile in tempMap) {
        if (tempMap[tile] > 0) {
            return false;
        }
    }
    return true;
}

/**
 * 检查胡牌带金的
 */
function checkHuPai_daiJin(hand, laiZi) {
    // 1. 统计每种牌的数量
    const countMap = {};
    for (const tile of hand) {
        countMap[tile] = (countMap[tile] || 0) + 1; // 直接统计所有牌的数量
    }
    // 2. 检查七对子（需排除龙牌的特殊性）
    if (isQiDuiZi_daiJin(countMap, laiZi)) {
        return true;
    }
    // 3. 检查基础牌型（刻子/顺子）和龙牌组合
    return isBaseHu_daiJin(countMap, laiZi);
}

/**
 * 检查七对子
 */
function isQiDuiZi_daiJin(countMap, laiZi) {
    let ifQYS = true;
    // 判断手牌中有无字牌
    for (const honor of ['Dragon_zhong', 'Dragon_fa', 'Dragon_bai']) {
        const count = countMap[honor] || 0;
        if (count > 0) {
            ifQYS = false;
            break;
        }
    }
    if (ifQYS) {
        let oneType = countMap[0].split("_")[0];
        for (key in tempMap) {
            if (key.split("_")[0] != oneType) {
                ifQYS = false;
                break;
            }
        }
    }
    let pairs = 0; //对数
    let laiZiCount = countMap[laiZi] || 0; //赖子数
    let haoHua = 0; //豪华对数
    for (const tile in countMap) {
        if (tile === laiZi) continue; // 跳过赖子牌
        const count = countMap[tile];
        // 非龙牌：必须成对（允许用赖子补足）
        if (count % 2 !== 0) {
            pairs += Math.floor(count / 2); // 计算对子数
            laiZiCount -= 1; // 用赖子补足单张
            if (laiZiCount < 0) {
                return false;
            }
            pairs += 1;
        } else {
            if (count === 4) {
                haoHua++;
            }
            pairs += Math.floor(count / 2); // 计算对子数
        }
    }
    // 剩余的赖子可以组成对子
    pairs += Math.floor(laiZiCount / 2);
    if (laiZiCount == 4) {
        haoHua++;
    }
    if (pairs === 7) {
        winNum = 2;
        if (haoHua > 0) {
            winNum = winNum * Math.pow(2, haoHua);
        }
        if (ifQYS) {
            winNum = winNum * 2;
        }
    }
    return pairs === 7; // 严格7对
}

/**
 * 检查基础牌型（将牌 + 刻子/顺子）
 */
function isBaseHu_daiJin(countMap, laiZi) {
    //获取赖子之外的牌
    const tiles = Object.keys(countMap).filter(tile => tile !== laiZi);
    const laiZiCount = countMap[laiZi] || 0; //赖子数
    // 1. 尝试将普通牌作为将牌（对子）
    for (const tile of tiles) {
        const newCountMap = {
            ...countMap
        };
        if (newCountMap[tile] >= 2) { //判断这张牌大于两张
            newCountMap[tile] -= 2; // 扣除将牌
            if (canFormSets(newCountMap, laiZiCount)) {
                return true;
            }
        }
    }
    // 2. 尝试用赖子牌作为将牌（需至少2张赖子）
    if (laiZiCount >= 2) {
        const newCountMap = {
            ...countMap
        };
        newCountMap[laiZi] -= 2; // 用赖子作为将牌
        if (canFormSets(newCountMap, laiZiCount - 2)) {
            return true;
        }
    }
    return false;
}

/**
 * 检查砍堆缺胡牌
 */
function checkHuPai_kanDuiQue(hand) {
    // 1. 统计每种牌的数量
    const countMap = {};
    for (const tile of hand) {
        countMap[tile] = (countMap[tile] || 0) + 1; // 直接统计所有牌的数量
    }
    // 2. 检查七对子
    if (isQiDuiZi_kanDuiQue(countMap)) {
        return true;
    }
    // 3. 检查基础牌型（刻子/顺子）和龙牌组合
    return isBaseHu_kanDuiQue(countMap);
}

/**
 * 砍堆缺检查七对
 */
function isQiDuiZi_kanDuiQue(countMap) {
    let ifQYS = true;
    // 判断手牌中有无字牌
    let Characters_num = 0;
    let Bamboos_num = 0;
    let Dots_num = 0;
    for (const honor of ['Dragon_zhong', 'Dragon_fa', 'Dragon_bai']) {
        const count = countMap[honor] || 0;
        if (count > 0) {
            ifQYS = false;
            break;
        }
    }
    if (ifQYS) {
        let oneType = countMap[0].split("_")[0];
        for (key in tempMap) {
            if (key.split("_")[0] != oneType) {
                ifQYS = false;
                break;
            }
        }
    }

    let pairs = 0; //对数
    let haoHua = 0; //豪华对数
    for (const tile in countMap) {
        const count = countMap[tile]; //此张牌数量
        if (count % 2 !== 0) {
            return false;
        } else {
            if (count === 4) {
                haoHua = haoHua + 1;
            }
        }
        pairs += Math.floor(count / 2); // 计算对子数
    }
    if (pairs === 7) {
        winNum = 2;
        if (haoHua > 0) {
            winNum = winNum * Math.pow(2, haoHua); //豪华指数对
        }
        if (ifQYS) {
            winNum = winNum * 2;
        }
    }
    return pairs === 7; // 严格7对
}

/**
 * 检查剩余牌是否能组成刻子或顺子（支持花色和龙牌）
 */
function canFormSets(countMap, remainingLaizi) {
    //获取剩余的牌
    const tiles = Object.keys(countMap).filter(tile => countMap[tile] > 0);
    for (const tile of tiles) {
        // 跳过赖子牌（已单独处理）
        if (tile.startsWith('Dragon_')) {
            // 风牌只能作为刻子（3张相同）
            if (countMap[tile] >= 3) {
                countMap[tile] -= 3; // 直接扣除刻子
            } else if (countMap[tile] !== 0) {
                return false;
            }
        } else {
            // 普通牌：分解为刻子或顺子
            const [suit, num] = tile.split('_'); // 如 ["Characters", "1"]
            const number = parseInt(num);
            // 优先组成刻子
            if (countMap[tile] >= 3) {
                countMap[tile] -= 3;
            }
            // 尝试组成顺子（需同一花色且数字连续）
            if (countMap[tile] > 0) {
                for (let i = 0; i < countMap[tile]; i++) {
                    const nextTile1 = `${suit}_${number + 1}`;
                    const nextTile2 = `${suit}_${number + 2}`;
                    // 检查顺子是否存在或可用赖子替代
                    let neededLaizi = 0;
                    if (!countMap[nextTile1]) neededLaizi++;
                    if (!countMap[nextTile2]) neededLaizi++;
                    if (remainingLaizi >= neededLaizi) {
                        remainingLaizi -= neededLaizi;
                        countMap[tile] -= 1;
                        if (countMap[nextTile1])
                            countMap[nextTile1] -= 1;
                        if (countMap[nextTile2])
                            countMap[nextTile2] -= 1;
                    } else {
                        return false; // 无法组成顺子且赖子不足
                    }
                }
            }
        }
    }
    // 检查剩余赖子是否足够填补剩余单张
    let remainingSingles = Object.values(countMap).reduce((sum, cnt) => sum + cnt, 0);
    return remainingLaizi >= remainingSingles; // 剩余赖子必须能补足所有单张
}

/**
 * 判断当前是否可以胡牌
 * @param card
 * @returns {boolean}
 */
function checkCanHu(card) {
    let hand = []; //手牌
    let laiZi = ""; //赖子
    if (nowGamePlay === "daiJin") {
        if (keyHot && keyHot.decor === "Dragon") {
            if (keyHot.name === "中") {
                laiZi = keyHot.decor + "_zhong";
            } else if (keyHot.name === "發") {
                laiZi = keyHot.decor + "_fa";
            } else if (keyHot.name === "白") {
                laiZi = keyHot.decor + "_bai";
            }
        } else {
            laiZi = keyHot.decor + "_" + keyHot.size;
        }
    }
    for (let i = 0; i < myCards.length; i++) {
        if (myCards[i].decor === "Dragon") {
            if (myCards[i].name === "中") {
                hand.push(myCards[i].decor + "_zhong");
            } else if (myCards[i].name === "發") {
                hand.push(myCards[i].decor + "_fa");
            } else if (myCards[i].name === "白") {
                hand.push(myCards[i].decor + "_bai");
            }
        } else {
            hand.push(myCards[i].decor + "_" + myCards[i].size);
        }
    }
    if (card) {
        if (card.decor === "Dragon") {
            if (card.name === "中") {
                hand.push(card.decor + "_zhong");
            } else if (card.name === "發") {
                hand.push(card.decor + "_zhong");
            } else if (card.name === "白") {
                hand.push(card.decor + "_zhong");
            }
        } else {
            hand.push(card.decor + "_" + card.size);
        }
    }
    return canHuPai(hand, laiZi);
}

/**
 * 手牌排序方法
 * @param a
 * @param b
 * @returns {number}
 */
function sortCards(a, b) {
    if (a.decor === b.decor) {
        return a.size - b.size;
    } else {
        let decorListNum = {
            "Characters": 1,
            "Bamboos": 2,
            "Dots": 3,
            "Winds": 4,
            "Dragon": 5
        };
        let aNum = decorListNum[a.decor];
        let bNum = decorListNum[b.decor];
        return aNum - bNum;
    }
}

/**
 * 手牌数组排序方法
 * @param a
 * @param b
 * @returns {number}
 */
function sortHands(a, b) {
    let decor_a = a.split("_")[0];
    let decor_b = b.split("_")[0];
    let size_a = parseInt(a.split("_")[1]);
    let size_b = parseInt(b.split("_")[1]);
    if (decor_a === decor_b) {
        return size_a - size_b;
    } else {
        let decorListNum = {
            "Characters": 1,
            "Bamboos": 2,
            "Dots": 3,
            "Winds": 4,
            "Dragon": 5
        };
        let aNum = decorListNum[decor_a];
        let bNum = decorListNum[decor_b];
        return aNum - bNum;
    }
}

/**
 * 刷新展示手牌
 */
function showMyCards() {
    //将我的手牌排序展示
    myCards.sort(sortCards);
    //拼接手牌展示
    let hmtl = '';
    //遍历我的手牌
    for (let i = 0; i < myCards.length; i++) {
        let nowHtml = loadCard(myCards[i]);
        hmtl += nowHtml;
    }
    //将手牌区域的牌背图片清空
    $("#player1").empty();
    //显示刚刚最新的手牌
    $("#player1").append(hmtl);
}

/**
 * 清空准备状态
 */
function clearReady() {
    areYouReady = {};
    for (let i = 1; i <= nowMaJiangData.nowNum; i++) {
        areYouReady[i] = false;
    }
}