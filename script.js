const _a = document.getElementById('target-word');
const _b = document.getElementById('score-display');
const _c = document.getElementById('timer-display');
const _d = document.getElementById('typing-input');
const _e = document.getElementById('mode-warning');

// 元の固定時間(30秒)を、選択によって書き換える形にします
let _f = 30; 
let _g = [];           
let _h = null;  
let _i = '';  
let _j = '';     
let _k = 0;        
let _l = 0;
let _m = _f;
let _n = null; 
let _o = false; 
let _p = 'normal'; 

// HTML側の新しい画面ID 'time-select-screen' を追加
const _q = ['menu-screen', 'time-select-screen', 'ready-screen', 'game-screen', 'result-screen'];

function showScreen(s) {
    _q.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.add('hidden');
    });
    const t = document.getElementById(s);
    if (t) t.classList.remove('hidden');
}

// モード選択（次の「時間選択」画面へ進むように変更）
function selectMode(m) {
    _p = m;
    const n = m === 'normal' ? '【通常モード】' : '【ふりがな無し】';
    document.getElementById('selected-mode-name').textContent = n;
    showScreen('time-select-screen');
}

// 時間選択（選んだ時間を反映して「準備画面」へ進む）
function selectTime(seconds) {
    _f = seconds; // 基準時間を更新
    _m = _f;     // 現在の残り時間をセット
    
    // 準備画面とゲーム画面の表示を更新
    const timeInfo = document.getElementById('selected-time-info');
    if (timeInfo) timeInfo.textContent = `${_f / 60}分モードで開始します`;
    _c.textContent = `残り時間: ${_f.toFixed(2)}秒`;
    
    showScreen('ready-screen');
}

async function initializeGame() {
    try {
        const r = await fetch('data1/terms.json');
        _g = await r.json();
        document.getElementById('start-button').onclick = _s;
        document.getElementById('retry-button').onclick = _s;
        _d.addEventListener('input', _t);
    } catch (e) {
        console.error(e);
    }
}

function _s() {
    _l = 0;
    _m = _f; // ここで選んだ時間(_f)がリセット時にも適用されます
    _b.textContent = `スコア: 0`;
    _d.disabled = false;
    _d.value = '';
    _u();
    showScreen('game-screen');
    setTimeout(() => _d.focus(), 10);
    _v();
    _o = true;
}

function _v() {
    if (_n) clearInterval(_n);
    _n = setInterval(() => {
        _m -= 0.01; 
        if (_m <= 0) {
            _m = 0;
            _w();
        }
        _c.textContent = `残り時間: ${_m.toFixed(2)}秒`;
    }, 10); 
}

function _w() {
    _o = false;
    clearInterval(_n); 
    document.getElementById('final-score').textContent = `クリア単語数: ${_l}`;
    showScreen('result-screen');
}

function _u() {
    const i = Math.floor(Math.random() * _g.length);
    _h = _g[i];
    _i = _h.reading;
    _j = _h.roma;
    _k = 0;
    _x();
}

function _x() {
    // 以前のチャットで確認した「ふりがな無し」はふりがなだけ消す仕様
    const s = (_p === 'no-ruby') ? 'style="visibility: hidden;"' : '';
    _a.innerHTML = `
        <div class="kanji" style="font-size: 40px; font-weight: bold;">${_h.term}</div>
        <div class="reading" ${s} style="color: #666;">${_i}</div>
        <div class="roma" style="font-size: 24px; font-family: monospace;">${_y(_j, _k)}</div>
    `;
}

function _y(w, i) {
    const t = w.substring(0, i);
    const u = w.substring(i);
    return `<span class="typed" style="color: #e74c3c; font-weight: bold;">${t}</span><span class="untyped">${u}</span>`;
}

function _t(e) {
    if (!_o || !_j) return;
    let v = _d.value;
    if (/[^\x20-\x7e]/.test(v)) {
        if (_e) _e.textContent = "⚠️ 半角英数モード(A)に切り替えてください！";
        _d.value = ""; 
        return;
    }
    if (_e) _e.textContent = ""; 
    const l = v.toLowerCase();
    if (_j.startsWith(l)) {
        _k = l.length; 
        if (_k >= _j.length) {
            _l++; 
            _b.textContent = `スコア: ${_l}`;
            _d.value = '';
            _u();
        } else {
            _x(); 
        }
    }
}

initializeGame();
