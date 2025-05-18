/*init*/
var roomId; //当前房间id
var myNum; //当前用户编号  最多位用户
var myName; //当前用户名称
var nowDeZhouPokerData; //当前对局游戏数据
//不同情况下人员位次表
// var tableNums = {
//     1: [1, 2, 3, 4], //这个数字代表座位编号
//     2: [4, 1, 2, 3], //在二号玩家的眼中，一号玩家为4号桌
//     3: [3, 4, 1, 2],
//     4: [2, 3, 4, 1],
// }
// var myCards = []; //我的手牌
var otherCards = []; //剩余牌
var nowTime = 10; //到计时时间
var timer; //定时器
var howBig = "2点";
var keyHot; //金牌
var areYouReady = {}
var nowOutPlayer = 1; //当前出牌人
var nowOutInfo = {};
//游戏开始
var stompClient;
var nowDealerNum = 1; //庄
var gangInfo = {};
var winInfo = {}
var winNum = 1;
var playerWorth = {};
var activeRooms=[];
/*js*/
window.onload = function () {
    //根据设备类型添加样式文件
    if (isMobile()) {
        loadCSS("static/css/deZhouPoker/deZhouPoker_mobile.css", function () {
            // $(".bodyLoading").css("display","none");
        });
    } else {
        loadCSS("static/css/deZhouPoker/deZhouPoker_pc.css", function () {
            // $(".bodyLoading").css("display","none");
        });
    }
    const socket = new SockJS('http://8.141.4.23:8086/stomp-websocket');
    // const socket = new SockJS('http://192.168.10.110:8999/stomp-websocket');
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
    renderGameList();
}
/**
 * 点击创建游戏
 */
function createRoom(){
    // $("#room_list").css("display", "none"); //
    $(".readyBody").css("display", "none"); //隐藏房间列表
    axios.post('/deZhou/create')
        .then(res => {
            if (res.status === 200) {
                let info = res.data.data;
                //返回主页隐藏  退出房间显示
                $("#exitPage").css("display", "none");
                $("#exitGame").css("display", "block");
                //在左上角显示房间号
                // $("#roomDiv").css("display", "flex");
                $("#thisRoomId").html(info.roomId);
                //记录当前房间id
                roomId = info.roomId;
                //记录当前用户编号
                myNum = 1;
                // TODO 展示开始游戏按钮
                //给玩家排桌次
                loadPlayerName(info.deZhouPoker);
                //获取当前用户名称
                myName = info.deZhouPoker.createUserName;
                nowDeZhouPokerData = info.deZhouPoker;
            } else {
                alert("创建房间失败! <br>(请重新登录后,尝试再次创建..)");
            }
        })
        .catch(error => {
            console.error('创建失败:', error);
            alert("创建游戏时产生未知的异常" + error);
        });
}

//让玩家就坐
function loadPlayerName(deZhouPoker) {
    for (let i = 1; i <= deZhouPoker.playerNum; i++) {
    }
}

// 加入游戏事件
function joinGame(roomId) {
    const room = activeRooms.find(r => r.id === roomId);
    if (room && room.playerNum < 10) {
        // TODO 这里可以添加实际的加入逻辑，比如WebSocket连接或页面跳转
        axios.post('/deZhou/add', 'roomId=' + nowRoomId)
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
    } else {
        alert('房间已满或不存在');
    }
}

// 渲染游戏列表
function renderGameList() {
    axios.get('/deZhou/getRoom')
        .then(res => {
            if (res.status === 200) {
                let info = res.data.data; //当前活跃的房间信息
                activeRooms=info;
                $("#gameList").empty(); //清空列表
                for (let i = 0; i < info.length; i++) {
                    let room = info[i];
                    let html = '<div class="room-card">';
                    html+=`<div class="room-info">
                        <h3>${room.createUserName}-${room.id}</h3>
                        <p>玩家数量：${room.playerNum}/10</p>`;
                    if (room.status === 1) {
                        html+=`<p class="room-status">准备中</p>`;
                    } else if (room.status === 2) {
                        html += `<p class="room-status">游戏中</p>`;
                    }
                    html+='</div>';
                    if (room.status === 1) {
                        html += '<button class="join-btn" onClick="joinGame(${room.id})">加入游戏</button>';
                    }else{
                        html += '<button class="join-btn" disabled>游戏进行中</button>';
                    }
                    html+='</div>';
                    $("#gameList").append(html);
                }
                // //添加房间信息点击监听
                // $(".room_info").on("click", function () {
                //     let nowClickRoomId = $(this).attr("data-id");
                //     $("#roomId").html(nowClickRoomId);
                //     $("#roomId").val(nowClickRoomId);
                //     $("#room_list").css("display", "none");
                // })
            }
        })
        .catch(error => {
            console.error('创建失败:', error);
            alert("创建游戏时产生未知的异常" + error);
        });
}