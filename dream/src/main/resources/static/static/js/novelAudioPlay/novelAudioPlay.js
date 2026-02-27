// 1. 模拟后端获取的音频列表（实际项目中替换为接口请求）
var audioList = [
    // {
    //     id: 1,
    //     title: "示例音频1 - 轻音乐",
    //     src: "https://cdn.pixabay.com/download/audio/2022/05/26/audio_2f30802882.mp3",
    //     duration: "02:15"
    // }
];

// 2. 获取DOM元素
const audioPlayer = document.getElementById('audio-player');
const playPauseBtn = document.getElementById('play-pause-btn');
const playPauseIcon = document.getElementById('play-pause-icon');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const speedSelect = document.getElementById('speed-select');
const progressBar = document.getElementById('progress-bar');
const progressFill = document.getElementById('progress-fill');
const progressThumb = document.getElementById('progress-thumb');
const currentAudioTitle = document.getElementById('current-audio-title');
const currentAudioDuration = document.getElementById('current-audio-duration');
const audioListContainer = document.getElementById('audio-list-container');
const audioCount = document.getElementById('audio-count');

// 3. 全局状态变量
let currentAudioIndex = -1; // 当前播放的音频索引
let isDragging = false; // 是否正在拖动进度条
let audioItems = []; // 音频列表DOM元素集合


const API_BASE = 'novelInfo'; // 请替换为实际的API基础地址
window.onload = function () {
    initPage();
}
// 15. 初始化页面
function initPage() {
    loadAllAudio();
    initAudioList();
    bindEvents();
}

function updateAudio(novelName){
    axios.post('/' + API_BASE + '/updateNovelInfoAudio?novelName='+novelName)
        .then(response => {
            const data = response.data.data;
        })
        .catch(error => {
            console.error('ge:', error);
        });
}

function  loadAllAudio() {
    // 构建查询参数
    const params = {
        pageNum: 0,
        pageSize: 0,
        novelName:"神的模仿犯",
        chapter: 0,
        actorName: "",
        emotion: ""
    };
    addLoading();
    axios.get('/' + API_BASE + '/findNovelInfoByHaveAudio', { params: params })
        .then(response => {
            removeLoading();
            const data = response.data.data;
            for ( let i = 0; i < data.length; i++){
                 audioList.push({
                    id: data[i].id,
                    title: data[i].chapterNum + " - " + data[i].index,
                    src: data[i].novelVoiceUrl+"?rand="+Math.random(),
                    duration: "02:15"
                });
            }
            initAudioList();
        })
        .catch(error => {
            console.error('获取文件内容失败:', error);
            removeLoading();
        });
 }


// 4. 初始化音频列表
function initAudioList() {
    // 清空列表容器
    audioListContainer.innerHTML = '';
    audioCount.textContent = `${audioList.length} 个音频`;

    // 生成音频列表项
    audioList.forEach((audio, index) => {
        const audioItem = document.createElement('div');
        audioItem.className = 'px-4 py-3 hover:bg-gray-50 flex items-center justify-between cursor-pointer transition-colors border-b border-gray-100';
        audioItem.dataset.index = index;
        audioItem.innerHTML = `
          <div class="flex items-center gap-3">
            <i class="fa fa-music text-secondary"></i>
            <div class="truncate">
              <h4 class="text-sm font-medium text-dark truncate">${audio.title}</h4>
              <p class="text-xs text-secondary">${audio.duration}</p>
            </div>
          </div>
          <span class="text-xs text-secondary">${audio.duration}</span>
        `;

        // 绑定点击事件
        audioItem.addEventListener('click', () => playAudioByIndex(index));
        audioListContainer.appendChild(audioItem);
        audioItems.push(audioItem);
    });
}

// 5. 播放指定索引的音频
function playAudioByIndex(index) {
    // 边界判断
    if (index < 0 || index >= audioList.length) return;

    // 更新当前索引
    currentAudioIndex = index;

    // 获取当前音频信息
    const currentAudio = audioList[index];
    audioPlayer.src = currentAudio.src;
    currentAudioTitle.textContent = currentAudio.title;

    // 更新音频列表激活状态
    updateAudioItemActiveState();

    // 播放音频
    playAudio();
}

// 6. 更新音频列表激活样式
function updateAudioItemActiveState() {
    audioItems.forEach((item, index) => {
        if (index === currentAudioIndex) {
            item.classList.add('audio-item-active');
        } else {
            item.classList.remove('audio-item-active');
        }
    });
}

// 7. 播放音频
function playAudio() {
    audioPlayer.play().then(() => {
        playPauseIcon.classList.remove('fa-play');
        playPauseIcon.classList.add('fa-pause');
    }).catch((err) => {
        console.error('播放失败：', err);
        alert('音频播放失败，请检查网络或音频地址');
    });
}

// 8. 暂停音频
function pauseAudio() {
    audioPlayer.pause();
    playPauseIcon.classList.remove('fa-pause');
    playPauseIcon.classList.add('fa-play');
}

// 9. 播放上一曲
function playPrevAudio() {
    if (currentAudioIndex <= 0) {
        // 循环播放：回到最后一曲
        playAudioByIndex(audioList.length - 1);
    } else {
        playAudioByIndex(currentAudioIndex - 1);
    }
}

// 10. 播放下一曲（自动顺序播放核心方法）
function playNextAudio() {
    if (currentAudioIndex >= audioList.length - 1) {
        // 循环播放：回到第一曲
        playAudioByIndex(0);
    } else {
        playAudioByIndex(currentAudioIndex + 1);
    }
}

// 11. 更新播放进度
function updateProgress() {
    if (!isDragging && audioPlayer.duration) {
        const progressPercent = (audioPlayer.currentTime / audioPlayer.duration) * 100;
        progressFill.style.width = `${progressPercent}%`;
        progressThumb.style.left = `${progressPercent}%`;

        // 更新当前时间和总时长
        const currentTimeFormatted = formatTime(audioPlayer.currentTime);
        const durationFormatted = formatTime(audioPlayer.duration);
        currentAudioDuration.textContent = `${currentTimeFormatted} / ${durationFormatted}`;
    }
}

// 12. 格式化时间（秒 -> 分:秒）
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// 13. 进度条点击/拖动事件处理
function handleProgressClick(e) {
    const progressRect = progressBar.getBoundingClientRect();
    const clickX = e.clientX || (e.touches && e.touches[0].clientX);
    const progressPercent = ((clickX - progressRect.left) / progressRect.width) * 100;
    const targetTime = (progressPercent / 100) * audioPlayer.duration;

    audioPlayer.currentTime = targetTime;
    progressFill.style.width = `${progressPercent}%`;
    progressThumb.style.left = `${progressPercent}%`;
}

// 14. 绑定所有事件
function bindEvents() {
    // 播放/暂停按钮
    playPauseBtn.addEventListener('click', () => {
        if (currentAudioIndex === -1 && audioList.length > 0) {
            // 首次点击：播放第一首
            playAudioByIndex(0);
        } else {
            if (audioPlayer.paused) {
                playAudio();
            } else {
                pauseAudio();
            }
        }
    });

    // 上一曲/下一曲按钮
    prevBtn.addEventListener('click', playPrevAudio);
    nextBtn.addEventListener('click', playNextAudio);

    // 播放速度选择
    speedSelect.addEventListener('change', () => {
        audioPlayer.playbackRate = speedSelect.value;
    });

    // 音频播放进度更新
    audioPlayer.addEventListener('timeupdate', updateProgress);

    // 音频播放结束：自动播放下一曲
    audioPlayer.addEventListener('ended', playNextAudio);

    // 音频加载完成：更新总时长
    audioPlayer.addEventListener('loadedmetadata', () => {
        const durationFormatted = formatTime(audioPlayer.duration);
        currentAudioDuration.textContent = `00:00 / ${durationFormatted}`;
    });

    // 进度条点击事件
    progressBar.addEventListener('click', handleProgressClick);
    progressBar.addEventListener('touchstart', (e) => {
        e.preventDefault();
        handleProgressClick(e);
    });

    // 进度条拖动事件
    progressThumb.addEventListener('mousedown', () => {
        isDragging = true;
        document.addEventListener('mousemove', handleProgressDrag);
        document.addEventListener('mouseup', stopProgressDrag);
    });

    progressThumb.addEventListener('touchstart', (e) => {
        e.preventDefault();
        isDragging = true;
        document.addEventListener('touchmove', handleProgressDrag);
        document.addEventListener('touchend', stopProgressDrag);
    });

    // 拖动进度条
    function handleProgressDrag(e) {
        if (isDragging && audioPlayer.duration) {
            handleProgressClick(e);
        }
    }

    // 停止拖动
    function stopProgressDrag() {
        isDragging = false;
        document.removeEventListener('mousemove', handleProgressDrag);
        document.removeEventListener('mouseup', stopProgressDrag);
        document.removeEventListener('touchmove', handleProgressDrag);
        document.removeEventListener('touchend', stopProgressDrag);
    }
}


function addLoading() {
    $(".loading").css("display", "block");
}

function removeLoading() {
    $(".loading").css("display", "none");
}