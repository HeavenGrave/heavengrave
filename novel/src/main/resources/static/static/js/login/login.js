window.onload = function () {
    const toast = new Toast();
    document.getElementById('toggleLink').addEventListener('click', function (e) {
        e.preventDefault();
        var formContainer = document.getElementById('formContainer');
        formContainer.classList.toggle('show-register');
        if (formContainer.classList.contains('show-register')) {
            this.textContent = '已有账号？登录';
        } else {
            this.textContent = '没有账号？注册';
        }
    });

    document.getElementById('loginForm').addEventListener('submit', function (e) {
        e.preventDefault();
        let username = $("#name").val();
        let password = $("#password").val();
        axios.post('/user/login', 'name=' + username + '&password=' + password)
            .then(res => {
                console.log(res);
                console.log(res.data);
                if (res.status === 200) {
                    let info = res.data;
                    if (info.msg === "success") {
                        toast.show('登录成功');
                        // location.href="/showEdit?userId="+info.data.id+"&token="+info.data.token;//重定向到首页
                        setTimeout(() => {
                            location.href = "/novel";
                        }, 800);
                    } else {
                        $("#name").val("");
                        $("#password").val("");
                        //展示错误信息
                        toast.show(info.msg);
                    }
                } else {
                    toast.show("登录失败");
                }
            })
            .catch(error => {
                console.error('登录失败:', error);
            });
    });

    document.getElementById('registerForm').addEventListener('submit', function (e) {
        e.preventDefault();
        var password = document.getElementById('registerPassword').value;
        var confirmPassword = document.getElementById('confirmPassword').value;
        var passwordError = document.getElementById('passwordError');

        if (password !== confirmPassword) {
            passwordError.textContent = '两次输入的密码不一致';
        } else {
            passwordError.textContent = '';
            let username = $("#new_name").val();
            let password = $("#registerPassword").val();
            axios.post('/user/reg', 'name=' + username + '&password=' + password)
                .then(res => {
                    console.log(res);
                    console.log(res.data);
                    if (res.status === 200) {
                        let info = res.data;
                        if (info.msg === "success") {
                            toast.show('注册成功');
                            setTimeout(() => {
                                location.href = "/login";//重定向到登录页面
                            }, 800);
                        } else {
                            $("#new_name").val("");
                            $("#new_password").val("");
                            //个性签名
                            $("#new_signature").val("");
                            toast.show(info.msg);
                        }
                    } else {
                        toast.show("注册失败");
                    }
                })
                .catch(error => {
                    console.error('注册失败:', error);
                });
        }
    });

    document.getElementById('confirmPassword').addEventListener('input', function () {
        var password = document.getElementById('registerPassword').value;
        var confirmPassword = this.value;
        var passwordError = document.getElementById('passwordError');
        if (password !== confirmPassword) {
            passwordError.textContent = '两次输入的密码不一致';
        } else {
            passwordError.textContent = '';
        }
    });
}