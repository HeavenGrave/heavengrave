// 全局变量
var records = [];
var recordsTableBody;
var recordModal;
var closeModal;
var cancelBtn;
var recordForm;
var modalTitle;
var recordIdInput;
var confirmModal;
var confirmMessage;
var confirmOk;
var confirmCancel;
var toast;
var toastMessage;
var toastIcon;
var categoryFilter;
var resetBtn;
var totalRecordsEl;
var totalAmountEl;
var categoryCountEl;
var shownCountEl;
var totalCountEl;
var exportBtn;
var categoryStats;
var currentRecordId = null;
var categoryChart = null;
var newAddNum = 0;
window.onload = function () {
    //初始化
    // 设置默认日期为今天
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('time').value = today;
    // 初始化品牌列表
    initBrandList();
    //添加按钮监听
    addBtnClick();
    //加载我的待办
    searchRenovation();

    // 暴露函数到全局，供HTML中调用
    window.openEditModal = openEditModal;
    window.deleteRecord = deleteRecord;
}

function addBtnClick() {
    const priceInput = document.getElementById('price');
    const quantityInput = document.getElementById('quantity');
    // 计算总价
    priceInput.addEventListener('input', calculateTotal);
    quantityInput.addEventListener('input', calculateTotal);

    // DOM元素
    recordsTableBody = document.getElementById('records-table-body');
    recordModal = document.getElementById('record-modal');
    closeModal = document.getElementById('close-modal');
    cancelBtn = document.getElementById('cancel-btn');
    recordForm = document.getElementById('record-form');
    modalTitle = document.getElementById('modal-title');
    recordIdInput = document.getElementById('record-id');
    confirmModal = document.getElementById('confirm-modal');
    confirmMessage = document.getElementById('confirm-message');
    confirmOk = document.getElementById('confirm-ok');
    confirmCancel = document.getElementById('confirm-cancel');
    toast = document.getElementById('toast');
    toastMessage = document.getElementById('toast-message');
    toastIcon = document.getElementById('toast-icon');
    resetBtn = document.getElementById('reset-btn');
    totalRecordsEl = document.getElementById('total-records');
    totalAmountEl = document.getElementById('total-amount');
    categoryCountEl = document.getElementById('category-count');
    shownCountEl = document.getElementById('shown-count');
    totalCountEl = document.getElementById('total-count');
    exportBtn = document.getElementById('export-btn');
    categoryStats = document.getElementById('category-stats');

    // 关闭确认对话框事件
    confirmCancel.addEventListener('click', closeConfirmModal);

    // 模态框操作
    closeModal.addEventListener('click', closeRecordModal);
    cancelBtn.addEventListener('click', closeRecordModal);

    // 搜索和筛选
    resetBtn.addEventListener('click', resetFilters);

    // 其他操作
    exportBtn.addEventListener('click', exportData);

    updateDashboardStats();
    // updateCategoryStats();


    $("#add-record-btn").on("click", function () {
        modalTitle.textContent = '新增花费记录';
        recordForm.reset();
        recordIdInput.value = '';
        document.getElementById('time').value = new Date().toISOString().split('T')[0];
        currentRecordId = null;
        openRecordModal();
    })
    /**
     * 查询记录
     */
    $("#search-btn").click(function () {
        searchRenovation();
    })
    /**
     * 点击保存按钮
     */
    $("#saveRecord").click(function () {
        let category = $("#category").val();//品类
        let brand = $("#brand").val();// 品牌
        let model = $("#model").val();//型号
        let price = $("#price").val();// 价格
        let specifications = $("#specifications").val();// 规格
        let remark = $("#remark").val();//备注
        let totalPrice = $("#totalPrice").val();//总价
        let quantity = $("#quantity").val();//数量
        let unit = $("#unit").val();//单位
        let status=$("#status").val();
        if (category == "" || price == "" || quantity == "" || unit == ""||status=="") {
            showToast("请填写完整信息");
        } else if (currentRecordId) {
            axios.post('/renovation/updateRenovation', 'id=' + currentRecordId + '&category=' + category + '&brand=' + brand + '&model=' + model + '&price=' + price + '&specifications=' + specifications + '&remark=' + remark + '&totalPrice=' + totalPrice + '&quantity=' + quantity + '&unit=' + unit + "&time=" + $("#time").val()+"&status="+status)
                .then(res => {
                    console.log(res);
                    console.log(res.data);
                    if (res.status === 200) {
                        let info = res.data;
                        //展示提示
                        showToast('更新记录成功', 'success');
                        // 刷新表格
                        searchRenovation();
                        //隐藏模态框
                        closeRecordModal();
                    }
                })
        } else {
            axios.post('/renovation/addRenovation', 'category=' + category + '&brand=' + brand + '&model=' + model + '&price=' + price + '&specifications=' + specifications + '&remark=' + remark + '&totalPrice=' + totalPrice + '&quantity=' + quantity + '&unit=' + unit + "&time=" + $("#time").val()+"&status="+status)
                .then(res => {
                    console.log(res);
                    console.log(res.data);
                    if (res.status === 200) {
                        let info = res.data;
                        let record = info.data;
                        //展示提示
                        showToast('记录添加成功', 'success');
                        // 刷新表格
                        searchRenovation();
                        //隐藏模态框
                        closeRecordModal();
                    }
                })
                .catch(error => {
                    // removeLoading();
                    showToast('记录添加失败', 'error');
                });
        }
    });
}


/**
 * 计算总价
 */
function calculateTotal() {
    const price = parseFloat($("#price").val()) || 0;
    const quantity = parseFloat($("#quantity").val()) || 0;
    $("#totalPrice").val((price * quantity).toFixed(2));
}

// 打开编辑模态框
function openEditModal(id) {
    const record = records.find(r => r.id === id);
    if (!record) return;
    modalTitle.textContent = '编辑花费记录';
    currentRecordId = id;
    // 填充表单数据
    recordIdInput.value = record.id;
    document.getElementById('category').value = record.category;
    document.getElementById('brand').value = record.brand;
    document.getElementById('model').value = record.model;
    document.getElementById('specifications').value = record.specifications;
    $("#price").val(record.price);
    $("#quantity").val(record.quantity);
    document.getElementById('unit').value = record.unit;
    document.getElementById('remark').value = record.remark;
    document.getElementById('time').value = record.time.split('T')[0];
    document.getElementById("status").value=record.status||"";
    $("#totalPrice").val((record.price * record.quantity).toFixed(2));
    openRecordModal();
}

// 打开模态框
function openRecordModal() {
    recordModal.classList.remove('hidden');
    recordModal.classList.add('flex');
    document.body.style.overflow = 'hidden';
}

// 关闭模态框
function closeRecordModal() {
    recordModal.classList.add('hidden');
    recordModal.classList.remove('flex');
    document.body.style.overflow = '';
}

// 删除记录
function deleteRecord(id) {
    confirmModal.classList.remove('hidden');
    confirmModal.classList.add('flex');
    confirmMessage.textContent = '您确定要删除这条记录吗？此操作不可恢复。';
    const confirmAction = () => {
        // records = records.filter(r => r.id !== id);
        // localStorage.setItem('decorationRecords', JSON.stringify(records));
        //
        // searchRenovation();
        // updateDashboardStats();
        // updateChart();
        // // updateCategoryStats();
        //
        //
        // showToast('记录已删除', 'success');
        axios.post('/renovation/deleteRenovation', 'id=' + id).then
        (res => {
            console.log(res);
            console.log(res.data);
            if (res.status === 200) {
                searchRenovation();
                closeConfirmModal();
                showToast('记录已删除', 'success');
            }
        })
    };
    confirmOk.onclick = confirmAction;
    document.body.style.overflow = 'hidden';
}

// 关闭确认对话框
function closeConfirmModal() {
    confirmModal.classList.add('hidden');
    confirmModal.classList.remove('flex');
    document.body.style.overflow = '';
}

// 显示提示消息
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');
    const toastIcon = document.getElementById('toast-icon');

    // 重置状态
    toast.className = 'fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2';
    toastMessage.textContent = message;

    // 设置类型样式
    if (type === 'success') {
        toast.classList.add('bg-green-50', 'text-green-800');
        toastIcon.className = 'fa fa-check-circle text-secondary';
    } else if (type === 'error') {
        toast.classList.add('bg-red-50', 'text-red-800');
        toastIcon.className = 'fa fa-exclamation-circle text-danger';
    } else if (type === 'info') {
        toast.classList.add('bg-blue-50', 'text-blue-800');
        toastIcon.className = 'fa fa-info-circle text-primary';
    }

    // 显示提示
    setTimeout(() => toast.classList.add('show'), 10);

    // 3秒后隐藏
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// 渲染记录表格
function renderRecords(filteredRecords = null) {
    const recordsToRender = filteredRecords || records;
    if (recordsToRender.length === 0) {
        recordsTableBody.innerHTML = `
          <tr class="table-row">
            <td colspan="8" class="px-4 py-8 text-center text-neutral">
              <div class="flex flex-col items-center">
                <i class="fa fa-folder-open-o text-4xl mb-2 text-gray-300"></i>
                <p>暂无记录，请点击"新增记录"添加</p>
              </div>
            </td>
          </tr>
        `;
    } else {
        // <td className="px-4 py-3">${record.category}</td>
        // <td className="px-4 py-3">${record.brand || '-'}</td>
        recordsTableBody.innerHTML = recordsToRender.map(record => `
          <tr class="table-row border-b border-gray-100">
            <td class="px-3 py-2">
              <div>
                <div class="text-sm">${record.category}</div>
                <div class="text-xs text-neutral">${record.brand || '-'}</div>
              </div>
            </td>
            <td class="px-3 py-2">
              <div>
                <div class="text-sm">${record.model || '-'}</div>
                <div class="text-xs text-neutral">${record.specifications || '-'}</div>
              </div>
            </td>
            <td class="px-3 py-2">${changeStatus(record.status)|| '-'}</td>
            <td class="px-3 py-2">¥${parseFloat(record.price).toFixed(2)}</td>
            <td class="px-3 py-2">${record.quantity} ${record.unit}</td>
            <td class="px-3 py-2 font-medium">¥${parseFloat(record.totalPrice).toFixed(2)}</td>
            <td class="px-3 py-2">${record.time.split("T")[0]}</td>
            <td class="px-3 py-2">
              <div class="flex gap-1 justify_content">
                <button onclick="openEditModal(${record.id})" class="text-primary hover:text-primary/80 p-1 transition-custom" title="编辑">
                  <i class="fa fa-pencil"></i>
                </button>
                <button onclick="deleteRecord(${record.id})" class="text-danger hover:text-danger/80 p-1 transition-custom" title="删除">
                  <i class="fa fa-trash"></i>
                </button>
              </div>
            </td>
          </tr>
        `).join('');
    }
    // 更新计数
    shownCountEl.textContent = recordsToRender.length;
    totalCountEl.textContent = records.length;
    $("#total-records").val(records.length);
    $("#addRecordNum").val('<i class="fa fa-arrow-up"></i> ' + newAddNum);
}

function changeStatus(status) {
    let html = "";
    switch (status){
        case '已下单':
            html = '<p style="color:#0a58ca;">'+status+'</p>';
            break;
        case '运输中':
            html = '<p style="color:#a66bff;">'+status+'</p>';
            break;
        case '已延期':
            html = '<p style="color:#ff4029;">'+status+'</p>';
            break;
        case '已收货':
            html = '<p style="color:#ff7800;">'+status+'</p>';
            break;
        case '已使用':
            html = '<p style="color:#345dff;">'+status+'</p>';
            break;
        case '已完成':
            html = '<p style="color:#0aca40;">'+status+'</p>';
            break;
    }
    return html;
}


// 重置筛选条件
function resetFilters() {
    $("#brand-filter").val('all');
    $("#keyword-search").val("");
    $("#time-filter").val("desc");
    $("#status-filter").val("all");
    searchRenovation();
}

// 更新仪表盘统计数据
function updateDashboardStats() {
    // 总记录数
    totalRecordsEl.textContent = records.length;

    // 总花费
    const totalAmount = records.reduce((sum, record) => sum + parseFloat(record.total), 0);
    totalAmountEl.textContent = `¥${totalAmount.toFixed(2)}`;

    // 品类数量
    const categories = new Set(records.map(r => r.category));
    categoryCountEl.textContent = categories.size;
}

// 更新图表
function updateChart() {
    const myChart_Num = echarts.init(document.getElementById('chart_num'));
    const myChart_Price = echarts.init(document.getElementById('chart_price'));
    let datas_num = [];
    let datas_price = [];
    let josn = {};
    let json_price = {};
    for (let i = 0; i < records.length; i++) {
        let brandName = records[i].brand;
        if (brandName == null || brandName === "" || brandName === "null") {
            brandName = "其他";
        }
        if (josn[brandName]) {
            josn[brandName] = josn[brandName] + 1;
        } else {
            josn[brandName] = 1;
        }
        if (json_price[brandName]) {
            json_price[brandName] = json_price[brandName] + parseFloat(records[i].totalPrice);
        } else {
            json_price[brandName] = parseFloat(records[i].totalPrice);
        }
    }
    for (let key in josn) {
        let object = {
            name: key,
            value: josn[key]
        }
        datas_num.push(object);
    }
    for (let key in json_price) {
        let object = {
            name: key,
            value: json_price[key]
        }
        datas_price.push(object);
    }
    // 指定图表的配置项和数据
    let option_num = {
        title: {
            text: '各品牌产品数量'
        },
        tooltip: {},
        series: [
            {
                name: '数量',
                type: 'pie',
                data: datas_num
            }
        ]
    };
    // 使用刚指定的配置项和数据显示图表。
    myChart_Num.setOption(option_num);

    // 指定图表的配置项和数据
    let option_price = {
        title: {
            text: '各品牌产品花费'
        },
        tooltip: {},
        series: [
            {
                name: '花费',
                type: 'pie',
                data: datas_price
            }
        ]
    };
    // 使用刚指定的配置项和数据显示图表。
    myChart_Price.setOption(option_price);
}

// 获取品类数据
function getCategoryData() {
    const categoryMap = {};

    records.forEach(record => {
        if (!categoryMap[record.category]) {
            categoryMap[record.category] = 0;
        }
        categoryMap[record.category] += parseFloat(record.total);
    });

    // 转换为数组并按金额排序
    const categories = Object.entries(categoryMap)
        .sort((a, b) => b[1] - a[1])
        .map(item => item[0]);

    const amounts = Object.entries(categoryMap)
        .sort((a, b) => b[1] - a[1])
        .map(item => item[1]);

    return {categories, amounts};
}

// 更新品类统计
function updateCategoryStats() {
    const categoryMap = {};

    // 计算每个品类的总金额和记录数
    records.forEach(record => {
        if (!categoryMap[record.category]) {
            categoryMap[record.category] = {
                total: 0,
                count: 0
            };
        }
        categoryMap[record.category].total += parseFloat(record.total);
        categoryMap[record.category].count += 1;
    });

    // 转换为数组并排序
    const categoryList = Object.entries(categoryMap)
        .map(([name, data]) => ({
            name,
            total: data.total,
            count: data.count
        }))
        .sort((a, b) => b.total - a.total);

    // 渲染统计数据
    if (categoryList.length === 0) {
        categoryStats.innerHTML = `
          <div class="text-center py-4 text-neutral">
            暂无统计数据
          </div>
        `;
    } else {
        categoryStats.innerHTML = categoryList.map((category, index) => `
          <div class="flex items-center justify-between p-2 rounded-lg hover:bg-light transition-custom">
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 rounded-full" style="background-color: ${categoryChart.data.datasets[0].backgroundColor[index % 10]}"></div>
              <span class="font-medium">${category.name}</span>
            </div>
            <div class="text-right">
              <div class="font-medium">¥${category.total.toFixed(2)}</div>
              <div class="text-xs text-neutral">${category.count} 条记录</div>
            </div>
          </div>
        `).join('');
    }
}

// 导出数据
function exportData() {
    if (records.length === 0) {
        showToast('没有数据可导出', 'info');
        return;
    }
    // 构建CSV内容
    let csvContent = "品类,品牌,型号,规格,单价(元),数量,单位,总计(元),记录时间\n";
    records.forEach(record => {
        csvContent += `${record.category},${record.brand},${record.model},${record.specifications},${record.price},${record.quantity},${record.unit},${record.totalPrice},${record.time}\n`;
    });
    // 创建下载链接
    const blob = new Blob([csvContent], {type: 'text/csv;charset=utf-8;'});
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `装修花费记录_${new Date().toLocaleDateString()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('数据导出成功', 'success');
}

/**
 * 查询花费记录列表
 */
function searchRenovation() {
    let brand = $("#brand-filter").val();//品牌
    if (brand === "all") {
        brand = null;
    }
    axios.post('/renovation/searchRenovation', 'brand=' + brand + '&cond=' + ($("#keyword-search").val() || null) + '&timeSort=' + $("#time-filter").val()+"&status="+$("#status-filter").val())
        .then(res => {
            if (res.status === 200) {
                let info = res.data;
                records = info.data;
                renderRecords();//渲染列表展示
                $("#total-records").text(records.length);
                let newAddNum = 0;
                let priceTotal = 0;
                let nowMonthPrice = 0;
                for (let i = 0; i < records.length; i++) {
                    if (records[i].time.split('T')[0] === (new Date().toISOString().split('T')[0])) {
                        newAddNum++;
                    }
                    priceTotal += parseFloat(records[i].totalPrice);
                    if (records[i].time.split('T')[0].split('-')[1] === (new Date().toISOString().split('T')[0].split('-')[1])) {
                        nowMonthPrice += parseFloat(records[i].totalPrice);
                    }
                }
                $("#addRecordNum").html('<i class="fa fa-arrow-up"></i> ' + newAddNum);
                $("#total-amount").text(priceTotal.toFixed(2));
                $("#total-amount-month").text('¥' + nowMonthPrice.toFixed(2));

                updateChart();
            }
        })
}

function initBrandList() {
    axios.get('/renovation/getBrandList').then(res => {
        if (res.status === 200) {
            let info = res.data;
            let brandList = info.data;
            $("#brand-filter").empty();
            $("#brand-filter").append('<option value="all" selected>全部品牌</option>');
            let total = 0;
            for (let i = 0; i < brandList.length; i++) {
                if (brandList[i] === "") {
                    continue;
                }
                total++;
                let option = '<option value="' + brandList[i] + '">' + brandList[i] + '</option>';
                $("#brand-filter").append(option);
            }
            $("#category-count").text(total);
        }
    });
}