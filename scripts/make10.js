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
            if (b === 0 || a % b !== 0) return null;
            return a / b;
        default: return null;
    }
}

function generateSolvableMakeXPuzzle(targetValue = 10) {
    const MAX_ATTEMPTS_OUTER = 100;
    const MAX_ATTEMPTS_INNER = 50;
    const operators = ['+', '-', '*', '/'];

    for (let outerAttempt = 0; outerAttempt < MAX_ATTEMPTS_OUTER; outerAttempt++) {
        const initialNumbers = Array.from({ length: 4 }, () => getRandomInt(1, 9));
        const permutations = getAllPermutations(initialNumbers);
        const opCombinations = getAllOperatorCombinations(operators);

        for (const nums of permutations) {
            for (const ops of opCombinations) {
                let res1 = calculate(nums[0], nums[1], ops[0]);
                if (res1 === null) continue;
                let res2 = calculate(res1, nums[2], ops[1]);
                if (res2 === null) continue;
                let finalRes = calculate(res2, nums[3], ops[2]);
                if (finalRes === targetValue) {
                    return {
                        numbers: initialNumbers.sort((a, b) => a - b),
                        target: targetValue,
                        solutionExpression: `((${nums[0]} ${ops[0]} ${nums[1]}) ${ops[1]} ${nums[2]}) ${ops[2]} ${nums[3]}`,
                    };
                }

                res1 = calculate(nums[1], nums[2], ops[1]);
                if (res1 === null) continue;
                res2 = calculate(nums[0], res1, ops[0]);
                if (res2 === null) continue;
                finalRes = calculate(res2, nums[3], ops[2]);
                if (finalRes === targetValue) {
                    return {
                        numbers: initialNumbers.sort((a, b) => a - b),
                        target: targetValue,
                        solutionExpression: `(${nums[0]} ${ops[0]} (${nums[1]} ${ops[1]} ${nums[2]})) ${ops[2]} ${nums[3]}`,
                    };
                }

                res1 = calculate(nums[1], nums[2], ops[1]);
                if (res1 === null) continue;
                res2 = calculate(res1, nums[3], ops[2]);
                if (res2 === null) continue;
                finalRes = calculate(nums[0], res2, ops[0]);
                if (finalRes === targetValue) {
                    return {
                        numbers: initialNumbers.sort((a, b) => a - b),
                        target: targetValue,
                        solutionExpression: `${nums[0]} ${ops[0]} ((${nums[1]} ${ops[1]} ${nums[2]}) ${ops[2]} ${nums[3]})`,
                    };
                }

                res1 = calculate(nums[0], nums[1], ops[0]);
                if (res1 === null) continue;
                res2 = calculate(nums[2], nums[3], ops[2]);
                if (res2 === null) continue;
                finalRes = calculate(res1, res2, ops[1]);
                if (finalRes === targetValue) {
                    return {
                        numbers: initialNumbers.sort((a, b) => a - b),
                        target: targetValue,
                        solutionExpression: `(${nums[0]} ${ops[0]} ${nums[1]}) ${ops[1]} (${nums[2]} ${ops[2]} ${nums[3]})`,
                    };
                }

                res1 = calculate(nums[2], nums[3], ops[2]);
                if (res1 === null) continue;
                res2 = calculate(nums[1], res1, ops[1]);
                if (res2 === null) continue;
                finalRes = calculate(nums[0], res2, ops[0]);
                if (finalRes === targetValue) {
                    return {
                        numbers: initialNumbers.sort((a, b) => a - b),
                        target: targetValue,
                        solutionExpression: `${nums[0]} ${ops[0]} (${nums[1]} ${ops[1]} (${nums[2]} ${ops[2]} ${nums[3]}))`,
                    };
                }
            }
        }
    }

    console.warn(`Could not generate a puzzle for target ${targetValue} after ${MAX_ATTEMPTS_OUTER} attempts. Generating any solvable puzzle.`);
    return generateAnySolvablePuzzleFallback();
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

function generateAnySolvablePuzzleFallback() {
    const MAX_ATTEMPTS = 50;
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
                    if (result !== null && Number.isInteger(result) && result >= 0) {
                        newExpression = `(${expr1} ${op} ${expr2})`;
                        calculationSucceeded = true;
                        break;
                    }
                    if (!calculationSucceeded && (op === '-' || op === '/')) {
                        result = calculate(num2, num1, op);
                        if (result !== null && Number.isInteger(result) && result >= 0) {
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
                numbers: initialNumbers.sort((a, b) => a - b),
                target: target,
                solutionExpression: solutionExpression,
            };
        }
    }
    console.error(`Fallback Failed: Could not generate any solvable puzzle after ${MAX_ATTEMPTS} attempts.`);
    return null;
}

function removeRedundantOuterParentheses(expr) {
    if (typeof expr !== 'string') return expr;
    expr = expr.trim();

    while (expr.startsWith('(') && expr.endsWith(')')) {
        const innerExpr = expr.substring(1, expr.length - 1);
        if (innerExpr === '') return expr;

        let balance = 0;
        let splitPoint = -1;
        for (let i = 0; i < innerExpr.length; i++) {
            if (innerExpr[i] === '(') balance++;
            else if (innerExpr[i] === ')') balance--;
            if (balance === 0 && i < innerExpr.length - 1) {
                const nextChar = innerExpr[i + 1]?.trim();
                if (['+', '-', '*', '/'].includes(nextChar)) {
                    splitPoint = i + 1;
                    break;
                }
            }
            if (balance < 0) break;
        }

        if (balance === 0 && splitPoint === -1) {
            expr = innerExpr;
        } else {
            break;
        }
    }
    return expr;
}

// --- Timer Functions ---

function formatTime(milliseconds) {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const ms = String(Math.floor((milliseconds % 1000) / 10)).padStart(2, '0');
    const seconds = String(totalSeconds % 60).padStart(2, '0');
    const minutes = String(Math.floor(totalSeconds / 60) % 60).padStart(2, '0');
    const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}.${ms}`;
}

function updateTimer() {
    const now = Date.now();
    elapsedTime = now - startTime;
    timerDisplay.textContent = formatTime(elapsedTime);
}

function startTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
    }
    startTime = Date.now();
    elapsedTime = 0;
    timerDisplay.textContent = formatTime(0);
    timerInterval = setInterval(updateTimer, 41);

    generateButtonContainer.style.display = 'none';
    stopButtonContainer.style.display = 'block';
    answerButton.disabled = false;
    answerButtonContainer.style.display = 'block';
    answerButton.style.display = 'inline-block';
    solutionDisplay.textContent = '';
}

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

function generateQ() {
    console.log("Generating puzzle...");
    puzzle = generateSolvableMakeXPuzzle(10);

    if (puzzle) {
        console.log("Puzzle generated:", puzzle);
        let nums = puzzle.numbers.sort((a, b) => a - b);
        let numsForDisplay = nums.join(' , ') + ` to make ${puzzle.target}`;

        puzzleAnswer = removeRedundantOuterParentheses(puzzle.solutionExpression);

        numbersDisplay.textContent = numsForDisplay;

        solutionDisplay.textContent = '';
        answerButtonContainer.style.display = 'block';
        answerButton.style.display = 'inline-block';
        answerButton.disabled = false;

    } else {
        console.error("Failed to generate a puzzle.");
        numbersDisplay.textContent = "Error: Could not generate a puzzle.";
        puzzleAnswer = null;
        answerButtonContainer.style.display = 'none';
        answerButton.style.display = 'none';
        answerButton.disabled = true;
        stopTimer();
        generateButtonContainer.style.display = 'block';
        stopButtonContainer.style.display = 'none';
    }
    console.log("generateQ finished.");
}

function showAnswer() {
    console.log("Showing answer...");
    if (puzzleAnswer) {
        solutionDisplay.textContent = puzzleAnswer + ` = ${puzzle.target}`;
        answerButton.style.display = 'none';
        answerButton.disabled = true;
    } else {
        console.log("No solution available to show.");
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

document.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        event.preventDefault();
        if (generateButtonContainer.style.display !== 'none') {
            console.log("Enter pressed, triggering Generate button.");
            generateButton.click();
        } else if (stopButtonContainer.style.display !== 'none') {
            console.log("Enter pressed, triggering Stop button.");
            stopButton.click();
        }
    }
});

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded. Initializing Make 10.");
    timerDisplay.textContent = formatTime(0);
    stopButtonContainer.style.display = 'none';
    answerButtonContainer.style.display = 'none';
    answerButton.style.display = 'none';
    answerButton.disabled = true;
    solutionDisplay.textContent = '';
    numbersDisplay.textContent = "? , ? , ? , ? to make ?";
});
