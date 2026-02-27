const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const API_BASE = 'novelInfo'; // 请替换为实际的API基础地址
// DOM 元素
const fileInput = $('#fileInput');
const browseBtn = $('#browseBtn');
const uploadArea = $('#uploadArea');
const progressContainer = $('#progressContainer');
const progressBar = $('#progressBar');
const progressText = $('#progressText');
const statsPanel = $('#statsPanel');
const tableContainer = $('#tableContainer');
const resetBtn = $('#resetBtn');
var viewModal;
var editModal;
var currentFile = null;//当前上传文件信息
var currentFileName = null;//当前上传文件名
window.onload = function () {
    // 全局变量
    // let articleData = [];

    // 模态框
    viewModal = new bootstrap.Modal('#viewModal');
    editModal = new bootstrap.Modal('#editModal');
    //初始化按钮点击监听
    initEvents();
}

// 初始化事件监听
function initEvents() {
    // 浏览文件按钮
    browseBtn.on('click', () => fileInput.click());
    // 文件选择变化
    fileInput.on('change', handleFileSelect);
    // 拖拽上传
    uploadArea.on('dragover', (e) => {
        e.preventDefault();
        uploadArea.addClass('border-primary bg-primary/5');
    });
    uploadArea.on('dragleave', () => {
        uploadArea.removeClass('border-primary bg-primary/5');
    });
    uploadArea.on('drop', (e) => {
        e.preventDefault();
        uploadArea.removeClass('border-primary bg-primary/5');
        if (e.originalEvent.dataTransfer.files.length) {
            if (e.originalEvent.dataTransfer.files.length > 1) {
                showAlert('只能上传一个文件', 'warning');
                return;
            }
            handleFile(e.originalEvent.dataTransfer.files[0]);
        }
    });

    // 重置按钮
    resetBtn.on('click', resetAll);

    // 保存编辑
    $('#saveEditBtn').on('click', saveEdit);
}

// 表格操作格式化
function actionFormatter(value, row, index) {
    return [
        '<button class="btn-action btn-view text-primary hover:bg-primary/10" title="查看">',
        '<i class="fas fa-eye"></i> 查看',
        '</button>',
        '<button class="btn-action btn-edit text-secondary hover:bg-secondary/10 ms-1" title="编辑">',
        '<i class="fas fa-pencil-alt"></i> 编辑',
        '</button>'
    ].join('');
}

// 处理文件选择
function handleFileSelect(e) {
    if (e.target.files.length) {
        handleFile(e.target.files[0]);
    }
}

// 处理文件
function handleFile(file) {
    // 验证文件类型
    if (file.type !== 'text/plain' && !file.name.endsWith('.txt')) {
        showAlert('请上传TXT格式的文件', 'error');
        return;
    }
    // 验证文件大小
    if (file.size > MAX_FILE_SIZE) {
        showAlert('文件大小不能超过50MB', 'error');
        return;
    }
    // 清除之前的数据
    resetAll(false);

    currentFile = file;
    uploadFileToServer(file); // 上传到服务器
}

// 上传文件到服务器
function uploadFileToServer(file) {
    addLoading();
    const formData = new FormData();
    formData.append('file', file);
    const startTime = performance.now();
    // 显示进度
    progressContainer.removeClass('hidden');
    progressBar.css('width', '0%');
    progressText.text('上传中: 0%');

    try {
        const xhr = new XMLHttpRequest();
        // 监听上传进度
        xhr.upload.addEventListener('progress', (event) => {
            if (event.lengthComputable) {
                const percent = Math.round((event.loaded / event.total) * 100);
                progressBar.css('width', `${percent}%`);
                progressText.text(`上传中: ${percent}%`);
            }
        });

        // 上传完成处理
        xhr.addEventListener('load', () => {
            if (xhr.status === 200) {
                try {

                    const result = JSON.parse(xhr.responseText);
                    // 上传完成后，从服务器获取文件内容进行处理
                    fetchFileContent(result.data, startTime);
                } catch (error) {
                    console.error('解析响应失败:', error);
                    showAlert('文件上传失败', 'error');
                    progressBar.css('background-color', '#dc3545');
                }
            } else {
                showAlert(`上传失败，状态码: ${xhr.status}`, 'error');
                progressBar.css('background-color', '#dc3545');
            }
        });

        // 上传错误处理
        xhr.addEventListener('error', () => {
            showAlert('网络错误，上传失败', 'error');
            progressBar.css('background-color', '#dc3545');
        });
        // 发送请求
        xhr.open('POST', `${API_BASE}/uplaodNovelFile`, true); // 注意：原代码中upload拼写错误uplaod
        xhr.send(formData);
    } catch (error) {
        console.error('上传错误:', error);
        showAlert('上传过程中发生错误', 'error');
        progressBar.css('background-color', '#dc3545');
    }
}

// 从服务器获取文件内容
function fetchFileContent(filename, startTime) {
    axios.get('/' + API_BASE + '/findNovelInfoByNovelNameToPage?novelName=' + filename + '&pageNum=1&pageSize=10')
        .then(response => {
            removeLoading();
            const rows = response.data.data.rows;
            const chapterCount = response.data.data.chapterCount;
            const endTime = performance.now();
            const processTime = ((endTime - startTime) / 1000).toFixed(2);
            // 更新统计信息
            updateStats(chapterCount, response.data.data.total, currentFile.size, processTime);
            // 更新表格数据
            // $('#articleTable').bootstrapTable('load', rows);

            // 显示统计面板和表格
            statsPanel.removeClass('hidden');
            // tableContainer.removeClass('hidden');

            // 完成进度
            progressBar.css('width', '100%');
            progressText.text('处理完成');

            // 3秒后隐藏进度条
            setTimeout(() => {
                progressContainer.addClass('hidden');
            }, 3000);

            showAlert('文件上传并处理完成', 'success');
        })
        .catch(error => {
            console.error('获取文件内容失败:', error);
            showAlert('获取文件内容失败', 'error');
        });
}

// 更新统计信息
function updateStats(chapterCount, total, fileSize, processTime) {
    // 章节数
    $('#chapterCount').text(chapterCount);
    // 总句数
    $('#sentenceCount').text(total);
    // 文件大小 (MB)
    const sizeMB = (fileSize / (1024 * 1024)).toFixed(2);
    $('#fileSize').text(sizeMB);
    // 处理时间
    $('#processTime').text(processTime);
}

// 重置所有数据
function resetAll(showAlert = true) {
    // 清空文件输入
    fileInput.val('');
    currentFile = null;
    currentFileName = null;
    articleData = [];

    // 重置UI
    progressContainer.addClass('hidden');
    statsPanel.addClass('hidden');
    tableContainer.addClass('hidden');

    // 清空表格
    $('#articleTable').bootstrapTable('removeAll');

    if (showAlert) {
        showAlert('已重置所有数据', 'info');
    }
}

// 显示提示信息
function showAlert(message, type = 'info') {
    const alertClass = {
        success: 'alert-success',
        error: 'alert-danger',
        warning: 'alert-warning',
        info: 'alert-info'
    }[type] || 'alert-info';

    const alert = $(`
        <div class="alert ${alertClass} fixed top-12 right-4 z-50 px-4 py-3 shadow-lg transform transition-all duration-300 translate-x-full">
          ${message}
        </div>
      `);

    $('body').append(alert);

    // 显示提示
    setTimeout(() => {
        alert.removeClass('translate-x-full');
    }, 100);

    // 3秒后隐藏
    setTimeout(() => {
        alert.addClass('translate-x-full');
        setTimeout(() => alert.remove(), 300);
    }, 3000);
}


// 表格操作事件
window.actionEvents = {
    'click .btn-view': function (e, value, row, index) {
        // 显示查看模态框
        $('#viewModalTitle').text(`第${row.chapterNum}章: ${row.title}`);
        $('#contentView').text(row.content);
        viewModal.show();
    },
    'click .btn-edit': function (e, value, row, index) {
        // 显示编辑模态框
        $('#editModalTitle').text(`编辑 第${row.chapterNum}章: ${row.title}`);
        $('#editId').val(index);
        $('#editActor').val(row.actor);
        $('#editContent').val(row.content);
        editModal.show();
    }
};

// 保存编辑
function saveEdit() {
    const index = $('#editId').val();
    const actor = $('#editActor').val();
    const content = $('#editContent').val();

    if (index !== '' && articleData[index] !== undefined) {
        // 更新本地数据
        articleData[index].actor = actor;
        articleData[index].content = content;

        // 更新表格
        $('#articleTable').bootstrapTable('updateRow', {
            index: parseInt(index),
            row: articleData[index]
        });

        // 更新统计
        updateStats(articleData, currentFile.size, $('#processTime').text());

        // 同步到服务器
        if (currentFileName) {
            axios.post(`${API_BASE}/updateNovelContent`, {
                filename: currentFileName,
                chapterIndex: index,
                actor: actor,
                content: content
            }).catch(error => {
                console.error('更新内容到服务器失败:', error);
                showAlert('本地修改已保存，但同步到服务器失败', 'warning');
            });
        }

        editModal.hide();
        showAlert('修改已保存', 'success');
    }
}

function addLoading() {
    $(".loading").css("display", "block");
}

function removeLoading() {
    $(".loading").css("display", "none");
}