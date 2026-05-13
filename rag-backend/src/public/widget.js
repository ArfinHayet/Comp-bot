(function () {
  'use strict';

  // ─── Config ────────────────────────────────────────────────────────────────
  var currentScript =
    document.currentScript ||
    (function () {
      var scripts = document.getElementsByTagName('script');
      return scripts[scripts.length - 1];
    })();

  var widgetKey = currentScript.getAttribute('data-key') || '';
  var apiBase = currentScript.getAttribute('data-api') || '';

  if (!widgetKey) {
    console.error('[comp-bot widget] Missing data-key attribute');
    return;
  }
  if (!apiBase) {
    console.error('[comp-bot widget] Missing data-api attribute');
    return;
  }

  // Strip trailing slash from apiBase
  apiBase = apiBase.replace(/\/+$/, '');

  // ─── Session ID (persisted per browser) ────────────────────────────────────
  var SESSION_KEY = 'compbot_session_' + widgetKey;
  var sessionId = sessionStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId =
      'sess_' +
      Math.random().toString(36).slice(2) +
      '_' +
      Date.now().toString(36);
    sessionStorage.setItem(SESSION_KEY, sessionId);
  }

  // ─── Styles ─────────────────────────────────────────────────────────────────
  var CSS = `
    :host {
      all: initial;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    #toggle-btn {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 2147483647;
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: #2563eb;
      border: none;
      cursor: pointer;
      box-shadow: 0 4px 14px rgba(0,0,0,0.25);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s;
    }
    #toggle-btn:hover { background: #1d4ed8; }
    #toggle-btn svg { width: 26px; height: 26px; fill: #fff; }

    #chat-window {
      position: fixed;
      bottom: 90px;
      right: 24px;
      z-index: 2147483646;
      width: 360px;
      max-width: calc(100vw - 32px);
      height: 520px;
      max-height: calc(100vh - 120px);
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.18);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      background: #fff;
      border: 1px solid #e5e7eb;
      transition: opacity 0.2s, transform 0.2s;
    }
    #chat-window.hidden {
      opacity: 0;
      pointer-events: none;
      transform: translateY(12px);
    }

    #chat-header {
      background: #2563eb;
      color: #fff;
      padding: 14px 16px;
      font-size: 15px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 8px;
      flex-shrink: 0;
    }
    #chat-header svg { width: 20px; height: 20px; fill: #fff; flex-shrink: 0; }

    #messages {
      flex: 1;
      overflow-y: auto;
      padding: 14px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      scroll-behavior: smooth;
    }
    #messages::-webkit-scrollbar { width: 4px; }
    #messages::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 2px; }

    .msg {
      max-width: 82%;
      padding: 9px 13px;
      border-radius: 14px;
      font-size: 14px;
      line-height: 1.5;
      word-break: break-word;
    }
    .msg.user {
      background: #2563eb;
      color: #fff;
      align-self: flex-end;
      border-bottom-right-radius: 4px;
    }
    .msg.bot {
      background: #f3f4f6;
      color: #111827;
      align-self: flex-start;
      border-bottom-left-radius: 4px;
    }
    .msg.error {
      background: #fee2e2;
      color: #b91c1c;
      align-self: flex-start;
    }

    .typing {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 10px 13px;
      background: #f3f4f6;
      border-radius: 14px;
      border-bottom-left-radius: 4px;
      align-self: flex-start;
    }
    .typing span {
      width: 7px; height: 7px;
      background: #9ca3af;
      border-radius: 50%;
      animation: bounce 1.2s infinite;
    }
    .typing span:nth-child(2) { animation-delay: 0.2s; }
    .typing span:nth-child(3) { animation-delay: 0.4s; }
    @keyframes bounce {
      0%, 60%, 100% { transform: translateY(0); }
      30% { transform: translateY(-5px); }
    }

    #input-row {
      display: flex;
      gap: 8px;
      padding: 10px 12px;
      border-top: 1px solid #e5e7eb;
      flex-shrink: 0;
      background: #fff;
    }
    #user-input {
      flex: 1;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      padding: 8px 12px;
      font-size: 14px;
      outline: none;
      resize: none;
      font-family: inherit;
      line-height: 1.4;
      max-height: 80px;
      overflow-y: auto;
      transition: border-color 0.2s;
    }
    #user-input:focus { border-color: #2563eb; }
    #send-btn {
      background: #2563eb;
      border: none;
      border-radius: 8px;
      padding: 8px 12px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: background 0.2s;
    }
    #send-btn:hover { background: #1d4ed8; }
    #send-btn:disabled { background: #93c5fd; cursor: not-allowed; }
    #send-btn svg { width: 18px; height: 18px; fill: #fff; }

    /* ── Markdown styles inside bot bubbles ── */
    .msg.bot p { margin: 0 0 6px; }
    .msg.bot p:last-child { margin-bottom: 0; }
    .msg.bot ul, .msg.bot ol { margin: 4px 0 6px 18px; padding: 0; }
    .msg.bot li { margin-bottom: 2px; }
    .msg.bot code {
      background: #e5e7eb;
      border-radius: 4px;
      padding: 1px 5px;
      font-size: 12px;
      font-family: 'SFMono-Regular', Consolas, monospace;
    }
    .msg.bot pre {
      background: #1e293b;
      color: #e2e8f0;
      border-radius: 8px;
      padding: 10px 12px;
      overflow-x: auto;
      margin: 6px 0;
      font-size: 12px;
    }
    .msg.bot pre code { background: none; padding: 0; color: inherit; font-size: inherit; }
    .msg.bot strong { font-weight: 600; }
    .msg.bot em { font-style: italic; }
    .msg.bot a { color: #2563eb; text-decoration: underline; }
    .msg.bot hr { border: none; border-top: 1px solid #d1d5db; margin: 8px 0; }
    .msg.bot h1, .msg.bot h2, .msg.bot h3 { font-weight: 600; margin: 8px 0 4px; line-height: 1.3; }
    .msg.bot h1 { font-size: 1.1em; }
    .msg.bot h2 { font-size: 1.05em; }
    .msg.bot h3 { font-size: 1em; }
    .msg.bot table { border-collapse: collapse; font-size: 13px; margin: 6px 0; width: 100%; }
    .msg.bot th, .msg.bot td { border: 1px solid #d1d5db; padding: 4px 8px; text-align: left; }
    .msg.bot th { background: #e5e7eb; font-weight: 600; }
    .msg.bot blockquote {
      border-left: 3px solid #2563eb;
      margin: 6px 0;
      padding: 4px 10px;
      color: #4b5563;
      background: #eff6ff;
      border-radius: 0 6px 6px 0;
    }
  `;

  // ─── SVGs ────────────────────────────────────────────────────────────────────
  var ICON_CHAT =
    '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.48 2 2 6.48 2 12c0 1.85.5 3.58 1.37 5.07L2 22l4.93-1.37A9.95 9.95 0 0 0 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm1 14H7v-2h6v2zm2-4H7v-2h8v2zm0-4H7V6h8v2z"/></svg>';
  var ICON_CLOSE =
    '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>';
  var ICON_SEND =
    '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>';

  // ─── Inline markdown renderer (no CDN dependency) ─────────────────────────
  function renderMarkdown(src) {
    src = src.replace(/^```[a-z]*\n([\s\S]*?)\n```\s*$/m, '$1').trim();

    function esc(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

    function fmt(s) {
      s = s.replace(/<br\s*\/?>/gi, '\x00');
      s = esc(s);
      s = s.replace(/\x00/g, '<br>');
      return s
        .replace(/`([^`]+)`/g, function(_, c) { return '<code>' + c + '</code>'; })
        .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*([^*\n]+)\*/g, '<em>$1</em>')
        .replace(/_([^_\n]+)_/g, '<em>$1</em>')
        .replace(/~~(.+?)~~/g, '<del>$1</del>')
        .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width:100%;border-radius:6px;margin:4px 0;">')
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
    }

    function parseCells(row) {
      return row.replace(/^\||\|$/g, '').split('|').map(function(c) { return fmt(c.trim()); });
    }

    var lines = src.split('\n'), html = '', i = 0;
    while (i < lines.length) {
      var ln = lines[i];

      if (/^```/.test(ln)) {
        var cb = []; i++;
        while (i < lines.length && !/^```/.test(lines[i])) cb.push(esc(lines[i++]));
        html += '<pre><code>' + cb.join('\n') + '</code></pre>';
        i++; continue;
      }
      var hm = ln.match(/^(#{1,6}) (.*)/);
      if (hm) {
        html += '<h' + hm[1].length + '>' + fmt(hm[2]) + '</h' + hm[1].length + '>';
        i++; continue;
      }
      if (/^\s*([-*_]\s*){3,}$/.test(ln) && !/^[-*+] /.test(ln)) {
        html += '<hr>'; i++; continue;
      }
      if (/^> ?/.test(ln)) {
        var bq = [];
        while (i < lines.length && /^>/.test(lines[i])) bq.push(lines[i++].replace(/^> ?/, ''));
        html += '<blockquote>' + renderMarkdown(bq.join('\n')) + '</blockquote>';
        continue;
      }
      if (/^[-*+] /.test(ln)) {
        html += '<ul>';
        while (i < lines.length && /^[-*+] /.test(lines[i])) html += '<li>' + fmt(lines[i++].slice(2)) + '</li>';
        html += '</ul>'; continue;
      }
      if (/^\d+\.\s/.test(ln)) {
        html += '<ol>';
        while (i < lines.length && /^\d+\.\s/.test(lines[i])) html += '<li>' + fmt(lines[i++].replace(/^\d+\.\s+/, '')) + '</li>';
        html += '</ol>'; continue;
      }
      if (/\|/.test(ln) && lines[i + 1] && /^[|\s:\- ]+$/.test(lines[i + 1])) {
        html += '<table><thead><tr>' + parseCells(ln).map(function(c) { return '<th>' + c + '</th>'; }).join('') + '</tr></thead><tbody>';
        i += 2;
        while (i < lines.length && /\|/.test(lines[i])) {
          html += '<tr>' + parseCells(lines[i++]).map(function(c) { return '<td>' + c + '</td>'; }).join('') + '</tr>';
        }
        html += '</tbody></table>'; continue;
      }
      if (!ln.trim()) { i++; continue; }
      var p = [];
      while (i < lines.length && lines[i].trim() &&
             !/^[#>`]/.test(lines[i]) && !/^[-*+] /.test(lines[i]) &&
             !/^\d+\.\s/.test(lines[i]) && !/^\s*([-*_]\s*){3,}$/.test(lines[i]) &&
             !/^```/.test(lines[i]) &&
             !(/\|/.test(lines[i]) && lines[i + 1] && /^[|\s:\- ]+$/.test(lines[i + 1]))) {
        p.push(lines[i++]);
      }
      if (p.length) { html += '<p>' + fmt(p.join('<br>')) + '</p>'; }
      else { html += '<p>' + fmt(ln) + '</p>'; i++; }
    }
    return html || '<p>' + esc(src) + '</p>';
  }

  // ─── Boot ─────────────────────────────────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {

  // ─── Build DOM ────────────────────────────────────────────────────────────────
  var host = document.createElement('div');
  host.id = 'compbot-widget-host';
  var shadow = host.attachShadow({ mode: 'open' });

  var style = document.createElement('style');
  style.textContent = CSS;
  shadow.appendChild(style);

  // Toggle button
  var toggleBtn = document.createElement('button');
  toggleBtn.id = 'toggle-btn';
  toggleBtn.setAttribute('aria-label', 'Open chat');
  toggleBtn.innerHTML = ICON_CHAT;
  shadow.appendChild(toggleBtn);

  // Chat window
  var chatWindow = document.createElement('div');
  chatWindow.id = 'chat-window';
  chatWindow.className = 'hidden';
  chatWindow.setAttribute('role', 'dialog');
  chatWindow.setAttribute('aria-label', 'Chat assistant');

  var header = document.createElement('div');
  header.id = 'chat-header';
  header.innerHTML = ICON_CHAT + 'Ask a question';

  var messages = document.createElement('div');
  messages.id = 'messages';
  messages.setAttribute('aria-live', 'polite');

  var inputRow = document.createElement('div');
  inputRow.id = 'input-row';

  var userInput = document.createElement('textarea');
  userInput.id = 'user-input';
  userInput.rows = 1;
  userInput.placeholder = 'Type your message…';
  userInput.setAttribute('aria-label', 'Message input');

  var sendBtn = document.createElement('button');
  sendBtn.id = 'send-btn';
  sendBtn.setAttribute('aria-label', 'Send message');
  sendBtn.innerHTML = ICON_SEND;

  inputRow.appendChild(userInput);
  inputRow.appendChild(sendBtn);
  chatWindow.appendChild(header);
  chatWindow.appendChild(messages);
  chatWindow.appendChild(inputRow);
  shadow.appendChild(chatWindow);

  document.body.appendChild(host);

  // ─── State ───────────────────────────────────────────────────────────────────
  var isOpen = false;
  var isLoading = false;

  // ─── Helpers ─────────────────────────────────────────────────────────────────
  function scrollToBottom() {
    messages.scrollTop = messages.scrollHeight;
  }

  function addMessage(text, role) {
    var el = document.createElement('div');
    el.className = 'msg ' + role;
    if (role === 'bot') {
      el.innerHTML = renderMarkdown(text);
    } else {
      el.textContent = text;
    }
    messages.appendChild(el);
    scrollToBottom();
    return el;
  }

  function showTyping() {
    var el = document.createElement('div');
    el.className = 'typing';
    el.id = 'typing-indicator';
    el.innerHTML = '<span></span><span></span><span></span>';
    messages.appendChild(el);
    scrollToBottom();
  }

  function hideTyping() {
    var el = shadow.getElementById('typing-indicator');
    if (el) el.remove();
  }

  function setLoading(val) {
    isLoading = val;
    sendBtn.disabled = val;
    userInput.disabled = val;
  }

  // ─── Toggle ───────────────────────────────────────────────────────────────────
  toggleBtn.addEventListener('click', function () {
    isOpen = !isOpen;
    if (isOpen) {
      chatWindow.classList.remove('hidden');
      toggleBtn.innerHTML = ICON_CLOSE;
      toggleBtn.setAttribute('aria-label', 'Close chat');
      userInput.focus();
    } else {
      chatWindow.classList.add('hidden');
      toggleBtn.innerHTML = ICON_CHAT;
      toggleBtn.setAttribute('aria-label', 'Open chat');
    }
  });

  // ─── Send ────────────────────────────────────────────────────────────────────
  function sendMessage() {
    var text = userInput.value.trim();
    if (!text || isLoading) return;

    userInput.value = '';
    userInput.style.height = 'auto';
    addMessage(text, 'user');
    setLoading(true);
    showTyping();

    var payload = JSON.stringify({ message: text, sessionId: sessionId });

    fetch(apiBase + '/widget/' + widgetKey + '/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload,
    })
      .then(function (res) {
        if (!res.ok) {
          return res.json().catch(function () { return {}; }).then(function (body) {
            throw new Error(body.message || ('Request failed: ' + res.status));
          });
        }
        return res.json();
      })
      .then(function (data) {
        hideTyping();
        addMessage(data.answer || data.response || data.message || 'No response', 'bot');
      })
      .catch(function (err) {
        hideTyping();
        addMessage('Error: ' + err.message, 'error');
      })
      .finally(function () {
        setLoading(false);
      });
  }

  sendBtn.addEventListener('click', sendMessage);

  userInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  // Auto-grow textarea
  userInput.addEventListener('input', function () {
    userInput.style.height = 'auto';
    userInput.style.height = Math.min(userInput.scrollHeight, 80) + 'px';
  });

  } // end init
})();
