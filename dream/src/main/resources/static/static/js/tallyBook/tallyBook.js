// ---------- 数据----------
let transactions = [];// 交易信息
let accounts = [];
let recurringBills = [];// 周期性账单
let savingGoal = 0; //储蓄目标
let pieChart = null, barChart = null;
let currentSelectedType = "income"; //当前选中的类别
let nowUserId = 1;
let currentTallyBookId = null;
let monthlyBudget = 0;//月预算
// 分页状态
let currentFilteredTransactions = [];
let currentPage = 1;
const PAGE_SIZE = 6;

window.onload = function () {
    // 获取用户id
    nowUserId = parseInt(getParameterByName('userId'));
    //根据用户Id 加载账本信息
    loadData();
    bindTransactionFilterEvents();
    // 加载周期性账单
    // loadRecurringBills();
    // applyRecurringForCurrentMonth();
    // renderAll();
    // setCurrentDate();
    // initTheme();
    // setActiveType('income');
}
//根据用户Id 加载账本信息
function loadData() {
    axios.get('/tally/searchTallyBook?userId='+nowUserId)
        .then(res => {
            console.log(res);
            console.log(res.data);
            if (res.status === 200) {
                let nowTallyBook = res.data.data;
                currentTallyBookId = nowTallyBook.id;
                monthlyBudget = nowTallyBook.budget;//预算
                savingGoal = nowTallyBook.target;//目标
                loadAccounts(nowTallyBook.id);//账户
                loadRecurringBills(nowTallyBook.id);//周期性账单
                loadTransactions(nowTallyBook.id);//交易信息
                updateStatsAndBudgets();
            }
        })
        .catch(error => {
            alert("保存我的文档时产生未知的异常" +error);
        });
}

function updateStatsAndBudgets() {
    let now = new Date();
    let currentYear = now.getFullYear(), currentMonth = now.getMonth() + 1;
    let monthIncome = 0, monthExpense = 0;
    let totalBalance = accounts.reduce((s, a) => s + Number(a.amount || 0), 0);
    transactions.forEach(t => {
        let [y, m] = t.date.split('-');
        if (parseInt(y) === currentYear && parseInt(m) === currentMonth) {
            if (t.type === 'income') monthIncome += t.amount;
            else monthExpense += t.amount;
        }
    });
    $("#monthIncome").text(`¥${monthIncome.toFixed(2)}`);
    $("#monthExpense").text(`¥${monthExpense.toFixed(2)}`);
    $("#balanceTotal").text(`¥${totalBalance.toFixed(2)}`);
    let remainBudget = monthlyBudget - monthExpense;
    $("#budgetRemainStr").text(`¥${Math.max(0, remainBudget).toFixed(2)}`);
    $("#curExpenseBudget").text(`¥${monthExpense.toFixed(2)}`);
    $("#budgetAmountShow").text(`¥${monthlyBudget.toFixed(2)}`);
    let percent = monthlyBudget > 0 ? Math.min(100, (monthExpense / monthlyBudget) * 100) : 0;
    $("#budgetProgressFill").css("width", `${percent}%`);
    if (monthExpense > monthlyBudget) $("#warningMsg").html(`⚠️ 超支 ${(monthExpense - monthlyBudget).toFixed(2)}`);
    else $("#warningMsg").html(`✔️ 剩余 ${remainBudget.toFixed(2)}`);

    let saved = totalBalance;
    $("#savedAmountSpan").text(`¥${saved.toFixed(2)}`);
    let targetPercent = savingGoal > 0 ? Math.min(100, (saved / savingGoal) * 100) : 0;
    $("#savingProgressFill").css("width", `${targetPercent}%`);
    if (saved >= savingGoal) $("#savingMessage").html(`🎉 达成目标！ 🎉`);
    else $("#savingMessage").html(`🏦 还需 ¥${(savingGoal - saved).toFixed(2)}`);
    $("#targetAmountSpan").text(`¥${savingGoal.toFixed(2)}`);
}
function loadAccounts(tallyBookId){
    axios.get('/tally/searchAccounts?tallyBookId='+tallyBookId)
        .then(res => {
            console.log(res);
            console.log(res.data);
            if (res.status === 200) {
                accounts = res.data.data;
                //渲染账户信息
                renderAccounts();
                renderRecentTransactions();
                renderFilteredTransactions();
                updateStatsAndBudgets();
            }
        })
        .catch(error => {
            alert("查询资产账户信息时产生未知的异常" +error);
        });
}


//根据用户id 加载周期性账单
function loadRecurringBills(tallyBookId){
    axios.get('/tally/searchRecurringBills?tallyBookId='+tallyBookId)
        .then(res => {
            console.log(res);
            console.log(res.data);
            if (res.status === 200) {
                recurringBills = res.data.data;
                renderRecurringList();
            }
        })
        .catch(error => {
            alert("保存我的文档时产生未知的异常" +error);
        });
}
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
    $(".delRecurring").off().on("click", function () {
        let id = $(this).data("id");
        recurringBills = recurringBills.filter(b => b.id !== id);
        renderAll();
    });
}
function renderAll() {
    // renderAccounts();
    renderRecentTransactions();
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

function renderRecentTransactions() {
    let container = $("#transactionsList");
    if (transactions.length === 0) {
        container.html('<div class="text-center text-gray-400 py-3 text-xs">✨ 暂无记录，点击快速记一笔</div>');
        return;
    }
    let latest = [...transactions].reverse().slice(0, 8);
    container.empty();
    latest.forEach(t => {
        let sign = t.type === 'expense' ? '-' : '+';
        let color = t.type === 'expense' ? 'text-red-500' : 'text-green-600';
        let accName = accounts.find(a => String(a.id) === String(t.account))?.name || '未知';
        container.append(`<div class="flex justify-between items-center border-b pb-1.5 dark:border-gray-700"><div><span class="text-xs">${t.date} ${t.description || t.category}</span><span class="ml-1 text-xs text-gray-400">${accName}</span></div><div class="${color} text-xs font-medium">${sign} ¥${t.amount.toFixed(2)}</div></div>`);
    });
}
//根据用户id 加载交易信息
function loadTransactions(tallyBookId) {
    if (!tallyBookId) {
        return;
    }
    currentTallyBookId = tallyBookId;

    let params = {
        tallyBookId: tallyBookId,
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
                transactions = applyTransactionFilters((res.data.data || []).map(normalizeTransaction), params);
                currentFilteredTransactions = [...transactions];
                currentPage = 1;
                renderChartsWithECharts();
                renderRecentTransactions();
                renderFilteredTransactions();
                renderPaginationControls();
                updateStatsAndBudgets();
            }
        })
        .catch(error => {
            alert("查询交易信息时产生未知的异常" +error);
        });
}

function normalizeTransaction(t) {
    let createTime = t.createTime || t.date || "";
    return {
        ...t,
        date: String(createTime).substring(0, 10),
        category: t.category || t.classified || "其他",
        description: t.description || t.des || "",
        amount: Number(t.amount || 0),
        account: t.account == null ? "" : String(t.account)
    };
}

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
        renderFilteredTransactions();
        renderPaginationControls();
    });
}

function bindTransactionFilterEvents() {
    $("#applyFilterBtn").off("click").on("click", function () {
        loadTransactions(currentTallyBookId);
    });

    $("#resetFilterBtn").off("click").on("click", function () {
        $("#filterType").val("");
        $("#filterCategory").val("");
        $("#filterAccount").val("");
        $("#startDate").val("");
        $("#endDate").val("");
        loadTransactions(currentTallyBookId);
    });
}

function renderAccounts() {
    let container = $("#accountList");
    container.empty();
    accounts.forEach(acc => {
        container.append(`<div class="flex justify-between items-center bg-gray-50 dark:bg-gray-700/40 p-1.5 rounded-lg text-sm account-item"><div><i class="fas fa-wallet"></i> ${acc.name}</div><div class="font-semibold">¥${acc.amount.toFixed(2)}</div></div>`);
    });
    renderAccountSelects();
}

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
