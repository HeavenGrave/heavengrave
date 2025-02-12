window.onload = function() {
    //根据设备类型添加样式文件
    if (isMobile()) {
        console.log("当前设备是手机端");
        loadCSS("static/css/treasureHunt/treasureHunt_mobile.css",function (){
            $(".bodyLoading").css("display","none");
        });
    } else {
        console.log("当前设备是电脑端");
        loadCSS("static/css/treasureHunt/treasureHunt_window.css",function (){
            $(".bodyLoading").css("display","none");
        });
    }
    //连接webSocket

        const socket = new SockJS('http://8.141.2.23:8086/stomp-websocket');
        stompClient = Stomp.over(socket);
        // 连接成功后的回调
        stompClient.connect({}, () => {
            stompClient.subscribe('/topic/messages', (response) => {
                // console.log('收到 JSON 对象:', JSON.parse(response.body))
                let jsonData = JSON.parse(response.body);
                let msg = jsonData; //websocket传递的信息
                if(jsonData.received) {
                    // 1. 提取 received 字段
                    let base64String = jsonData.received;
                    // 2. 解码 Base64 字符串
                    let decodedString = atob(base64String); // 输出: {"key":"value","list":[1,2,3]}
                    // 3. 解析为 JSON 对象
                    msg = JSON.parse(decodedString);
                }
                console.log(msg);
                switch (msg.type) { //当前操作类型
                    case 'addGame': //加入游戏
                        addGame(msg);
                        break;
                    case 'startGame': //开始游戏
                        startGame(msg);
                        break;
                    case "addTreasure":
                        addTreasure(msg);
                        break;
                    case "nextMove":
                        nextMove(msg);
                        break;
                    case "PlayerWin":
                        PlayerWin(msg);
                        break;
                    case "noBan":
                        noBan(msg);
                        break;
                }
            });
            // // 发送任意 JSON 对象
            // stompClient.send('/app/sendMessage', {}, JSON.stringify({
            //     key: "value",
            //     list: [1, 2, 3]
            // }));
        });

    //加载棋盘
    initializationChessboard();
    //添加按钮点击监听
    btnClickListen();
    //添加按钮点击监听
    addClickEvent();

    //退出房间
    $("#exitGame").on("click",function (){
        //重新访问寻宝游戏
        location.href="//treasureHunt";
    })
    //返回主页
    $("#exitPage").on("click",function (){
        //返回到主页
        location.href="/welcome";
    })
    //添加定时同步游戏信息的方法
    // intervalId = setInterval(synchronizeInformation, 1000);
}
//-----------------------------------------------------------创建游戏流程-------------------------------------------------
function addClickEvent() {
    //创建游戏
    $("#createHunt").on("click", function() {
        $.ajax({
            url : "/hunt/create",
            type : "POST",
            data : '',
            dataType : "JSON",
            success : function(res) {
                if (res.state == 200) {
                    //隐藏返回主页按钮,显示退出房间
                    $("#exitPage").css("display", "none");
                    $("#exitGame").css("display", "block");
                    //在最上方显示房间号
                    $("#roomDiv").css("display", "flex");
                    $("#thisRoomId").html(res.data.roomId);
                    //记录当前房间id
                    roomId = res.data.roomId;
                    //记录当前用户编号
                    myNum = 1;
                    //隐藏创建游戏按钮
                    $("#createDiv").css("display", "none");
                    //展示准备人数，以及开始按钮
                    $("#gameShowDiv").css("display", "flex");
                    //给玩家排桌次
                    addPlayerName(res.data.treasureHunt);
                    //获取当前用户名称
                    myName = res.data.treasureHunt.createuser;
                } else {
                    nowAlertFn("创建失败");
                }
            },
            error : function(xhr) {
                nowAlertFn("创建游戏时产生未知的异常" + xhr.message);
            }
        })
    })
    //加入游戏
    $("#addGame").on("click", function() {
        let nowRoomId = $("#roomId").val();
        if (nowRoomId === "") {
            nowAlertFn("请先输入房间号！");
        } else {
            $.ajax({
                url : "/hunt/add",
                type : "POST",
                data : "roomId=" + nowRoomId,
                dataType : "JSON",
                success : function(res) {
                    if (res.state === 200) {
                        if (res.data.type === "addGameError") {
                            nowAlertFn("当前房间人数已满,等下一局吧！");
                            return;
                        }
                        //返回主页隐藏 退出房间显示
                        $("#exitPage").css("display", "none");
                        $("#exitGame").css("display", "block");
                        //展示当前加入的房间号
                        $("#roomDiv").css("display", "flex");
                        $("#thisRoomId").html(res.data.treasureHunt.id);
                        //给房间号赋值
                        roomId = res.data.treasureHunt.id;
                        myNum = res.data.treasureHunt.playernum;
                        myName = res.data.treasureHunt["player" + myNum];
                        //隐藏创建游戏按钮
                        $("#createDiv").css("display", "none");
                        //展示准备人数，以及开始按钮
                        $("#gameShowDiv").css("display", "flex");
                        //根据游戏信息加载座位表
                        addPlayerName(res.data.treasureHunt);
                    } else {
                        nowAlertFn("创建房间失败! <br>(请重新登录后,尝试再次创建..)");
                    }
                },
                error : function(xhr) {
                    nowAlertFn("创建游戏时产生未知的异常" + xhr.message);
                }
            })
        }
    })

    //开始游戏
    $("#startGame").on("click", function() {
        if ($("#startGame").attr("disabled") == "disabled") {
            return;
        } else {
            $.ajax({
                url : '/hunt/start',
                method : 'PUT', // 请求方法，可以是 'GET', 'POST', 'PUT', 'DELETE' 等
                dataType : 'JSON', // 响应数据的格式，可以是 'json', 'xml', 'text' 等
                data : {
                    data : nowTreasureHuntData,
                    roomId : roomId,
                    type : "create",
                },
                success : function(res) {
                    // console.log('请求成功:', response);
                },
                error : function(xhr, status, error) {
                    // 请求失败时的处理函数
                    // console.log('请求失败:', error);
                }
            });
        }
    })
}


//给玩家排桌次
function addPlayerName(data) {
    //我的编号为空时，代表我还未加入游戏，不需要加载其他用户信息
    if (!myNum) {
        return;
    }
    //遍历游戏对象，获取当前加入对局的玩家信息
    for (let i = 1; i <= 3; i++) {
        let name = data["player" + i]; //获取i号玩家的名称
        //当前玩家不为空(当前玩家已经加入了游戏,需要显示他的坐次)
        if (name != null && name !== "null" && name !== "" && name !== undefined) {
            $("#name" + i).empty();
            $("#name" + i).html(name);
        }
    }
}
//请下一位玩家移动
function pleaseNextMove() {
    $.ajax({
        url : "/hunt/nextMove",
        type : "POST",
        data : {
            moveId : moveId,
            banId : banId,
            myNum : myNum,
        },
        dataType : "JSON",
        success : function(res){
        },
        error : function(xhr){
        }
    })
}

//----------------------------------------------------------websocket相关方法开始----------------------------------------
/**
 * websocket 有新用户加入游戏
 * @param data
 */
function addGame(data) {
    //通过json转对象的方法，获取当前游戏数据
    let treasureHunt = parseTreasureHunt(data.treasureHunt);
    treasureHunt.playernum = data.playernum; //第几个加入的人
    //显示游戏组人进度 n/3
    $("#nowPlayerNum").html(data.playernum);
    //判断人数是否满足三个人了，开启房主开启游戏的权限
    if (data.playernum === 3 && treasureHunt.createuser === myName) {
        //移除按钮的不可点击逻辑
        $("#startGame").attr("disabled", false);
        //添加按钮高亮
        $("#startGame").addClass("active");
    }
    //备份当前游戏数据
    nowTreasureHuntData = treasureHunt;
    //我的游戏编号 与当前新加入用户不同 加载这个新用户的座位信息
    if (myNum !== treasureHunt.playernum) {
        //加载用户座位信息
        addPlayerName(treasureHunt);
    }
}


/**
 * websocket 开始游戏
 * @param data
 */
function startGame(data) {
    if (data.nowType == 'create') {
        //隐藏游戏创建页面
        $(".createDiv").css("display", "none");
    } else { //hunt
        //隐藏游戏准备页面
        $(".readyDiv").css("display", "none");
        myIdentity = "player" + myNum;//初始化自己的身份
        nowPlayer = data.nowMovePlayer;//记录当前行动玩家
        //隐藏等待遮罩
        $(".loadingDiv").css('display', "none");
        //初始化玩家位置
        initializationPlayerLocation();
    }
}

/**
 * 初始化每个玩家的开始点和宝藏点
 */
function addTreasure(data) {
    palyerInfo["player" + data.num].location = treasure[data.startNode];
    palyerInfo["player" + data.num].end = treasure[data.endNode];
    nowLoadNum = nowLoadNum + 1;
    //等待所有玩家选择完成，由房主发送开始游戏
    if (nowLoadNum == 3 && nowTreasureHuntData.createuser === myName) {
        $.ajax({
            url : '/hunt/start',
            method : 'PUT', // 请求方法，可以是 'GET', 'POST', 'PUT', 'DELETE' 等
            dataType : 'JSON', // 响应数据的格式，可以是 'json', 'xml', 'text' 等
            data : {
                data : nowTreasureHuntData,
                roomId : roomId,
                type : "hunt",
            },
            success : function(res) {
            },
            error : function(xhr, status, error) {
            }
        });
    }
}

/**
 * 同步上一位玩家的行动，下家开始行动
 */
function nextMove(data) {
    //先ban
    if (data.oldNum != myNum) {
        let banRow = data.banId.split("_")[0];
        let banCol = data.banId.split("_")[1];
        let banHtml = '<div style="color:' + palyerInfo["player" + data.oldNum].color + ';">✖</div>';
        $("#" + data.banId).attr("data-move", false);
        $("#" + data.banId).append(banHtml);
        obstacles.push([ parseInt(banRow), parseInt(banCol)]);
    }
    //后选
    let moveRow = data.moveId.split("_")[0];
    let moveCol = data.moveId.split("_")[1];
    let moveHtml = '<div id="player' + data.oldNum + '" style="color:' + palyerInfo["player" + data.oldNum].color + ';" >▲</div>';
    $("#player" + data.oldNum).remove();
    palyerInfo["player" + data.oldNum].location=[parseInt(moveRow),parseInt(moveCol)];
    $("#" + data.moveId).append(moveHtml);
    //改变当前行动人的信息
    nowPlayer = "player" + data.nextNum;
    $("#nowOperation").css("color", palyerInfo[nowPlayer].color);
    if (nowPlayer == myIdentity) {
        ifBan_Finish = false;
        ifMove_Finish = false;
        showTip("轮到你了，请开始你的表演。。");
    }
}


/**
 * 同步封禁失败信息
 */
function noBan(data) {
    if (data.oldNum == myNum) {
        ifBan_Finish = true;
        ifMove_Finish = true;
    } else {
        if (noBanIds[data.noBanID]) {
            noBanIds[data.noBanID].push(data.oldNum);
        } else {
            noBanIds[data.noBanID] = [];
            noBanIds[data.noBanID].push(data.oldNum);
        }
    }
    //改变当前行动人的信息
    nowPlayer = "player" + data.num;
    $("#nowOperation").css("color", palyerInfo[nowPlayer].color);
    if (nowPlayer == myIdentity) {
        ifBan_Finish = false;
        ifMove_Finish = false;
        showTip("轮到你了，请开始你的表演。。");
    }
    updetaNoBan();
}
//----------------------------------------------------------websocket相关方法结束----------------------------------------


function updetaNoBan() {
    $(".banRowInfo").empty();
    for (let key in noBanIds) {
        let playerNums = noBanIds[key];
        let html = '<div class="rowInfo">';
        html += '<div style="">'+key+'：</div>';
        for (let i = 0; i < playerNums.length; i++) {
            html += '<div style="color:' + palyerInfo["player" + playerNums[i]].color + ';margin: 0px 5px;">▲</div>';
        }
        html += '</div>';
        $(".banRowInfo").append(html);
    }
}


//添加按钮点击监听
function btnClickListen() {
    //点击监听
    $(".cellDiv").on("click", function() {
        if (nowPlayer != myIdentity) {
            nowAlertFn("没到你回合,请稍后!");
            return;
        }
        //判断当前div是否为障碍点
        let ifCanMove = $(this).attr("data-move");
        if (ifCanMove == "true") {
            //选中当前div
            $(this).addClass("selected");
            //展示选择div
            $(".selectDiv").css("display", "flex");
            nowSelectDivId = $(this).attr("id");
            if (ifBan_Finish) {
                $("#Ban").css("display","none");
                $("#Move").css("display","block");
            } else {
                $("#Ban").css("display","block");
                $("#Move").css("display","none");
            }
        }else{
            nowAlertFn("当前点为障碍点，无法操作!");
            return;
        }
    })
    //点击封禁按钮
    $("#Ban").on("click", function() {
        //是否完成了封禁
//		if (ifBan_Finish) {
//			nowAlertFn("你这回合已经添加了一个障碍!");
//			return;
//		}
        if (treasureIds.indexOf(nowSelectDivId) >= 0) {
            //隐藏选择div
            clear();
            nowAlertFn("无法禁用一个宝藏点!");
            return;
        }
        //判断是否为其他玩家所在点
        let nowRow = nowSelectDivId.split("_")[0];
        let nowCol = nowSelectDivId.split("_")[1];
        const deepCopiedArray = JSON.parse(JSON.stringify(obstacles));
        deepCopiedArray.push([parseInt(nowRow),parseInt(nowCol)]);
        for (let key in palyerInfo) {
            let start = palyerInfo[key]['location'];
            let end = palyerInfo[key]['end'];
            if(start[0]+"_"+start[1]==nowSelectDivId){
                //隐藏选择div
                clear();
                nowAlertFn("无法禁用一个玩家所在点!");
                return;
            }
            if (!isPathExist(start, end, deepCopiedArray)) {
                //隐藏选择div
                clear();
                nowAlertFn("当前点封禁无效，你被沉默了!");
                //判断当前点位是否之前被选错过
                if (noBanIds[nowSelectDivId]) {
                    noBanIds[nowSelectDivId].push(myNum);
                } else {
                    noBanIds[nowSelectDivId] = [];
                    noBanIds[nowSelectDivId].push(myNum);
                }
                $.ajax({
                    url : "/hunt/noBan",
                    type : "POST",
                    data : {
                        noBanID : nowSelectDivId,
                        myNum : myNum
                    },
                    dataType : "JSON",
                    success : function(res) {
                    },
                    error : function(xhr) {
                    }
                })
                return;
            }
        }
        let html = '<div style="color:' + palyerInfo[myIdentity].color + ';">✖</div>';
        $("#" + nowSelectDivId).attr("data-move", false);
        $("#" + nowSelectDivId).append(html);
        obstacles.push([ parseInt(nowRow), parseInt(nowCol) ]);
        //隐藏选择div
        clear();
        ifBan_Finish = true;
        banId = nowSelectDivId;
    })


    //点击取消按钮
    $("#cancel").on("click", function() {
        //隐藏选择div
        clear();
    })


    //点击移动按钮
    $("#Move").on("click", function() {
        //是否完成了移动
//		if (ifMove_Finish) {
//			nowAlertFn("你这回合已经移动了一次了!");
//			return;
//		}
        let nowRow = nowLocationId.split("_")[0];
        let nowCol = nowLocationId.split("_")[1];
        let targetRow = nowSelectDivId.split("_")[0];
        let targetCol = nowSelectDivId.split("_")[1];
        let html = '<div id="' + myIdentity + '" style="color:' + palyerInfo[myIdentity].color + ';" >▲</div>';
        if (nowRow == targetRow && Math.abs(nowCol - targetCol) == 1) {
            $("#" + myIdentity).remove();
            $("#" + nowSelectDivId).append(html);
        } else if (nowCol == targetCol && Math.abs(nowRow - targetRow) == 1) {
            $("#" + myIdentity).remove();
            $("#" + nowSelectDivId).append(html);
        } else if (Math.abs(nowCol - targetCol) == 1 && Math.abs(nowRow - targetRow) == 1) {
            $("#" + myIdentity).remove();
            $("#" + nowSelectDivId).append(html);
        } else {
            clear();
            //不可移动
            nowAlertFn("只能选择当前所在格的相邻格移动!");
            return;
        }
        nowLocationId = nowSelectDivId; //更新当前所在divId
        //隐藏选择div
        clear();
        //判断是否走到终端了
        if (nowLocationId == (palyerInfo[myIdentity]['end'][0] + "_" + palyerInfo[myIdentity]['end'][1])) {
            nowAlertFn("you are winer!");
            //告诉其他人，你赢了
            $.ajax({
                url : "/hunt/win",
                type : "POST",
                data : {
                    myName : myName,
                    myNum : myNum
                },
                dataType : "JSON",
                success : function(res) {
                },
                error : function(xhr) {
                }
            })
        }
        ifMove_Finish = true;
        moveId = nowLocationId;
        if (ifBan_Finish) {
            pleaseNextMove();
            showTip("你的回合已结束，请等待其他玩家操作。。");
        }
    })


    //点击确认按钮
    $("#ok").on("click", function() {
        //隐藏提示div
        $(".alertDiv").css("display", "none");
    })
    //点击开始按钮
    $("#go").on("click", function() {
        //获取下一位玩家的开始结束点
        let startNode = $("#select_start").val();
        let endNode = $("#select_end").val();
        $.ajax({
            url : "/hunt/addTreasure",
            type : "POST",
            data : {
                startNode : startNode,
                endNode : endNode,
                myNum : myNum
            },
            dataType : "JSON",
            success : function(res) {
                if (res.state == 200) {
                    //遮罩 等待其他玩家选择 避免重复点击确定按钮
                    $(".loadingDiv").css('display', "flex");
                } else {
                    nowAlertFn("添加失败");
                }
            },
            error : function(xhr) {
                nowAlertFn("添加失败");
            }
        })
    })
    //点击tip确认按钮
    $("#back").on("click", function() {
        //隐藏提示div
        $(".tipInfoDiv").css("display", "none");
    })
}




function clear(){
    //隐藏选择div
    $(".selectDiv").css("display", "none");
    $(".selected").removeClass("selected");
}




function showTip(info){
    $(".tipInfoDiv").css("display","flex");
    $("#tipInfo").html(info);
}


//初始化地图
function initializationChessboard() {
    //加载棋盘
    let contentHtml = '';
    for (let i = 0; i <=mazeSize; i++) {
        for (let j = 0; j <=mazeSize; j++) {
            if(i!=mazeSize&&j!=mazeSize){
                contentHtml += '<div class="cellDiv" id="' + i + "_" + j + '" data-move=true style="width:' + divSize + 'px;height:' + divSize + 'px;font-size:' + (divSize / 3) + 'px;"></div>';
            }else if(i==mazeSize&&j!=mazeSize){
                contentHtml += '<div class="cellDiv_num"  style="border-top: 1px solid #000;border-left: 1px solid #ffffff00;width:' + divSize + 'px;height:' + divSize + 'px;font-size:' + (divSize / 3) + 'px;text-align: center;line-height:' + divSize + 'px;">'+j+'</div>';
            }else if(j==mazeSize&&i!=mazeSize){
                contentHtml += '<div class="cellDiv_num"  style="border-left: 1px solid #000;border-top: 1px solid #ffffff00;width:' + divSize + 'px;height:' + divSize + 'px;font-size:' + (divSize / 3) + 'px;text-align: center;line-height:' + divSize + 'px;">'+i+'</div>';
            }
        }
    }
    $(".content").empty();
    $(".content").css("width", ((divSize + 1) * (mazeSize+1)) + "px");
    $(".content").append(contentHtml);
    //加载默认障碍物
    for (let i = 0; i < obstacles.length; i++) {
        let id = obstacles[i][0] + '_' + obstacles[i][1];
        banDivIds.push(id);
        let html = '<div>✖</div>';
        $("#" + id).attr("data-move", false);
        $("#" + id).append(html);
    }
    //加载宝藏点
    for (let key in treasure) {
        let id = treasure[key][0] + '_' + treasure[key][1];
        let html = '<div>' + key + '</div>';
        treasureIds.push(id);
        $("#" + id).append(html);
    }
}


//初始化玩家位置
function initializationPlayerLocation() {
    //初始化玩家位置
    for (let key in palyerInfo) {


        let html = '<div id="' + key + '" style="color:' + palyerInfo[key].color + ';" >▲</div>';
        $("#" + palyerInfo[key].location[0] + "_" + palyerInfo[key].location[1]).append(html);
        if (key == myIdentity) {


            nowLocationId = palyerInfo[key].location[0] + "_" + palyerInfo[key].location[1];
        }
    }
}

//自定义提示方法
function nowAlertFn(text) {
    //显示提示div
    $(".alertDiv").css("display", "flex");
    $("#alertInfo").html(text);
    $(".selected").removeClass("selected");
}
//判断是否存在通路
function isPathExist(start, end, obstacles) {
    const n = 9; // 迷宫的大小
    const directions = [
        [ 0, 1 ], [ 1, 0 ], [ 0, -1 ], [ -1, 0 ], // 右，下，左，上
        [ 1, 1 ], [ 1, -1 ], [ -1, 1 ], [ -1, -1 ] // 右下，右上，左下，左上
    ];
    // 创建迷宫，并标记障碍物
    const maze = Array.from({
        length : n
    }, () => Array(n).fill(0));
    for (const [x, y] of obstacles) {
        maze[x][y] = 1; // 标记障碍物
    }
    // 检查点是否在迷宫范围内并且没有障碍物
    function isValid(x, y) {
        return x >= 0 && x < n && y >= 0 && y < n && maze[x][y] === 0;
    }
    // 初始化队列并将起点加入队列
    const queue = [ [ start[0], start[1] ] ];
    maze[start[0]][start[1]] = 1; // 标记起点为已访问
    while (queue.length > 0) {
        const [x, y] = queue.shift();
        // 如果到达终点，返回true
        if (x === end[0] && y === end[1]) {
            return true;
        }
        // 扩展当前点的八个方向
        for (const [dx, dy] of directions) {
            const newX = x + dx;
            const newY = y + dy;
            if (isValid(newX, newY)) {
                queue.push([ newX, newY ]);
                maze[newX][newY] = 1; // 标记为已访问
            }
        }
    }
    // 如果队列为空仍未到达终点，返回false
    return false;
}
//工具类
function parseTreasureHunt(treasureHuntStr) {
    const obj = {};
    const regex = /(\w+)='([^']*)'/g;
    let match;
    while (match = regex.exec(treasureHuntStr)) {
        obj[match[1]] = match[2];
    }
    return obj;
}



//定时同步游戏信息
function synchronizeInformation(){
    //判断当前是否是当前用户的回合
    if(myIdentity==nowPlayer){
        return;
    }else {//同步信息
        axios.post('/hunt/updateGame','startNode='+startNode+'&endNode='+endNode+'&myNum='+myNum)
            .then(res => {
                console.log(res);
                console.log(res.data);
                if(res.status===200){
                    let info=res.data;
                    //遮罩 等待其他玩家选择 避免重复点击确定按钮
                    // $(".loadingDiv").css('display', "flex");
                }else{
                    nowAlertFn("添加失败");
                }
            })
            .catch(error => {
                nowAlertFn("添加失败");
            });
    }
}
