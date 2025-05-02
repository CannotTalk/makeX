// scripts/make10.js

// --- グローバル変数 ---
let puzzle = null;
let puzzleAnswer = null;
let timerInterval = null;
let startTime = 0;
let elapsedTime = 0;

// --- DOM要素への参照 ---
const timerDisplay = document.getElementById('timer');
const generateButton = document.getElementById('generate-button');
const stopButtonContainer = document.getElementById('stop-button-container');
const stopButton = document.getElementById('stop-button');
const answerButton = document.getElementById('answer-button'); // Solution Ex. ボタン
const numbersDisplay = document.getElementById('numbers');
const solutionDisplay = document.getElementById('solution-display'); // 解答表示用の要素

// --- ヘルパー関数 (提供されたコード) ---

/**
 * 指定された範囲内のランダムな整数を生成します。
 */
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * 配列をシャッフルします (Fisher-Yatesアルゴリズム)。
 */
function shuffleArray(array) {
    const shuffled = array.slice();
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

/**
 * 二つの数値と演算子で計算を実行します。
 */
function calculate(a, b, op) {
    switch (op) {
        case '+': return a + b;
        case '-': return a - b;
        case '*': return a * b;
        case '/':
            if (b === 0 || a % b !== 0) return null;
            return a / b;
        default: return null;
    }
}

/**
 * 必ず解けるMakeXパズルとその解法の一つを生成する関数
 */
function generateSolvableMakeXPuzzle() {
    const MAX_ATTEMPTS = 100;
    const operators = ['+', '-', '*', '/'];

    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
        const initialNumbers = Array.from({ length: 4 }, () => getRandomInt(1, 9));
        let currentNumbers = [...initialNumbers];
        let currentExpressions = initialNumbers.map(String);

        try {
            for (let i = 0; i < 3; i++) {
                const indices = shuffleArray([...Array(currentNumbers.length).keys()]).slice(0, 2);
                const index1 = Math.max(indices[0], indices[1]);
                const index2 = Math.min(indices[0], indices[1]);

                const num1 = currentNumbers.splice(index1, 1)[0];
                const expr1 = currentExpressions.splice(index1, 1)[0];
                const num2 = currentNumbers.splice(index2, 1)[0];
                const expr2 = currentExpressions.splice(index2, 1)[0];

                let result = null;
                let newExpression = null;
                const shuffledOps = shuffleArray(operators);
                let calculationSucceeded = false;

                for (const op of shuffledOps) {
                    result = calculate(num1, num2, op);
                    if (result !== null) {
                        newExpression = `(${expr1} ${op} ${expr2})`;
                        calculationSucceeded = true;
                        break;
                    }
                    if (!calculationSucceeded && (op === '-' || op === '/')) {
                        result = calculate(num2, num1, op);
                        if (result !== null) {
                            newExpression = `(${expr2} ${op} ${expr1})`;
                            calculationSucceeded = true;
                            break;
                        }
                    }
                }

                if (!calculationSucceeded) {
                    throw new Error("Calculation failed in this path");
                }
                currentNumbers.push(result);
                currentExpressions.push(newExpression);
            }
        } catch (e) {
            continue;
        }

        if (currentNumbers.length !== 1 || currentExpressions.length !== 1) {
            continue;
        }
        const target = currentNumbers[0];
        const solutionExpression = currentExpressions[0];

        if (Number.isInteger(target) && target > 0) {
             // Make 10 に限定する場合 (必要ならコメントアウト解除)
             // if (target === 10) {
                return {
                    numbers: initialNumbers,
                    target: target,
                    solutionExpression: solutionExpression,
                };
             // }
        }
    }
    console.error(`指定回数(${MAX_ATTEMPTS})試行しても適切なパズルを生成できませんでした。`);
    return null;
}

/**
 * 数式文字列の一番外側にある不要な括弧を削除します。
 */
function removeRedundantOuterParentheses(expr) {
    if (typeof expr !== 'string') return expr;
    expr = expr.trim();

    while (expr.startsWith('(') && expr.endsWith(')')) {
        const innerExpr = expr.substring(1, expr.length - 1);
        if (innerExpr === '') return expr; // Avoid reducing "()" to ""

        let balance = 0;
        let valid = true;
        for (let i = 0; i < innerExpr.length; i++) {
            if (innerExpr[i] === '(') balance++;
            else if (innerExpr[i] === ')') balance--;
            // If balance goes negative or ends non-zero inside, outer parens were necessary
            if (balance < 0) {
                 valid = false;
                 break;
            }
        }
        // Check final balance and validity
        if (balance === 0 && valid) {
            expr = innerExpr; // Remove outer parentheses and repeat
        } else {
            break; // Outer parentheses are necessary, stop removing
        }
    }
    return expr;
}


// --- タイマー関数 ---

/**
 * 時間を HH:MM:SS.msms 形式にフォーマットします。
 */
function formatTime(milliseconds) {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const ms = String(Math.floor((milliseconds % 1000) / 10)).padStart(2, '0');
    const seconds = String(totalSeconds % 60).padStart(2, '0');
    const minutes = String(Math.floor(totalSeconds / 60) % 60).padStart(2, '0');
    const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}.${ms}`;
}

/**
 * タイマー表示を更新します。
 */
function updateTimer() {
    const now = Date.now();
    elapsedTime = now - startTime;
    timerDisplay.textContent = formatTime(elapsedTime);
}

/**
 * タイマーを開始します。
 */
function startTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
    }
    startTime = Date.now();
    elapsedTime = 0;
    timerDisplay.textContent = formatTime(0);
    timerInterval = setInterval(updateTimer, 10); // 10msごとに更新

    stopButtonContainer.style.display = 'block'; // ストップボタン表示
    answerButton.disabled = false; // Solutionボタン有効化
    answerButton.style.display = 'inline-block'; // Solutionボタン表示
    solutionDisplay.textContent = ''; // 前回の解答をクリア
}

/**
 * タイマーを停止します。
 */
function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        updateTimer(); // 停止時の最終時間を正確に表示
        timerInterval = null;
        stopButtonContainer.style.display = 'none'; // ストップボタン非表示
        // 必要に応じてSolutionボタンを無効化したり非表示にする
        // answerButton.disabled = true;
        // answerButton.style.display = 'none';
    }
}

// --- メインロジック関数 ---

/**
 * 問題を生成し、表示します。
 */
function generateQ() {
    console.log("Generating puzzle...");
    puzzle = generateSolvableMakeXPuzzle(); // Make 10 にしたい場合は target === 10 のチェックを追加

    if (puzzle) {
        console.log("Puzzle generated:", puzzle);
        let nums = puzzle.numbers;
        // カンマとスペースで数字を結合し、ターゲット数を追加
        let numsForDisplay = nums.join(' , ') + ` で ${puzzle.target} をつくれ`;

        // 解答を準備（不要な括弧を削除）
        puzzleAnswer = puzzle.solutionExpression;
        puzzleAnswer = removeRedundantOuterParentheses(puzzleAnswer); // 繰り返し削除は不要かも？ removeRedundantOuterParentheses内でループする実装にした

        // 問題を表示
        numbersDisplay.textContent = numsForDisplay; // textContent を推奨

        // 解答表示エリアをクリアし、解答ボタンを表示状態にする
        solutionDisplay.textContent = ''; // ここで解答を表示しない
        answerButton.style.display = 'inline-block'; // 解答ボタンを表示
        answerButton.disabled = false; // 解答ボタンを有効化

    } else {
        console.error("パズルの生成に失敗しました。");
        numbersDisplay.textContent = "エラー: パズルを生成できませんでした。";
        puzzleAnswer = null; // 解答もnullに
        answerButton.style.display = 'none'; // エラー時は解答ボタンを隠す
    }
    console.log("generateQ finished.");
}

/**
 * 解答を表示します。
 */
function showAnswer() {
    console.log("Showing answer...");
    if (puzzleAnswer) {
        // 解答を専用の表示エリアに表示
        solutionDisplay.textContent = puzzleAnswer;
        // 解答を表示したらボタンを隠すなどの処理 (任意)
        answerButton.style.display = 'none';
    } else {
        console.log("解答が生成されていません。");
        solutionDisplay.textContent = "解答がありません";
    }
    console.log("Answer displayed.");
}


// --- イベントリスナーの設定 ---

generateButton.addEventListener('click', () => {
    generateQ(); // 問題生成
    // generateQ が成功した場合のみタイマーを開始するなどの制御も可能
    if (puzzle) {
      startTimer(); // タイマースタート
    }
});

stopButton.addEventListener('click', () => {
    stopTimer(); // タイマーストップ
});

answerButton.addEventListener('click', () => {
    showAnswer(); // 解答表示
    stopTimer();  // タイマーストップ
});

// --- 初期化処理 ---
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded. Initializing Make 10.");
    timerDisplay.textContent = formatTime(0); // 初期タイマー表示
    stopButtonContainer.style.display = 'none'; // ストップボタンを隠す
    answerButton.style.display = 'none'; // 初期状態では解答ボタンも隠すか無効化
    answerButton.disabled = true;
    solutionDisplay.textContent = ''; // 解答表示エリアをクリア
    numbersDisplay.textContent = "? ? ? ?"; // 初期問題表示

    // loading.js が完了したことを検知したい場合は、loading.js側で
    // カスタムイベントを発火させ、ここでリッスンするなどの方法があります。
    // 例: window.addEventListener('loadingComplete', initializeMake10);
});