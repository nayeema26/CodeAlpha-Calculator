const display = document.getElementById('display');
const historyEl = document.getElementById('history');
const keys = document.querySelectorAll('.key');

let current = '0';
let history = '';
let justEvaluated = false;

const OP_SYMBOLS = { '+': '+', '−': '-', '×': '*', '÷': '/' };

function updateScreen() {
  display.textContent = current;
  historyEl.textContent = history || '\u00A0';
}

function inputDigit(d) {
  if (justEvaluated) {
    current = d === '.' ? '0.' : d;
    history = '';
    justEvaluated = false;
    updateScreen();
    return;
  }
  if (d === '.' && current.includes('.')) return;
  if (current === '0' && d !== '.') {
    current = d;
  } else {
    current += d;
  }
  updateScreen();
}

function inputOperator(op) {
  if (justEvaluated) {
    history = current + ' ' + op + ' ';
    justEvaluated = false;
    updateScreen();
    return;
  }
  // Replace trailing operator if user changes their mind
  if (/[+\-×÷]\s*$/.test(history + current) || /\s[+\-×÷]\s$/.test(history)) {
    // no-op guard, handled below
  }
  if (history.trim().endsWith(current) === false) {
    history += current + ' ' + op + ' ';
  }
  current = '0';
  updateScreen();
}

function calculate() {
  const expression = (history + current)
    .split('').map(ch => OP_SYMBOLS[ch] || ch).join('');
  try {
    // Safe eval: only digits, operators, decimal points, spaces, parentheses allowed
    if (!/^[0-9+\-*/.\s]+$/.test(expression)) throw new Error('invalid');
    // eslint-disable-next-line no-eval
    const result = Function('"use strict"; return (' + expression + ')')();
    if (!isFinite(result)) throw new Error('divzero');
    history = history + current + ' =';
    current = String(parseFloat(result.toFixed(10)));
    justEvaluated = true;
  } catch (e) {
    current = 'Error';
    history = '';
    justEvaluated = true;
  }
  updateScreen();
}

function clearAll() {
  current = '0';
  history = '';
  justEvaluated = false;
  updateScreen();
}

function deleteLast() {
  if (justEvaluated) { clearAll(); return; }
  current = current.length > 1 ? current.slice(0, -1) : '0';
  updateScreen();
}

function percent() {
  current = String(parseFloat(current) / 100);
  updateScreen();
}

keys.forEach(key => {
  key.addEventListener('click', () => {
    const value = key.dataset.value;
    const action = key.dataset.action;

    if (value && '0123456789.'.includes(value)) inputDigit(value);
    else if (value && OP_SYMBOLS[value]) inputOperator(value);
    else if (action === 'clear') clearAll();
    else if (action === 'delete') deleteLast();
    else if (action === 'percent') percent();
    else if (action === 'equals') calculate();
  });
});

document.addEventListener('keydown', (e) => {
  if (/[0-9.]/.test(e.key)) { inputDigit(e.key); return; }
  if (e.key === '+') { inputOperator('+'); return; }
  if (e.key === '-') { inputOperator('−'); return; }
  if (e.key === '*') { inputOperator('×'); return; }
  if (e.key === '/') { e.preventDefault(); inputOperator('÷'); return; }
  if (e.key === 'Enter' || e.key === '=') { e.preventDefault(); calculate(); return; }
  if (e.key === 'Backspace') { deleteLast(); return; }
  if (e.key === 'Escape') { clearAll(); return; }
  if (e.key === '%') { percent(); return; }
});

updateScreen();
