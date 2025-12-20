// index.htmlの要素を取得
const targetWordElement = document.getElementById('target-word');
const scoreDisplayElement = document.getElementById('score-display');
const timerDisplayElement = document.getElementById('timer-display');
const typingInputElement = document.getElementById('typing-input');
const warningElement = document.getElementById('mode-warning');

// ゲームの状態を保持する変数
const GAME_TIME = 30; 
let terms = [];           
let currentTerm = null;  
let currentReading = '';  
let currentRoma = '';     // ローマ字用
let typeIndex = 0;        
let score = 0;
let timeLeft = GAME_TIME;
let timerId = null; 
let gameRunning = false; 
let currentMode = 'normal'; // 'normal' または 'no-ruby'

// --- 画面切り替えの仕組み ---
const screens = ['menu-screen', 'ready-screen', 'game-screen', 'result-screen'];

function showScreen(screenId) {
    screens.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.add('hidden');
    });
    const target = document.getElementById(screenId);
    if (target) target.classList.remove('hidden');
}

// --- モード選択 ---
function selectMode(mode) {
    currentMode = mode;
    const modeName = mode === 'normal' ? '【通常モード】' : '【ふりがな無し】';
    document.getElementById('selected-mode-name').textContent = modeName;
    showScreen('ready-screen');
}

// --- ゲーム開始の準備 ---
async function initializeGame() {
    try {
        const response = await fetch('data/terms.json');
        terms = await response.json();
        
        // ボタンのイベント登録（一度だけ実行）
        document.getElementById('start-button').onclick = startGame;
        document.getElementById('retry-button').onclick = startGame;
        
        // 入力監視の開始
        typingInputElement.addEventListener('input', handleTypingInput);
        
    } catch (error) {
        console.error("Error loading terms.json:", error);
    }
}

// --- ゲーム本編の開始 ---
function startGame() {
    score = 0;
    timeLeft = GAME_TIME;
    scoreDisplayElement.textContent = `スコア: 0`;
    typingInputElement.disabled = false;
    typingInputElement.value = '';
    
    setNextWord();
    showScreen('game-screen');
    
    // 入力欄にフォーカス
    setTimeout(() => typingInputElement.focus(), 10);
    
    startGameTimer();
    gameRunning = true;
}

// タイマー
function startGameTimer() {
    if (timerId) clearInterval(timerId);
    timerId = setInterval(() => {
        timeLeft -= 0.01; 
        if (timeLeft <= 0) {
            timeLeft = 0;
            gameOver();
        }
        timerDisplayElement.textContent = `残り時間: ${timeLeft.toFixed(2)}秒`;
    }, 10); 
}

// ゲームオーバー
function gameOver() {
    gameRunning = false;
    clearInterval(timerId); 
    document.getElementById('final-score').textContent = `クリア単語数: ${score}`;
    showScreen('result-screen');
}

// 単語のセット
function setNextWord() {
    const randomIndex = Math.floor(Math.random() * terms.length);
    currentTerm = terms[randomIndex];
    currentReading = currentTerm.reading;
    currentRoma = currentTerm.roma;
    typeIndex = 0;
    updateDisplay();
}

// 画面表示（モードによる「読み」の出し分け）
function updateDisplay() {
    // ふりがな無しモードの場合は visibility: hidden で隠す（場所は確保される）
    const rubyStyle = (currentMode === 'no-ruby') ? 'style="visibility: hidden;"' : '';

    targetWordElement.innerHTML = `
        <div class="kanji" style="font-size: 40px; font-weight: bold;">${currentTerm.term}</div>
        <div class="reading" ${rubyStyle} style="color: #666;">${currentReading}</div>
        <div class="roma" style="font-size: 24px; font-family: monospace;">${renderWord(currentRoma, typeIndex)}</div>
    `;
}

function renderWord(word, index) {
    const typed = word.substring(0, index);
    const untyped = word.substring(index);
    return `<span class="typed" style="color: #e74c3c; font-weight: bold;">${typed}</span><span class="untyped">${untyped}</span>`;
}

// --- 入力判定 ---
function handleTypingInput(event) {
    if (!gameRunning || !currentRoma) return;

    let typedValue = typingInputElement.value;

    // 全角チェック
    if (/[^\x20-\x7e]/.test(typedValue)) {
        if (warningElement) warningElement.textContent = "⚠️ 半角英数モード(A)に切り替えてください！";
        typingInputElement.value = ""; 
        return;
    }
    if (warningElement) warningElement.textContent = ""; 

    // ローマ字判定
    const lowerTypedValue = typedValue.toLowerCase();

    if (currentRoma.startsWith(lowerTypedValue)) {
        typeIndex = lowerTypedValue.length; 

        if (typeIndex >= currentRoma.length) {
            score++; 
            scoreDisplayElement.textContent = `スコア: ${score}`;
            typingInputElement.value = '';
            setNextWord();
        } else {
            updateDisplay(); 
        }
    }
}

// 最初にデータを読み込み
initializeGame();