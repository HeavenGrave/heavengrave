var nowUserId = 1;//当前用户ID
// var nowToDay = formatDate(new Date(),"yyyy-MM-dd");
// var ifAddClickFinish = false;
// var nowType="MONTH";//月
// var nowCheckYear=2024;
// var nowCheckMonth=12;
// var nowCheckDay=1;
// 任务数据存储
var tasks = [];//任务信息
var currentEditingTaskId = null;
var taskToDelete = null;
var currentCategory = '全部';
// 排序方式：createTime, dueDate, priority
var currentSort = 'createTime';//创建时间
var currentFilter = 'all'; // all, incomplete, completed  全部任务
var searchQuery = '';
var searchVisible = false; // 搜索框可见状态
// 页面加载完成后初始化
// $(document).ready(function() {
window.onload = function () {
    // 获取用户ID
    nowUserId = parseInt(getParameterByName('userId'));
    //添加按钮监听
    addBtnClick();
    //加载我的待办
    searchMyToDo();
}

function addBtnClick() {
    // 事件监听：分类标签切换
    $('.category-tab').click(function () {
        $('.category-tab').removeClass('active bg-xiaomi text-white').addClass('bg-cardGray text-textPrimary hover:bg-gray-100');
        $(this).addClass('active bg-xiaomi text-white').removeClass('bg-cardGray text-textPrimary hover:bg-gray-100');

        currentCategory = $(this).text().trim();
        searchMyToDo();
    });

// 事件监听：搜索框输入
    $('#search-input').on('input', function () {
        searchQuery = $(this).val().trim();

        // 显示/隐藏清除按钮
        if (searchQuery) {
            $('#clear-search').removeClass('hidden');
        } else {
            $('#clear-search').addClass('hidden');
        }

        searchMyToDo();
    });

// 事件监听：清除搜索
    $('#clear-search').click(function () {
        $('#search-input').val('');
        searchQuery = '';
        $(this).addClass('hidden');
        renderTasks();
    });

// 事件监听：搜索按钮（切换显示/隐藏）
    $('#search-toggle-btn').click(toggleSearch);

// 事件监听：排序按钮 - 循环切换排序方式
    $('#sort-btn').click(function () {
        // 切换排序方式：创建时间 → 截止时间 → 优先级 → 创建时间...
        if (currentSort === 'createTime') {
            currentSort = 'dueDate';
            showToast('已按截止时间排序');
        } else if (currentSort === 'dueDate') {
            currentSort = 'priority';
            showToast('已按优先级排序');
        } else {
            currentSort = 'createTime';
            showToast('已按创建时间排序');
        }

        updateSortIndicator();
        searchMyToDo();
    });

// 事件监听：筛选按钮
    $('#filter-btn').click(function () {
        // 切换筛选状态：全部 -> 未完成 -> 已完成 -> 全部...
        if (currentFilter === 'all') {
            currentFilter = 'incomplete';
            showToast('已筛选未完成任务');
        } else if (currentFilter === 'incomplete') {
            currentFilter = 'completed';
            showToast('已筛选已完成任务');
        } else {
            currentFilter = 'all';
            showToast('已显示全部任务');
        }

        updateFilterIndicator();
        searchMyToDo();
    });

// 事件监听：添加任务按钮
    $('#add-task-btn, #add-first-task').click(openAddTaskModal);

// 事件监听：关闭模态框
    $('#close-modal, #cancel-delete').click(closeModals);

// 点击模态框背景关闭
    $('#task-modal, #delete-modal').click(function (e) {
        if (e.target === this) {
            closeModals();
        }
    });
// 点击设置按钮
    $('#more-btn').click(function (e) {
        showToast('设置功能开发中...');
    });

// 事件监听：提交任务表单
    $('#task-form').submit(function (e) {
        e.preventDefault();
        const taskData = {
            title: $('#task-title').val().trim(),
            info: $('#task-desc').val().trim(),
            category: $('#task-category').val(),
            level: $('#task-priority').val(),
            endTime: $('#task-date').val(),
            ctime: $('#create-time').val()
        };
        // 验证
        if (!taskData.title) {
            showToast('请输入任务名称');
            return;
        }
        if (!taskData.endTime) {
            showToast('请选择截止日期');
            return;
        }
        if (currentEditingTaskId) {
            updateTask(currentEditingTaskId, taskData);
        } else {
            addTask(taskData);
        }

        closeModals();
    });

// 事件监听：任务复选框
    $(document).on('change', '.task-checkbox', function () {
        const taskId = $(this).closest('.task-item').data('id');
        const completed = $(this).is(':checked');

        toggleTaskCompletion(taskId, completed);
    });

// 事件监听：编辑任务
    $(document).on('click', '.edit-task', function () {
        const taskId = $(this).closest('.task-item').data('id');
        openEditTaskModal(taskId);
    });

// 事件监听：删除任务（打开确认框）
    $(document).on('click', '.delete-task', function () {
        taskToDelete = $(this).closest('.task-item').data('id');
        $('#delete-modal').removeClass('hidden').css('display', 'flex');
        $('body').css('overflow', 'hidden');
    });

// 事件监听：确认删除
    $('#confirm-delete').click(function () {
        if (taskToDelete) {
            deleteTask(taskToDelete);
            taskToDelete = null;
            closeModals();
        }
    });
}


function addLoading() {
    $(".loading").css("display", "block");
}

function removeLoading() {
    $(".loading").css("display", "none");
}

function searchMyToDo() {
    addLoading();
    axios.get('/todo/searchMyToDo?userId=' + nowUserId + '&currentFilter=' + currentFilter + '&currentSort=' + currentSort)
        .then(res => {
            removeLoading();
            console.log(res);
            console.log(res.data);
            if (res.status === 200) {
                let info = res.data;
                let nowMyToDoList = info.data;
                console.log(nowMyToDoList);
                tasks = nowMyToDoList;
                // addNewToDo();
                // if(!ifAddClickFinish){
                //     ifAddClickFinish = true;
                //     //添加点击事件
                //     addBtnClick();
                // }
                // 初始化示例任务数据
                initSampleTasks();
            }
        })
        .catch(error => {
            removeLoading();
            console.error('查询失败:', error);
        });
}


// 初始化示例任务
function initSampleTasks() {
    let json = {
        id: "uuid",
        title: "标题",
        content: "内容",
        createTime: '创建时间',
        endTime: '截止时间',
        type: '事件类型',
        level: '事件等级',
    }
    // 更新排序指示器
    updateSortIndicator();
    // 更新筛选指示器
    updateFilterIndicator();
    // 渲染任务
    renderTasks();
}

// 更新排序指示器
function updateSortIndicator() {
    let icon = '';
    let text = '';
    switch (currentSort) {
        case 'createTime':
            icon = '<i class="fa fa-calendar-plus-o"></i>';
            text = '创建时间';
            break;
        case 'dueDate':
            icon = '<i class="fa fa-clock-o"></i>';
            text = '截止时间';
            break;
        case 'priority':
            icon = '<i class="fa fa-flag"></i>';
            text = '优先级';
            break;
    }
    $('#sort-indicator').html(`${icon} <span class="hidden sm:inline">${text}</span>`);
}

// 更新筛选指示器
function updateFilterIndicator() {
    let icon = '';
    let text = '';
    if (currentFilter === 'all') {
        icon = '<i class="fa fa-bullseye"></i>';
        text = "全部";
    } else if (currentFilter === 'incomplete') {
        icon = '<i class="fa fa-circle-o"></i>';
        text = "未完成";
    } else if (currentFilter === 'completed') {
        icon = '<i class="fa fa-check-circle-o"></i>';
        text = "已完成";
    }
    $('#filter-indicator').html(`${icon} <span class="hidden sm:inline">${text}</span>`);
}

// 过滤并排序任务
function getFilteredAndSortedTasks() {
    let result = [...tasks];
    // 应用搜索过滤
    if (searchQuery) {
        const query = searchQuery.toLowerCase();
        z
        result = result.filter(task => task.title.toLowerCase().includes(query) ||
            task.info.toLowerCase().includes(query)
        );
    }

    // 应用分类过滤
    if (currentCategory !== '全部') {
        result = result.filter(task => task.category === currentCategory);
    }

    // 应用状态过滤
    if (currentFilter === 'incomplete') {
        result = result.filter(task => !task.completed);
    } else if (currentFilter === 'completed') {
        result = result.filter(task => task.completed);
    }

    // 应用排序
    result.sort((a, b) => {
        if (currentSort === 'createTime') {
            // 按创建时间降序（最新的在前）
            return new Date(b.ctime) - new Date(a.ctime);
        } else if (currentSort === 'dueDate') {
            // 按截止时间升序（最早的在前）
            return new Date(a.endTime) - new Date(b.endTime);
        } else { // priority
            // 按优先级排序（高 -> 中 -> 低）
            const priorityOrder = {
                'high': 3,
                'medium': 2,
                'low': 1
            };
            return priorityOrder[b.priority] - priorityOrder[a.priority];
        }
    });

    return result;
}

// 渲染任务列表
function renderTasks() {
    const taskContainer = $('#task-container');
    taskContainer.empty();

    // 获取过滤和排序后的任务
    const filteredTasks = getFilteredAndSortedTasks();

    // 显示空状态或任务列表
    if (filteredTasks.length === 0) {
        $('#empty-state').removeClass('hidden');
        taskContainer.hide();
    } else {
        $('#empty-state').addClass('hidden');
        taskContainer.show();

        // 渲染每个任务
        filteredTasks.forEach(task => {
            const isOverdue = !task.ifFinish && new Date(task.endTime.substring(0,16)) < new Date();
            const displayDate = formatDateForDisplay(task.endTime.substring(0,16));
            const priorityInfo = getPriorityInfo(task.level);

            // 设置日期样式
            let dateClass = 'text-amber-500';
            let dateIcon = 'fa-clock-o';

            if (isOverdue) {
                dateClass = 'text-priorityHigh';
                dateIcon = 'fa-exclamation-circle';
            } else if (task.ifFinish) {
                dateClass = 'text-textTertiary';
            } else if (displayDate.startsWith('今天')) {
                dateClass = 'text-priorityHigh';
            }

            // 设置分类样式
            const categoryStyles = {
                '工作': 'bg-blue-100 text-blue-700',
                '生活': 'bg-green-100 text-green-700',
                '学习': 'bg-purple-100 text-purple-700',
                '健康': 'bg-red-100 text-red-700',
                '其他': 'bg-gray-100 text-gray-700'
            };

            // 创建任务元素
            const taskElement = $(`
                            <div class="task-item bg-cardGray rounded-xl p-4 shadow-sm hover:shadow transition-all duration-200 task-enter"
                                 data-id="${task.id}"
                                 data-category="${task.category}"
                                 data-priority="${task.level}">
                                <div class="flex items-start">
                                    <div class="mr-3 mt-0.5">
                                        <input type="checkbox" class="task-checkbox w-5 h-5 rounded border-gray-300 text-xiaomi focus:ring-xiaomi/30"
                                               ${task.ifFinish ? 'checked' : ''}>
                                    </div>
                                    <div class="flex-1">
                                        <div class="flex justify-between items-start flex-wrap gap-2">
                                            <h3 class="font-medium task-title ${task.ifFinish ? 'line-through text-textTertiary' : ''}">${task.title}</h3>
                                            <div class="flex space-x-2">
                                                <span class="text-xs ${categoryStyles[task.category]} px-2 py-0.5 rounded-full">${task.category}</span>
                                                <span class="text-xs ${priorityInfo.class} px-2 py-0.5 rounded-full border">
                                                    <i class="fa ${priorityInfo.icon} mr-0.5"></i>${priorityInfo.text}
                                                </span>
                                            </div>
                                        </div>
                                        ${task.info ?
                `<p class="text-sm text-textSecondary mt-1 task-desc ${task.ifFinish ? 'line-through text-textTertiary' : ''}">${task.info}</p>` : ''}
                                        <div class="flex justify-between items-center mt-3">
                                            <span class="text-xs ${dateClass}"><i class="fa ${dateIcon} mr-1"></i> ${displayDate}</span>
                                            <div class="flex space-x-2">
                                                <button class="edit-task p-1.5 text-textTertiary hover:text-xiaomi transition-colors">
                                                    <i class="fa fa-pencil"></i>
                                                </button>
                                                <button class="delete-task p-1.5 text-textTertiary hover:text-priorityHigh transition-colors">
                                                    <i class="fa-regular fa-trash-can"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        `);

            taskContainer.append(taskElement);
        });
    }
    // 更新任务统计
    updateTaskStats();
}

// 切换搜索框显示/隐藏
function toggleSearch() {
    const searchContainer = $('#search-container');
    const searchInput = $('#search-input');

    if (searchVisible) {
        // 隐藏搜索框
        searchContainer.addClass('slide-up-hide');
        setTimeout(() => {
            searchContainer.addClass('hidden').removeClass('slide-up-hide');
        }, 300);

        // 清除搜索内容
        searchQuery = '';
        searchInput.val('');
        $('#clear-search').addClass('hidden');

        // 重新渲染任务列表
        searchMyToDo();
    } else {
        // 显示搜索框
        searchContainer.removeClass('hidden');
        setTimeout(() => {
            searchInput.focus();
        }, 100);
    }

    searchVisible = !searchVisible;
}

// 生成唯一ID
function generateId() {
    return 'task_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
}


// 格式化日期为input可用格式
function formatDateForInput(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}`;
}

// 格式化日期为显示格式
function formatDateForDisplay(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const taskDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    // 计算日期差
    const diffTime = taskDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let dayText = '';
    switch (diffDays) {
        case 0:
            dayText = '今天';
            break;
        case 1:
            dayText = '明天';
            break;
        case -1:
            dayText = '昨天';
            break;
        default:
            dayText = `${date.getMonth() + 1}月${date.getDate()}日`;
    }

    // 格式化时间
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${dayText} ${hours}:${minutes}`;
}

// 获取优先级样式和文本
function getPriorityInfo(priority) {
    const styles = {
        3: {
            class: 'bg-priorityHigh/10 text-priorityHigh border border-priorityHigh/30',
            text: '高',
            icon: 'fa-flag'
        },
        2: {
            class: 'bg-priorityMedium/10 text-priorityMedium border border-priorityMedium/30',
            text: '中',
            icon: 'fa-flag-o'
        },
        1: {
            class: 'bg-priorityLow/10 text-priorityLow border border-priorityLow/30',
            text: '低',
            icon: 'fa-flag-o'
        }
    };
    return styles[priority];
}

/**
 * 根据url获取参数值
 * @param name
 * @returns {string|null}
 */
function getParameterByName(name) {
    name = name.replace(/[[]]/g, '\$&');
    var url = window.location.href;
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)');
    var results = regex.exec(url);
    if (!results) {
        return null;
    }
    if (!results[2]) {
        return '';
    }
    return decodeURIComponent(results[2].replace('/+/g', ' '));
}


// 更新任务统计数据
function updateTaskStats() {
    const total = tasks.length;
    const completed = tasks.filter(task => task.ifFinish).length;
    const pending = total - completed;
    const overdue = tasks.filter(task => !task.ifFinish && new Date(task.endTime.substring(0,16)) < new Date()).length;

    $('#total-tasks').text(total);
    $('#pending-tasks').text(pending);
    $('#completed-tasks').text(completed);
    $('#overdue-tasks').text(overdue);
}

// 显示提示消息
function showToast(message) {
    const toast = $('#toast');
    toast.text(message).removeClass('hidden');

    setTimeout(() => {
        toast.addClass('hidden');
    }, 2000);
}

// 打开添加任务模态框
function openAddTaskModal() {
    currentEditingTaskId = null;
    $('#modal-title').text('添加新任务');
    $('#task-form')[0].reset();
    $('#task-id').val('');
    $('#create-time').val('');
    $('#task-priority').val(2); // 默认中等优先级

    // 设置默认日期为今天18:00
    const defaultDate = new Date();
    defaultDate.setHours(18, 0, 0, 0);
    $('#task-date').val(formatDateForInput(defaultDate));

    $('#task-modal').removeClass('hidden').css('display', 'flex');
    $('body').css('overflow', 'hidden');
}

// 打开编辑任务模态框
function openEditTaskModal(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    currentEditingTaskId = taskId;
    $('#modal-title').text('编辑任务');
    $('#task-id').val(taskId);
    $('#task-title').val(task.title);
    $('#task-desc').val(task.info);
    $('#task-category').val(task.category);
    $('#task-priority').val(task.level || 2);
    $('#task-date').val(task.endTime.substring(0,16));
    $('#create-time').val(task.ctime);

    $('#task-modal').removeClass('hidden').css('display', 'flex');
    $('body').css('overflow', 'hidden');
}

// 关闭模态框
function closeModals() {
    $('#task-modal').addClass('hidden').css('display', 'none');
    $('#delete-modal').addClass('hidden').css('display', 'none');
    $('body').css('overflow', 'auto');
}

// 添加新任务
function addTask(taskData) {
    axios.post('/todo/addToDo','userId=' + nowUserId +'&title='+taskData.title+ '&info=' + taskData.info + '&category=' + taskData.category+'&endTime=' + taskData.endTime+'&level=' + taskData.level)
        .then(res => {
            console.log(res);
            console.log(res.data);
            if(res.status===200){
                let info=res.data;
                let nowMyToDo = info.data;
                tasks.push(nowMyToDo);
                // console.log(nowMyToDo);
                // toDoCellDiv.attr("id", nowMyToDo.id);
                // toDoCellDiv.find(".toDoDelBtn").css("display","flex");
                // addNewToDo();
                renderTasks();
                showToast('任务添加成功');
            }
        })
        .catch(error => {
            // removeLoading();
            showToast('任务添加失败');
        });
}

// 更新任务
function updateTask(taskId, taskData) {
    const index = tasks.findIndex(t => t.id === taskId);
    if (index === -1) return;
    tasks[index] = {
        ...tasks[index],
        title: taskData.title,
        info: taskData.info,
        category: taskData.category,
        level: taskData.level,
        endTime: taskData.endTime
        // 保留原有的createTime和completed状态
    };
    saveTasks(tasks[index]);

}

// 删除任务
function deleteTask(taskId) {
    axios.post('/todo/deleteToDo','myToDoId=' + taskId)
        .then(res => {
            console.log(res);
            // console.log(res.data);
            if(res.status===200){
                searchMyToDo();
                showToast('任务已删除!');
            }
        })
        .catch(error => {
            // removeLoading();
            showToast('任务添加失败');
        });
}

// 切换任务完成状态
function toggleTaskCompletion(taskId, completed) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        task.ifFinish = completed;
        saveTasks(task);
        // 更新UI
        const $taskItem = $(`.task-item[data-id="${taskId}"]`);
        $taskItem.find('.task-title, .task-desc').toggleClass('line-through text-textTertiary', completed);
        updateTaskStats();
        showToast(completed ? '任务已完成' : '任务已恢复');
        // 如果启用了筛选，可能需要重新渲染
        if (currentFilter !== 'all') {
            searchMyToDo();
        }
    }
}

/**
 * 保存更新数据
 * @param taskData
 */
function saveTasks(taskData){
    axios.post('/todo/updateToDo','myToDoId='+taskData.id+'&title='+taskData.title+ '&info=' + taskData.info + '&category=' + taskData.category+'&endTime=' + taskData.endTime+'&level=' + taskData.level+'&ifFinish='+taskData.ifFinish)
        .then(res => {
            console.log(res);
            // console.log(res.data);
            if(res.status===200){
                renderTasks();
                showToast('任务更新成功');
            }
        })
        .catch(error => {
            // removeLoading();
            showToast('任务添加失败');
        });
}