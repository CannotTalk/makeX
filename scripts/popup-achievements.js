/**
 * 実績解除風ポップアップを表示する関数 (HTML要素操作版)
 */
function showEnterHintPopup() {
    const popup = document.getElementById('achievement-popup');

    if (!popup) {
        console.error("Achievement popup element not found in HTML (ID: achievement-popup)");
        return;
    }

    popup.classList.remove('hidden');
    requestAnimationFrame(() => {
        popup.classList.add('visible');
    });

    if (popup.disappearTimer) {
        clearTimeout(popup.disappearTimer);
    }
    popup.disappearTimer = setTimeout(() => {
        removePopup(popup);
    }, 4000);

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
 * ポップアップ要素を下にアニメーションさせてから非表示にする関数 (HTML要素操作版)
 * @param {HTMLElement} popupElement - 対象のポップアップ要素
 */
function removePopup(popupElement) {
    if (!popupElement) return;

    popupElement.classList.remove('visible');

    const transitionEndHandler = (event) => {
        if ((event.propertyName === 'opacity' || event.propertyName === 'transform')) {
            if (!popupElement.classList.contains('visible')) {
                popupElement.classList.add('hidden');
            }
        }
    };

    if (popupElement.transitionEndHandler) {
        popupElement.removeEventListener('transitionend', popupElement.transitionEndHandler);
    }
    popupElement.addEventListener('transitionend', transitionEndHandler, { once: true });
    popupElement.transitionEndHandler = transitionEndHandler;

    setTimeout(() => {
        if (!popupElement.classList.contains('visible')) {
            popupElement.classList.add('hidden');
        }
    }, 600);

    if (popupElement.disappearTimer) {
        clearTimeout(popupElement.disappearTimer);
        popupElement.disappearTimer = null;
    }
    popupElement.clickHandler = null;
}

let isEnterHintShown = false;

document.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        event.preventDefault();

        if (!isEnterHintShown) {
            showEnterHintPopup();
            isEnterHintShown = true;
        }

        if (generateButtonContainer.style.display !== 'none') {
            // generateButton.click();
        } else if (stopButtonContainer.style.display !== 'none') {
            // stopButton.click();
        }
    }
});
