

class TextToSpeechApp {
    constructor() {
        this.speechSynthesis = window.speechSynthesis;
        this.currentUtterance = null;
        this.isPlaying = false;
        this.currentProgress = 0;
        this.totalDuration = 12; // 秒
        this.progressInterval = null;
        this.audioBlob = null;

        this.initElements();
        this.initEventListeners();
        this.updateCharCount();
        this.checkSpeechSupport();
    }

    initElements() {
        // 输入方式选择
        this.manualInputBtn = document.getElementById('manualInputBtn');
        this.uploadFileBtn = document.getElementById('uploadFileBtn');

        // 文本输入
        this.textInput = document.getElementById('textInput');
        this.charCount = document.getElementById('charCount');
        this.estimatedTime = document.getElementById('estimatedTime');
        this.clearTextBtn = document.getElementById('clearTextBtn');
        this.sampleTextBtn = document.getElementById('sampleTextBtn');

        // 语音设置
        this.voiceSelect = document.getElementById('voiceSelect');
        this.speedSelect = document.getElementById('speedSelect');
        this.pitchSelect = document.getElementById('pitchSelect');
        this.styleSelect = document.getElementById('styleSelect');

        // 控制按钮
        this.generateBtn = document.getElementById('generateBtn');
        this.playPauseBtn = document.getElementById('playPauseBtn');
        this.downloadBtn = document.getElementById('downloadBtn');

        // 播放器
        this.audioPlayer = document.getElementById('audioPlayer');
        this.progressBar = document.getElementById('progressBar');
        this.progressSlider = document.getElementById('progressSlider');
        this.currentTime = document.getElementById('currentTime');
        this.totalTime = document.getElementById('totalTime');
        this.volumeBtn = document.getElementById('volumeBtn');
        this.volumeSlider = document.getElementById('volumeSlider');

        // 模态框
        this.loadingModal = document.getElementById('loadingModal');
        this.toast = document.getElementById('toast');
    }

    initEventListeners() {
        // 输入方式切换
        this.manualInputBtn.addEventListener('click', () => this.selectInputMethod('manual'));
        this.uploadFileBtn.addEventListener('click', () => this.selectInputMethod('upload'));

        // 文本输入事件
        this.textInput.addEventListener('input', () => {
            this.updateCharCount();
            this.updateEstimatedTime();
        });

        this.clearTextBtn.addEventListener('click', () => this.clearText());
        this.sampleTextBtn.addEventListener('click', () => this.insertSampleText());

        // 生成按钮
        this.generateBtn.addEventListener('click', () => this.generateSpeech());

        // 播放控制
        this.playPauseBtn.addEventListener('click', () => this.togglePlayPause());
        this.downloadBtn.addEventListener('click', () => this.downloadAudio());

        // 进度控制
        this.progressSlider.addEventListener('input', (e) => this.seekTo(e.target.value));

        // 音量控制
        this.volumeSlider.addEventListener('input', (e) => this.updateVolume(e.target.value));
        this.volumeBtn.addEventListener('click', () => this.toggleMute());

        // 语音合成事件
        this.speechSynthesis.onvoiceschanged = () => this.updateVoices();
        this.speechSynthesis.onend = () => this.onSpeechEnd();
    }

    selectInputMethod(method) {
        // 重置所有按钮状态
        this.manualInputBtn.classList.remove('border-primary', 'bg-primary/5');
        this.uploadFileBtn.classList.remove('border-primary', 'bg-primary/5');
        this.manualInputBtn.classList.add('border-gray-200');
        this.uploadFileBtn.classList.add('border-gray-200');

        // 设置选中状态
        if (method === 'manual') {
            this.manualInputBtn.classList.add('border-primary', 'bg-primary/5');
            this.manualInputBtn.classList.remove('border-gray-200');
            this.textInput.disabled = false;
            this.textInput.focus();
        } else if (method === 'upload') {
            this.uploadFileBtn.classList.add('border-primary', 'bg-primary/5');
            this.uploadFileBtn.classList.remove('border-gray-200');
            this.showFileUpload();
        }
    }

    showFileUpload() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.txt,.docx,.pdf';
        input.onchange = (e) => this.handleFileUpload(e.target.files[0]);
        input.click();
    }

    handleFileUpload(file) {
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            this.textInput.value = e.target.result.substring(0, 5000); // 限制5000字符
            this.updateCharCount();
            this.updateEstimatedTime();
            this.showToast('文件上传成功', '文本已加载到输入框', 'success');
        };

        if (file.type === 'text/plain') {
            reader.readAsText(file, 'UTF-8');
        } else {
            this.showToast('格式不支持', '目前仅支持TXT文本文件', 'warning');
        }
    }

    updateCharCount() {
        const text = this.textInput.value;
        const count = text.length;
        this.charCount.textContent = count + ' 字符';
    }

    updateEstimatedTime() {
        const text = this.textInput.value;
        const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;
        this.totalDuration = Math.max(1, Math.round(wordCount * 0.3)); // 平均每个词0.3秒
        this.totalTime.textContent = this.formatTime(this.totalDuration);
        this.estimatedTime.textContent = `预计时长: ${this.formatTime(this.totalDuration)}`;
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    clearText() {
        this.textInput.value = '';
        this.updateCharCount();
        this.updateEstimatedTime();
        this.showToast('操作成功', '文本已清空', 'success');
    }

    insertSampleText() {
        const sampleText = `欢迎使用智能文字转语音工具！

这是一个基于AI技术的语音合成应用，支持多种语音选择和参数调节。

主要功能特点：
• 实时文字转语音
• 多种语音风格选择
• 语速音调可调节
• 免费下载音频文件

让文字拥有声音，让信息传递更生动！`;

        this.textInput.value = sampleText;
        this.updateCharCount();
        this.updateEstimatedTime();
        this.showToast('示例文本', '已插入示例内容', 'info');
    }

    async generateSpeech() {
        const text = this.textInput.value.trim();
        if (!text) {
            this.showToast('输入为空', '请先输入要转换的文本', 'warning');
            return;
        }

        this.showLoading(true);

        try {
            // 模拟生成过程
            await new Promise(resolve => setTimeout(resolve, 1500));

            // 使用Web Speech API
            this.currentUtterance = new SpeechSynthesisUtterance(text);

            // 设置语音参数
            const voice = this.voiceSelect.value;
            const speed = parseFloat(this.speedSelect.value);
            const pitch = parseFloat(this.pitchSelect.value);
            const style = this.styleSelect.value;

            this.currentUtterance.lang = 'zh-CN';
            this.currentUtterance.rate = speed;
            this.currentUtterance.pitch = pitch;
            this.currentUtterance.volume = this.volumeSlider.value / 100;

            // 根据风格调整参数
            this.adjustForStyle(style);

            // 更新UI
            this.audioPlayer.scrollIntoView({ behavior: 'smooth' });
            this.showToast('生成成功', '语音生成完成，点击播放按钮开始播放', 'success');

        } catch (error) {
            console.error('生成语音失败:', error);
            this.showToast('生成失败', '语音生成过程中出现错误', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    adjustForStyle(style) {
        if (!this.currentUtterance) return;

        switch(style) {
            case 'story':
                this.currentUtterance.rate *= 0.9;
                this.currentUtterance.pitch *= 1.1;
                break;
            case 'news':
                this.currentUtterance.rate *= 1.1;
                this.currentUtterance.pitch *= 0.9;
                break;
            case 'chat':
                this.currentUtterance.rate *= 1.2;
                this.currentUtterance.pitch *= 1.2;
                break;
            case 'emotional':
                this.currentUtterance.rate *= 0.8;
                this.currentUtterance.pitch *= 1.3;
                break;
        }
    }

    togglePlayPause() {
        if (!this.currentUtterance) {
            this.generateSpeech();
            return;
        }

        if (this.isPlaying) {
            this.pauseSpeech();
        } else {
            this.startSpeech();
        }
    }

    startSpeech() {
        this.speechSynthesis.speak(this.currentUtterance);
        this.isPlaying = true;
        this.updatePlayPauseIcon();
        this.startProgressTracking();
    }

    pauseSpeech() {
        this.speechSynthesis.pause();
        this.isPlaying = false;
        this.updatePlayPauseIcon();
        this.stopProgressTracking();
    }

    stopSpeech() {
        this.speechSynthesis.cancel();
        this.isPlaying = false;
        this.currentProgress = 0;
        this.updatePlayPauseIcon();
        this.updateProgressBar();
        this.stopProgressTracking();
    }

    updatePlayPauseIcon() {
        const icon = this.playPauseBtn.querySelector('i');
        if (this.isPlaying) {
            icon.className = 'fa fa-pause';
        } else {
            icon.className = 'fa fa-play ml-1';
        }
    }

    startProgressTracking() {
        this.stopProgressTracking();

        this.progressInterval = setInterval(() => {
            if (this.isPlaying && this.totalDuration > 0) {
                this.currentProgress += 0.1;
                if (this.currentProgress >= this.totalDuration) {
                    this.currentProgress = this.totalDuration;
                    this.onSpeechEnd();
                }
                this.updateProgressBar();
                this.currentTime.textContent = this.formatTime(this.currentProgress);
            }
        }, 100);
    }

    stopProgressTracking() {
        if (this.progressInterval) {
            clearInterval(this.progressInterval);
            this.progressInterval = null;
        }
    }

    updateProgressBar() {
        const percentage = (this.currentProgress / this.totalDuration) * 100;
        this.progressBar.style.width = percentage + '%';
        this.progressSlider.value = percentage;
    }

    seekTo(percentage) {
        this.currentProgress = (percentage / 100) * this.totalDuration;
        this.updateProgressBar();
        this.currentTime.textContent = this.formatTime(this.currentProgress);
    }

    updateVolume(value) {
        const volume = value / 100;
        if (this.currentUtterance) {
            this.currentUtterance.volume = volume;
        }

        // 更新音量图标
        const icon = this.volumeBtn.querySelector('i');
        if (value == 0) {
            icon.className = 'fa fa-volume-off';
        } else if (value < 50) {
            icon.className = 'fa fa-volume-down';
        } else {
            icon.className = 'fa fa-volume-up';
        }
    }

    toggleMute() {
        const currentValue = this.volumeSlider.value;
        if (currentValue > 0) {
            this.volumeSlider.value = 0;
        } else {
            this.volumeSlider.value = 80;
        }
        this.updateVolume(this.volumeSlider.value);
    }

    onSpeechEnd() {
        this.isPlaying = false;
        this.currentProgress = 0;
        this.updatePlayPauseIcon();
        this.updateProgressBar();
        this.currentTime.textContent = '0:00';
        this.stopProgressTracking();
    }

    updateVoices() {
        const voices = this.speechSynthesis.getVoices();
        console.log('可用语音:', voices);
    }

    checkSpeechSupport() {
        if (!this.speechSynthesis) {
            this.showToast('浏览器不支持', '您的浏览器不支持语音合成功能', 'error');
        }
    }

    downloadAudio() {
        // 模拟下载功能
        this.showToast('下载功能', '音频下载功能开发中...', 'info');

        // 实际应用中需要使用后端服务或Web Audio API来实现
        const link = document.createElement('a');
        link.href = '#';
        link.download = 'speech_' + new Date().getTime() + '.mp3';
        link.click();
    }

    showLoading(show) {
        if (show) {
            this.loadingModal.classList.remove('hidden');
            this.loadingModal.classList.add('flex');
        } else {
            this.loadingModal.classList.add('hidden');
            this.loadingModal.classList.remove('flex');
        }
    }

    showToast(title, message, type = 'info') {
        const toastTitle = document.getElementById('toastTitle');
        const toastMessage = document.getElementById('toastMessage');
        const toastIcon = document.getElementById('toastIcon');

        toastTitle.textContent = title;
        toastMessage.textContent = message;

        // 设置图标和颜色
        switch(type) {
            case 'success':
                toastIcon.className = 'w-8 h-8 bg-green-500 rounded-full flex items-center justify-center';
                toastIcon.innerHTML = '<i class="fa fa-check text-white"></i>';
                break;
            case 'error':
                toastIcon.className = 'w-8 h-8 bg-red-500 rounded-full flex items-center justify-center';
                toastIcon.innerHTML = '<i class="fa fa-times text-white"></i>';
                break;
            case 'warning':
                toastIcon.className = 'w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center';
                toastIcon.innerHTML = '<i class="fa fa-exclamation text-white"></i>';
                break;
            default:
                toastIcon.className = 'w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center';
                toastIcon.innerHTML = '<i class="fa fa-info text-white"></i>';
        }

        // 显示提示框
        this.toast.classList.remove('translate-x-full');

        // 3秒后隐藏
        setTimeout(() => {
            this.toast.classList.add('translate-x-full');
        }, 3000);
    }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    new TextToSpeechApp();

    // 添加全局样式
    const style = document.createElement('style');
    style.textContent = `
                input[type="range"]::-webkit-slider-thumb {
                    appearance: none;
                    width: 16px;
                    height: 16px;
                    border-radius: 50%;
                    background: #165DFF;
                    cursor: pointer;
                    box-shadow: 0 2px 6px rgba(22, 93, 255, 0.3);
                }

                input[type="range"]::-moz-range-thumb {
                    width: 16px;
                    height: 16px;
                    border-radius: 50%;
                    background: #165DFF;
                    cursor: pointer;
                    border: none;
                    box-shadow: 0 2px 6px rgba(22, 93, 255, 0.3);
                }
            `;
    document.head.appendChild(style);
});