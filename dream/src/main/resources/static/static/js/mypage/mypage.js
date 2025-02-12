window.onload = function() {
    // //获取文档id
    // userId = parseInt(getParameterByName('userId'));
    // console.log(userId); // 输出参数值到控制台或进行其他操作
    //获取当前用户信息
    //获取当前用户信息
    // $.ajax({
    //     url : "/user/getUserInfo",
    //     type : "POST",
    //     data : '',
    //     dataType : "JSON",
    //     success : function(res) {
    //         if (res.state === 200) {
    //             userInfo=res.data.userInfo;
    //             userName=res.data.userName;
    //             //信息回显
    //             $("#userName").val(userName);
    //             $("#myIcon").attr("src",userInfo.image);
    //             $("#userSign").val(userInfo.signature);
    //         } else {
    //             alert("更新失败");
    //         }
    //     },
    //     error : function(xhr) {
    //         alert("更新用户头像时产生未知的异常" + xhr.message);
    //     }
    // })
    axios.get('/user/getUserInfo')
    .then(res => {
        console.log(res);
        console.log(res.data);
        if(res.status===200){
            let info=res.data;
            if(info.msg==="success"){
                userInfo=info.data;
                userName=info.data.userName;
                userId=info.data.id;
            }
        }
    })
    .catch(error => {
        console.log('获取用户信息失败:', error);
    });
}

//点击个人中心监听
$("#userCenter").on("click",function (){
    $(".myMinPage").css("display","none");
    $("#user_center").css("display","flex");
})

//返回主页
$("#exitPage").on("click",function (){
    location.href="/welcome";
})


/*音频上传*/
$("#input_audio").change(function() {
    var fileInput = document.getElementById('input_audio');
    var file = fileInput.files[0]; // 获取用户选择的文件

    var reader = new FileReader();
    reader.onload = function(e) {
        var dataURL = e.target.result;
        var base64Data = dataURL.split(',')[1]; // 提取 base64 数据部分
        // 在这里使用 base64Data 进行后续处理
        console.log(base64Data);
        //		$("#play_audio").attr("src", reader.result);
        // 创建 Audio 对象
        var audio = new Audio();
        // 设置音频源为 base64 数据
        audio.src = 'data:audio/mp3;base64,' + base64Data;
        // 播放音频
        audio.play();
    };
    reader.readAsDataURL(file);
});

/**
 * 点击我的文档
 */
$("#editCenter").on("click",function (){
    location.href="/showEdit?userId="+userId;
})

/**
 * 上传头像
 */

$("#headImage").on("change",function(){
    let fileInput = document.getElementById('headImage');
    let file = fileInput.files[0];
    let formData = new FormData();
    formData.append('file', file);
    const settings = {
        "async": true,
        "crossDomain": true,
        "url": "/img/addImage",
        "method": "POST",
        "headers": {},
        "processData": false,
        "contentType": false,
        "mimeType": "multipart/form-data",
        "data": formData
    };
    $.ajax(settings).done(function (response) {
        let res=JSON.parse(response);
        let data=JSON.parse(res.data.data);
        // 最后插入图片
        let imageUrl="";
        if (data.message==="Upload success."){
            imageUrl=data.data.url;
        }else{
            imageUrl=data.images;
        }
        $("#myIcon").attr("src",imageUrl);
        //更新用户信息
        updateUserInfo(imageUrl);
    });
})

/**
 * 更新用户信息
 */
function updateUserInfo(imageUrl,name,signature){
    $.ajax({
        url : "/users/update",
        type : "POST",
        data : {
            userId:userId,
            userName:name,
            userSign:signature,
            image:imageUrl
        },
        dataType : "JSON",
        success : function(res) {
            if (res.state === 200) {
                //显示个人名称
                userInfo=res.data;
                userName=res.data.name;
                //显示用户头像
            } else {
                alert("创建失败");
            }
        },
        error : function(xhr) {
            alert("获取用户信息时产生未知的异常" + xhr.message);
        }
    })
}
/**
 * 上传文件
 */
function uploadImage() {
    var fileInput = document.getElementById('fileInput');
    var file = fileInput.files[0];

    var formData = new FormData();
    formData.append('file', file);


    const settings = {
        "async": true,
        "crossDomain": true,
        "url": "/img/uploadNew",
        "method": "POST",
        "headers": {},
        "processData": false,
        "contentType": false,
        "mimeType": "multipart/form-data",
        "data": formData
    };

    $.ajax(settings).done(function (response) {
        // console.log(response);
        nowData =JSON.parse(response);
        document.getElementById('result').innerHTML = '<img src="'+nowData.data.data.url+'" alt="Uploaded Image" />';
    });

}