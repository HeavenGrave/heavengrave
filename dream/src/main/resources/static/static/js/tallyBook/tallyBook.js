// ---------- 数据----------
let transactions = [];// 交易信息
let accounts = [];
let recurringBills = [];// 周期性账单
let savingGoal = 0; //储蓄目标
let pieChart = null, barChart = null;
let currentSelectedType = "income"; //当前选中的类别
let nowTallyBookId = null;//账本Id
let monthlyBudget = 0;//月预算
// 分页状态
let currentFilteredTransactions = [];
let currentPage = 1;
const PAGE_SIZE = 6;

window.onload = function () {
    // 初始化查询条件开始结束时间
    setCurrentDate();
    //根据用户Id 加载账本信息
    loadData();
    //初始化账单查询监听
    bindTransactionFilterEvents();
    //添加账户创建监听
    bindAccountEvents();
    //添加周期性账单监听
    bindPeriodicBillEvents();
    // applyRecurringForCurrentMonth();
    // renderAll();
    // initTheme();
    // 初始化收入 支出的记录状态
    setActiveType('income');
}

//根据用户Id 加载账本信息
function loadData() {
    axios.get('/tally/searchTallyBook')
        .then(res => {
            console.log(res);
            console.log(res.data);
            if (res.status === 200) {
                let nowTallyBook = res.data.data;
                nowTallyBookId = nowTallyBook.id;//账本Id
                monthlyBudget = nowTallyBook.budget;//预算
                savingGoal = nowTallyBook.target;//目标
                loadAccounts();//账户
                loadRecurringBills();//周期性账单
                loadAllTransactions();//查询所有交易信息 近六个月
                loadTransactions();//默认查询本月交易信息
            }
        })
        .catch(error => {
            alert("保存我的文档时产生未知的异常" + error);
        });
}

/**
 * 查询所有交易信息 近六个月
 */
function loadAllTransactions() {
    // 获取近六个月日期
    const {startDate, endDate} = getDateRange();
    let params = {
        tallyBookId: nowTallyBookId,
        type: "",
        classified: "",
        account: "",
        startTime: startDate || "",
        endTime: endDate || ""
    };
    axios.get('/tally/searchTransactions', {params})
        .then(res => {
            console.log(res);
            console.log(res.data);
            if (res.status === 200) {
                transactions = applyTransactionFilters((res.data.data || []).map(normalizeTransaction), params);
                //生成支出报表
                renderChartsWithECharts();
            }
        })
        .catch(error => {
            alert("查询交易信息时产生未知的异常" + error);
        });
}

/**
 * 更新储蓄信息
 */
function updateTargetInfo() {
    // 根据账户信息计算总余额
    let totalBalance = accounts.reduce((s, a) => s + Number(a.amount || 0), 0);
    //更新储蓄目标中的已存金额
    $("#balanceTotal").text(`¥${totalBalance.toFixed(2)}`);
    //更新储蓄目标中的储蓄状态
    let saved = totalBalance;
    $("#savedAmountSpan").text(`¥${saved.toFixed(2)}`);
    let targetPercent = savingGoal > 0 ? Math.min(100, (saved / savingGoal) * 100) : 0;
    $("#savingProgressFill").css("width", `${targetPercent}%`);
    if (saved >= savingGoal) $("#savingMessage").html(`🎉 达成目标！ 🎉`);
    else $("#savingMessage").html(`🏦 还需 ¥${(savingGoal - saved).toFixed(2)}`);
    $("#targetAmountSpan").text(`¥${savingGoal.toFixed(2)}`);
}

/**
 * 更新统计信息
 */
function updateStatsAndBudgets() {
    let now = new Date();
    let currentYear = now.getFullYear(), currentMonth = now.getMonth() + 1;
    let monthIncome = 0, monthExpense = 0;
    //遍历所有的交易记录 计算本月的支出和收入
    transactions.forEach(t => {
        let [y, m] = t.date.split('-');
        if (parseInt(y) === currentYear && parseInt(m) === currentMonth) {
            if (t.type === 'income') monthIncome += t.amount;
            else monthExpense += t.amount;
        }
    });
    $("#monthIncome").text(`¥${monthIncome.toFixed(2)}`);
    $("#monthExpense").text(`¥${monthExpense.toFixed(2)}`);

    let remainBudget = monthlyBudget - monthExpense;
    $("#budgetRemainStr").text(`¥${Math.max(0, remainBudget).toFixed(2)}`);//展示剩余预算
    $("#curExpenseBudget").text(`¥${monthExpense.toFixed(2)}`);//本月支出
    $("#budgetAmountShow").text(`¥${monthlyBudget.toFixed(2)}`);//本月预算
    let percent = monthlyBudget > 0 ? Math.min(100, (monthExpense / monthlyBudget) * 100) : 0;
    $("#budgetProgressFill").css("width", `${percent}%`);//月预算进度条
    if (monthExpense > monthlyBudget) $("#warningMsg").html(`⚠️ 超支 ${(monthExpense - monthlyBudget).toFixed(2)}`);
    else $("#warningMsg").html(`✔️ 剩余 ${remainBudget.toFixed(2)}`);
}

/**
 * 加载账户信息
 */
function loadAccounts() {
    axios.get('/tally/searchAccounts?tallyBookId=' + nowTallyBookId)
        .then(res => {
            console.log(res);
            console.log(res.data);
            if (res.status === 200) {
                accounts = res.data.data;
                // 渲染账户信息
                renderAccounts();
                // 更新储蓄目标信息
                updateTargetInfo();
            }
        })
        .catch(error => {
            alert("查询资产账户信息时产生未知的异常" + error);
        });
}

/**
 * 根据用户id 加载周期性账单
 */
function loadRecurringBills() {
    axios.get('/tally/searchRecurringBills?tallyBookId=' + nowTallyBookId)
        .then(res => {
            console.log(res);
            console.log(res.data);
            if (res.status === 200) {
                recurringBills = res.data.data;
                renderRecurringList();
            }
        })
        .catch(error => {
            alert("保存我的文档时产生未知的异常" + error);
        });
}

/**
 * 渲染周期性账单
 */
function renderRecurringList() {
    let cont = $("#recurringList");
    if (recurringBills.length === 0) {
        cont.html('<div class="text-gray-400 text-xs text-center">暂无周期账单，点上方添加</div>');
        return;
    }
    cont.empty();
    recurringBills.forEach(b => {
        cont.append(`<div class="flex justify-between items-center bg-indigo-50/40 dark:bg-indigo-950/30 p-1.5 rounded-lg recurring-item"><div class="text-xs"><i class="fas fa-sync-alt"></i> ${b.name} · ¥${b.amount}</div><button class="delRecurring text-red-400 text-xs" data-id="${b.id}"><i class="fas fa-trash-alt"></i></button></div>`);
    });
    // 周期性账单删除点击监听
    $(".delRecurring").off().on("click", function () {
        let id = $(this).data("id");
        axios.delete('/tally/deleteRecurringBill?id=' + id)
            .then(res => {
                console.log(res);
                recurringBills = recurringBills.filter(b => b.id != id);
                renderRecurringList();
            })
            .catch(error => {
                alert("删除周期账单时产生未知的异常" + error);
            })

    });
}

/**
 * 刷新页面信息
 */
function renderAll() {
    // renderAccounts();
    renderRecurringList();
    updateStatsAndBudgets();
    renderChartsWithECharts();
    // saveData();
    let accSelect = $("#transAccount");
    accSelect.empty();
    accounts.forEach(acc => accSelect.append(`<option value="${acc.id}">${acc.name}</option>`));
    let recurringAcc = $("#recurringAccount");
    recurringAcc.empty();
    accounts.forEach(acc => recurringAcc.append(`<option value="${acc.id}">${acc.name}</option>`));
}

/**
 * 渲染图表
 */
function renderChartsWithECharts() {
    let now = new Date();
    let year = now.getFullYear(), month = now.getMonth() + 1;
    let monthStr = `${year}-${month.toString().padStart(2, '0')}`;
    let expByCat = {};
    transactions.filter(t => t.type === 'expense' && t.date.startsWith(monthStr)).forEach(t => {
        expByCat[t.category] = (expByCat[t.category] || 0) + t.amount;
    });
    let pieData = Object.entries(expByCat).map(([name, value]) => ({name, value}));
    if (pieData.length === 0) pieData = [{name: "暂无支出", value: 1}];
    let months = [], incomeData = [], expenseData = [];
    for (let i = 5; i >= 0; i--) {
        let d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        let y = d.getFullYear(), m = d.getMonth() + 1;
        let ym = `${y}-${m.toString().padStart(2, '0')}`;
        months.push(`${m}月`);
        let inc = 0, exp = 0;
        transactions.forEach(t => {
            if (t.date.startsWith(ym)) {
                if (t.type === 'income') inc += t.amount; else exp += t.amount;
            }
        });
        incomeData.push(inc);
        expenseData.push(exp);
    }
    const isDark = document.body.classList.contains('dark');
    const textColor = isDark ? '#e2e8f0' : '#1e293b';
    const axisColor = isDark ? '#94a3b8' : '#64748b';
    const gridColor = isDark ? '#334155' : '#e2e8f0';
    if (pieChart) pieChart.dispose();
    pieChart = echarts.init(document.getElementById('pieChartContainer'));
    pieChart.setOption({
        tooltip: {trigger: 'item', formatter: '{b}: ¥{c} ({d}%)'},
        legend: {orient: 'vertical', left: 'left', textStyle: {color: textColor}, itemWidth: 20, itemHeight: 12},
        series: [{
            type: 'pie',
            radius: '55%',
            data: pieData,
            label: {color: textColor, fontSize: 10},
            itemStyle: {borderRadius: 6, borderColor: isDark ? '#1e293b' : '#fff', borderWidth: 1}
        }],
        backgroundColor: 'transparent'
    });
    if (barChart) barChart.dispose();
    barChart = echarts.init(document.getElementById('barChartContainer'));
    barChart.setOption({
        tooltip: {trigger: 'axis'},
        legend: {data: ['收入', '支出'], textStyle: {color: textColor}, itemWidth: 20},
        grid: {containLabel: true},
        xAxis: {
            type: 'category',
            data: months,
            axisLabel: {color: axisColor, fontSize: 10},
            axisLine: {lineStyle: {color: axisColor}}
        },
        yAxis: {
            type: 'value',
            name: '¥',
            nameTextStyle: {color: textColor, fontSize: 9},
            axisLabel: {fontSize: 9, color: axisColor},
            splitLine: {lineStyle: {color: gridColor}}
        },
        series: [{
            name: '收入',
            type: 'bar',
            data: incomeData,
            itemStyle: {color: '#10b981', borderRadius: [6, 6, 0, 0]}
        }, {name: '支出', type: 'bar', data: expenseData, itemStyle: {color: '#f97316', borderRadius: [6, 6, 0, 0]}}],
        backgroundColor: 'transparent'
    });
    window.addEventListener('resize', () => {
        pieChart?.resize();
        barChart?.resize();
    });
}

/**
 * 根据用户id 加载交易信息
 */
function loadTransactions() {
    let params = {
        tallyBookId: nowTallyBookId,
        type: $("#filterType").val() || "",
        classified: $("#filterCategory").val() || "",
        account: $("#filterAccount").val() || "",
        startTime: $("#startDate").val() || "",
        endTime: $("#endDate").val() || ""
    };
    axios.get('/tally/searchTransactions', {params})
        .then(res => {
            console.log(res);
            console.log(res.data);
            if (res.status === 200) {
                currentFilteredTransactions = applyTransactionFilters((res.data.data || []).map(normalizeTransaction), params);
                currentPage = 1;
                //渲染分页交易信息
                renderFilteredTransactions();
                //渲染分页控件
                renderPaginationControls();
                //更新统计信息
                updateStatsAndBudgets();
            }
        })
        .catch(error => {
            alert("查询交易信息时产生未知的异常" + error);
        });
}

/**
 * 格式化交易信息
 * @param t
 * @returns {*&{date: string, category, description, amount: number, account: string|string}}
 */
function normalizeTransaction(t) {
    let createTime = t.createTime || t.date || "";
    return {
        ...t,
        date: String(createTime).substring(0, 10),
        category: t.classified || "其他",
        description: t.des || "",
        amount: Number(t.amount || 0),
        account: t.account == null ? "" : String(t.account)
    };
}

/**
 * 过滤交易信息
 * @param data
 * @param params
 * @returns {*}
 */
function applyTransactionFilters(data, params) {
    return data.filter(t => {
        if (params.type && t.type !== params.type) return false;
        if (params.classified && t.category !== params.classified) return false;
        if (params.account && String(t.account) !== String(params.account)) return false;
        if (params.startTime && t.date < params.startTime) return false;
        if (params.endTime && t.date > params.endTime) return false;
        return true;
    });
}

/**
 * 分页展示交易信息
 */
function renderFilteredTransactions() {
    let container = $("#transactionsFilteredList");
    $("#recordCount").text(`共 ${currentFilteredTransactions.length} 条记录`);

    if (currentFilteredTransactions.length === 0) {
        container.html('<div class="text-center text-gray-400 py-3 text-xs">暂无符合条件的交易记录</div>');
        return;
    }

    let start = (currentPage - 1) * PAGE_SIZE;
    let pageTransactions = currentFilteredTransactions.slice(start, start + PAGE_SIZE);
    container.empty();
    pageTransactions.forEach(t => {
        let sign = t.type === 'expense' ? '-' : '+';
        let color = t.type === 'expense' ? 'text-red-500' : 'text-green-600';
        let typeText = t.type === 'expense' ? '支出' : '收入';
        let accName = accounts.find(a => String(a.id) === String(t.account))?.name || '未知';
        container.append(`
            <div class="flex justify-between items-center border-b pb-1.5 dark:border-gray-700">
                <div>
                    <div class="text-xs font-medium dark:text-white">${t.date} · ${t.category}</div>
                    <div class="text-xs text-gray-400">${typeText} · ${accName}${t.description ? ' · ' + t.description : ''}</div>
                </div>
                <div class="${color} text-xs font-semibold">${sign} ¥${t.amount.toFixed(2)}</div>
            </div>
        `);
    });
}

/**
 * 渲染分页控件
 */
function renderPaginationControls() {
    let totalPages = Math.ceil(currentFilteredTransactions.length / PAGE_SIZE);
    let controls = $("#paginationControls");
    controls.empty();

    if (totalPages <= 1) {
        return;
    }

    controls.append(`<button class="page-btn text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-700" data-page="${Math.max(1, currentPage - 1)}">上一页</button>`);
    for (let i = 1; i <= totalPages; i++) {
        let activeClass = i === currentPage ? 'bg-indigo-500 text-white' : 'bg-gray-100 dark:bg-gray-700';
        controls.append(`<button class="page-btn text-xs px-2 py-1 rounded ${activeClass}" data-page="${i}">${i}</button>`);
    }
    controls.append(`<button class="page-btn text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-700" data-page="${Math.min(totalPages, currentPage + 1)}">下一页</button>`);

    $(".page-btn").off("click").on("click", function () {
        currentPage = Number($(this).data("page"));
        //渲染分页交易信息
        renderFilteredTransactions();
        //渲染分页控件
        renderPaginationControls();
    });
}

/**
 * 账单查询、重置查询条件点击监听
 */
function bindTransactionFilterEvents() {
    $("#applyFilterBtn").off("click").on("click", function () {
        loadTransactions();
    });
    $("#resetFilterBtn").off("click").on("click", function () {
        $("#filterType").val("");
        $("#filterCategory").val("");
        $("#filterAccount").val("");
        setCurrentDate();//设置当前时间
        loadTransactions();
    });
}

/**
 * 账户管理点击监听
 */
function bindAccountEvents() {
    $("#addAccountBtn").off("click").on("click", function () {
        $("#newAccountName").val("");
        $("#newAccountBalance").val("0");
        bootstrap.Modal.getOrCreateInstance(document.getElementById("addAccountModal")).show();
    });

    $("#confirmAddAccountBtn").off("click").on("click", function () {
        addAccount();
    });
}

/**
 * 添加账户
 */
function addAccount() {
    let name = ($("#newAccountName").val() || "").trim();
    let amountValue = $("#newAccountBalance").val();
    let amount = Number(amountValue);

    if (!nowTallyBookId) {
        alert("账本信息未加载完成，请稍后再试");
        return;
    }
    if (!name) {
        alert("请输入账户名称");
        return;
    }
    if (amountValue === "" || Number.isNaN(amount)) {
        alert("请输入正确的账户余额");
        return;
    }

    let params = new URLSearchParams();
    params.append("tallyBookId", nowTallyBookId);
    params.append("name", name);
    params.append("amount", amount);

    $("#confirmAddAccountBtn").prop("disabled", true).text("添加中...");
    axios.post('/tally/addAccount', params)
        .then(res => {
            if (res.status === 200 && res.data.code === 1) {
                bootstrap.Modal.getOrCreateInstance(document.getElementById("addAccountModal")).hide();
                loadAccounts(nowTallyBookId);
            } else {
                alert(res.data.msg || "添加账户失败");
            }
        })
        .catch(error => {
            alert("添加账户时产生未知的异常" + error);
        })
        .finally(() => {
            $("#confirmAddAccountBtn").prop("disabled", false).text("确认添加");
        });
}

/**
 * 账户列表渲染
 */
function renderAccounts() {
    let container = $("#accountList");
    container.empty();
    accounts.forEach(acc => {
        container.append(`<div class="flex justify-between items-center bg-gray-50 dark:bg-gray-700/40 p-1.5 rounded-lg text-sm account-item"><div><i class="fas fa-wallet"></i> ${acc.name}</div><div class="font-semibold">¥${acc.amount.toFixed(2)}</div></div>`);
    });
    renderAccountSelects();
}

/**
 * 账户选择渲染
 */
function renderAccountSelects() {
    let filterAccount = $("#filterAccount");
    let selectedFilterAccount = filterAccount.val() || "";
    filterAccount.empty().append('<option value="">全部账户</option>');
    accounts.forEach(acc => filterAccount.append(`<option value="${acc.id}">${acc.name}</option>`));
    filterAccount.val(selectedFilterAccount);

    let transAccount = $("#transAccount");
    let selectedTransAccount = transAccount.val();
    transAccount.empty();
    accounts.forEach(acc => transAccount.append(`<option value="${acc.id}">${acc.name}</option>`));
    if (selectedTransAccount) transAccount.val(selectedTransAccount);

    let recurringAccount = $("#recurringAccount");
    let selectedRecurringAccount = recurringAccount.val();
    recurringAccount.empty();
    accounts.forEach(acc => recurringAccount.append(`<option value="${acc.id}">${acc.name}</option>`));
    if (selectedRecurringAccount) recurringAccount.val(selectedRecurringAccount);
}

function bindPeriodicBillEvents() {
    $("#addRecurringBtn").click(() => {
        $('#recurringName').val("");
        $('#recurringAmount').val("");
        $('#recurringModal').modal('show');
    });

    $("#saveRecurringBtn").off("click").on("click", function () {
        addPeriodicBill();
    });
}

function addPeriodicBill() {
    let name = ($("#recurringName").val() || "").trim();
    let amountValue = $("#recurringAmount").val();
    let amount = Number(amountValue);
    let type = $("#recurringCategory").val();
    let accountId = $("#recurringAccount").val();

    if (!nowTallyBookId) {
        alert("账本信息未加载完成，请稍后再试");
        return;
    }
    if (!name) {
        alert("请输入周期账单名称");
        return;
    }
    if (amountValue === "" || Number.isNaN(amount)) {
        alert("请输入正确的金额");
        return;
    }

    let params = new URLSearchParams();
    params.append("tallyBookId", nowTallyBookId);
    params.append("name", name);
    params.append("amount", amount);
    params.append("type", type);
    params.append("accountId", accountId);

    $("#saveRecurringBtn").prop("disabled", true).text("创建中...");
    axios.post('/tally/addPeriodicBill', params)
        .then(res => {
            if (res.status === 200 && res.data.code === 1) {
                bootstrap.Modal.getOrCreateInstance(document.getElementById("recurringModal")).hide();
                loadRecurringBills(nowTallyBookId);
            } else {
                alert(res.data.msg || "添加周期账单失败");
            }
        })
        .catch(error => {
            alert("添加周期账单时产生未知的异常" + error);
        })
        .finally(() => {
            $("#saveRecurringBtn").prop("disabled", false).text("创建账单");
        });
}

$("#setBudgetBtn").click(() => {
    let nb = parseFloat($("#budgetInput").val());// 预算
    if (!isNaN(nb) && nb >= 0) {
        let params = new URLSearchParams();
        params.append("tallyBookId", nowTallyBookId);
        params.append("budget", nb);
        axios.post('/tally/changeBudget', params)
            .then(res => {
                if (res.status === 200 && res.data.code === 1) {
                    monthlyBudget = nb;
                    updateStatsAndBudgets();
                } else {
                    alert(res.data.msg || "修改预算失败");
                }
            })
            .catch(error => {
                alert("修改预算时产生未知的异常" + error);
            })
            .finally(() => {
                $("#budgetInput").val("");
            });
    }
});

function setActiveType(type) {
    currentSelectedType = type;
    const incomeBtn = document.getElementById('incomeTypeBtn'), expenseBtn = document.getElementById('expenseTypeBtn');
    if (type === 'income') {
        incomeBtn.classList.add('active-income');
        expenseBtn.classList.remove('active-expense');
        document.getElementById('dynamicConfirmBtn').innerHTML = '确认收入 ✅';
        document.getElementById('dynamicConfirmBtn').classList.remove('bg-red-600');
        document.getElementById('dynamicConfirmBtn').classList.add('bg-indigo-600');
    } else {
        expenseBtn.classList.add('active-expense');
        incomeBtn.classList.remove('active-income');
        document.getElementById('dynamicConfirmBtn').innerHTML = '确认支出 ⚠️';
        document.getElementById('dynamicConfirmBtn').classList.remove('bg-indigo-600');
        document.getElementById('dynamicConfirmBtn').classList.add('bg-red-600');
    }
}

$("#quickAddBtn").click(() => {
    $("#transAmount").val("");
    $("#transDesc").val("");
    setActiveType('income');
    $('#transactionModal').modal('show');
});

document.getElementById('incomeTypeBtn')?.addEventListener('click', () => setActiveType('income'));
document.getElementById('expenseTypeBtn')?.addEventListener('click', () => setActiveType('expense'));
document.getElementById('dynamicConfirmBtn')?.addEventListener('click', saveTransactionFromModal);

function setCurrentDate() {
    $("#currentDate").text(new Date().toLocaleDateString('zh-CN', {year: 'numeric', month: 'long', day: 'numeric'}));
    const now = new Date();
    const start = new Date();
    start.setDate(1);
    let startDate= formatDate(start);
    let endDate= formatDate(now);
    $("#startDate").val(startDate);
    $("#endDate").val(endDate);
}

/**
 * 保存交易记录
 */
function saveTransactionFromModal() {
    let type = currentSelectedType;
    let des = $("#transDesc").val().trim();
    if (des === "") desc = (type === 'income' ? '收入' : '支出');
    let amount = parseFloat($("#transAmount").val());
    let category = $("#transCategory").val();
    let accountId = $("#transAccount").val();
    if (isNaN(amount) || amount <= 0) {
        alert("请输入有效金额 (>0)");
        return;
    }
    let newTrans = {
        id: Date.now(),
        amount,
        type,
        category,
        date: new Date().toISOString().slice(0, 10),
        description: desc,
        account: accountId
    };
    // transactions.push(newTrans);
    // let delta = type === 'expense' ? -amount : amount;
    // updateAccountBalance(accountId, delta);
    // renderAll();

    let params = new URLSearchParams();
    params.append("tallyBookId", nowTallyBookId);
    params.append("type", type);
    params.append("amount", amount);
    params.append("category", category);
    params.append("accountId", accountId);
    params.append("des", des);
    axios.post('/tally/addTransaction', params)
        .then(res => {
            if (res.status === 200 && res.data.code === 1) {
                $('#transactionModal').modal('hide');
                loadTransactions(nowTallyBookId);
                $("#transAmount").val("");
                $("#transDesc").val("");
            } else {
                alert(res.data.msg || "添加交易失败");
            }
        })
        .catch(error => {
            alert("添加交易时产生未知的异常" + error);
        })
}

$("#refreshChartsBtn").click(() => {
    renderChartsWithECharts();
});


// 主题、存储等基础函数 (保持原有)
function initTheme() {
    const saved = localStorage.getItem('theme');
    const isDark = saved === 'dark' || (saved !== 'light' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (isDark) document.body.classList.add('dark');
    updateThemeUI(isDark);
}

function toggleTheme() {
    const isDark = document.body.classList.contains('dark');
    if (isDark) {
        document.body.classList.remove('dark');
        localStorage.setItem('theme', 'light');
    } else {
        document.body.classList.add('dark');
        localStorage.setItem('theme', 'dark');
    }
    updateThemeUI(document.body.classList.contains('dark'));
}

document.getElementById('themeToggleBtn')?.addEventListener('click', toggleTheme);

function updateThemeUI(isDark) {
    const icon = document.getElementById('themeIcon');
    const textSpan = document.getElementById('themeText');
    if (isDark) {
        icon.className = "fas fa-sun";
        if (textSpan) textSpan.innerText = "亮色";
    } else {
        icon.className = "fas fa-moon";
        if (textSpan) textSpan.innerText = "深色";
    }
    renderChartsWithECharts();
}

// 储蓄目标设定 (卡片模块)
$("#setSavingGoalBtn").click(() => {
    $("#savingGoalAmount").val(savingGoal);
    $('#savingGoalModal').modal('show');
});
$("#confirmSetSavingBtn").click(() => {
    let newTarget = parseFloat($("#savingGoalAmount").val());
    if (isNaN(newTarget) || newTarget <= 0) {
        alert("请输入有效的目标金额 (>0)");
        return;
    }
    let params = new URLSearchParams();
    params.append("tallyBookId", nowTallyBookId);
    params.append("target", newTarget);
    axios.post('/tally/updateTarget', params)
        .then(res => {
            if (res.status === 200 && res.data.code === 1) {
                savingGoal = newTarget;
                updateTargetInfo();
                $('#savingGoalModal').modal('hide');
            } else {
                alert(res.data.msg || "目标设定失败");
            }
        })
        .catch(error => {
            alert("目标设定时产生未知的异常" + error);
        })
});


// 获取：6个月前的1号、今天的日期
function getDateRange() {
    const now = new Date();

    // 1. 今天日期
    const today = now.getFullYear() + '-' +
        String(now.getMonth() + 1).padStart(2, '0') + '-' +
        String(now.getDate()).padStart(2, '0');

    // 2. 6个月前的1号
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6); // 减6个月
    sixMonthsAgo.setDate(1); // 设为1号

    const startDate = sixMonthsAgo.getFullYear() + '-' +
        String(sixMonthsAgo.getMonth() + 1).padStart(2, '0') + '-' +
        '01';

    return {
        startDate: startDate,  // 6个月前1号
        endDate: today         // 今天
    };
}