var articles = [];
var totalCount = 0;
var totalPages = 0;
// 当前页码和每页条数
var currentPage = 1;
var pageSize = 10;
// 筛选条件
var filters = {
    novelName: '',
    gender: '',
    actor: '',
    emotion: ''
};
const API_BASE = 'voice'; // 请替换为实际的API基础地址
var nowArticleInfo={};
window.onload = function () {
    initEventListeners();
    // 查询文章信息
    search();
}

function search() {
    addLoading();
    // 构建查询参数
    const params = {
        pageNum: currentPage,
        pageSize: pageSize,
        novelName: filters.novelName,
        gender: filters.gender,
        actor: filters.actor,
        emotion: filters.emotion
    };

    axios.get('/' + API_BASE + '/findVoiceInfoByCondToPage', { params: params })
        .then(response => {
            removeLoading();
            const data = response.data.data;
            articles = data.rows || [];
            totalCount = data.total || 0;
            totalPages = Math.ceil(data.total/pageSize)  || 0;
            renderList();
        })
        .catch(error => {
            console.error('获取文件内容失败:', error);
            showAlert('获取文件内容失败', 'error');
            removeLoading();
        });
}

// 初始化事件监听
function initEventListeners() {
    // 筛选输入事件
    $('#filter-novelName, #filter-gender, #filter-actor, #filter-emotion').on('input', function() {
        const id = $(this).attr('id');
        const field = id.replace('filter-', '');
        filters[field] = $(this).val().toLowerCase().trim();
        currentPage = 1; // 重置到第一页
        search(); // 重新查询后端
    });

    // 重置筛选
    $('#btn-reset').click(function() {
        $('#filter-novelName, #filter-gender, #filter-actor, #filter-emotion').val('');
        filters = {
            novelName: '',
            gender: '',
            actor: '',
            emotion: ''
        };
        currentPage = 1;
        search(); // 重新查询后端
    });

    // 分页按钮
    $('#prev-page').click(function() {
        if (currentPage > 1) {
            currentPage--;
            search(); // 重新查询后端
        }
    });

    $('#next-page').click(function() {
        if (currentPage < totalPages) {
            currentPage++;
            search(); // 重新查询后端
        }
    });

    // 关闭模态框
    $('#close-modal, #cancel-edit').click(function() {
        closeModal();
    });

    // 保存编辑
    $('#save-edit').click(function() {
        saveEdit();
    });

    // 生成音频
    $('#generate-audio').click(function() {
        generateAudio();
    });

    // 点击模态框背景关闭
    $('#edit-modal').click(function(e) {
        if (e.target === this) {
            closeModal();
        }
    });
}

// 关闭模态框并添加动画
function closeModal() {
    const $modal = $('#edit-modal');
    $modal.find('> div').removeClass('scale-100').addClass('scale-95');
    $modal.removeClass('opacity-100').addClass('opacity-0');

    setTimeout(() => {
        $modal.addClass('hidden');
    }, 300);
}

// 打开模态框并添加动画
function openModal() {
    const $modal = $('#edit-modal');
    $modal.removeClass('hidden');

    setTimeout(() => {
        $modal.addClass('opacity-100').removeClass('opacity-0');
        $modal.find('> div').removeClass('scale-95').addClass('scale-100');
    }, 10);
}

// 渲染列表
function renderList() {
    const $list = $('#article-list');
    $list.empty();
    if (articles.length === 0) {
        $('#empty-state').removeClass('hidden');
    } else {
        $('#empty-state').addClass('hidden');
        articles.forEach((article, index) => {
            const row = `
                        <tr class="table-row-hover transition-colors duration-200 hover:bg-gray-50">
                            <td class="px-4 md:px-6 py-3 whitespace-nowrap text-sm text-center text-gray-500">${(currentPage - 1) * pageSize + index + 1}</td>
                            <td class="px-4 md:px-6 py-3 whitespace-nowrap text-sm text-gray-600">${article.actor}</td>
                            <td class="px-4 md:px-6 py-3 text-sm text-gray-900 max-w-xs truncate" title="${article.text}">${article.text}</td>`+
                            // <td class="px-4 md:px-6 py-3 whitespace-nowrap text-sm text-gray-600">${article.chapterNum}</td>
                            // <td class="px-4 md:px-6 py-3 whitespace-nowrap text-sm text-gray-600">${article.novelName}</td>
                            // <td class="px-4 md:px-6 py-3 whitespace-nowrap text-sm text-gray-600">${article.actor}</td>
                            // <td class="px-4 md:px-6 py-3 whitespace-nowrap text-sm text-gray-600">${article.emotion}</td>
                            // <td class="px-4 md:px-6 py-3 whitespace-nowrap text-sm text-gray-600">${article.tone}</td>
                            // <td class="px-4 md:px-6 py-3 whitespace-nowrap text-sm text-gray-600">${article.speechRate}</td>
                `<td class="px-4 md:px-6 py-3 whitespace-nowrap text-sm text-center">
                                <audio controls class="audio-player w-full">
                                    <source src="${article.url+"?rand="+Math.random()}" type="audio/mpeg">
                                    您的浏览器不支持音频播放
                                </audio>
                            </td>
                            <td class="px-4 md:px-6 py-3 whitespace-nowrap text-sm text-center font-medium">
                                <button class="btn-action btn-edit text-blue-600 hover:text-blue-800 mr-3" data-id="${article.id}">
                                    <i class="fa fa-pencil mr-1"></i> 编辑
                                </button>
                                <button class="btn-action btn-delete text-red-600 hover:text-red-800" data-id="${article.id}">
                                    <i class="fa fa-trash mr-1"></i> 删除
                                </button>
                            </td>
                        </tr>
                    `;
            $list.append(row);
        });

        // 绑定编辑和删除事件
        $('.btn-edit').click(function() {
            const id = parseInt($(this).data('id'));
            const article = articles.find(a => a.id === id);
            openEditModal(article);
        });

        $('.btn-delete').click(function() {
            const id = parseInt($(this).data('id'));
            if (confirm('确定要删除这条信息吗？')) {
                deleteArticle(id);
            }
        });
    }

    // 更新分页信息
    $('#total-count').text(totalCount);
    const startIndex = articles.length > 0 ? (currentPage - 1) * pageSize + 1 : 0;
    const endIndex = Math.min(currentPage * pageSize, totalCount);
    $('#showing-range').text(totalCount > 0 ? `${startIndex}-${endIndex}` : '0-0');

    // 更新分页按钮状态
    $('#prev-page').prop('disabled', currentPage === 1);
    $('#next-page').prop('disabled', currentPage >= totalPages || totalCount === 0);
}

// 打开编辑模态框
function openEditModal(article) {
    if (article) {
        $('#modal-title').text('编辑信息');
        $('#edit-id').val(article.id);
        $('#edit-content').val(article.text);
        $('#edit-actorName').val(article.actor);
        $('#edit-title').val(article.book);
        $('#edit-voice').val(article.voice);
        $('#edit-emotion').val(article.emotion);
        $('#edit-pitch').val(article.tone);
        $('#edit-speed').val(article.speechRate);
        $('#edit-audio-url').val(article.url);
        $('#edit-audio-preview').attr('src', article.url+'?rand='+Math.random());
        nowArticleInfo=article;
    } else {
        $('#modal-title').text('添加新信息');
        $('#edit-form')[0].reset();
        $('#edit-id').val('');
        $('#edit-audio-url').val('');
        $('#edit-audio-preview').attr('src', '');
    }
    openModal();
}

// 保存编辑
function saveEdit() {
    const id = $('#edit-id').val();
    const articleData = {
        text: $('#edit-content').val().trim(),
        actor: $('#edit-actorName').val().trim(),
        novelName: $('#edit-title').val().trim(),
        voice: $('#edit-voice').val().trim(),
        emotion: $('#edit-emotion').val().trim(),
        tone: parseFloat($('#edit-pitch').val()),
        speechRate: parseFloat($('#edit-speed').val()),
        url: $('#edit-audio-url').val().trim()
    };
    // 简单验证
    if (!articleData.text || !articleData.actor || !articleData.novelName || !articleData.voice || !articleData.emotion) {
        alert('请填写所有必填字段');
        return;
    }
    articleData.id=id;
    addLoading();
    if (id) {
        // 更新现有文章
        axios.post('/' + API_BASE + '/updateCharacterVoice','id='+parseInt(id)+'&text='+articleData.text+'&actor='+articleData.actor+'&book='+articleData.novelName+'&voice='+articleData.voice+'&emotion='+articleData.emotion+'&tone='+articleData.tone+'&speechRate='+articleData.speechRate+'&url='+articleData.url)
            .then(() => {
                removeLoading();
                closeModal();
                search(); // 重新查询数据
                showAlert('更新成功', 'success');
            })
            .catch(error => {
                removeLoading();
                console.error('更新失败：', error);
                showAlert('更新失败', 'error');
            });
    } else {
        // 添加新文章
        axios.post('/' + API_BASE + '/addCharacterVoice', articleData)
            .then(() => {
                removeLoading();
                closeModal();
                search(); // 重新查询数据
                showAlert('添加成功', 'success');
            })
            .catch(error => {
                removeLoading();
                console.error('添加失败：', error);
                showAlert('添加失败', 'error');
            });
    }
}

// 删除角色音频
function deleteArticle(id) {
    addLoading();
    axios.post('/' + API_BASE + '/deleteCharacterVoice', { id: id })
        .then(() => {
            removeLoading();
            search(); // 重新查询数据
            showAlert('删除成功', 'success');
        })
        .catch(error => {
            removeLoading();
            console.error('删除失败：', error);
            showAlert('删除失败', 'error');
        });
}

// 生成音频
function generateAudio() {
    const content = $('#edit-content').val().trim();
    const emotion = $('#edit-emotion').val().trim();
    const tone = $('#edit-pitch').val();//音调
    const voice = $('#edit-voice').val().trim();//
    const speed = $('#edit-speed').val();

    if (!content) {
        alert('请先填写内容');
        return;
    }

    // 显示加载状态
    $('#generate-audio').prop('disabled', true).html('<i class="fa fa-spinner fa-spin mr-1"></i>生成中...');

    // 调用后端TTS接口
    const ttsData = {
        content: content,
        actor:voice,
        emotion: emotion,
        tone: tone,
        speechRate: parseFloat(speed),
        volume:"5",
        chapterNum: 0,
        index: parseInt(nowArticleInfo.id),
        novelName: $('#edit-title').val().trim()
    };

    axios.post('/' + API_BASE + '/generateAudio','content='+content+'&actor='+voice+'&emotion='+emotion+'&tone='+tone+'&speechRate='+parseFloat(speed)+'&chapterNum=0&index='+parseInt(nowArticleInfo.id))
        .then(response => {
            const audioUrl = response.data.data;
            $('#edit-audio-url').val(audioUrl);
            $('#edit-audio-preview').attr('src', audioUrl+'?rand='+Math.random());
            showAlert('音频生成成功', 'success');
        })
        .catch(error => {
            console.error('音频生成失败：', error);
            showAlert('音频生成失败', 'error');
        })
        .finally(() => {
            // 恢复按钮状态
            $('#generate-audio').prop('disabled', false).html('<i class="fa fa-magic mr-1"></i>生成音频');
        });
}

function addLoading() {
    $(".loading").css("display", "block");
}

function removeLoading() {
    $(".loading").css("display", "none");
}

// 显示提示信息
function showAlert(message, type = 'info') {
    const alertClass = {
        success: 'bg-green-500 text-white',
        error: 'bg-red-500 text-white',
        warning: 'bg-yellow-500 text-white',
        info: 'bg-blue-500 text-white'
    }[type] || 'bg-blue-500 text-white';

    const alert = $(`
                <div class="fixed top-12 right-4 z-50 px-6 py-3 shadow-lg transform transition-all duration-300 translate-x-full ${alertClass} rounded-lg">
                  <div class="flex items-center">
                    <i class="fa fa-${type === 'success' ? 'check' : type === 'error' ? 'times' : type === 'warning' ? 'exclamation' : 'info'}-circle mr-2"></i>
                    <span>${message}</span>
                  </div>
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

