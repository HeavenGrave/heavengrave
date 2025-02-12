window.onload = function () {
    keybegin();//初始化键盘监听
    //生成一个难度等级为7的数独
    addSD(7);
}



//校验数字是否正确
function isValid(board, row, col, num) {
    for (let x = 0; x < 9; x++) {
        if (board[row][x] === num || board[x][col] === num ||
            board[3 * Math.floor(row / 3) + Math.floor(x / 3)][3 * Math.floor(col / 3) + x % 3] === num) {
            return false;
        }
    }
    return true;
}
//获取解决方案
function solveSudoku(board) {
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if (board[row][col] === 0) {
                for (let num = 1; num <= 9; num++) {
                    if (isValid(board, row, col, num)) {
                        board[row][col] = num;
                        if (solveSudoku(board)) {
                            return true;
                        }
                        board[row][col] = 0;
                    }
                }
                return false;
            }
        }
    }
    return true;
}
//根据难度随机移除部分数字
function removeNumbers(board,difficulty) {
    let attempts =Math.floor(difficulty * 7.2);
    while (attempts > 0) {
        let row = Math.floor(Math.random() * 9);
        let col = Math.floor(Math.random() * 9);
        while (board[row][col] === 0) {
            row = Math.floor(Math.random() * 9);
            col = Math.floor(Math.random() * 9);
        }
        board[row][col] = 0;
        attempts--;
    }
}
//Fisher-Yates 洗牌算法
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // 交换元素
    }
    return array;
}
//根据等级创建
function generateSudoku(difficulty) {
    let board = [];
    for (let i = 0; i < 9; i++) {
        board[i] = new Array(9).fill(0);
    }
// 填充一些数字来创建初始状态
    var arr=[1,2,3,4,5,6,7,8,9];
    shuffle(arr);//打乱数组顺序
    for(let i=0;i<arr.length;i++){
        board[0]=arr;
    }
// 解决数独以确保它是有效的 ,并且是随机的
    solveSudoku(board);
    for(let i=0;i<9;i++){
        for(let j=0;j<9;j++){
            daAn[i+"_"+j]=board[i][j];
        }
    }
//根据难度 移除部分数字
    removeNumbers(board, difficulty);
    return board;
}
var selectDivId;
var count=0;
var daAn={};
function addSD(difficulty){
    $(".addSD").css("display","block");
    let board=generateSudoku(difficulty);
    let html='<div class="shuDuCanvas" style="display: grid;width: 100%;font-size: 10px;height: 100%;grid-template-columns: repeat(9,11.11%);border:1px solid #ccc;grid-template-rows: repeat(9,11.11%);">';
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            let content = board[i][j] != 0 ? board[i][j] : '';
            let ifCanChange = board[i][j] != 0 ? false : true;
            let right = 2;
            let bottom = 2;
            let rightColor = "#ccc";
            let bottomColor = "#ccc";
            if (i==8) {
                bottom = 0;
            }
            if (j==8) {
                right = 0;
            }
            if((i+1)%3==0&&i<8){
                bottomColor="#ff9900";
            }
            if((j+1)%3==0&&j<8){
                rightColor="#ff9900";
            }
            html += '<div id="' + i + '_' + j + '" class="numDiv" data-change=' + ifCanChange + ' style="color:' + (ifCanChange ? "#00b8ff" : "#000") + ';border-right:' + right + 'px solid '+rightColor+';border-bottom:' + bottom + 'px solid '+bottomColor+';">' + content + '</div>';
        }
    }
    html+='</div>';
    $(".addSD").empty();
    $(".addSD").append(html);
    $(".numDiv").on("click",function(){
        let ifCanChange=$(this).attr("data-change");
        $(".active").removeClass("active");
        $(this).addClass("active");
        if(ifCanChange=="true"){
            selectDivId=$(this).attr("id");
        }else{
            let num=parseInt($(this).html());
            for(key in daAn){
                if(daAn[key]==num){
                    if($("#"+key).attr("data-change")=="false"){
                        $("#"+key).addClass("active");
                    }
                }
            }
        }
    })
}
/**
 * 键盘监听开始
 * @author 赵文博 2021年11月18日 14:21
 */
function keybegin(){
//键盘按下事件
    $(document).keydown(function(event){
        if(selectDivId==""){
            return;
        }
        let value=0;
        switch(event.keyCode){
            case 49:
            case 97:
                value=1;
                break;
            case 50:
            case 98:
                value=2;
                break;
            case 51:
            case 99:
                value=3;
                break;
            case 52:
            case 100:
                value=4;
                break;
            case 53:
            case 101:
                value=5;
                break;
            case 54:
            case 102:
                value=6;
                break;
            case 55:
            case 103:
                value=7;
                break;
            case 56:
            case 104:
                value=8;
                break;
            case 57:
            case 105:
                value=9;
                break;
        }
        if(value!=0){
            if(daAn[selectDivId]==value){
                $("#"+selectDivId).html(value);
                $("#"+selectDivId).attr("data-change",false);
            }else{
                count++;
                $("#"+selectDivId).html('<div style="color:red">'+value+'<div>');
            }
            $(".active").removeClass("active");
            selectDivId="";
        }
        //38up 37left 39 right 40 down
    });
}