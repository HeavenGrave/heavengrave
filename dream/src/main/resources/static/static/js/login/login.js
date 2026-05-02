let particles = [];
let mouseX = 0, mouseY = 0;
let glowX = 0, glowY = 0;
let canvas;
let ctx;
let glowFollow;
let card;
let loginPanel;
let registerPanel;
let strengthBars;
let strengthLabel;
let regPassword;
let strengthTexts = ['', '弱', '中等', '强', '非常强'];
let toast;
window.onload = function () {
    toast = new Toast();
    canvas = document.getElementById('particle-canvas');
    ctx = canvas.getContext('2d');
    window.addEventListener('resize', () => {
        resizeCanvas();
        initParticles();
    });
    // 初始化粒子
    resizeCanvas();
    initParticles();
    animate();
    glowFollow = document.getElementById('glow-follow');
    card = document.getElementById('form-card');
    document.addEventListener('mousemove', e => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    document.addEventListener('mouseenter', () => {
        glowFollow.style.opacity = '1';
    });
    document.addEventListener('mouseleave', () => {
        glowFollow.style.opacity = '0';
    });

    updateGlow();

    loginPanel = document.getElementById('login-panel');
    registerPanel = document.getElementById('register-panel');

    document.getElementById('to-register').addEventListener('click', e => {
        e.preventDefault();
        showRegister();
    });
    document.getElementById('to-login').addEventListener('click', e => {
        e.preventDefault();
        showLogin();
    });
    strengthBars = document.querySelectorAll('.strength-bar');
    strengthLabel = document.getElementById('strength-label');
    regPassword = document.getElementById('reg-password');

    regPassword.addEventListener('input', () => {
        const score = calculateStrength(regPassword.value);
        strengthBars.forEach((bar, i) => {
            bar.classList.toggle('active', i < score);
        });
        if (score > 0) {
            strengthLabel.textContent = strengthTexts[score];
            strengthLabel.className = `strength-label level-${score}`;
        } else {
            strengthLabel.textContent = '';
            strengthLabel.className = 'strength-label';
        }
    });
}

// =============================================
// Task 2: Canvas 粒子系统
// =============================================
class Particle {
    constructor(canvas) {
        this.canvas = canvas;
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 1;
        this.speedX = (Math.random() - 0.5) * 1.2;
        this.speedY = (Math.random() - 0.5) * 1.2;
        this.colors = ['#00f0ff', '#ff00aa', '#7c3aed'];
        this.color = this.colors[Math.floor(Math.random() * this.colors.length)];
        this.opacity = Math.random() * 0.7 + 0.3;
        this.pulseSpeed = Math.random() * 0.02 + 0.01;
        this.pulsePhase = Math.random() * Math.PI * 2;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.pulsePhase += this.pulseSpeed;

        if (this.x < 0 || this.x > this.canvas.width) this.speedX *= -1;
        if (this.y < 0 || this.y > this.canvas.height) this.speedY *= -1;
    }

    draw(ctx) {
        const pulseOpacity = this.opacity * (0.6 + 0.4 * Math.sin(this.pulsePhase));
        ctx.save();
        ctx.globalAlpha = pulseOpacity;
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function initParticles() {
    particles = [];
    const count = Math.min(200, Math.floor((canvas.width * canvas.height) / 8000));
    for (let i = 0; i < count; i++) {
        particles.push(new Particle(canvas));
    }
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
        p.update();
        p.draw(ctx);
    });
    requestAnimationFrame(animate);
}


// =============================================
// 鼠标跟随光晕
// =============================================

function updateGlow() {
    // 缓动跟随
    glowX += (mouseX - glowX) * 0.12;
    glowY += (mouseY - glowY) * 0.12;

    glowFollow.style.background = `radial-gradient(
        500px circle at ${glowX}px ${glowY}px,
        rgba(0, 240, 255, 0.12),
        rgba(124, 58, 237, 0.06),
        transparent 60%
      )`;
    glowFollow.style.opacity = '1';

    requestAnimationFrame(updateGlow);
}


// =============================================
// Task 3: 登录 ↔ 注册切换动画
// =============================================

function showRegister() {
    loginPanel.style.opacity = '0';
    loginPanel.style.transform = 'translateY(-20px)';
    setTimeout(() => {
        loginPanel.classList.add('hidden');
        registerPanel.classList.remove('hidden');
        registerPanel.style.opacity = '0';
        registerPanel.style.transform = 'translateY(20px)';
        setTimeout(() => {
            registerPanel.style.opacity = '1';
            registerPanel.style.transform = 'translateY(0)';
        }, 50);
    }, 200);
}

function showLogin() {
    registerPanel.style.opacity = '0';
    registerPanel.style.transform = 'translateY(-20px)';
    setTimeout(() => {
        registerPanel.classList.add('hidden');
        loginPanel.classList.remove('hidden');
        loginPanel.style.opacity = '0';
        loginPanel.style.transform = 'translateY(20px)';
        setTimeout(() => {
            loginPanel.style.opacity = '1';
            loginPanel.style.transform = 'translateY(0)';
        }, 50);
    }, 200);
}

// =============================================
// Task 3: 密码可见性切换
// =============================================
document.querySelectorAll('.toggle-visibility').forEach(btn => {
    btn.addEventListener('click', () => {
        const input = btn.previousElementSibling;
        if (input.type === 'password') {
            input.type = 'text';
            btn.classList.add('show');
        } else {
            input.type = 'password';
            btn.classList.remove('show');
        }
    });
});

// =============================================
// Task 3: 密码强度指示器
// =============================================


function calculateStrength(password) {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
    return score;
}


// =============================================
// Task 4: 表单验证
// =============================================
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function showError(inputId, message) {
    const errorEl = document.getElementById(inputId + '-error');
    if (errorEl) errorEl.textContent = message;
}

function clearError(inputId) {
    const errorEl = document.getElementById(inputId + '-error');
    if (errorEl) errorEl.textContent = '';
}

// 聚焦时清除错误
document.querySelectorAll('input').forEach(input => {
    input.addEventListener('focus', () => {
        const errorEl = input.closest('.input-group').querySelector('.error-msg');
        if (errorEl) errorEl.textContent = '';
    });
});

// 登录表单提交
document.getElementById('login-form').addEventListener('submit', e => {
    e.preventDefault();
    let valid = true;
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;

    clearError('login-username');
    clearError('login-password');

    if (!username) {
        showError('login-username', '请输入用户名');
        valid = false;
    } else if (username.length < 2) {
        showError('login-username', '用户名至少2位');
        valid = false;
    }

    if (!password) {
        showError('login-password', '请输入密码');
        valid = false;
    } else if (password.length < 3) {
        showError('login-password', '密码至少3位');
        valid = false;
    }

    if (valid) {
        const btn = e.target.querySelector('.btn-primary');
        const originalHTML = btn.innerHTML;
        btn.innerHTML = '<span>登录中...</span>';
        axios.post('/user/login', 'name=' + username + '&password=' + password)
            .then(res => {
                console.log(res);
                console.log(res.data);
                if (res.status === 200) {
                    let info = res.data;
                    if (info.msg === "success") {
                        toast.show('🎉登录成功');
                        // location.href="/showEdit?userId="+info.data.id+"&token="+info.data.token;//重定向到首页
                        setTimeout(() => {
                            if (info.data.type !== "普通用户") {
                                location.href = "/myPage";//重定向到欢迎页面
                            } else {
                                location.href = "/myToDo?userId=" + info.data.id;//重定向到笔记页面
                            }
                        }, 800);
                    } else {
                        btn.innerHTML = originalHTML;
                        // 清空用户名密码输入框
                        $("#login-username").val("");
                        $("#login-password").val("");
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
    }
});

// 注册表单提交
document.getElementById('register-form').addEventListener('submit', e => {
    e.preventDefault();
    let valid = true;

    const username = document.getElementById('reg-username').value.trim();
    const password = document.getElementById('reg-password').value;
    const confirm = document.getElementById('reg-confirm').value;

    clearError('reg-username');
    clearError('reg-password');
    clearError('reg-confirm');

    if (!username) {
        showError('reg-username', '请输入用户名');
        valid = false;
    } else if (username.length < 2) {
        showError('reg-username', '用户名至少2位');
        valid = false;
    }

    if (!password) {
        showError('reg-password', '请输入密码');
        valid = false;
    } else if (password.length < 3) {
        showError('reg-password', '密码至少3位');
        valid = false;
    }

    if (!confirm) {
        showError('reg-confirm', '请确认密码');
        valid = false;
    } else if (confirm !== password) {
        showError('reg-confirm', '两次密码不一致');
        valid = false;
    }

    if (valid) {
        const btn = e.target.querySelector('.btn-primary');
        const originalHTML = btn.innerHTML;
        btn.innerHTML = '<span>注册中...</span>';
        axios.post('/user/reg', 'name=' + username + '&password=' + password)
            .then(res => {
                console.log(res);
                console.log(res.data);
                if (res.status === 200) {
                    let info = res.data;
                    if (info.msg === "success") {
                        toast.show('🎉 注册成功！开始探索吧~');
                        btn.innerHTML = originalHTML;
                        showLogin();
                        // setTimeout(() => {
                        //     location.href = "/login";//重定向到登录页面
                        // }, 800);
                    } else {
                        $("#reg-username").val("");
                        $("#reg-password").val("");
                        //确认密码
                        $("#reg-confirm").val("");
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


