// scripts/make10.js

// --- 定数 ---
const MIN_TARGET = 0; // ターゲットの最小値
const MAX_TARGET = 100; // ターゲットの最大値

// --- グローバル変数 ---
let puzzle = null; // 現在のパズル情報 (numbers, target, solutionExpression を含む)
let timerInterval = null;
let startTime = 0;
let elapsedTime = 0;
let buttonClickCount = 0; // ボタンクリック回数カウンター
let isClickAchievementShown = false; // クリック実績表示フラグ

// --- DOM要素への参照 (ボタン構造変更に合わせて) ---
const timerDisplay = document.getElementById('timer');
const actionButtonContainer = document.getElementById('action-button-container'); // 統合されたコンテナ
const actionButton = document.getElementById('action-button');       // 統合されたボタン
const answerButton = document.getElementById('answer-button');
const numbersDisplay = document.getElementById('numbers');
const solutionDisplay = document.getElementById('solution-display');

// --- グローバルスコープに要素を公開 (popup-achievements.js用、) ---
window.actionButton = actionButton;        // 統合されたボタンを公開
window.actionButtonContainer = actionButtonContainer; // 統合されたコンテナを公開
window.answerButton = answerButton;       // これは変更なし
// 古い参照は不要

// --- ヘルパー関数 ---

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffleArray(array) {
    const shuffled = array.slice();
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

function calculate(a, b, op) {
    switch (op) {
        case '+': return a + b;
        case '-': return a - b;
        case '*': return a * b;
        case '/':
            // ゼロ除算と非整数結果を回避
            if (b === 0 || a % b !== 0) return null;
            return a / b;
        default: return null;
    }
}

function getAllPermutations(arr) {
    const result = [];
    function permute(currentArr, remainingArr) {
        if (remainingArr.length === 0) {
            result.push(currentArr);
            return;
        }
        for (let i = 0; i < remainingArr.length; i++) {
            const nextCurrent = currentArr.concat(remainingArr[i]);
            const nextRemaining = remainingArr.slice(0, i).concat(remainingArr.slice(i + 1));
            permute(nextCurrent, nextRemaining);
        }
    }
    permute([], arr);
    return result;
}

function getAllOperatorCombinations(ops) {
    const combinations = [];
    for (let i = 0; i < ops.length; i++) {
        for (let j = 0; j < ops.length; j++) {
            for (let k = 0; k < ops.length; k++) {
                combinations.push([ops[i], ops[j], ops[k]]);
            }
        }
    }
    return combinations;
}

// パズル生成関数 (ターゲット値を引数で受け取る)
function generateSolvableMakeXPuzzle(targetValue) {
    const MAX_ATTEMPTS_OUTER = 100; // 試行回数を増やすことも検討
    const operators = ['+', '-', '*', '/'];
    const PARENTHESIS_STRUCTURES = 5;

    for (let outerAttempt = 0; outerAttempt < MAX_ATTEMPTS_OUTER; outerAttempt++) {
        const initialNumbers = Array.from({ length: 4 }, () => getRandomInt(1, 9));
        const permutations = getAllPermutations(initialNumbers);
        const opCombinations = getAllOperatorCombinations(operators);

        for (const nums of permutations) {
            for (const ops of opCombinations) {
                for (let structure = 0; structure < PARENTHESIS_STRUCTURES; structure++) {
                    let result = null;
                    let expression = null;

                    try {
                        // 各括弧構造で計算し、targetValue と比較
                        switch (structure) {
                            case 0: // ((N1 op1 N2) op2 N3) op3 N4
                                let res1_0 = calculate(nums[0], nums[1], ops[0]);
                                if (res1_0 === null) continue;
                                let res2_0 = calculate(res1_0, nums[2], ops[1]);
                                if (res2_0 === null) continue;
                                result = calculate(res2_0, nums[3], ops[2]);
                                if (result === targetValue) {
                                    expression = `((${nums[0]} ${ops[0]} ${nums[1]}) ${ops[1]} ${nums[2]}) ${ops[2]} ${nums[3]}`;
                                }
                                break;

                            case 1: // (N1 op1 (N2 op2 N3)) op3 N4
                                let res1_1 = calculate(nums[1], nums[2], ops[1]);
                                if (res1_1 === null) continue;
                                let res2_1 = calculate(nums[0], res1_1, ops[0]);
                                if (res2_1 === null) continue;
                                result = calculate(res2_1, nums[3], ops[2]);
                                if (result === targetValue) {
                                    expression = `(${nums[0]} ${ops[0]} (${nums[1]} ${ops[1]} ${nums[2]})) ${ops[2]} ${nums[3]}`;
                                }
                                break;

                            case 2: // N1 op1 ((N2 op2 N3) op3 N4)
                                let res1_2 = calculate(nums[1], nums[2], ops[1]);
                                if (res1_2 === null) continue;
                                let res2_2 = calculate(res1_2, nums[3], ops[2]);
                                if (res2_2 === null) continue;
                                result = calculate(nums[0], res2_2, ops[0]);
                                if (result === targetValue) {
                                     expression = `${nums[0]} ${ops[0]} ((${nums[1]} ${ops[1]} ${nums[2]}) ${ops[2]} ${nums[3]})`;
                                }
                                break;

                            case 3: // (N1 op1 N2) op2 (N3 op3 N4)
                                let res1_3 = calculate(nums[0], nums[1], ops[0]);
                                if (res1_3 === null) continue;
                                let res2_3 = calculate(nums[2], nums[3], ops[2]);
                                if (res2_3 === null) continue;
                                result = calculate(res1_3, res2_3, ops[1]);
                                if (result === targetValue) {
                                    expression = `(${nums[0]} ${ops[0]} ${nums[1]}) ${ops[1]} (${nums[2]} ${ops[2]} ${nums[3]})`;
                                }
                                break;

                            case 4: // N1 op1 (N2 op2 (N3 op3 N4))
                                let res1_4 = calculate(nums[2], nums[3], ops[2]);
                                if (res1_4 === null) continue;
                                let res2_4 = calculate(nums[1], res1_4, ops[1]);
                                if (res2_4 === null) continue;
                                result = calculate(nums[0], res2_4, ops[0]);
                                if (result === targetValue) {
                                    expression = `${nums[0]} ${ops[0]} (${nums[1]} ${ops[1]} (${nums[2]} ${ops[2]} ${nums[3]}))`;
                                }
                                break;
                        }
                    } catch (e) {
                        continue; // 計算エラーはスキップ
                    }

                    if (result !== null && Math.abs(result - targetValue) < 1e-9 && expression !== null) {
                        // 浮動小数点誤差を考慮し、ほぼ一致する場合も許可 (ただし除算が整数のみなので通常不要)
                        // 解が見つかったら、元の数字、ターゲット値、解答式を返す
                        return {
                            numbers: initialNumbers, // 元の数字 (ソートは表示時に)
                            target: targetValue,     // 使用したターゲット値
                            solutionExpression: expression, // 解答式
                        };
                    }
                }
            }
        }
    }

    // 解が見つからなかった場合
    console.warn(`ターゲット ${targetValue} に対するパズルを ${MAX_ATTEMPTS_OUTER} 回の試行後も生成できませんでした。`);
    return null; // nullを返す
}


// --- タイマー関数 (ボタン切り替え処理を追加) ---
function formatTime(milliseconds) {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const ms = Math.floor((milliseconds % 1000) / 10); // ミリ秒（小数点以下2桁）

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(ms).padStart(2, '0')}`;
}

function startTimer() {
    if (timerInterval) return; // 既に開始している場合は何もしない
    startTime = Date.now() - elapsedTime; // 停止していた時間を考慮
    timerInterval = setInterval(() => {
        elapsedTime = Date.now() - startTime;
        timerDisplay.textContent = formatTime(elapsedTime);
    }, 10);
    // ボタンを Stop モードに切り替え
    actionButton.textContent = 'Stop';
    actionButton.classList.add('stop-mode'); // CSSクラスでスタイルを制御
}

function stopTimer() {
    if (!timerInterval) return; // 開始していない場合は何もしない
    clearInterval(timerInterval);
    timerInterval = null; // インターバルIDをクリア
    // elapsedTime は stop した時点の値が保持される
    // ボタンを Generate モードに切り替え
    actionButton.textContent = 'Generate';
    actionButton.classList.remove('stop-mode'); // CSSクラスを削除
}

function resetTimer() {
    stopTimer(); // stopTimer内でボタンがGenerateモードに戻る
    elapsedTime = 0;
    timerDisplay.textContent = formatTime(0);
}

// --- メインロジック ---

function generateNewPuzzle() {
    solutionDisplay.textContent = ''; // 前回の解答例をクリア
    const target = getRandomInt(MIN_TARGET, MAX_TARGET); // ターゲット値をランダムに決定
    puzzle = generateSolvableMakeXPuzzle(target); // 決定したターゲット値でパズル生成試行

    if (puzzle) {
        // パズル生成成功時
        // 数字をソートし、指定フォーマットで表示
        const sortedNumbers = puzzle.numbers.slice().sort((a, b) => a - b);
        numbersDisplay.textContent = `${sortedNumbers.join(' , ')} to make ${puzzle.target}`;

        resetTimer(); // タイマーリセット (ボタンがGenerateに戻る)
        startTimer(); // タイマー開始 (ボタンがStopに変わる)
        answerButton.disabled = false; // 解答ボタンを有効化
    } else {
        // パズル生成失敗時
        numbersDisplay.textContent = "? , ? , ? , ? to make ?"; // 初期表示に戻す
        solutionDisplay.textContent = "Failed to generate a puzzle. Try again.";
        answerButton.disabled = true; // 解答ボタンを無効化
        resetTimer(); // タイマーリセット (ボタンがGenerateに戻る)
        // 失敗時はstartTimerを呼ばないので、ボタンはGenerateのまま
    }
}

// 解答表示関数)
function showSolution() {
    if (puzzle && puzzle.solutionExpression) { // puzzleオブジェクトと解答式が存在するか確認
        // 正しいターゲット値を式の結果として表示
        solutionDisplay.textContent = `${puzzle.solutionExpression} = ${puzzle.target}`;
        stopTimer(); // 解答表示時にタイマー停止 (ボタンがGenerateに戻る)
    }
}

// --- クリックカウンター更新関数 ---
function incrementClickCount() {
    buttonClickCount++;
    // console.log("Click count:", buttonClickCount); // デバッグ用
    if (buttonClickCount === 50 && !isClickAchievementShown) {
        // popup-achievements.js の関数を呼び出す (window経由を明示)
        if (typeof window.showClickAchievementPopup === 'function') {
             window.showClickAchievementPopup();
             isClickAchievementShown = true;
        } else {
            console.error("window.showClickAchievementPopup function is not defined. Check script loading order.");
        }
    }
}

// --- イベントリスナー ---
actionButton.addEventListener('click', () => {
    // ボタンの現在の状態（テキストやクラス）で処理を分岐
    if (actionButton.classList.contains('stop-mode')) {
        // Stopモードの場合 -> Stop処理を実行
        stopTimer();
    } else {
        // Generateモードの場合 -> Generate処理を実行
        generateNewPuzzle();
    }
    incrementClickCount(); // Generate/Stopどちらの操作でもカウント
});

// Answerボタンのリスナー 
answerButton.addEventListener('click', () => {
    showSolution();
    incrementClickCount(); // Solution Ex.ボタンのクリックもカウント
});

// --- 初期化 ---
// ページ読み込み時の初期状態を設定
actionButton.textContent = 'Generate';       // ボタンのテキストを初期化
actionButton.classList.remove('stop-mode'); // Stopモードクラスを削除
answerButton.disabled = true;              // 解答ボタンは初期無効
numbersDisplay.textContent = '? , ? , ? , ? to make ?'; // パズル表示を初期化
timerDisplay.textContent = formatTime(0);      // タイマー表示を初期化
