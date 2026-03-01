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
