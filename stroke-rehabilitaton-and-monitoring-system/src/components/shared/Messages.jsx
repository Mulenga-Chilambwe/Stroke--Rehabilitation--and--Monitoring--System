/**
 * components/shared/Messages.jsx
 * ─────────────────────────────────────────────────────────────
 * In-app messaging panel used by all three portals.
 *
 * Each role can select a recipient from the available choices
 * and see / send messages in a chat-bubble layout.
 * All messages are written into the shared store so they appear
 * immediately in the recipient's portal (simulating real-time sync).
 * ─────────────────────────────────────────────────────────────
 */

import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';

/** Human-readable display names for each role. */
const ROLE_NAMES = {
  patient:   'Mercy Banda (Patient)',
  caregiver: 'John Banda (Caregiver)',
  hp:        'Dr. Kumaran (Clinician)',
};

/**
 * Messages
 * Props:
 *   currentUser – { role, name, ... }
 */
const Messages = ({ currentUser }) => {
  const [state, dispatch] = useStore();

  // Default recipient: patients / caregivers talk to hp; hp talks to patient
  const defaultRecipient =
    currentUser.role === 'patient'   ? 'hp'
    : currentUser.role === 'caregiver' ? 'hp'
    : 'patient';

  const [recipient, setRecipient] = useState(defaultRecipient);
  const [text, setText] = useState('');

  // Scroll to bottom when messages change
  const bottomRef = useRef(null);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.messages, recipient]);

  /** Filter to messages in the current conversation thread. */
  const thread = state.messages.filter(
    (m) =>
      (m.from === currentUser.role && m.to === recipient) ||
      (m.from === recipient       && m.to === currentUser.role)
  );

  /** Mark unread messages from the selected thread as read. */
  useEffect(() => {
    dispatch((s) => ({
      ...s,
      messages: s.messages.map((m) =>
        m.from === recipient && m.to === currentUser.role && !m.read
          ? { ...m, read: true }
          : m
      ),
    }));
  }, [recipient, dispatch, currentUser.role]);

  /** Send a new message. */
  const sendMessage = () => {
    const trimmed = text.trim();
    if (!trimmed) return;

    dispatch((s) => ({
      ...s,
      messages: [
        ...s.messages,
        {
          id: `m${Date.now()}`,
          from: currentUser.role,
          to: recipient,
          fromName: currentUser.name,
          text: trimmed,
          time: 'Just now',
          read: false,
        },
      ],
    }));

    setText('');
  };

  /** Allow sending with Enter (Shift+Enter for newline). */
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Recipients available to this user (everyone except themselves)
  const recipientOptions = Object.entries(ROLE_NAMES).filter(
    ([role]) => role !== currentUser.role
  );

  return (
    <div className="card anim-fade-up" style={{ overflow: 'hidden' }}>
      {/* ── Header ── */}
      <div className="card__header" style={{ paddingBottom: 14 }}>
        <span className="card__title">💬 Messages</span>

        {/* Recipient selector */}
        <select
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          style={{
            padding: '5px 10px',
            borderRadius: 6,
            border: '1.5px solid var(--clr-border)',
            fontSize: '0.8rem',
            background: 'var(--clr-card)',
            color: 'var(--clr-fg)',
            cursor: 'pointer',
          }}
        >
          {recipientOptions.map(([role, name]) => (
            <option key={role} value={role}>
              {name}
            </option>
          ))}
        </select>
      </div>

      {/* ── Message thread ── */}
      <div className="chat-messages">
        {thread.length === 0 && (
          <p style={{ textAlign: 'center', color: 'var(--clr-muted)', padding: '24px 0' }}>
            No messages yet. Start the conversation!
          </p>
        )}

        {thread.map((m) => {
          const isMine = m.from === currentUser.role;
          return (
            <div
              key={m.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: isMine ? 'flex-end' : 'flex-start',
              }}
            >
              {/* Sender label for incoming messages */}
              {!isMine && (
                <span className="chat-bubble__sender">{m.fromName}</span>
              )}

              <div
                className={`chat-bubble ${
                  isMine ? 'chat-bubble--mine' : 'chat-bubble--theirs'
                }`}
              >
                {m.text}
              </div>

              <span className="chat-bubble__time">{m.time}</span>
            </div>
          );
        })}

        {/* Invisible anchor for auto-scroll */}
        <div ref={bottomRef} />
      </div>

      {/* ── Input row ── */}
      <div className="chat-input-row">
        <input
          className="chat-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`Message ${ROLE_NAMES[recipient].split(' (')[0]}…`}
        />
        <button
          className="btn btn--primary btn--sm"
          onClick={sendMessage}
          disabled={!text.trim()}
        >
          Send ➤
        </button>
      </div>
    </div>
  );
};

export default Messages;
