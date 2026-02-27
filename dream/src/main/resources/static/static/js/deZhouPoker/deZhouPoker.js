/*init*/
var roomId; //当前房间id
var myNum; //当前用户编号  最多位用户
var myName; //当前用户名称
var nowDeZhouPokerData; //当前对局游戏数据
var myCards = []; //我的手牌
//var nowTime = 10; //到计时时间
//var timer; //定时器
var howBig = "2点";
var areYouReady = {}
var nowActionPlayer = 1; //当前出牌人
//游戏开始
var stompClient;
var nowDealerNum = 1; //庄
var winInfo = {}
var winNum = 1;
var playerWorth = {};
var activeRooms = [];
var SmallBlind = 2;
var BigBlind = 4;
var communityCards = [];
var playerStatus = {};
var playerRaise = {};
var SBNum = 2;
var BBNum = 3;
var nowBet = 0;
var pot = 0;
var nowGameAllValue = 100;
var gameStatus = "Pre-flop";
const CardInfo = {
    "RedHearts" : {
        color : "#ff0000",
        name : "♥"
    },
    "Spades" : {
        color : "#000",
        name : "♠"
    },
    "Square" : {
        color : "#ff0000",
        name : "♦"
    },
    "ThePlumBlossom" : {
        color : "#000",
        name : "♣"
    },
}
const handRankNames=["高牌","一对","两对","三条","顺子","同花","葫芦","四条","同花顺","皇家同花顺"];
var AllCardData;
/*js*/
window.onload = function() {
    //根据设备类型添加样式文件
    if (isMobile()) {
        loadCSS("static/css/deZhouPoker/deZhouPoker_mobile.css", function() {
            // $(".bodyLoading").css("display","none");
        });
    } else {
        loadCSS("static/css/deZhouPoker/deZhouPoker_pc.css", function() {
            // $(".bodyLoading").css("display","none");
        });
    }
    // const socket = new SockJS('http://8.141.4.23:8086/stomp-websocket');
    const socket = new SockJS('http://192.168.10.110:8086/stomp-websocket');
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
                case "outNextOne":
                    outNextOne(info);
                    break;
                //			case "iReady":
                //				iReady(info);
                //				break
                case "readyNextGame":
                    readyNextGame(info);
                    break;
                case "startNextGame":
                    startNextGame(info);
                    break;
                case "iFold":
                    iFold(info);
                    break;
                case "iCheck":
                    iCheck(info);
                    break;
                case "iRaise":
                    iRaise(info);
                    break;
                case "iCell":
                    iCell(info);
                    break;
                case "toNextStep":
                    toNextStep(info);
                    break;
                case "updateRoomList":
                    updateRoomList(info);
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
    renderGameList(); //加载房间列表
}

/**
 * 点击创建游戏
 */
function createRoom() {
    axios.post('/deZhou/create')
        .then(res => {
            if (res.status === 200) {
                $(".readyBody").css("display", "none"); //隐藏房间列表
                $(".poker-table").css("display", "grid"); //展示牌桌子
                $(".action-buttons").css("display", "none"); //隐藏操作按钮
                $("#startGameDiv").css("display", "flex"); //展示开始游戏按钮
                let info = res.data.data;
                $("#thisRoomId").html(info.roomId); //在左上角显示房间号
                roomId = info.roomId; //记录当前房间id
                myNum = 1; //记录当前用户编号
                loadPlayerName(info.deZhouPoker); //给玩家排桌次
                myName = info.deZhouPoker.createUserName; //获取当前用户名称
                nowDeZhouPokerData = info.deZhouPoker;
                //初始化所有用户准备状态 以及筹码
                for (let i = 1; i <= info.deZhouPoker.playerNum; i++) {
                    areYouReady[i] = false;
                    playerWorth[i] = nowGameAllValue;
                    playerRaise[i] = 0;
                }
                stompClient.send('/app/sendMessage', {}, JSON.stringify({
                    type : "updateRoomList",
                    playerNum : myNum
                }));
            } else {
                alert("创建房间失败! <br>(请重新登录后,尝试再次创建..)");
            }
        })
        .catch(error => {
            console.error('创建失败:', error);
            alert("创建游戏时产生未知的异常" + error);
        });
}
/**
 * 更新房间列表信息
 */
function updateRoomList(data) {
    if (!myNum && data.playerNum !== myNum) {
        renderGameList();
    }
}

//让玩家就坐
function loadPlayerName(deZhouPoker) {
    for (let i = 1; i <= deZhouPoker.playerNum; i++) {
        $(".player-name").eq(i - 1).html(deZhouPoker["player" + i]); //展示玩家名称
        //高亮座位
        $('.player-seat').eq(i - 1).removeClass('vacant');
        $('.player-seat').eq(i - 1).addClass('active');
        $('.chips').eq(i - 1).html("¥" + nowGameAllValue); //初始化筹码
        $('.status').eq(i - 1).html("等待中"); //初始化状态
    }
}

// 加入游戏事件
function joinGame(roomId) {
    const room = activeRooms.find(r => r.id == roomId);
    if (room && room.playerNum < 8) {
        // TODO 这里可以添加实际的加入逻辑，比如WebSocket连接或页面跳转
        axios.post('/deZhou/add', 'roomId=' + roomId)
            .then(res => {
                if (res.status === 200) {
                    let info = res.data.data;
                    if (info.type === "addGameError") {
                        alert("当前房间人数已满,等下一局吧！");
                        return;
                    }
                    $(".readyBody").css("display", "none"); //隐藏房间列表
                    $(".poker-table").css("display", "grid"); //展示牌桌子
                    $("#thisRoomId").html(info.deZhouPoker.id); //展示当前加入的房间号
                    roomId = info.deZhouPoker.id; //给房间号赋值
                    myNum = info.deZhouPoker.playerNum; //玩家编号
                    myName = info.deZhouPoker["player" + myNum]; //玩家名称
                    //根据游戏信息加载座位表
                    loadPlayerName(info.deZhouPoker);
                    //初始化所有用户准备状态 以及筹码
                    for (let i = 1; i <= info.deZhouPoker.playerNum; i++) {
                        areYouReady[i] = false;
                        playerWorth[i] = nowGameAllValue;
                        playerRaise[i] = 0;
                    }
                } else {
                    alert("加入失败");
                }
            })
            .catch(error => {
                console.error('加入游戏异常:', error);
                alert("加入游戏时产生未知的异常" + error);
            });
    } else {
        alert('房间已满或不存在（已解散）');
    }
}

// 渲染游戏列表
function renderGameList() {
    axios.get('/deZhou/getRoom')
        .then(res => {
            if (res.status === 200) {
                let info = res.data.data; //当前活跃的房间信息
                activeRooms = info;
                $("#gameList").empty(); //清空列表
                for (let i = 0; i < info.length; i++) {
                    let room = info[i];
                    let html = '<div class="room-card">';
                    html += `<div class="room-info">
                        <h3>${room.createUserName}-${room.id}</h3>
                        <p>玩家数量：${room.playerNum}/8</p>`;
                    if (room.status === 1) {
                        html += '<p class="room-status">准备中</p>';
                    } else if (room.status === 2) {
                        html += '<p class="room-status">游戏中</p>';
                    }
                    html += '</div>';
                    if (room.status === 1) {
                        html += '<button class="join-btn" onClick="joinGame(' + room.id + ')">加入游戏</button>';
                    } else {
                        html += '<button class="join-btn" disabled>游戏进行中</button>';
                    }
                    html += '</div>';
                    $("#gameList").append(html);
                }
            }
        })
        .catch(error => {
            console.error('创建失败:', error);
            alert("创建游戏时产生未知的异常" + error);
        });
}

/**
 * 开始游戏
 */
function startGame() {
    if (nowDeZhouPokerData.playerNum < 3) {
        alert("至少需要三个人");
        return;
    }
    axios.put('/deZhou/start', "roomId=" + roomId)
        .then(res => {
            //展示操作按钮，隐藏开始按钮
            $(".action-buttons").css("display", "flex");
            $("#startGameDiv").css("display", "none");
        })
        .catch(error => {
            console.error('开始游戏异常:', error);
            alert("开始游戏时产生未知的异常" + error);
        });
}

/*socket*/

//----------------------------------------------------------websocket相关方法开始----------------------------------------
/**
 * websocket 有新用户加入游戏
 * @param data
 */
function addGame(data) {
    //备份当前游戏数据
    nowDeZhouPokerData = data.deZhouPoker;
    //我的游戏编号 与当前新加入用户不同  加载这个新用户的座位信息
    if (myNum !== nowDeZhouPokerData.playerNum) {
        areYouReady[nowDeZhouPokerData.playerNum] = false;
        //            playerWorth[nowDeZhouPokerData.playerNum] = info.deZhouPoker.price;
        playerWorth[nowDeZhouPokerData.playerNum] = nowGameAllValue;
        playerRaise[nowDeZhouPokerData.playerNum] = 0;
        loadPlayerName(nowDeZhouPokerData); //根据游戏信息加载座位表
    }
    $(".action-buttons").css("display", "none"); //隐藏操作按钮
    if (myName !== nowDeZhouPokerData.createUserName) {
        $("#startGameDiv").css("display", "none"); //隐藏开始按钮
    }
    //判断人数是否满足当前对局需要的人数了，开启房主开启游戏的权限
    // if (data.playerNum >= 3 && nowDeZhouPokerData.createUserName === myName) {
    //     // //移除按钮的不可点击逻辑
    //     // $("#startGame").attr("disabled", false);
    //     // //添加按钮高亮
    //     // $("#startGame").addClass("active");
    //     $("#startGameDiv").css("display", "flex");
    // }
    //重新加载游戏列表
    renderGameList();
}

/**
 * websocket 发牌
 * @param data
 */
function distributedCard(data) {
    AllCardData = data; //记录所有人手牌信息
    nowDealerNum = data.nowDealerNum; //更新坐庄的人
    myCards = data["player" + myNum]; //根据我的玩家编号获取我的手牌
    communityCards = data["other"]; //公共牌
    showMyCards(); //将我的手牌排序展示
    //判断我当前是不是庄家
    //添加庄家按钮展示
    $(".player-dealer").eq(nowDealerNum - 1).addClass("active");
    //展示小盲 大盲
    let SBNum = nowDealerNum + 1 > nowDeZhouPokerData.playerNum ? (nowDealerNum + 1) % nowDeZhouPokerData.playerNum : nowDealerNum + 1;
    let BBNum = nowDealerNum + 2 > nowDeZhouPokerData.playerNum ? (nowDealerNum + 2) % nowDeZhouPokerData.playerNum : nowDealerNum + 2;
    $(".player-SB").eq(SBNum - 1).addClass("active");
    $(".player-BB").eq(BBNum - 1).addClass("active");
    let UTGNum = nowDealerNum + 3 > nowDeZhouPokerData.playerNum ? (nowDealerNum + 3) % nowDeZhouPokerData.playerNum : nowDealerNum + 3;
    $('.player-seat').eq(UTGNum - 1).removeClass('active'); //翻牌前从枪口位行动
    $('.player-seat').eq(UTGNum - 1).addClass('activeDo');
    $('.status').eq(UTGNum - 1).html("行动中");
    nowActionPlayer = UTGNum; //记录当前行动玩家
    playerWorth[SBNum] -= SmallBlind; //减少小盲位筹码
    $('.chips').eq(SBNum - 1).html("¥" + playerWorth[SBNum]); //更新玩家剩余筹码
    playerWorth[BBNum] -= BigBlind; //减少大盲位筹码
    $('.chips').eq(BBNum - 1).html("¥" + playerWorth[BBNum]); //更新玩家剩余筹码
    $(".action-buttons").css("display", "flex"); //显示操作按钮
    //更新底池信息
    pot += (SmallBlind + BigBlind);
    $("#pot").html("¥" + pot);
    renderGameList(); //加载房间列表
}

/**
 * 下一局的发牌
 * @param data
 */
function distributedCardNext(data) {
    //    $(".dealerDiv").css("display", "none");
    //    $(".duoLa").css("display", "none"); //隐藏哆啦A梦
    //    $(".result-Div").css("display", "none"); //隐藏上一局的结果
    //    $("#continueGame").html("准备");
    //    nowDealerNum = data.nowDealerNum; //更新坐庄的人
    //    nowActionPlayer = data.nowDealerNum; //更新当前行动人
    //    for (let i = 1; i <= nowDeZhouPokerData.nowNum; i++) {
    //        gangInfo[i] = 0;
    //        winInfo[i] = 0;
    //    }
    //    //根据我的玩家编号获取我的手牌
    //    myCards = data["player" + myNum];
    //    communityCards = data["other"]; //剩余牌
    //    //将我的手牌排序展示
    //    showMyCards();
    //    //判断我当前是不是庄家
    //    //TODO 添加庄家按钮展示
    //    if (nowDealerNum === myNum) {
    //        $("#dealer_1").css("display", "block");
    //        $(".time1").css("display", "block");
    //    } else {
    //        //根据当前用户编号，获取当前用户视角位次数组
    //        let nowTableNum = tableNums[myNum];
    //        $("#dealer_" + nowTableNum[nowActionPlayer - 1]).css("display", "block");
    //        $(".time" + nowTableNum[nowActionPlayer - 1]).css("display", "block"); //展示出牌标识
    //    }
    //    //行动倒计时
    //    addTimeOut();
}

/**
 * 下家请行动
 * @param data
 */
function outNextOne(data) {
    if (playerStatus[data.nextPlayerNum] !== "allIn" && playerStatus[data.nextPlayerNum] !== "fold") {
        nowActionPlayer = data.nextPlayerNum; //更新当前行动玩家
        //轮到我了，且我的下注与当前最高下注一致 且其他人已完成至少一次下注
        if (myNum === data.nextPlayerNum && playerRaise[myNum] === nowBet && checkStatusNum(myNum)) {
            //			//相当于这一轮最后一个行动的人
            //			if(!playerStatus[myNum]){
            //
            //			}
            //			playerStatus = {};
            // TODO 判断有没有进入到下一个阶段
            if (gameStatus === "Pre-flop") {
                gameStatus = "Post-flop";
                //提醒玩家进入到了下一个阶段
                stompClient.send('/app/sendMessage', {}, JSON.stringify({
                    type : "toNextStep",
                    playerNum : myNum,
                    gameStatus : gameStatus
                }));
            } else if (gameStatus === "Post-flop") {
                gameStatus = "Turn";
                //提醒玩家进入到了下一个阶段
                stompClient.send('/app/sendMessage', {}, JSON.stringify({
                    type : "toNextStep",
                    playerNum : myNum,
                    gameStatus : gameStatus
                }));
            } else if (gameStatus === "Turn") {
                gameStatus = "River";
                //提醒玩家进入到了下一个阶段
                stompClient.send('/app/sendMessage', {}, JSON.stringify({
                    type : "toNextStep",
                    playerNum : myNum,
                    gameStatus : gameStatus
                }));
            } else if (gameStatus === "River") {
                $('.player-seat').eq(data.nextPlayerNum - 1).removeClass('active');
                $('.player-seat').eq(data.nextPlayerNum - 1).addClass('activeDo');
                //开始结算
                Showdown();
                return;
            }
        } else {
            $('.player-seat').eq(data.nextPlayerNum - 1).removeClass('active');
            $('.player-seat').eq(data.nextPlayerNum - 1).addClass('activeDo');
        }
    } else if (myNum === data.nextPlayerNum) {
        //TODO 提醒下家操作
        stompClient.send('/app/sendMessage', {}, JSON.stringify({
            type : "outNextOne",
            nextPlayerNum : myNum + 1 > nowDeZhouPokerData.playerNum ? (myNum + 1) % nowDeZhouPokerData.playerNum : myNum + 1
        }));
    }
}

/**
 * 检查玩家状态信息，是否符合一轮下注结束
 */
function checkStatusNum(myNum) {
    if (playerStatus[myNum]) {
        return Object.keys(playerStatus).length === nowDeZhouPokerData.playerNum;
    } else {
        if (Object.keys(playerStatus).length === nowDeZhouPokerData.playerNum - 1) {
            let ifAllCheck = true;
            for (let key in playerStatus) {
                if (playerStatus[key] !== "check") {
                    ifAllCheck = false;
                }
            }
            return !ifAllCheck;
        } else {
            return false;
        }
    }
}

/**
 * 开始下一轮
 */
function toNextStep(data) {
    gameStatus = data.gameStatus; //更新当前状态
    nowBet = 0; //清空当前轮的最大下注
    let nowNextNum = SBNum; //小盲
    let ifEnd = false;
    let AllInNum = 0;
    while (playerStatus[nowNextNum] === "allIn" || playerStatus[nowNextNum] === "fold") {
        if (playerStatus[nowNextNum] === "allIn") {
            AllInNum++;
        }
        nowNextNum++;
        if (nowNextNum > nowDeZhouPokerData.playerNum) {
            nowNextNum = 1;
        }
        if (nowNextNum === SBNum) {
            ifEnd = true;
            break;
        }
    }
    if (gameStatus === "Post-flop") {
        if (ifEnd) {
            if (AllInNum > 0) {
                //展示三张底牌 所有人都allIn了,直接发转牌 河牌
                $('.back').eq(0).html(communityCards[0].name + CardInfo[communityCards[0].decor].name);
                $('.back').eq(0).css("color", CardInfo[communityCards[0].decor].color);
                $('.back').eq(0).removeClass('back');
                $('.back').eq(0).html(communityCards[1].name + CardInfo[communityCards[1].decor].name);
                $('.back').eq(0).css("color", CardInfo[communityCards[1].decor].color);
                $('.back').eq(0).removeClass('back');
                $('.back').eq(0).html(communityCards[2].name + CardInfo[communityCards[2].decor].name);
                $('.back').eq(0).css("color", CardInfo[communityCards[2].decor].color);
                $('.back').eq(0).removeClass('back');
                $('.back').eq(0).html(communityCards[3].name + CardInfo[communityCards[3].decor].name);
                $('.back').eq(0).css("color", CardInfo[communityCards[3].decor].color);
                $('.back').eq(0).removeClass('back');
                $('.back').eq(0).html(communityCards[4].name + CardInfo[communityCards[4].decor].name);
                $('.back').eq(0).css("color", CardInfo[communityCards[4].decor].color);
                $('.back').eq(0).removeClass('back');
                //开始结算
                Showdown();
                return;
            } else {
                //TODO 剩余的最后玩家获胜
                //不需要再发牌了
                return;
            }
        } else {
            //TODO 展示三张底牌
            $('.back').eq(0).html(communityCards[0].name + CardInfo[communityCards[0].decor].name);
            $('.back').eq(0).css("color", CardInfo[communityCards[0].decor].color);
            $('.back').eq(0).removeClass('back');
            $('.back').eq(0).html(communityCards[1].name + CardInfo[communityCards[1].decor].name);
            $('.back').eq(0).css("color", CardInfo[communityCards[1].decor].color);
            $('.back').eq(0).removeClass('back');
            $('.back').eq(0).html(communityCards[2].name + CardInfo[communityCards[2].decor].name);
            $('.back').eq(0).css("color", CardInfo[communityCards[2].decor].color);
            $('.back').eq(0).removeClass('back');
        }
    } else if (gameStatus === "Turn") {
        if (ifEnd) {
            if (AllInNum > 0) {
                //所有人都allIn了,直接发转牌 河牌
                $('.back').eq(0).html(communityCards[3].name + CardInfo[communityCards[3].decor].name);
                $('.back').eq(0).css("color", CardInfo[communityCards[3].decor].color);
                $('.back').eq(0).removeClass('back');
                $('.back').eq(0).html(communityCards[4].name + CardInfo[communityCards[4].decor].name);
                $('.back').eq(0).css("color", CardInfo[communityCards[4].decor].color);
                $('.back').eq(0).removeClass('back');
                //开始结算
                Showdown();
                return;
            } else {
                //TODO 剩余的最后玩家获胜
                //不需要再发牌了
                return;
            }
        } else {
            //展示第四张底牌
            $('.back').eq(0).html(communityCards[3].name + CardInfo[communityCards[3].decor].name);
            $('.back').eq(0).css("color", CardInfo[communityCards[3].decor].color);
            $('.back').eq(0).removeClass('back');
        }
    } else if (gameStatus === "River") {
        if (ifEnd) {
            if (AllInNum > 0) {
                //所有人都allIn了,直接发河牌
                $('.back').eq(0).html(communityCards[4].name + CardInfo[communityCards[4].decor].name);
                $('.back').eq(0).css("color", CardInfo[communityCards[4].decor].color);
                $('.back').eq(0).removeClass('back');
                //开始结算
                Showdown();
                return;
            } else {
                //TODO 剩余的最后玩家获胜
                //不需要再发牌了
                return;
            }
        } else {
            //展示第五张底牌
            $('.back').eq(0).html(communityCards[4].name + CardInfo[communityCards[4].decor].name);
            $('.back').eq(0).css("color", CardInfo[communityCards[4].decor].color);
            $('.back').eq(0).removeClass('back');
        }
    }
    // 清空上一轮的下注信息
    $(".bet-info").empty()
    for (let i = 1; i <= nowDeZhouPokerData.playerNum; i++) {
        if (playerStatus[i] !== "allIn" && playerStatus[i] !== "fold") {
            $('.status').eq(i - 1).html("待行动"); //修改状态
            delete playerStatus[i];
        }
    }
    $(".activeDo").addClass("active");
    $(".activeDo").removeClass("activeDo");
    //提醒下家操作
    if (myNum === data.playerNum) {
        //提醒下家操作
        stompClient.send('/app/sendMessage', {}, JSON.stringify({
            type : "outNextOne",
            nextPlayerNum : nowNextNum
        }));
    }
}
/**
 * 有人弃牌了
 */
function iFold(data) {
    $('.status').eq(data.playerNum - 1).html("Fold（已弃牌）"); //修改状态
    //移除座位高亮
    $('.player-seat').eq(data.playerNum - 1).removeClass('activeDo');
    $('.player-seat').eq(data.playerNum - 1).addClass('active');
    $('.player-seat').eq(data.playerNum - 1).addClass('vacant');
    $('.bet-info').eq(data.playerNum - 1).html("");
    playerStatus[data.playerNum] = "fold";
    if (data.playerNum === myNum) {
        //提醒下家操作
        stompClient.send('/app/sendMessage', {}, JSON.stringify({
            type : "outNextOne",
            nextPlayerNum : myNum + 1 > nowDeZhouPokerData.playerNum ? (myNum + 1) % nowDeZhouPokerData.playerNum : myNum + 1
        }));
    }
}
/**
 * 有人跳过了
 */
function iCheck(data) {
    $('.status').eq(data.playerNum - 1).html("Check（已跳过）"); //修改状态
    //移除座位高亮
    $('.player-seat').eq(data.playerNum - 1).removeClass('activeDo');
    $('.player-seat').eq(data.playerNum - 1).addClass('active');
    $('.bet-info').eq(data.playerNum - 1).html('<div>Check</div>');
    playerStatus[data.playerNum] = "check";
    if (data.playerNum === myNum) {
        //提醒下家操作
        stompClient.send('/app/sendMessage', {}, JSON.stringify({
            type : "outNextOne",
            nextPlayerNum : myNum + 1 > nowDeZhouPokerData.playerNum ? (myNum + 1) % nowDeZhouPokerData.playerNum : myNum + 1
        }));
    }
}
/**
 * 有人加注了
 */
function iRaise(data) {
    $('.status').eq(data.playerNum - 1).html("Raise（已加注）"); //修改状态
    //移除座位高亮
    $('.player-seat').eq(data.playerNum - 1).removeClass('activeDo');
    $('.player-seat').eq(data.playerNum - 1).addClass('active');
    $('.bet-info').eq(data.playerNum - 1).html('<div>当前下注：¥' + data.raise + '</div>');
    playerWorth[data.playerNum] -= (data.raise - playerRaise[data.playerNum]);
    $('.chips').eq(data.playerNum - 1).html("¥" + playerWorth[data.playerNum]); //更新玩家剩余筹码
    //更新底池信息
    nowBet = data.raise;
    pot += (data.raise - playerRaise[data.playerNum]);
    playerRaise[data.playerNum] = data.raise; //更新此轮下注信息
    playerStatus[data.playerNum] = "raise";
    //展示底池
    $("#pot").html("￥" + pot);
    if (data.playerNum === myNum) {
        //提醒下家操作
        stompClient.send('/app/sendMessage', {}, JSON.stringify({
            type : "outNextOne",
            nextPlayerNum : myNum + 1 > nowDeZhouPokerData.playerNum ? (myNum + 1) % nowDeZhouPokerData.playerNum : myNum + 1
        }));
    }
}
/**
 * 有人跟注了
 */
function iCell(data) {
    $('.status').eq(data.playerNum - 1).html("Cell（已跟注）"); //修改状态
    //移除座位高亮
    $('.player-seat').eq(data.playerNum - 1).removeClass('activeDo');
    $('.player-seat').eq(data.playerNum - 1).addClass('active');
    $('.bet-info').eq(data.playerNum - 1).html('<div>当前下注：¥' + data.raise + '</div>');
    playerWorth[data.playerNum] -= (data.raise - playerRaise[data.playerNum]);
    $('.chips').eq(data.playerNum - 1).html("¥" + playerWorth[data.playerNum]); //更新玩家剩余筹码
    pot += (data.raise - playerRaise[data.playerNum]);
    //更新底池
    $("#pot").html("￥" + pot);
    playerRaise[data.playerNum] = data.raise; //更新此轮下注信息
    playerStatus[data.playerNum] = "cell";
    if (data.playerNum === myNum) {
        //提醒下家操作
        stompClient.send('/app/sendMessage', {}, JSON.stringify({
            type : "outNextOne",
            nextPlayerNum : myNum + 1 > nowDeZhouPokerData.playerNum ? (myNum + 1) % nowDeZhouPokerData.playerNum : myNum + 1
        }));
    }
}
function iAllIn(data) {
    $('.status').eq(data.playerNum - 1).html("ALL IN"); //修改状态
    //移除座位高亮
    $('.player-seat').eq(data.playerNum - 1).removeClass('activeDo');
    $('.player-seat').eq(data.playerNum - 1).addClass('active');
    $('.bet-info').eq(data.playerNum - 1).html('<div>当前下注：¥' + data.raise + '</div>');
    playerWorth[data.playerNum] -= (data.raise - playerRaise[data.playerNum]);
    $('.chips').eq(data.playerNum - 1).html("¥" + playerWorth[data.playerNum]); //更新玩家剩余筹码
    //更新底池信息
    pot += (data.raise - playerRaise[data.playerNum]);
    $("#pot").html("￥" + pot);
    playerRaise[data.playerNum] = data.raise; //更新此轮下注信息
    playerStatus[data.playerNum] = "allIn";
    if (data.playerNum === myNum) {
        //提醒下家操作
        stompClient.send('/app/sendMessage', {}, JSON.stringify({
            type : "outNextOne",
            nextPlayerNum : myNum + 1 > nowDeZhouPokerData.playerNum ? (myNum + 1) % nowDeZhouPokerData.playerNum : myNum + 1
        }));
    }
}
/**
 * 结算
 */
function PlayerWin(data) {
    clearReady(); //清空准备信息
    let ifEndGame = false;
    let html="";
    html+='<div class="result_pai">';
    html+=$(".card").parent().html;
    html+='</div>';
    html+='<div class="result_pai">';
    let cardHtml="";
    let userHtml="";
    let nowPrice=pot/data.winer.length;
    html += '<div style="display:flex;justify-content: space-around;width: 100%;"><div style="width:6rem;text-align:center;">玩家名称</div><div style="width:2rem;text-align:center;">牌型</div><div style="width:4rem;text-align:center;">获取积分</div></div>';

    for(let i=0;i<data.winer;i++){
        let winerInfo=data.winer[i];
        // cardHtml+='<div class="card">'+winerInfo.name+'</div>';
        html+='<div style="display:flex;justify-content: space-around;width: 100%;"><div style="width:6rem;text-align:center;">' + winerInfo.player.name + '</div><div style="width:2rem;text-align:center;">' +winerInfo.name+ '</div><div style="width:4rem;text-align:center;">' +nowPrice + '</div></div>';
    }
    // html+=cardHtml;
    // html+='</div>';
    // html += '<div style="display:flex;flex-direction: column;align-items: center;">';
    // html += '<div style="display:flex;justify-content: space-around;width: 100%;"><div style="width:6rem;text-align:center;">玩家名称</div><div style="width:2rem;text-align:center;"></div><div style="width:2rem;text-align:center;">杠</div><div style="width:4rem;text-align:center;">当前积分</div></div>';
    // html += '<div style="display:flex;justify-content: space-around;width: 100%;"><div style="width:6rem;text-align:center;">' + nowDeZhouPokerData["player1"] + '</div><div style="width:2rem;text-align:center;">' + (data.winInfo[1] - gangInfo[1]) + '</div><div style="width:2rem;text-align:center;">' + gangInfo[1] + '</div><div style="width:4rem;text-align:center;">' + playerWorth[1] + '</div></div>';
    // html += '<div style="display:flex;justify-content: space-around;width: 100%;"><div style="width:6rem;text-align:center;">' + nowDeZhouPokerData["player2"] + '</div><div style="width:2rem;text-align:center;">' + (data.winInfo[2] - gangInfo[2]) + '</div><div style="width:2rem;text-align:center;">' + gangInfo[2] + '</div><div style="width:4rem;text-align:center;">' + playerWorth[2] + '</div></div>';
    // html += '<div style="display:flex;justify-content: space-around;width: 100%;"><div style="width:6rem;text-align:center;">' + nowDeZhouPokerData["player3"] + '</div><div style="width:2rem;text-align:center;">' + (data.winInfo[3] - gangInfo[3]) + '</div><div style="width:2rem;text-align:center;">' + gangInfo[3] + '</div><div style="width:4rem;text-align:center;">' + playerWorth[3] + '</div></div>';
    // html += '</div>';
    $("#result-cards").html(html);
    $(".result-Div").css("display", "flex");
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
                type : "startNextGame",
                playerNum : myNum,
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
        axios.put('/deZhou/startNext', "roomId=" + roomId + "&nowDealerNum=" + myNum)
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
/*tools*/
function showMyCards() {
    myCards.sort(function(a, b) {
        if (a.length == b.length) {
            return a.decor - b.decor;
        } else {
            return a.length - b.length;
        }
    })
    let html = "";
    for (let card of myCards) {
        html += '<div class="card" style="color:' + CardInfo[card.decor].color + '" >' + card.name + CardInfo[card.decor].name + '</div>'; }
    $("#handCard").css("display", "flex");
    $("#handCard").append(html);
}

/**
 * 摊牌
 * @constructor
 */
function Showdown() {
    let result = checkCardSize();
    console.log(result);
    //牌力最大的玩家赢得底池
    //提醒下家操作
    stompClient.send('/app/sendMessage', {}, JSON.stringify({
        type : "PlayerWin",
        winer: result,
    }));
}


/**
 * 检查卡牌大小
 */
function checkCardSize() {
    let players = [];
    for (let i = 1; i <= nowDeZhouPokerData.playerNum; i++) {
        if (playerStatus[i] !== "fold") {
            let player = {};
            player.index = i;
            player.name = nowDeZhouPokerData["player" + i];
            player.folded = false;
            player.hand = AllCardData["player" + i];
            players.push(player);
        }
    }
    let result = evaluateAllPlayersHands(players);
    let best = null;
    let nowResult=[];
    for (let i = 0; i < result.length; i++) {
        let evaluated=result[i];
        if (!best || evaluated.rank > best.rank || evaluated.rank === best.rank && compareKickers(evaluated, best)) {
            best=evaluated;
            nowResult.push(evaluated);
        }
    }
    return nowResult;
}

/**
 * 比较所有玩家的手牌并返回胜负排序
 * @param {Array} players - 所有玩家
 * @returns {Array} 包含玩家和其牌型的列表，用于排序、显示胜者
 */
function evaluateAllPlayersHands(players) {
    const playersInGame = players.filter(p => !p.folded);
    if (playersInGame.length === 0) return [];
    const results = [];
    for (const player of playersInGame) {
        const allCards = [...communityCards];
        allCards.push(...player.hand);
        const bestHand = getBestFiveCardHand(allCards);
        const evaluated = evaluateHand(bestHand);
        results.push({
            player ,
            ...evaluated
        });
    }
    // 排序，最强牌在前
    results.sort((a, b) => {
        if (a.rank !== b.rank) {
            return b.rank - a.rank; // 牌型等级高的在前
        }
        // 牌型相同，比较细节
        return compareKickers(a, b);
    });
    return results;
}

/**
 * 获取一个玩家7张牌中最好的5张
 */
function getBestFiveCardHand(cards) {
    const allCombinations = getCombinations(cards,5);
    let best = null;
    for (const combo of allCombinations) {
        const evaluated = evaluateHand(combo);
        if (!best || evaluated.rank > best.rank ||
            (evaluated.rank === best.rank && compareKickers(evaluated, best))) {
            best = evaluated;
            best.combo = combo;
        }
    }
    return best.combo;
}

/**
 * 组合算法：从 n 张牌中选取 m 张
 */
function getCombinations(arr, m) {
    const result = [];
    function dfs(start, path) {
        if (path.length === m) {
            result.push([ ...path ]);
            return;
        }
        for (let i = start; i < arr.length; i++) {
            path.push(arr[i]);
            dfs(i + 1, path);
            path.pop();
        }
    }
    dfs(0, []);
    return result;
}

/**
 * 判断 5 张牌的牌型
 */
function evaluateHand(combo) {
    const ranks = combo.map(c => c.size);//获取牌值

    const rankMap = {};//统计不同牌值的数量
    const decorMap = {};//统计每个花色的数量

    for (const card of combo) {
        rankMap[card.size] = (rankMap[card.size] || 0) + 1;
        decorMap[card.decor] = (decorMap[card.decor] || 0) + 1;
    }

    const rankCounts = Object.entries(rankMap).map(([rank, count]) => ({
        rank : Number(rank),
        count
    }));
    rankCounts.sort((a, b) => b.rank - a.rank);

    const isFlush = Object.values(decorMap).some(count => count >= 5); //判断是否为同花
    const isStraight = checkStraight(ranks); //是不是顺子

    const valuesSet = [ ...new Set(ranks) ].sort((a, b) => b - a);

    // 皇家同花顺
    if (isFlush && valuesSet[0] === 14 && valuesSet.includes(13) && valuesSet.includes(12) && valuesSet.includes(11) && valuesSet.includes(10)) {
        return {
            rank : 9,
            name : handRankNames[9],
            kicker : 14,
            kickers : valuesSet
        };
    }

    // 同花顺
    if (isFlush && isStraight) {
        return {
            rank : 8,
            name : handRankNames[8],
            kicker : valuesSet[0],
            kickers : valuesSet
        };
    }

    // 四条
    const four = rankCounts.find(r => r.count === 4);
    if (four) {
        const kicker = rankCounts.find(r => r.count === 1);
        return {
            rank : 7,
            name : handRankNames[7],
            kicker : four.rank,
            kickers : valuesSet
        };
    }

    // 葫芦
    const three = rankCounts.find(r => r.count === 3);
    const pair = rankCounts.find(r => r.count === 2);
    if (three && pair) {
        return {
            rank : 6,
            name : handRankNames[6],
            triplet : three.rank,
            pair : pair.rank,
            kickers : valuesSet
        };
    }

    // 同花
    if (isFlush) {
        return {
            rank : 5,
            name : handRankNames[5],
            kicker : valuesSet[0],
            kickers : valuesSet
        };
    }

    // 顺子
    if (isStraight) {
        return {
            rank : 4,
            name : handRankNames[4],
            kicker:valuesSet[0], // high card
            kickers : valuesSet
        };
    }

    // 三条
    if (three) {
        const kickers = valuesSet.filter(v => v !== three.rank).sort((a, b) => b - a);
        return {
            rank : 3,
            name : handRankNames[3],
            triplet : three.rank,
            kickers : kickers
        };
    }

    // 两对
    const pairs = rankCounts.filter(r => r.count === 2);
    if (pairs.length >= 2) {
        const sortedPairs = pairs.sort((a, b) => b.rank - a.rank);
        const kicker = valuesSet.filter(v => v !== sortedPairs[0].rank && v !== sortedPairs[1].rank);
        return {
            rank : 2,
            name : handRankNames[2],
            pairs : sortedPairs.map(p => p.rank),
            kicker : kicker.length > 0 ? kicker[0] : 0,
            kickers : valuesSet
        };
    }

    // 一对
    if (pairs.length === 1) {
        const kickers = valuesSet.filter(v => v !== pairs[0].rank);
        return {
            rank : 1,
            name : handRankNames[1],
            pair : pairs[0].rank,
            kickers : kickers
        };
    }

    // 高牌
    return {
        rank : 0,
        name : handRankNames[0],
        kickers : valuesSet
    };
}

/**
 * 判断是否是顺子
 */
function checkStraight(values) {
    const distinctValues = [ ...new Set(values) ].sort((a, b) => a - b);
    if (distinctValues.length < 5) return false;
    if (distinctValues[4] - distinctValues[0] === 4) return true;
    // A-2-3-4-5 顺子
    if (distinctValues.includes(14) && distinctValues.includes(2) &&
        distinctValues.includes(3) && distinctValues.includes(4) && distinctValues.includes(5)) {
        return true;
    }
    return false;
}

function compareKickers(hand1, hand2) {
    // 检查特殊牌型单独比较
    switch (hand1.rank) {
        case 9: // 皇家同花顺 不需要比较花色
            return 0;
        case 8: // 同花顺
        case 4: // 顺子
            return hand1.kicker - hand2.kicker;
        case 5: // 同花
        case 0: // 高牌
            for (let i = 0; i < hand1.kickers.length; i++) {
                if (hand1.kickers[i] !== hand2.kickers[i]) {
                    return hand1.kickers[i] - hand2.kickers[i];
                }
            }
            return 0;
        case 7: // 四条
            return hand1.kicker - hand2.kicker;
        case 6: // 葫芦
            if (hand1.triplet !== hand2.triplet) {
                return hand1.triplet - hand2.triplet;
            }
            return hand1.pair - hand2.pair;
        case 3: // 三条
            if (hand1.triplet !== hand2.triplet) {
                return hand1.triplet - hand2.triplet;
            }
            for (let i = 0; i < hand1.kickers.length; i++) {
                if (hand1.kickers[i] !== hand2.kickers[i]) {
                    return hand1.kickers[i] - hand2.kickers[i];
                }
            }
            return 0;
        case 2: // 两对
            const p1 = hand1.pairs.sort((a, b) => b - a);
            const p2 = hand2.pairs.sort((a, b) => b - a);
            for (let i = 0; i < 2; i++) {
                if (p1[i] !== p2[i]) return p1[i] - p2[i];
            }
            return hand1.kicker - hand2.kicker;
        case 1: // 一对
            if (hand1.pair !== hand2.pair) {
                return hand1.pair - hand2.pair;
            }
            for (let i = 0; i < hand1.kickers.length; i++) {
                if (hand1.kickers[i] !== hand2.kickers[i]) {
                    return hand1.kickers[i] - hand2.kickers[i];
                }
            }
            return 0;
    }
    return 0;
}


/**
 * 操作按钮点击监听
 */
$(".operationBtn").on("click", function() {
    if (myNum !== nowActionPlayer) {
        alert("还没到你！");
        return;
    } else {
        let type = $(this).attr("id");
        switch (type) {
            case "fold":
                stompClient.send('/app/sendMessage', {}, JSON.stringify({
                    type : "iFold",
                    playerNum : myNum,
                }));
                break;
            case "check":
                if (nowBet === 0) {
                    stompClient.send('/app/sendMessage', {}, JSON.stringify({
                        type : "iCheck",
                        playerNum : myNum,
                    }));
                } else {
                    //TODO 已经有玩家下注，不可跳过
                }
                break;
            case "raise":
                let nowRaise = parseInt($("#nowPrice").val());
                if (nowRaise > nowBet) {
                    stompClient.send('/app/sendMessage', {}, JSON.stringify({
                        type : "iRaise",
                        playerNum : myNum,
                        raise : nowRaise
                    }));
                } else if (nowRaise === nowBet) {
                    //TODO 提示信息 加注需要比当前下注大
                }
                break;
            case "cell":
                stompClient.send('/app/sendMessage', {}, JSON.stringify({
                    type : "iCell",
                    playerNum : myNum,
                    raise : nowBet
                }));
                break;
            case "allIn":
                stompClient.send('/app/sendMessage', {}, JSON.stringify({
                    type : "iAllIn",
                    playerNum : myNum,
                    raise : playerRaise[myNum]
                }));
                break;
        }
    }
});

$("#backHome").on("click", function() {
    //TODO 告诉其他玩家，房间解散了
    // stompClient.send('/app/sendMessage', {}, JSON.stringify({
    //     type: "backHome",
    //     playerNum: myNum,
    // }));
    if (nowDeZhouPokerData.createUserName === myName) {//这是房主
        axios.put('/deZhou/exitRoom', "roomId=" + roomId )
            .then(res => {
                if (res.status === 200) {
                    let info = res.data.data;
                    //返回主页
                    window.location.href = "/TexasPoker";
                } else {
                    alert("退出失败!");
                }
            })
            .catch(error => {
                console.error('退出异常:', error);
                alert("退出房间时产生未知的异常" + error);
            });
    }else {
        //返回主页
        window.location.href = "/TexasPoker";
    }
})
/**
 * 清空准备状态
 */
function clearReady() {
    areYouReady = {};
    for (let i = 1; i <= nowDeZhouPokerData.playerNum; i++) {
        areYouReady[i] = false;
    }
}

//1.确定庄家(Button)第一局随机指定庄家位置后续每局顺时针移动庄家位置
//① 翻牌前（Pre-flop）
//小盲注(Small Blind)：庄家左侧第一位玩家
//大盲注(Big Blind)：庄家左侧第二位玩家
//每位玩家获得两张底牌。
//从UTG开始，按顺时针方向依次行动
//跟注 BB（Call）
//加注（Raise）
//弃牌（Fold）
//5. 翻牌(Flop)发三张公共牌，面朝上
//6. 第二轮下注(Post-flop)
//从小盲注玩家开始行动
//玩家可以选择：
//过牌(Check)：不下注(如果前面无人下注)
//下注(Bet)：下注
//跟注(Call)：跟前面玩家的下注
//加注(Raise)
//弃牌(Fold)
//7. 转牌(Turn)发第四张公共牌
//8. 第三轮下注
//同第二轮下注规则
//9. 河牌(River)
//发第五张公共牌
//10. 第四轮下注
//同前几轮下注规则
//11. 摊牌(Showdown)
//如果超过一名玩家未弃牌，则进行摊牌
//玩家使用自己的两张底牌和五张公共牌组成最好的五张牌
//牌力最大的玩家赢得底池