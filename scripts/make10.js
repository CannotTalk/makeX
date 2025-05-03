// scripts/make10.js

// --- Global Variables ---
let puzzle = null;
let puzzleAnswer = null;
let timerInterval = null;
let startTime = 0;
let elapsedTime = 0;

// --- References to DOM Elements ---
const timerDisplay = document.getElementById('timer');
const generateButtonContainer = document.getElementById('generate-button-container');
const generateButton = document.getElementById('generate-button');
const stopButtonContainer = document.getElementById('stop-button-container');
const stopButton = document.getElementById('stop-button');
const answerButtonContainer = document.getElementById('answer-button-container');
const answerButton = document.getElementById('answer-button');
const numbersDisplay = document.getElementById('numbers');
const solutionDisplay = document.getElementById('solution-display');

// --- Helper Functions ---

/**
 * Generates a random integer within the specified range.
 */
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Shuffles an array (Fisher-Yates algorithm).
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
 * Performs a calculation with two numbers and an operator.
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
 * Generates a solvable MakeX puzzle and one of its solutions.
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
            return {
                numbers: initialNumbers,
                target: target,
                solutionExpression: solutionExpression,
            };
        }
    }
    console.error(`Failed to generate a valid puzzle after ${MAX_ATTEMPTS} attempts.`);
    return null;
}

/**
 * Removes unnecessary outer parentheses from an expression string.
 */
function removeRedundantOuterParentheses(expr) {
    if (typeof expr !== 'string') return expr;
    expr = expr.trim();

    while (expr.startsWith('(') && expr.endsWith(')')) {
        const innerExpr = expr.substring(1, expr.length - 1);
        if (innerExpr === '') return expr;

        let balance = 0;
        let valid = true;
        for (let i = 0; i < innerExpr.length; i++) {
            if (innerExpr[i] === '(') balance++;
            else if (innerExpr[i] === ')') balance--;
            if (balance < 0) {
                 valid = false;
                 break;
            }
        }
        if (balance === 0 && valid) {
            expr = innerExpr;
        } else {
            break;
        }
    }
    return expr;
}

// --- Timer Functions ---

/**
 * Formats time into HH:MM:SS.msms format.
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
 * Updates the timer display.
 */
function updateTimer() {
    const now = Date.now();
    elapsedTime = now - startTime;
    timerDisplay.textContent = formatTime(elapsedTime);
}

/**
 * Starts the timer.
 */
function startTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
    }
    startTime = Date.now();
    elapsedTime = 0;
    timerDisplay.textContent = formatTime(0);
    timerInterval = setInterval(updateTimer, 10);

    generateButtonContainer.style.display = 'none';
    stopButtonContainer.style.display = 'block';
    answerButton.disabled = false;
    answerButton.style.display = 'inline-block';
    solutionDisplay.textContent = '';
}

/**
 * Stops the timer.
 */
function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        updateTimer();
        timerInterval = null;
        stopButtonContainer.style.display = 'none';
        generateButtonContainer.style.display = 'block';
    }
}

// --- Main Logic Functions ---

/**
 * Generates and displays a puzzle.
 */
function generateQ() {
    console.log("Generating puzzle...");
    puzzle = generateSolvableMakeXPuzzle();

    if (puzzle) {
        console.log("Puzzle generated:", puzzle);
        let nums = puzzle.numbers;
        let numsForDisplay = nums.join(' , ') + ` to make ${puzzle.target}`;

        puzzleAnswer = puzzle.solutionExpression;
        puzzleAnswer = removeRedundantOuterParentheses(puzzleAnswer);

        numbersDisplay.textContent = numsForDisplay;

        solutionDisplay.textContent = '';
        answerButton.style.display = 'inline-block';
        answerButton.disabled = false;

    } else {
        console.error("Failed to generate a puzzle.");
        numbersDisplay.textContent = "Error: Could not generate a puzzle.";
        puzzleAnswer = null;
        answerButton.style.display = 'none';
    }
    console.log("generateQ finished.");
}

/**
 * Displays the solution.
 */
function showAnswer() {
    console.log("Showing answer...");
    if (puzzleAnswer) {
        solutionDisplay.textContent = puzzleAnswer;
        answerButton.style.display = 'none';
    } else {
        console.log("No solution generated.");
        solutionDisplay.textContent = "No solution available.";
    }
    console.log("Answer displayed.");
}

// --- Event Listeners ---

generateButton.addEventListener('click', () => {
    generateQ();
    if (puzzle) {
      startTimer();
    }
});

stopButton.addEventListener('click', () => {
    stopTimer();
});

answerButton.addEventListener('click', () => {
    showAnswer();
    stopTimer();
});

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded. Initializing Make 10.");
    timerDisplay.textContent = formatTime(0);
    stopButtonContainer.style.display = 'none';
    answerButton.style.display = 'none';
    answerButton.disabled = true;
    solutionDisplay.textContent = '';
    numbersDisplay.textContent = "? ? ? ?";
});
