var articles = [];
var totalCount = 0;
var totalPages = 0;
// 当前页码和每页条数
var currentPage = 1;
var pageSize = 10;
// 筛选条件
var filters = {
    novelName: '',
    chapter: 0,
    actorName: '',
    emotion: ''
};
const API_BASE = 'novelInfo'; // 请替换为实际的API基础地址
var nowArticleInfo={};
window.onload = function () {
    // 初始化事件监听器
    initEventListeners();
    //加载角色音频信息
    loadActorVoiceInfo();
    // 查询文章信息
    search();
}

/**
 * 获取角色音频信息
 */
function loadActorVoiceInfo() {
    axios.get('/voice/findAllVoiceInfo',)
        .then(response => {
            const data = response.data.data;
            if (data && data.length > 0) {
                let html="";
                // 创建下拉菜单选项
                data.forEach(actorInfo => {
                    html+='<option value="'+actorInfo.voice+'" >'+actorInfo.actor+'</option>'
                })
                $("#edit-actorVoice").append(html);
            }
        })
}

function search() {
    addLoading();
    // 构建查询参数
    const params = {
        pageNum: currentPage,
        pageSize: pageSize,
        novelName: filters.novelName,
        chapter: filters.chapter,
        actorName: filters.actorName,
        emotion: filters.emotion
    };

    axios.get('/' + API_BASE + '/findNovelInfoByCondToPage', { params: params })
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
    $('#filter-title, #filter-chapter, #filter-actorName, #filter-emotion').on('input', function() {
        const id = $(this).attr('id');
        const field = id.replace('filter-', '');
        filters[field] = $(this).val().toLowerCase().trim();
        currentPage = 1; // 重置到第一页
        search(); // 重新查询后端
    });

    // 重置筛选
    $('#btn-reset').click(function() {
        $('#filter-title, #filter-chapter, #filter-actorName, #filter-emotion').val('');
        filters = {
            novelName: '',
            chapter: '',
            actorName: '',
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
                            <td class="px-4 md:px-6 py-3 text-sm text-gray-900 max-w-xs truncate" title="${article.content}">${article.content}</td>`+
                            // <td class="px-4 md:px-6 py-3 whitespace-nowrap text-sm text-gray-600">${article.chapterNum}</td>
                            // <td class="px-4 md:px-6 py-3 whitespace-nowrap text-sm text-gray-600">${article.novelName}</td>
                            // <td class="px-4 md:px-6 py-3 whitespace-nowrap text-sm text-gray-600">${article.actor}</td>
                            // <td class="px-4 md:px-6 py-3 whitespace-nowrap text-sm text-gray-600">${article.emotion}</td>
                            // <td class="px-4 md:px-6 py-3 whitespace-nowrap text-sm text-gray-600">${article.tone}</td>
                            // <td class="px-4 md:px-6 py-3 whitespace-nowrap text-sm text-gray-600">${article.speechRate}</td>
                `<td class="px-4 md:px-6 py-3 whitespace-nowrap text-sm text-center">
                                <audio controls class="audio-player w-full">
                                    <source src="${article.novelVoiceUrl+"?rand="+Math.random()}" type="audio/mpeg">
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
        $('#edit-content').val(article.content);
        $('#edit-chapter').val(article.chapterNum);
        $('#edit-title').val(article.novelName);
        $('#edit-actorVoice').val(article.actorVoice);
        $('#edit-emotion').val(article.emotion);
        $('#edit-pitch').val(article.tone);
        $('#edit-speed').val(article.speechRate);
        $('#edit-audio-url').val(article.novelVoiceUrl);
        $('#edit-audio-preview').attr('src', article.novelVoiceUrl+'?rand='+Math.random());
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
        content: $('#edit-content').val().trim(),
        chapterNum: $('#edit-chapter').val().trim(),
        novelName: $('#edit-title').val().trim(),
        actorVoice: $('#edit-actorVoice').val().trim(),
        actorName: $('#edit-actorVoice option:selected').text(),
        emotion: $('#edit-emotion').val().trim(),
        tone: parseFloat($('#edit-pitch').val()),
        speechRate: parseFloat($('#edit-speed').val()),
        novelVoiceUrl: $('#edit-audio-url').val().trim()
    };

    // 简单验证
    if (!articleData.content || !articleData.chapterNum || !articleData.novelName || !articleData.actorVoice || !articleData.emotion) {
        alert('请填写所有必填字段');
        return;
    }
    articleData.id=id;
    addLoading();
    if (id) {
        // 更新现有文章
        axios.post('/' + API_BASE + '/updateNovelInfo','id='+parseInt(id)+'&content='+articleData.content+'&chapterNum='+articleData.chapterNum+'&novelName='+articleData.novelName+'&actorVoice='+articleData.actorVoice+'&actorName='+articleData.actorName+'&emotion='+articleData.emotion+'&tone='+articleData.tone+'&speechRate='+articleData.speechRate+'&novelVoiceUrl='+articleData.novelVoiceUrl)
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
        axios.post('/' + API_BASE + '/addNovelInfo', articleData)
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

// 删除文章
function deleteArticle(id) {
    addLoading();
    axios.post('/' + API_BASE + '/deleteNovelInfo', { id: id })
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
    const actor = $('#edit-actorVoice').val().trim();
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
        actor:actor,
        emotion: emotion,
        tone: tone,
        speechRate: parseFloat(speed),
        volume:"5",
        chapterNum: parseInt($('#edit-chapter').val().trim()+""),
        index: parseInt(nowArticleInfo.index+""),
        novelName: $('#edit-title').val().trim()
    };

    axios.post('/' + API_BASE + '/generateAudio','content='+content+'&actor='+actor+'&emotion='+emotion+'&tone='+tone+'&speechRate='+parseFloat(speed)+'&volume=5&chapterNum='+parseInt($('#edit-chapter').val().trim()+"")+'&index='+parseInt(nowArticleInfo.index+"")+'&novelName='+$('#edit-title').val().trim())
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

