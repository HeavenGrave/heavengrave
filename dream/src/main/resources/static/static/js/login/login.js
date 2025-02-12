window.onload = function () {
    document.querySelector('.img__btn').addEventListener('click', function() {
        document.querySelector('.cont').classList.toggle('s--signup');
    });
    /**
     * 点击登录按钮
     */
    $("#doLogin").click(function (){
        let username=$("#name").val();
        let password=$("#password").val();
        axios.post('/user/login','name='+username+'&password='+password)
        .then(res => {
            console.log(res);
            console.log(res.data);
            if(res.status===200){
                let info=res.data;
                if(info.msg==="success"){
                    // location.href="/showEdit?userId="+info.data.id+"&token="+info.data.token;//重定向到首页
                    location.href="/myPage";
                }else {
                    $("#name").val("");
                    $("#password").val("");
                    //展示错误信息
                    alert(info.msg);
                }
            }else{
                alert("登录失败");
            }
        })
        .catch(error => {
            console.error('登录失败:', error);
        });
    })
    /**
     * 点击注册按钮
     */
    $("#registered").click(function (){
        let username=$("#new_name").val();
        let password=$("#new_password").val();
        //个性签名
        let signature=$("#new_signature").val();
        axios.post('/user/reg','name='+username+'&password='+password+'&signature='+signature)
        .then(res => {
            console.log(res);
            console.log(res.data);
            if(res.status===200){
                let info=res.data;
                if(info.msg==="success"){
                    location.href="/login";//重定向到登录页面
                }else {
                    $("#new_name").val("");
                    $("#new_password").val("");
                    //个性签名
                    $("#new_signature").val("");
                    alert(info.msg);
                }
            }else{
                alert("注册失败");
            }
        })
        .catch(error => {
            console.error('注册失败:', error);
        });
    })
}