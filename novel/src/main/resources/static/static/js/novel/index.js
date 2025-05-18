// DOM 元素
const shelfPage = document.getElementById('shelfPage');
const uploadPage = document.getElementById('uploadPage');
const readerPage = document.getElementById('readerPage');
const bookShelf = document.getElementById('bookShelf');
const chapterTitle = document.getElementById('chapterTitle');
const chapterContent = document.getElementById('chapterContent');
const prevChapterBtn = document.getElementById('prevChapterBtn');
const nextChapterBtn = document.getElementById('nextChapterBtn');
const fontIncreaseBtn = document.getElementById('fontIncreaseBtn');
const fontDecreaseBtn = document.getElementById('fontDecreaseBtn');
const themeToggleBtn = document.getElementById('themeToggleBtn');
const toggleTocBtn = document.getElementById('toggleTocBtn');
const tocSidebar = document.getElementById('tocSidebar');
const tocList = document.getElementById('tocList');
const shelfLink = document.getElementById('shelfLink');
const addBookBtn = document.getElementById('addBookBtn');
const fileInput = document.getElementById('fileInput');
const selectFileBtn = document.getElementById('selectFileBtn');
const uploadForm = document.getElementById('uploadForm');
const uploadBtn = document.getElementById('uploadBtn');
const cancelUploadBtn = document.getElementById('cancelUploadBtn');
const uploadProgress = document.getElementById('uploadProgress');
const bookTitle = document.getElementById('bookTitle');
const bookAuthor = document.getElementById('bookAuthor');
const bookDesc = document.getElementById('bookDesc');

let library = [];
let toast;
window.onload = function () {
    toast = new Toast();
    loadBooks();
    renderBookshelf();
    setupEventListeners();
}
let nowFile;//当前上传的书籍
// 当前阅读状态
let currentState = {
    currentBookIndex: null,
    currentChapterIndex: 0,
    fontSize: 16,
    darkMode: false
};
let nowChapters = [];
let interval_upload;//上传文件进度条定时方法
function loadBooks() {
    axios.get('/book/list')
        .then(response => {
            if (response.status === 200) {
                library = response.data.data;
                renderBookshelf();
            }
        })
        .catch(error => {
            console.error('Error:', error);
            toast.show('书籍查询失败，请重试！');
        });
}

/**
 * 渲染书架,加载书籍图书
 */
function renderBookshelf() {
    bookShelf.innerHTML = '';
    library.forEach((book, index) => {
        const bookCard = document.createElement('div');
        bookCard.className = 'col';
        bookCard.innerHTML = `
                    <div class="card book-card" data-id="${book.id}">
                        <div class="book-cover">
                            <img src="${book.coverUrl}" class="card-img-top" alt="${book.name}" >
                        </div>
                        <div class="card-body">
                            <h5 class="card-title">${book.name}</h5>
                            <p class="card-text text-muted small">${book.author}</p>
                            <p class="card-text small text-truncate">${book.des || "作者有点懒，什么都没留下..."}</p>
                        </div>
                        <div class="card-footer bg-transparent">
                            <small class="text-muted">${book.chapters || 0}章</small>
                        </div>
                    </div>
                `;
        bookCard.addEventListener('click', () => openReader(index));
        bookShelf.appendChild(bookCard);
    });
}

/**
 * 设置事件监听器
 */
function setupEventListeners() {
    //点击添加书籍
    $("#addBookBtn").on('click', function () {
        showUploadPage();//显示上传页面
    });

    // 阅读器控制 上一章点击监听
    $("#prevChapterBtn").on('click', function () {
        if (currentState.currentChapterIndex > 0) {
            currentState.currentChapterIndex--;
            updateChapterDisplay();
        }
    });
    //下一章点击监听
    $("#nextChapterBtn").on('click', function () {
        const book = library[currentState.currentBookIndex];
        if (currentState.currentChapterIndex < nowChapters.length - 1) {
            currentState.currentChapterIndex++;
            updateChapterDisplay();
        }
    });
    //点击增大字体
    $("#fontIncreaseBtn").on('click', function () {
        currentState.fontSize += 2;
        document.querySelector('.reader-container').style.fontSize = currentState.fontSize + 'px';
    });

    fontDecreaseBtn.addEventListener('click', () => {
        if (currentState.fontSize > 12) {
            currentState.fontSize -= 2;
            document.querySelector('.reader-container').style.fontSize = currentState.fontSize + 'px';
        }
    });

    themeToggleBtn.addEventListener('click', () => {
        currentState.darkMode = !currentState.darkMode;
        const reader = document.querySelector('.reader-container');
        if (currentState.darkMode) {
            reader.classList.add('bg-dark', 'text-white');
            themeToggleBtn.innerHTML = '<i class="fas fa-sun"></i>';
        } else {
            reader.classList.remove('bg-dark', 'text-white');
            themeToggleBtn.innerHTML = '<i class="fas fa-adjust"></i>';
        }
    });

    // 文件上传
    selectFileBtn.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFileSelect(e.target.files[0]);
            nowFile = e.target.files[0];
        }
    });

    // 拖放功能
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false);
    });

    ['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, unhighlight, false);
    });

    dropArea.addEventListener('drop', handleDrop, false);

    // 上传按钮
    uploadBtn.addEventListener('click', () => {
        uploadBook();
    });

    cancelUploadBtn.addEventListener('click', () => {
        showShelfPage();
    });

    // 表单验证
    bookTitle.addEventListener('input', validateForm);
    bookAuthor.addEventListener('input', validateForm);
    bookDesc.addEventListener('input', validateForm);

    // 目录控制
    toggleTocBtn.addEventListener('click', () => {
        if (tocSidebar.classList.contains('active')) {
            closeToc();
        } else {
            openToc();
        }
    });

    // 点击外部关闭目录
    document.addEventListener('click', (e) => {
        if (!tocSidebar.contains(e.target) && !toggleTocBtn.contains(e.target)) {
            closeToc();
        }
    });

    // 显示书架页面
    function showShelfPage() {
        shelfPage.classList.remove('hidden');// 显示书架页面
        uploadPage.classList.add('hidden');// 隐藏上传页面
        readerPage.classList.add('hidden');// 隐藏阅读页面
        resetUploadForm();
    }


    // 拖放相关函数
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    function highlight() {
        dropArea.classList.add('active');
    }

    function unhighlight() {
        dropArea.classList.remove('active');
    }

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const file = dt.files[0];
        handleFileSelect(file);
    }

    // 处理文件选择
    function handleFileSelect(file) {
        if (!file.name.endsWith('.txt')) {
            alert('请上传.txt格式的文件');
            return;
        }

        bookTitle.value = file.name.replace('.txt', '');
        bookAuthor.value = '';
        bookDesc.value = '';

        uploadBtn.disabled = false;

        // 简单读取文件内容预览
        const reader = new FileReader();
        reader.onload = (e) => {
            // 这里可以添加对文件内容的解析逻辑（如分章等）
            console.log('文件内容预览:', e.target.result.substring(0, 100));
        };
        reader.readAsText(file);

    }

    // 验证表单
    function validateForm() {
        uploadBtn.disabled = !(bookTitle.value.trim() && bookAuthor.value.trim() && bookDesc.value.trim());
    }

    // 重置上传表单
    function resetUploadForm() {
        fileInput.value = '';
        bookTitle.value = '';
        bookAuthor.value = '';
        bookDesc.value = '';
        document.getElementById('bookCover').value = '';
        uploadBtn.disabled = true;
        uploadProgress.classList.add('hidden');
        uploadProgress.querySelector('.progress-bar').style.width = '0%';
    }

    // 模拟上传书籍
    function uploadBook() {
        if (!bookTitle.value.trim()) {
            alert('请输入书名');
            return;
        }

        const formData = new FormData();
        const title = document.getElementById('bookTitle').value;
        const author = document.getElementById('bookAuthor').value;
        // const coverFile = document.getElementById('bookCover').files[0];
        if (!title || !author || !nowFile) return;

        formData.append('name', bookTitle.value.trim());
        formData.append('author', bookAuthor.value.trim());
        // formData.append('cover', coverFile);
        formData.append('des', bookDesc.value.trim());
        formData.append('file', nowFile);

        //模拟上传过程
        let progress = 0;
        if (interval_upload) {
            clearInterval(interval_upload);
        }
        axios.post('/book/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
            .then(response => {
                if (response.status === 200) {
                    // 创建新书籍并添加到书架
                    const newBook = response.data.data;
                    library.push(newBook);
                    progress = 100;
                    // document.getElementById('uploadForm').reset();
                    // bootstrap.Modal.getInstance(document.getElementById('uploadModal')).hide();
                } else {
                    alert('上传失败，请重试！');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('上传失败，请重试！');
            });
        // 显示进度条
        uploadProgress.classList.remove('hidden');
        const progressBar = uploadProgress.querySelector('.progress-bar');
        interval_upload = setInterval(() => {
            if (progress < 99) {
                progress += 1;
            }
            progressBar.style.width = `${progress}%`;
            if (progress >= 100) {
                clearInterval(interval_upload);
                // 创建新书籍并添加到书架
                const newBook = createNewBook();
                library.books.push(newBook);
                // 返回书架
                showShelfPage();
                renderBookshelf();
                alert('书籍上传成功！');
            }
        }, 300);
    }

    // AI助手相关事件
    toggleAiSidebarBtn.addEventListener('click', toggleAiSidebar);
    closeAiSidebar.addEventListener('click', toggleAiSidebar);

    // AI标签切换
    document.querySelectorAll('.ai-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.ai-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.ai-panel').forEach(p => p.classList.remove('active'));

            tab.classList.add('active');
            document.getElementById(`${tab.dataset.tab}Panel`).classList.add('active');
        });
    });

    // AI功能按钮
    generateSummaryBtn.addEventListener('click', generateSummary);
    askQuestionBtn.addEventListener('click', askQuestion);
    analyzeCharactersBtn.addEventListener('click', () => analyzeContent('人物'));
    analyzePlotBtn.addEventListener('click', () => analyzeContent('情节'));
    analyzeThemeBtn.addEventListener('click', () => analyzeContent('主题'));

    // 文本选择功能
    document.addEventListener('mouseup', handleTextSelection);
    explainSelectionBtn.addEventListener('click', explainSelectedText);
    translateSelectionBtn.addEventListener('click', translateSelectedText);
    closePopupBtn.addEventListener('click', hideTextSelectionPopup);
}

// 显示上传页面
function showUploadPage() {
    shelfPage.classList.add('hidden');
    uploadPage.classList.remove('hidden');
    readerPage.classList.add('hidden');
}

// 打开阅读器
function openReader(bookIndex) {
    currentState.currentBookIndex = bookIndex;//阅读状态 阅读书籍标识
    currentState.currentChapterIndex = library[bookIndex].lastReadChapter || 0; //阅读状态 阅读章节标识
    //查询当前书籍的所有章节信息
    axios.get('/chapter/list?bookId=' + parseInt(library[bookIndex].id))
        .then(response => {
            if (response.status === 200) {
                nowChapters = response.data.data;
                chapterTitle.textContent = nowChapters[currentState.currentChapterIndex].name;
                shelfPage.classList.add('hidden');//隐藏书籍
                readerPage.classList.remove('hidden');// 显示阅读器
                toggleTocBtn.classList.remove('hidden'); // 显示目录按钮

                updateChapterDisplay();//加载章节内容
                renderToc();//加载目录结构

                // 设置阅读器样式
                document.querySelector('.reader-container').style.fontSize = currentState.fontSize + 'px';
                if (currentState.darkMode) {
                    document.querySelector('.reader-container').classList.add('bg-dark', 'text-white');
                } else {
                    document.querySelector('.reader-container').classList.remove('bg-dark', 'text-white');
                }
            }
        })
        .catch(error => {
            console.error('Error:', error);
            toast.show('章节查询失败，请重试！');
        });
}

// 更新章节显示
function updateChapterDisplay() {
    const book = library[currentState.currentBookIndex];//书籍信息
    //查看这个地方应该是先去查用户的阅读记录。 The whole根据阅读器物去加载丧尸看到的对应章节。 此处暂时直接每次都加载第一张。
    //根据书籍的章节ID查询章节内容。
    axios.get('/chapter/content?bookId=' + book.id + '&chapterNum=' + currentState.currentChapterIndex)
        .then(response => {
            if (response.status === 200) {
                let chapter = response.data.data;
                chapterTitle.textContent = chapter.name;
                chapterContent.textContent = chapter.content;
                // 更新按钮状态
                prevChapterBtn.disabled = currentState.currentChapterIndex === 0;
                nextChapterBtn.disabled = currentState.currentChapterIndex === nowChapters.length - 1;
                // 记录上次阅读章节
                book.lastReadChapter = currentState.currentChapterIndex;
                // 更新目录选中状态
                updateTocSelection();
            }
        });
}

// 渲染目录
function renderToc() {
    tocList.innerHTML = '';
    const book = library[currentState.currentBookIndex];

    nowChapters.forEach((chapter, index) => {
        const tocItem = document.createElement('li');
        tocItem.className = 'toc-item';
        tocItem.textContent = chapter.name;
        tocItem.addEventListener('click', () => {
            currentState.currentChapterIndex = index;
            updateChapterDisplay();
            closeToc();
        });
        tocList.appendChild(tocItem);
    });
    updateTocSelection();
}

// 更新目录选中状态
function updateTocSelection() {
    const tocItems = document.querySelectorAll('.toc-item');
    tocItems.forEach((item, index) => {
        if (index === currentState.currentChapterIndex) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

// 打开目录
function openToc() {
    tocSidebar.classList.add('active');
}

// 关闭目录
function closeToc() {
    tocSidebar.classList.remove('active');
}


// AI助手功能函数
function toggleAiSidebar() {
    document.getElementById('aiSidebar').classList.toggle('active');
    if (document.getElementById('aiSidebar').classList.contains('active')) {
        // 打开侧边栏时自动生成摘要
        generateSummary();
    }
}

async function generateSummary() {
    const responseEl = document.getElementById('summaryResponse');
    responseEl.innerHTML = '<div class="ai-loading"><div class="ai-spinner"></div></div>';
    let aiResponse =await askAIForAnAnswer("总结以下文章内容：" + chapterContent.textContent);
    responseEl.innerHTML = `<p>${aiResponse}</p>`;
}

async function askQuestion() {
    const question = document.getElementById('aiQuestionInput').value.trim();
    if (!question) return;

    const responseEl = document.getElementById('qaResponse');
    responseEl.innerHTML = '<div class="ai-loading"><div class="ai-spinner"></div></div>';

    let aiResponse =await askAIForAnAnswer(chapterContent.textContent+""+question);
    const answer = `关于"${question}"的问题，根据本章内容，${aiResponse}...这部分内容可能与此相关。`;
    responseEl.innerHTML = `<p><strong>问题：</strong>${question}</p><p><strong>回答：</strong>${answer}</p>`;
}

async function analyzeContent(type) {
    const responseEl = document.getElementById('analysisResponse');
    responseEl.innerHTML = '<div class="ai-loading"><div class="ai-spinner"></div></div>';
    let question = "";
    switch (type) {
        case '人物':
            question = `列出本章主要人物分析`;
            break;
        case '情节':
            question = `列出本章情节发展`;
            break;
        case '主题':
            question = `列出本章主题探讨`;
            break;
    }
    let aiResponse =await askAIForAnAnswer(chapterContent.textContent+""+question);
    responseEl.innerHTML = `<p><strong>${type}分析：</strong>${aiResponse}</p>`;
}

// 文本选择功能
let selectedText = '';

function handleTextSelection() {
    const selection = window.getSelection();
    if (!selection.isCollapsed) {
        selectedText = selection.toString().trim();
        if (selectedText.length > 0) {
            showTextSelectionPopup(selection.getRangeAt(0).getBoundingClientRect());
        }
    }
}

function showTextSelectionPopup(rect) {
    const popup = document.getElementById('textSelectionPopup');
    popup.style.display = 'block';
    popup.style.top = `${rect.top + window.scrollY - popup.offsetHeight - 5}px`;
    popup.style.left = `${rect.left + window.scrollX + rect.width / 2 - popup.offsetWidth / 2}px`;
}

function hideTextSelectionPopup() {
    document.getElementById('textSelectionPopup').style.display = 'none';
}

function explainSelectedText() {
    if (!selectedText) return;

    hideTextSelectionPopup();
    const responseEl = document.getElementById('qaResponse');
    responseEl.innerHTML = '<div class="ai-loading"><div class="ai-spinner"></div></div>';

    // 切换到问答面板
    document.querySelector('.ai-tab[data-tab="qa"]').click();
    document.getElementById('aiQuestionInput').value = `请解释这段话："${selectedText.substring(0, 50)}..."`;

    // 模拟API调用
    setTimeout(() => {
        responseEl.innerHTML = `
            <p><strong>问题：</strong>请解释这段话："${selectedText.substring(0, 50)}..."</p>
            <p><strong>回答：</strong>这段话的意思是...（AI解释）</p>
        `;
    }, 1500);
}

function translateSelectedText() {
    if (!selectedText) return;

    hideTextSelectionPopup();
    const responseEl = document.getElementById('qaResponse');
    responseEl.innerHTML = '<div class="ai-loading"><div class="ai-spinner"></div></div>';

    // 切换到问答面板
    document.querySelector('.ai-tab[data-tab="qa"]').click();
    document.getElementById('aiQuestionInput').value = `请将这段话翻译成中文："${selectedText.substring(0, 50)}..."`;

    // 模拟API调用
    setTimeout(() => {
        responseEl.innerHTML = `
            <p><strong>原文：</strong>"${selectedText.substring(0, 50)}..."</p>
            <p><strong>翻译：</strong>（这里是翻译结果）</p>
        `;
    }, 1500);
}