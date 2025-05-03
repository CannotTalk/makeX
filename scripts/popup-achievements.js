// scripts/popup-achievements.js

/**
 * 実績解除風ポップアップを表示する汎用関数
 * @param {string} title - ポップアップのタイトル
 * @param {string} description - ポップアップの説明文
 * @param {number} [duration=4000] - 表示時間 (ミリ秒)
 */
function showPopup(title, description, duration = 4000) {
    const popup = document.getElementById('achievement-popup');
    const popupTitle = popup.querySelector('.achievement-title');
    const popupDesc = popup.querySelector('.achievement-desc');

    if (!popup || !popupTitle || !popupDesc) {
        console.error("Achievement popup elements not found in HTML.");
        return;
    }

    // 内容を設定
    popupTitle.textContent = title;
    popupDesc.textContent = description;

    popup.classList.remove('hidden');
    // アニメーションのために僅かな遅延を挟む
    requestAnimationFrame(() => {
        requestAnimationFrame(() => { // もう一度requestAnimationFrameを挟むことで確実に描画後にクラス追加
             popup.classList.add('visible');
        });
    });


    // 既存のタイマーをクリア
    if (popup.disappearTimer) {
        clearTimeout(popup.disappearTimer);
    }
    // 新しいタイマーを設定
    popup.disappearTimer = setTimeout(() => {
        removePopup(popup);
    }, duration);

    // クリックで閉じる処理（既存のハンドラがあれば削除してから追加）
    const clickHandler = () => {
        clearTimeout(popup.disappearTimer);
        removePopup(popup);
    };

    if (popup.clickHandler) {
        popup.removeEventListener('click', popup.clickHandler);
    }
    popup.addEventListener('click', clickHandler, { once: true });
    popup.clickHandler = clickHandler;
}

/**
 * ポップアップ要素を下にアニメーションさせてから非表示にする関数
 * @param {HTMLElement} popupElement - 対象のポップアップ要素
 */
function removePopup(popupElement) {
    if (!popupElement) return;

    popupElement.classList.remove('visible');

    // transitionend イベントで hidden クラスを追加
    const transitionEndHandler = (event) => {
        // opacity または transform の transition が完了し、かつ visible クラスがない場合のみ hidden を追加
        if ((event.propertyName === 'opacity' || event.propertyName === 'transform')) {
            // visibleクラスがないことを確認（アニメーション中に再度表示されるケースを考慮）
             if (!popupElement.classList.contains('visible')) {
                 popupElement.classList.add('hidden');
             }
        }
    };

    // 既存のハンドラがあれば削除
    if (popupElement.transitionEndHandler) {
        popupElement.removeEventListener('transitionend', popupElement.transitionEndHandler);
    }
    popupElement.addEventListener('transitionend', transitionEndHandler, { once: true });
    popupElement.transitionEndHandler = transitionEndHandler; // ハンドラを保存

    // フォールバックタイマー：transitionendが発火しない場合（例：transitionがない、要素が非表示になるなど）
     setTimeout(() => {
         if (!popupElement.classList.contains('visible')) {
             popupElement.classList.add('hidden');
         }
     }, 600); // transitionの時間（0.5s）より少し長く設定

    // タイマーとクリックハンドラもクリア
    if (popupElement.disappearTimer) {
        clearTimeout(popupElement.disappearTimer);
        popupElement.disappearTimer = null;
    }
    popupElement.clickHandler = null;
}


// --- フラグ管理 ---
let isEnterHintShown = false;
let isWrongKeyHintShown = false; // 必要に応じて使用
let wrongKeyPopupTimeout = null; // 不正キーポップアップの連続表示制御用タイマー

// --- キーボードイベントリスナー (ボタン参照を修正) ---
document.addEventListener('keydown', (event) => {
    // グローバルスコープからボタン要素を取得 (make10.jsで設定)
    const actBtn = window.actionButton; // Generate/Stop 統合ボタン
    const answerBtn = window.answerButton;
    // const actBtnContainer = window.actionButtonContainer; // コンテナは通常不要

    // ボタン要素が見つからない場合は処理中断
    if (!actBtn || !answerBtn) {
        // console.warn("Button elements not found globally for keydown listener.");
        // make10.jsが読み込まれる前にkeydownが発生する可能性があるので、エラーではなく警告に留める
        return;
    }

    if (event.key === ' ') { // Spaceキー
        event.preventDefault(); // デフォルトのスクロール等を防ぐ
        actBtn.click(); // actionButton をクリック (Generate/Stopの動作はmake10.js側で判断)

        if (!isEnterHintShown) {
            showPopup(
                "The Shortcuts Key Nobody Knows",
                "Discover a new shortcut key.",
                4000 // 表示時間
            );
            isEnterHintShown = true;
        }
    } else if (event.key === 'Enter') { // Enterキー
        event.preventDefault(); // デフォルトの動作（もしあれば）を防ぐ
        if (!answerBtn.disabled) { // 解答ボタンが有効な場合のみクリック
            answerBtn.click(); // Solution Ex. ボタンをクリック
        }

        // 初回のみEnterヒントを表示
        if (!isEnterHintShown) {
            showPopup(
                "The Shortcuts Key Nobody Knows",
                "Discover a new shortcut key.",
                4000 // 表示時間
            );
            isEnterHintShown = true;
        }
    } else {
        // Space, Enter以外の修飾キーでないキーが押された場合
        // (Shift, Ctrl, Alt, Meta などは無視)
        // 入力フィールド等での入力を妨げないように注意が必要だが、このアプリにはないので単純化
        if (!event.ctrlKey && !event.altKey && !event.metaKey && event.key.length === 1) {
             // 短時間に連続表示されるのを防ぐ
             if (!wrongKeyPopupTimeout) {
                 showPopup(
                     "Hmm?",
                     "What are you doing...?",
                     1000 // 少し短めに表示
                 );
                 // 3秒間は再表示しないようにする
                 wrongKeyPopupTimeout = setTimeout(() => {
                     wrongKeyPopupTimeout = null;
                 }, 1500);
             }
        }
    }
});

// --- 外部から呼び出すためのポップアップ関数 ---
// クリック回数達成時に make10.js から呼び出す
// (関数名をグローバルに公開するため window に追加)
window.showClickAchievementPopup = function() {
     showPopup(
         "Click Enthusiast!",
         "You clicked hard, lol.",
         4000 // 少し長めに表示
     );
}
