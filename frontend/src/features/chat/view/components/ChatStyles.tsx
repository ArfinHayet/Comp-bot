export function ChatStyles() {
  return (
    <style>{`
      :root {
        --brand: #2563EB;
        --brand-dark: #1D4ED8;
        --brand-faint: #EFF6FF;
        --brand-mid: #BFDBFE;
        --surface: #FFFFFF;
        --surface-2: #F7F8FC;
        --border: rgba(0,0,0,0.07);
        --border-strong: rgba(0,0,0,0.13);
        --text: #0F172A;
        --text-muted: #64748B;
        --text-faint: #94A3B8;
        --radius-sm: 10px;
        --radius-md: 14px;
        --radius-lg: 20px;
        --radius-xl: 28px;
        --shadow-sm: 0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
        --shadow-md: 0 4px 16px rgba(0,0,0,0.06), 0 2px 6px rgba(0,0,0,0.04);
        --shadow-brand: 0 4px 20px rgba(37,99,235,0.22);
      }

      .status-dot {
        display: inline-flex; align-items: center; gap: 5px;
        font-size: 11px; font-weight: 500; color: #16A34A;
        background: #F0FDF4; border: 0.5px solid #BBF7D0;
        padding: 2px 8px; border-radius: 20px;
      }
      .status-dot::before {
        content: '';
        width: 5px; height: 5px; border-radius: 50%;
        background: #22C55E;
        animation: pulse-dot 2s ease infinite;
      }
      @keyframes pulse-dot {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.6; transform: scale(0.85); }
      }

      .clear-btn {
        display: flex; align-items: center; gap: 6px;
        font-size: 12px; font-weight: 500; color: var(--text-muted);
        background: var(--surface-2); border: 0.5px solid var(--border-strong);
        padding: 6px 12px; border-radius: var(--radius-sm);
        cursor: pointer; transition: all 0.15s ease;
      }
      .clear-btn:hover { color: #DC2626; background: #FEF2F2; border-color: #FECACA; }
      .clear-btn:active { transform: scale(0.97); }

      .messages-area { padding: 24px 20px 16px; display: flex; flex-direction: column; gap: 20px; max-width: 760px; margin: 0 auto; width: 100%; }

      .empty-state {
        display: flex; flex-direction: column; align-items: center; justify-content: center;
        padding: 80px 20px; text-align: center;
        animation: fade-in 0.4s ease;
      }
      @keyframes fade-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

      .empty-orb {
        width: 72px; height: 72px; border-radius: 22px;
        background: var(--brand-faint); border: 1.5px solid var(--brand-mid);
        display: flex; align-items: center; justify-content: center;
        margin-bottom: 20px;
        box-shadow: 0 0 0 8px rgba(37,99,235,0.04), 0 0 0 16px rgba(37,99,235,0.02);
      }

      .empty-title { font-size: 17px; font-weight: 600; color: var(--text); letter-spacing: -0.3px; margin-bottom: 6px; }
      .empty-sub { font-size: 14px; color: var(--text-muted); max-width: 280px; line-height: 1.5; margin-bottom: 28px; }

      .suggestions { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; }
      .suggestion-chip {
        font-size: 13px; font-weight: 500; color: var(--brand);
        background: var(--surface); border: 1px solid var(--brand-mid);
        padding: 8px 16px; border-radius: 40px;
        cursor: pointer; transition: all 0.15s ease;
        box-shadow: var(--shadow-sm);
      }
      .suggestion-chip:hover { background: var(--brand-faint); border-color: var(--brand); transform: translateY(-1px); box-shadow: var(--shadow-md); }
      .suggestion-chip:active { transform: translateY(0); }

      .msg-row {
        display: flex; align-items: flex-end; gap: 10px;
        animation: msg-in 0.25s ease;
      }
      @keyframes msg-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
      .msg-row.user { flex-direction: row-reverse; }

      .avatar {
        width: 32px; height: 32px; border-radius: 10px;
        display: flex; align-items: center; justify-content: center;
        flex-shrink: 0; margin-bottom: 2px;
      }
      .avatar.bot {
        background: var(--surface); border: 0.5px solid var(--border-strong);
        color: var(--text-muted);
        box-shadow: var(--shadow-sm);
      }
      .avatar.user {
        background: var(--brand);
        color: white;
        box-shadow: var(--shadow-brand);
        position: relative; overflow: hidden;
      }
      .avatar.user::after {
        content: '';
        position: absolute; inset: 0;
        background: linear-gradient(135deg, rgba(255,255,255,0.25) 0%, transparent 60%);
      }

      .bubble-wrap { display: flex; flex-direction: column; gap: 4px; max-width: 74%; }
      .bubble-wrap.user { align-items: flex-end; }

      .bubble {
        padding: 11px 15px;
        border-radius: var(--radius-lg);
        font-size: 14px; line-height: 1.65;
        box-shadow: var(--shadow-sm);
      }
      .bubble.user {
        background: var(--brand);
        color: white;
        border-bottom-right-radius: 5px;
        font-weight: 450;
        white-space: pre-wrap;
        position: relative; overflow: hidden;
      }
      .bubble.user::before {
        content: '';
        position: absolute; top: 0; left: 0; right: 0;
        height: 1px;
        background: rgba(255,255,255,0.3);
      }
      .bubble.bot {
        background: var(--surface);
        color: var(--text);
        border: 0.5px solid var(--border);
        border-bottom-left-radius: 5px;
      }

      .bubble.bot .prose p { margin: 4px 0; }
      .bubble.bot .prose ul, .bubble.bot .prose ol { margin: 6px 0; padding-left: 18px; }
      .bubble.bot .prose li { margin: 2px 0; }
      .bubble.bot .prose h1, .bubble.bot .prose h2, .bubble.bot .prose h3 { margin: 10px 0 4px; font-weight: 600; }
      .bubble.bot .prose code { font-size: 13px; background: var(--brand-faint); color: var(--brand); padding: 1px 5px; border-radius: 5px; }
      .bubble.bot .prose pre { background: #F8FAFC; border: 0.5px solid var(--border-strong); border-radius: 8px; padding: 10px 12px; overflow-x: auto; margin: 8px 0; }
      .bubble.bot .prose pre code { background: none; color: var(--text); padding: 0; }
      .bubble.bot .prose a { color: var(--brand); text-decoration: underline; text-decoration-color: var(--brand-mid); }
      .bubble.bot .prose blockquote { border-left: 3px solid var(--brand-mid); padding-left: 12px; color: var(--text-muted); margin: 6px 0; }

      .cached-badge {
        display: inline-flex; align-items: center; gap: 4px;
        font-size: 11px; font-weight: 600; letter-spacing: 0.3px;
        color: #92400E; background: #FFFBEB; border: 0.5px solid #FDE68A;
        padding: 3px 8px; border-radius: 20px;
        margin-top: 2px; width: fit-content;
      }

      .typing-bubble {
        background: var(--surface); border: 0.5px solid var(--border);
        border-bottom-left-radius: 5px;
        border-radius: var(--radius-lg);
        padding: 12px 16px;
        display: flex; align-items: center; gap: 4px;
        box-shadow: var(--shadow-sm);
      }
      .typing-dot {
        width: 7px; height: 7px; border-radius: 50%;
        background: var(--brand);
        animation: typing-bounce 1.2s ease infinite;
      }
      .typing-dot:nth-child(2) { animation-delay: 0.15s; background: color-mix(in srgb, var(--brand) 75%, transparent); }
      .typing-dot:nth-child(3) { animation-delay: 0.3s; background: color-mix(in srgb, var(--brand) 50%, transparent); }
      @keyframes typing-bounce {
        0%, 60%, 100% { transform: translateY(0); }
        30% { transform: translateY(-5px); }
      }

      .input-area {
        background: rgba(255,255,255,0.95);
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        border-top: 0.5px solid var(--border);
        padding: 16px 20px 20px;
        flex-shrink: 0;
      }

      .input-shell {
        max-width: 760px; margin: 0 auto;
        background: var(--surface);
        border: 1px solid var(--border-strong);
        border-radius: var(--radius-xl);
        box-shadow: 0 2px 12px rgba(0,0,0,0.06), 0 0 0 1px rgba(37,99,235,0);
        transition: box-shadow 0.2s ease, border-color 0.2s ease;
        overflow: hidden;
      }
      .input-shell:focus-within {
        border-color: var(--brand-mid);
        box-shadow: 0 2px 12px rgba(0,0,0,0.06), 0 0 0 3px rgba(37,99,235,0.1);
      }

      .input-row {
        display: flex; align-items: flex-end; gap: 0;
        padding: 4px 4px 4px 18px;
      }

      .chat-textarea {
        flex: 1;
        resize: none;
        border: none; outline: none; background: transparent;
        font-size: 14px; color: var(--text);
        line-height: 1.6;
        padding: 10px 12px 10px 0;
        min-height: 44px; max-height: 200px;
        font-family: inherit;
      }
      .chat-textarea::placeholder { color: var(--text-faint); }
      .chat-textarea:disabled { opacity: 0.5; }
      .chat-textarea:focus-visible { outline: none; }

      .send-btn {
        width: 36px; height: 36px; border-radius: 14px;
        background: var(--brand);
        border: none; cursor: pointer;
        display: flex; align-items: center; justify-content: center;
        color: white; flex-shrink: 0;
        margin-bottom: 2px;
        transition: all 0.15s ease;
        box-shadow: var(--shadow-brand);
        position: relative; overflow: hidden;
      }
      .send-btn::after {
        content: '';
        position: absolute; inset: 0;
        background: linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 60%);
      }
      .send-btn:hover:not(:disabled) { background: var(--brand-dark); transform: scale(1.05); }
      .send-btn:active:not(:disabled) { transform: scale(0.96); }
      .send-btn:disabled { opacity: 0.35; cursor: not-allowed; box-shadow: none; }

      .input-hint {
        text-align: center; font-size: 11px; color: var(--text-faint);
        margin-top: 10px; letter-spacing: 0.1px;
      }
      .input-hint kbd {
        font-family: inherit; background: var(--surface-2);
        border: 0.5px solid var(--border-strong);
        border-radius: 4px; padding: 1px 5px; font-size: 10px;
        color: var(--text-muted);
      }
    `}</style>
  );
}
