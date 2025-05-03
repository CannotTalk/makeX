const progressBarElement = document.querySelector('.progress-bar');
const progressTextElement = document.getElementById('progress-text');
const loadingElement = document.getElementById('loading');

let progress = 0;
let progressInterval;

// 読み込み開始前に要素が存在するか確認
if (progressBarElement && progressTextElement && loadingElement) {
    progressInterval = setInterval(() => {
        if (progress < 90) {
            progress += Math.random() * 5;
            if (progress > 90) progress = 90;
            progressBarElement.style.width = progress + '%';
            progressTextElement.textContent = Math.round(progress) + '%';
        } else {
            // 90%に達したらインターバルクリア（window.onloadを待つ）
            clearInterval(progressInterval);
        }
    }, 200);
} else {
    console.error("Loading screen elements not found.");
    // 要素がない場合、ローディング画面を非表示にするなどのフォールバック処理
    if(loadingElement) loadingElement.style.display = 'none';
}


window.onload = function () {
    // window.onloadが早すぎる場合があるので、念のためインターバルをクリア
    if(progressInterval) clearInterval(progressInterval);

    if (progressBarElement && progressTextElement && loadingElement) {
        progress = 100;
        progressBarElement.style.width = progress + '%';
        progressTextElement.textContent = Math.round(progress) + '%';

        // プログレスバーが100%になるのを待ってからフェードアウト
        setTimeout(() => {
            loadingElement.classList.add('loaded');

            loadingElement.addEventListener(
                'transitionend',
                () => {
                    // アニメーション完了後に完全に非表示
                    loadingElement.style.display = 'none';
                },
                { once: true }
            );
        }, 300); // 100%表示のための短い待機時間
    } else {
         // 要素がない場合、もしくはエラーがあった場合はローディング画面を隠す
         if(loadingElement) loadingElement.style.display = 'none';
    }
};

// window.onloadが発火しない場合のフォールバック
setTimeout(() => {
    if (loadingElement && !loadingElement.classList.contains('loaded')) {
        console.warn("window.onload did not fire within 5 seconds. Forcing loading screen removal.");
        if(progressInterval) clearInterval(progressInterval);
        loadingElement.style.opacity = '0'; // 強制的に透明に
        loadingElement.style.pointerEvents = 'none';
        setTimeout(() => {
            loadingElement.style.display = 'none';
        }, 1000); // transition時間を待つ
    }
}, 5000); // 5秒待つ
