window.onload = function () {
    const API_BASE = '/files';
    const fileList = document.getElementById('fileList');

// 文件上传处理
    async function uploadFile(file) {
        const formData = new FormData();
        formData.append('file', file);

        // 创建文件项（显示进度条）
        const item = createFileItem({
            name: file.name,
            size: file.size,
            isCompleted: false,
            timeFormat:getCurrentTime()
        });
        fileList.prepend(item);

        const progressBar = item.querySelector('.progress-bar');
        const progress = item.querySelector('.progress');

        try {
            const xhr = new XMLHttpRequest();

            xhr.upload.addEventListener('progress', (event) => {
                if (event.lengthComputable) {
                    const percent = (event.loaded / event.total) * 100;
                    progress.style.width = `${percent}%`;
                }
            });

            xhr.addEventListener('load', () => {
                if (xhr.status === 200) {
                    const result = JSON.parse(xhr.responseText);
                    const filename = result.filename;

                    let name = filename;
                    // 保留前 10 个字符和后 10 个字符，中间用省略号代替
                    const maxLength = 40; // 最大显示长度
                    if (name.length > maxLength) {
                        const start = name.slice(0, 20); // 前 10 个字符
                        const end = name.slice(-20); // 后 10 个字符
                        name = `${start}...${end}`;
                    }

                    // 更新文件名
                    item.querySelector('.file-name').textContent = name;
                    item.dataset.filename = filename;

                    // 替换进度条为操作按钮
                    progressBar.outerHTML = `
                    <div class="action-buttons" data-fileid="${Date.now()}">
                        <button class="action-btn" title="预览">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="action-btn" title="下载">
                            <i class="fas fa-download"></i>
                        </button>
                        <button class="action-btn" title="删除">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                `;

                    // 绑定新按钮的事件
                    const buttons = item.querySelectorAll('.action-btn');
                    buttons[0].addEventListener('click', () => previewFile(filename));
                    buttons[1].addEventListener('click', () => downloadFile(filename));
                    buttons[2].addEventListener('click', async () => {
                        try {
                            await deleteFile(filename);
                            item.style.transform = 'translateX(100%)';
                            item.style.opacity = '0';
                            setTimeout(() => item.remove(), 300);
                        } catch (error) {
                            alert('删除文件失败，请重试');
                        }
                    });
                } else {
                    throw new Error('上传失败');
                }
            });

            xhr.addEventListener('error', () => {
                progress.style.background = '#ff4444';
                item.querySelector('.file-meta').textContent = '上传失败';
            });

            xhr.open('POST', `${API_BASE}/upload`, true);
            xhr.send(formData);
        } catch (error) {
            console.error('上传错误:', error);
            progress.style.background = '#ff4444';
            item.querySelector('.file-meta').textContent = '上传失败';
        }
    }


// 获取文件列表
    async function loadFiles() {
        try {
            const response = await fetch(`${API_BASE}/list`);
            if (!response.ok) throw new Error('获取文件列表失败');
            return await response.json();
        } catch (error) {
            console.error('获取文件列表错误:', error);
            return [];
        }
    }

// 文件预览
    function previewFile(filename) {
        window.open(`${API_BASE}/preview/${encodeURIComponent(filename)}`, '_blank');
    }

// 文件下载
    function downloadFile(filename) {
        const link = document.createElement('a');
        link.href = `${API_BASE}/download/${encodeURIComponent(filename)}`;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

// 文件删除
    async function deleteFile(filename) {
        try {
            const response = await fetch(`${API_BASE}/delete/${encodeURIComponent(filename)}`, {
                method: 'DELETE'
            });
            if (!response.ok) throw new Error('删除失败');
            return true;
        } catch (error) {
            console.error('删除错误:', error);
            throw error;
        }
    }

// 创建文件项
    function createFileItem(fileInfo) {
        const item = document.createElement('div');
        item.className = 'file-item';
        const fileId = Date.now() + Math.random().toString(36).substr(2, 9);

        const fileType = getFileType(fileInfo);

        // 根据是否已完成显示不同状态
        const progressHtml = fileInfo.isCompleted ?
            `<div class="action-buttons" style="display: flex;" data-fileid="${fileId}">
                <button class="action-btn" title="预览">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="action-btn" title="下载">
                    <i class="fas fa-download"></i>
                </button>
                <button class="action-btn" title="删除">
                    <i class="fas fa-trash"></i>
                </button>
            </div>` :
            `<div class="progress-bar">
                <div class="progress"></div>
            </div>`;

        let name = fileInfo.name;
        // 保留前 10 个字符和后 10 个字符，中间用省略号代替
        const maxLength = 40; // 最大显示长度
        if (name.length > maxLength) {
            const start = name.slice(0, 20); // 前 10 个字符
            const end = name.slice(-20); // 后 10 个字符
            name = `${start}...${end}`;
        }
        item.innerHTML = `
<!--            <div style="height:100%;display:flex;width: 24px;align-items: center;font-size: 17px;justify-content: center;font-family: 'FontAwesome';color: #444;">1.</div>-->
            <div class="file-icon ${fileType.class}">
                <i class="${fileType.icon}"></i>
            </div>
            <div class="file-info">
                <div class="file-name">${name}</div>
                <div class="file-meta">${fileInfo.timeFormat} • ${fileType.name} • ${formatFileSize(fileInfo.size)}</div>
            </div>
            ${progressHtml}
        `;
        // 操作按钮事件绑定
        if (fileInfo.isCompleted) {
            const buttons = item.querySelectorAll('.action-btn');
            const filename = fileInfo.name;
            buttons[0].addEventListener('click', () => previewFile(filename));
            buttons[1].addEventListener('click', () => downloadFile(filename));
            buttons[2].addEventListener('click', async () => {
                try {
                    await deleteFile(filename);
                    item.style.transform = 'translateX(100%)';
                    item.style.opacity = '0';
                    setTimeout(() => item.remove(), 300);
                } catch (error) {
                    alert('删除文件失败，请重试');
                }
            });
        }

        return item;
    }

    function handleFiles(files) {
        for (const file of files) {
            uploadFile(file);
        }
    }

// 初始化文件列表
    async function initFileList() {
        try {
            const files = await loadFiles();
            fileList.innerHTML = '';
            // 按照 timeFormat 字段对文件进行降序排序（最新的文件排在前面）
            files.sort((a, b) => {
                return new Date(b.timeFormat) - new Date(a.timeFormat);
            });
            files.forEach(file => {
                const item = createFileItem({
                    name: file.filename,
                    size: file.size,
                    isCompleted: true, // 标记为已完成
                    timeFormat: file.timeFormat
                });
                fileList.appendChild(item);
            });
        } catch (error) {
            console.error('初始化文件列表失败:', error);
        }
    }

// 拖拽处理
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');

    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragover');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        handleFiles(e.dataTransfer.files);
    });

    fileInput.addEventListener('change', (e) => {
        handleFiles(e.target.files);
    });

// 初始化加载文件列表
    initFileList();

// 辅助函数：获取文件类型
    function getFileType(file) {
        const filename = file.name;
        const extension = filename.split('.').pop().toLowerCase();

        const typeMap = {
            png: {class: 'file-type-image', icon: 'fas fa-image', name: '图片文件'},
            jpg: {class: 'file-type-image', icon: 'fas fa-image', name: '图片文件'},
            jpeg: {class: 'file-type-image', icon: 'fas fa-image', name: '图片文件'},
            gif: {class: 'file-type-image', icon: 'fas fa-image', name: '图片文件'},
            webp: {class: 'file-type-image', icon: 'fas fa-image', name: '图片文件'},
            bmp: {class: 'file-type-image', icon: 'fas fa-image', name: '图片文件'},
            pdf: {class: 'file-type-pdf', icon: 'fas fa-file-pdf', name: 'PDF文档'},
            doc: {class: 'file-type-doc', icon: 'fas fa-file-word', name: 'Word文档'},
            docx: {class: 'file-type-doc', icon: 'fas fa-file-word', name: 'Word文档'},
            xls: {class: 'file-type-xls', icon: 'fas fa-file-excel', name: 'Excel文档'},
            xlsx: {class: 'file-type-xls', icon: 'fas fa-file-excel', name: 'Excel文档'},
            ppt: {class: 'file-type-ppt', icon: 'fas fa-file-powerpoint', name: 'PPT文档'},
            pptx: {class: 'file-type-ppt', icon: 'fas fa-file-powerpoint', name: 'PPT文档'},
            zip: {class: 'file-type-zip', icon: 'fas fa-file-archive', name: '压缩文件'},
            rar: {class: 'file-type-zip', icon: 'fas fa-file-archive', name: '压缩文件'},
            '7z': {class: 'file-type-zip', icon: 'fas fa-file-archive', name: '压缩文件'},
            tar: {class: 'file-type-zip', icon: 'fas fa-file-archive', name: '压缩文件'},
            gz: {class: 'file-type-zip', icon: 'fas fa-file-archive', name: '压缩文件'},
            txt: {class: 'file-type-text', icon: 'fas fa-file-alt', name: '文本文件'},
            md: {class: 'file-type-text', icon: 'fas fa-file-alt', name: '文本文件'},
            json: {class: 'file-type-text', icon: 'fas fa-file-alt', name: '配置文件'},
            yml: {class: 'file-type-text', icon: 'fas fa-file-alt', name: '配置文件'},
            yaml: {class: 'file-type-text', icon: 'fas fa-file-alt', name: '配置文件'},
            js: {class: 'file-type-code', icon: 'fas fa-file-code', name: '脚本文件'},
            java: {class: 'file-type-code', icon: 'fas fa-file-code', name: '代码文件'},
            py: {class: 'file-type-code', icon: 'fas fa-file-code', name: '代码文件'},
            html: {class: 'file-type-code', icon: 'fas fa-file-code', name: '网页文件'},
            css: {class: 'file-type-code', icon: 'fas fa-file-code', name: '样式文件'},
            default: {class: '', icon: 'fas fa-file', name: '其他文件'}
        };

        return typeMap[extension] || typeMap.default;
    }

// 辅助函数：格式化文件大小
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }


// 获取搜索框和按钮
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');

// 监听搜索按钮点击事件
    searchButton.addEventListener('click', () => {
        const query = searchInput.value.trim().toLowerCase();
        filterFiles(query);
    });

// 监听搜索框输入事件（实时搜索）
    searchInput.addEventListener('input', () => {
        const query = searchInput.value.trim().toLowerCase();
        filterFiles(query);
    });

// 过滤文件列表
    function filterFiles(query) {
        const fileItems = document.querySelectorAll('.file-item');
        fileItems.forEach(item => {
            const fileName = item.querySelector('.file-name').textContent.toLowerCase();
            const fileType = item.querySelector('.file-meta').textContent.toLowerCase();

            // 根据文件名或文件类型匹配
            if (fileName.includes(query) || fileType.includes(query)) {
                item.style.display = 'flex'; // 显示匹配的文件
            } else {
                item.style.display = 'none'; // 隐藏不匹配的文件
            }
        });
    }


    function previewFile(filename) {
        const previewModal = document.getElementById('previewModal');
        const previewFrame = document.getElementById('previewFrame');

        // 设置 iframe 的 src 为文件预览的 URL
        previewFrame.src = `${API_BASE}/preview/${encodeURIComponent(filename)}`;

        // 显示预览模块
        previewModal.style.display = 'flex';
    }

//
// // 关闭预览模块
//     document.getElementById('closePreview').addEventListener('click', () => {
//         const previewModal = document.getElementById('previewModal');
//         const previewFrame = document.getElementById('previewFrame');
//
//         // 隐藏预览模块并清空 iframe 内容
//         previewModal.style.display = 'none';
//         previewFrame.src = '';
//     });
//
//     document.getElementById('previewModal').addEventListener('click', (e) => {
//         if (e.target === e.currentTarget) {
//             const previewModal = document.getElementById('previewModal');
//             const previewFrame = document.getElementById('previewFrame');
//
//             // 隐藏预览模块并清空 iframe 内容
//             previewModal.style.display = 'none';
//             previewFrame.src = '';
//         }
//     });
    // 关闭预览模块
    document.getElementById('closePreview').addEventListener('click', () => {
        const previewModal = document.getElementById('previewModal');
        const previewFrame = document.getElementById('previewFrame');

        previewModal.style.display = 'none';
        previewFrame.src = '';
    });

// 在新标签页打开
    document.getElementById('openInNewTab').addEventListener('click', () => {
        const previewFrame = document.getElementById('previewFrame');
        const fileUrl = previewFrame.src;

        if (fileUrl) {
            window.open(fileUrl, '_blank');
        }
    });

// 全屏查看
    document.getElementById('fullScreen').addEventListener('click', () => {
        const previewContent = document.querySelector('.preview-content');

        // 切换最大化状态
        if (previewContent.classList.contains('maximized')) {
            previewContent.classList.remove('maximized');
        } else {
            previewContent.classList.add('maximized');
        }
    });

    document.getElementById('previewModal').addEventListener('click', (e) => {
        if (e.target === e.currentTarget) {
            const previewModal = document.getElementById('previewModal');
            const previewFrame = document.getElementById('previewFrame');

            previewModal.style.display = 'none';
            previewFrame.src = '';
        }
    });


    function getCurrentTime() {
        const now = new Date();

        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');

        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');

        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }
}