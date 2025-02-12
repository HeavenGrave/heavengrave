var nowUserId;
var  nowInfos=[];
var deleteEditId;
window.onload = function() {
    // const token = localStorage.getItem('token');
    // console.log('token:', token);
    if (isMobile()) {
        console.log("当前设备是手机端");
        loadCSS("css/myEdit/showEdit_mobile.css",function (){
            // $(".bodyLoading").css("display","none");
        });
    }
    //获取文档id
    nowUserId = parseInt(getParameterByName('userId'));
    if(nowUserId!=null){
        $("#btn_backMyPage").css("display","flex" );
    }else{
        $.ajax({
            url: "/edit/ifCanShow",
            type: "post",
            data: {
                userId:  nowUserId?nowUserId:0
            },
            success: function(res) {
                if (res.state === 200) {
                    if(res.data.ifCanShow) {
                        $("#btn_backMyPage").css("display", "flex");
                    }
                }else{
                    console.log("当前用户没有管理员权限");
                }
            }
        });
    }
    console.log(nowUserId); // 输出参数值到控制台或进行其他操作
    //根据用户id获取当前用户信息
    axios.post('/edit/showMyEdit','userId='+(nowUserId?nowUserId:0))
    .then(res => {
       console.log(res);
       console.log(res.data);
       if(res.status===200){
           let infos=res.data.data;
           nowInfos=res.data.data;
           console.log(infos);
           //遍历信息
           let html="";
           for (let i=0; i<infos.length; i++){
               let info=infos[i];
               if (info.userId === 0){
                   html+='<div class="edit_card"><div class="card_title">' +info.title+'</div><div style="display: flex;width: 100%;justify-content: center;"><div data-id="'+info.id+'" class="btn_div_edit">编辑</div></div></div>';
               }else{
                   html+='<div class="edit_card"><div class="card_title">' +info.title+'</div><div style="display: flex;width: 100%;justify-content: center;"><div data-id="'+info.id+'" class="btn_div_delete" >删除</div><div data-id="'+info.id+'" class="btn_div_edit">编辑</div></div></div>';
               }
           }
           $("#card_page").empty();
           $("#card_page").append(html);
           $(".loadDiv").css("display","none");
           $(".showEditBody").css("display","block");
           addCardClick();
       }
    })
}
/**
 * 判断是否是手机端
 */
function isMobile() {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    return /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
}
/**
 * 点击查询按钮监听
 */
$("#btn_search").on("click",function(){
    let name = $("#title").val();
    $(".loadDiv").css("display","block");
    $(".showEditBody").css("display","none");
    let html="";
    for(let i=0;i<nowInfos.length;i++){
        if(nowInfos[i].title.indexOf(name)!==-1) {
            let info = nowInfos[i];
            if (info.userId === 0) {
                html += '<div class="edit_card"><div class="card_title">' + info.title + '</div><div style="display: flex;width: 100%;justify-content: center;"><div data-id="' + info.id + '" class="btn_div_edit">编辑</div></div></div>';
            } else {
                html += '<div class="edit_card"><div class="card_title">' + info.title + '</div><div style="display: flex;width: 100%;justify-content: center;"><div data-id="' + info.id + '" class="btn_div_delete" >删除</div><div data-id="' + info.id + '" class="btn_div_edit">编辑</div></div></div>';
            }
        }
    }
    $("#card_page").empty();
    $("#card_page").append(html);
    $(".loadDiv").css("display","none");
    $(".showEditBody").css("display","block");
    addCardClick();
})
/**
 * 点击重置按钮监听
 */
$("#btn_Refresh").on("click",function(){
    $("#title").empty();
    $(".loadDiv").css("display","block");
    $(".showEditBody").css("display","none");
    let html="";
    for(let i=0;i<nowInfos.length;i++) {
        let info = nowInfos[i];
        if (info.userId === 0) {
            html += '<div class="edit_card"><div class="card_title">' + info.title + '</div><div style="display: flex;width: 100%;justify-content: center;"><div data-id="' + info.id + '" class="btn_div_edit">编辑</div></div></div>';
        } else {
            html += '<div class="edit_card"><div class="card_title">' + info.title + '</div><div style="display: flex;width: 100%;justify-content: center;"><div data-id="' + info.id + '" class="btn_div_delete" >删除</div><div data-id="' + info.id + '" class="btn_div_edit">编辑</div></div></div>';
        }
    }
    $("#card_page").empty();
    $("#card_page").append(html);
    $(".loadDiv").css("display","none");
    $(".showEditBody").css("display","block");
    addCardClick();
})
/**
 * 点击重置按钮监听
 */
$("#btn_add").on("click",function(){
    location.href="/myEdit?userId="+nowUserId;
})

/**
 * 添加新的文档
 */
function addCardClick(){
    /**
     * 点击编辑按钮监听
     */
    $(".btn_div_edit").click(function(){
        let myEditId=$(this).data("id");
        console.log(myEditId);
        location.href="/myEdit?myEditId=" + parseInt(myEditId)+"&userId="+nowUserId;
    })
    /**
     * 点击删除按钮监听
     */
    $(".btn_div_delete").on("click",function(){
        //显示是否确定按钮
        $("#ifDelete").css("display","block");
        deleteEditId=$(this).data("id");
        console.log(deleteEditId);
    })
    //取消删除
    $("#btn_clear").on("click",function(){
        deleteEditId=undefined;
        $("#ifDelete").css("display","none");
    });
    //确认删除
    $("#btn_ok").on("click",function(){
        axios.delete('/edit/deleteEdit?myEditId='+deleteEditId)
        .then(res => {
            console.log(res);
            console.log(res.data);
            if(res.status===200){
                location.href="/showEdit?userId="+nowUserId;
            }else{
                alert("删除失败");
            }
        })
        .catch(error => {
            console.error('删除失败:', error);
        });
    })

    /**
     *返回主页
     */
    $("#btn_backMyPage").on("click",function(){
        location.href="/myPage";
    })

    /**
     * 我的代办
     */
    $("#btn_TODO").on("click",function(){
        location.href="/myToDo?userId="+nowUserId;
    })
}