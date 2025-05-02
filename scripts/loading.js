const progressBarElement = document.querySelector('.progress-bar');
const progressTextElement = document.getElementById('progress-text');
const loadingElement = document.getElementById('loading');

let progress = 0;
let progressInterval;

progressInterval = setInterval(() => {
    if (progress < 90) {
        progress += Math.random() * 5;
        if (progress > 90) progress = 90;
        progressBarElement.style.width = progress + '%';
        if (progressTextElement) {
            progressTextElement.textContent = Math.round(progress) + '%';
        }
    }
}, 200);

window.onload = function () {
    clearInterval(progressInterval);

    progress = 100;
    progressBarElement.style.width = progress + '%';
    if (progressTextElement) {
        progressTextElement.textContent = Math.round(progress) + '%';
    }

    setTimeout(() => {
        loadingElement.classList.add('loaded');

        loadingElement.addEventListener(
            'transitionend',
            () => {
                loadingElement.style.display = 'none';
            },
            { once: true }
        );
    }, 500);
};
