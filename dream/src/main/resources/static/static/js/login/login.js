window.onload = function () {
    const toast = new Toast();
    const signUpButton = document.getElementById('signUp');
    const signInButton = document.getElementById('signIn');
    const mobileSignUpButton = document.getElementById('mobileSignUp');
    const mobileSignInButton = document.getElementById('mobileSignIn');
    const container = document.getElementById('main-container');

    // PC端切换按钮事件
    if (signUpButton && signInButton) {
        signUpButton.addEventListener('click', () => {
            container.classList.add("right-panel-active");
        });
        signInButton.addEventListener('click', () => {
            container.classList.remove("right-panel-active");
        });
    }

    // 移动端切换链接事件
    if (mobileSignUpButton && mobileSignInButton) {
        mobileSignUpButton.addEventListener('click', () => {
            container.classList.add("right-panel-active");
        });

        mobileSignInButton.addEventListener('click', () => {
            container.classList.remove("right-panel-active");
        });
    }
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
                            if(info.data.type !== "普通用户") {
                                location.href = "/myPage";//重定向到欢迎页面
                            }else{
                                location.href = "/myToDo?userId="+info.data.id;//重定向到笔记页面
                            }
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
                            $("#registerPassword").val("");
                            //确认密码
                            $("#confirmPassword").val("");
                            toast.show(info.msg);
                        }
                    } else {
                        toast.show("注册失败，请重试！");
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