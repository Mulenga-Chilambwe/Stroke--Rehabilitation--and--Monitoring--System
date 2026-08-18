/**
 * components/shared/Messages.jsx
 * ─────────────────────────────────────────────────────────────
 * Shared chat UI used by all three roles (patient, caregiver, hp).
 * Displays a message thread filtered by patient case and sender/
 * recipient role. Supports send, read receipts, and inline role
 * switching for the health professional.
 * ─────────────────────────────────────────────────────────────
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  getCaregiverForPatient,
  getDoctorForPatient,
  getDoctorIdForUser,
  getPatient,
  getPatientIdForUser,
} from '../../utils/care';

const roleLabel = {
  patient: 'Patient',
  caregiver: 'Caregiver',
  hp: 'Health Professional',
};

const Messages = ({ currentUser }) => {
  const [state, dispatch, ctx] = useStore();
  const doctorId = getDoctorIdForUser(currentUser);
  const defaultPatientId = getPatientIdForUser(currentUser);
  const doctorPatients = (state.patients || []).filter((patient) => patient.doctorId === doctorId);
  const [patientId, setPatientId] = useState(defaultPatientId);
  const [recipient, setRecipient] = useState(currentUser.role === 'hp' ? 'patient' : 'hp');
  const [text, setText] = useState('');
  const bottomRef = useRef(null);
  const hasAccessiblePatient = currentUser.role === 'hp' ? doctorPatients.length > 0 : Boolean(defaultPatientId);

  useEffect(() => {
    if (currentUser.role === 'hp' && doctorPatients.length > 0 && !doctorPatients.some((patient) => patient.id === patientId)) {
      setPatientId(doctorPatients[0].id);
    }
  }, [currentUser.role, doctorPatients, patientId]);

  const activePatientId =
    currentUser.role === 'hp' && !doctorPatients.some((item) => item.id === patientId)
      ? doctorPatients[0]?.id || patientId
      : patientId;

  const patient = getPatient(state, activePatientId);
  const caregiver = getCaregiverForPatient(state, activePatientId);
  const doctor = getDoctorForPatient(state, activePatientId);

  const names = useMemo(
    () => ({
      patient: `${patient.name} (Patient)`,
      caregiver: `${caregiver.name} (Caregiver)`,
      hp: `${doctor.name} (Doctor)`,
    }),
    [patient.name, caregiver.name, doctor.name]
  );

  const recipientOptions = ['patient', 'caregiver', 'hp'].filter((role) => role !== currentUser.role);
  const thread = (state.messages || []).filter(
    (message) =>
      message.patientId === activePatientId &&
      ((message.from === currentUser.role && message.to === recipient) ||
        (message.from === recipient && message.to === currentUser.role))
  );

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [thread.length, recipient, activePatientId]);

  useEffect(() => {
    dispatch((s) => ({
      ...s,
      messages: s.messages.map((message) =>
        message.patientId === activePatientId &&
        message.from === recipient &&
        message.to === currentUser.role &&
        !message.read
          ? { ...message, read: true }
          : message
      ),
    }));
  }, [activePatientId, recipient, currentUser.role, dispatch]);

  const sendMessage = () => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const msgRecord = {
      id: `m${Date.now()}`,
      patientId: activePatientId,
      from: currentUser.role,
      to: recipient,
      fromName: currentUser.name,
      text: trimmed,
      time: 'Just now',
      read: false,
    };

    dispatch((s) => ({
      ...s,
      messages: [...s.messages, msgRecord],
    }));
    ctx.syncMessage(msgRecord);
    setText('');
  };

  if (!hasAccessiblePatient) {
    return (
      <div className="card anim-fade-up">
        <div className="card__header">
          <span className="card__title">No care thread yet</span>
        </div>
        <div className="card__body">
          <p className="text-muted" style={{ lineHeight: 1.7 }}>
            Messages become available after this account is connected to a patient care record.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card anim-fade-up" style={{ overflow: 'hidden' }}>
      <div className="card__header message-header">
        <div>
          <span className="card__title">Care team messages</span>
          <p className="text-muted">Case thread for {patient.name}</p>
        </div>
        <div className="message-controls">
          {currentUser.role === 'hp' && (
            <select value={patientId} onChange={(e) => setPatientId(e.target.value)} className="select-control">
              {doctorPatients.map((item) => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </select>
          )}
          <select value={recipient} onChange={(e) => setRecipient(e.target.value)} className="select-control">
            {recipientOptions.map((role) => (
              <option key={role} value={role}>{names[role]}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="conversation-strip">
        {['patient', 'caregiver', 'hp'].map((role) => (
          <div key={role} className={`conversation-person ${role === currentUser.role ? 'active' : ''}`}>
            <strong>{(names[role] || '').split(' (')[0]}</strong>
            <span>{roleLabel[role]}</span>
          </div>
        ))}
      </div>

      <div className="chat-messages chat-messages--tall">
        {thread.length === 0 && (
          <p className="text-muted text-center" style={{ padding: '24px 0' }}>
            No messages yet. Start the conversation.
          </p>
        )}
        {thread.map((message) => {
          const isMine = message.from === currentUser.role;
          return (
            <div key={message.id} className={`chat-line ${isMine ? 'mine' : ''}`}>
              {!isMine && <span className="chat-bubble__sender">{message.fromName}</span>}
              <div className={`chat-bubble ${isMine ? 'chat-bubble--mine' : 'chat-bubble--theirs'}`}>
                {message.text}
              </div>
              <span className="chat-bubble__time">{message.time}</span>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div className="chat-input-row">
        <textarea
          className="chat-input chat-input--textarea"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={`Message ${(names[recipient] || '').split(' (')[0]} in detail...`}
        />
        <button className="btn btn--primary btn--sm" onClick={sendMessage} disabled={!text.trim()}>
          Send
        </button>
      </div>
    </div>
  );
};

export default Messages;
