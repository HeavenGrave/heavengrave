const mazeSize = 9;//qp大小

var nowSelectDivId;//当前选中divId

var divSize = 60;//默认div大小

var nowLocationId = "";//当前所处位置divId

var roomId;//房间名称

var myNum;//编号

var myName;//名称

var nowTreasureHuntData;//当前数据

var moveId;//上一人移动的位置

var banId;//上一人禁止的位置
//宝藏默认位置

var treasure = {

    'A' : [ 0, 0 ],
    'B' : [ 0, 4 ],
    'C' : [ 0, 8 ],
    'D' : [ 4, 0 ],
    'E' : [ 4, 8 ],
    'F' : [ 8, 0 ],
    'G' : [ 8, 4 ],
    'H' : [ 8, 8 ],

}

//默认障碍点

var obstacles = [ [ 0, 3 ], [ 0, 5 ], [ 2, 2 ], [ 2, 6 ], [ 3, 0 ], [ 3, 8 ], [ 5, 0 ], [ 5, 8 ], [ 6, 2 ], [ 6, 6 ], [ 8, 3 ], [ 8, 5 ] ];

//默认信息

var palyerInfo = {

    'player1' : {

        color : '#ff0000',
        location : [ 0, 0 ],
        end : [ 8, 8 ]
    },
    'player2' : {

        color : '#0099ff',
        location : [ 0, 0 ],
        end : [ 8, 8 ]
    },
    'player3' : {

        color : '#ff9900',
        location : [ 0, 0 ],
        end : [ 8, 8 ]
    },

}

var nowLoadNum=0;//当前加载了几个人的信息

var myIdentity = 'player1';//我的身份

var nowPlayer='player1';//当前操作用户
//是否已经完成单元格禁用

var ifBan_Finish = false;

//是否已经完成了移动

var ifMove_Finish = false;
var banDivIds = []; //障碍点id

var treasureIds = []; //宝藏点id

var noBanIds={};//封禁失败DivId数组

var nowStep=0;