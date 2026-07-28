import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SystemMessage, UserRole } from '../../types';
import { Modal } from '../common/Modal';
import {
  MessageSquare,
  Plus,
  Send,
  User,
  Clock,
  CheckCheck,
  Megaphone,
  Search,
  Filter,
  Inbox,
  SendHorizontal,
  MailWarning,
  Sparkles,
} from 'lucide-react';

export const MessagingView: React.FC = () => {
  const { currentUser, users, messages, sendMessage, markMessageAsRead } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'inbox' | 'sent' | 'broadcasts'>('inbox');
  const [searchTerm, setSearchTerm] = useState('');

  // Compose Modal State
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [targetType, setTargetType] = useState<'individual' | 'role' | 'all'>('individual');
  const [recipientUserId, setRecipientUserId] = useState('');
  const [recipientRole, setRecipientRole] = useState<UserRole>('manager');
  const [messageSubject, setMessageSubject] = useState('');
  const [messageBody, setMessageBody] = useState('');
  const [messagePriority, setMessagePriority] = useState<'normal' | 'urgent'>('normal');

  const handleComposeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageSubject || !messageBody) return;

    if (targetType === 'individual') {
      const recipient = users.find((u) => u.id === recipientUserId);
      if (!recipient) return;

      sendMessage({
        recipientId: recipient.id,
        recipientName: recipient.name,
        subject: messageSubject,
        body: messageBody,
        priority: messagePriority,
      });
    } else if (targetType === 'role') {
      const targetUsers = users.filter((u) => u.role === recipientRole && u.id !== currentUser.id);
      targetUsers.forEach((u) => {
        sendMessage({
          recipientId: u.id,
          recipientName: u.name,
          subject: `[Role Broadcast: ${recipientRole.toUpperCase()}] ${messageSubject}`,
          body: messageBody,
          priority: messagePriority,
          isBroadcast: true,
        });
      });
    } else if (targetType === 'all') {
      const targetUsers = users.filter((u) => u.id !== currentUser.id);
      targetUsers.forEach((u) => {
        sendMessage({
          recipientId: u.id,
          recipientName: u.name,
          subject: `[SYSTEM ANNOUNCEMENT] ${messageSubject}`,
          body: messageBody,
          priority: messagePriority,
          isBroadcast: true,
        });
      });
    }

    setIsComposeOpen(false);
    setMessageSubject('');
    setMessageBody('');
    setRecipientUserId('');
  };

  // Filtered Messages
  const userInbox = messages.filter(
    (m) => m.recipientId === currentUser.id || (m.isBroadcast && m.senderId !== currentUser.id)
  );

  const userSent = messages.filter((m) => m.senderId === currentUser.id);

  const broadcastList = messages.filter((m) => m.isBroadcast);

  const displayedList =
    activeSubTab === 'inbox'
      ? userInbox
      : activeSubTab === 'sent'
      ? userSent
      : broadcastList;

  const filteredList = displayedList.filter(
    (m) =>
      m.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.body.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.senderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.recipientName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const unreadInboxCount = userInbox.filter((m) => !m.isRead).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-cyan-600" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Internal System Communication Hub
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Send real-time notices, directives, and supply communications between Admin, Managers, Operators, Drivers, and Customers.
          </p>
        </div>

        <button
          onClick={() => setIsComposeOpen(true)}
          className="px-4 py-2 bg-cyan-700 hover:bg-cyan-800 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm transition-all cursor-pointer self-start sm:self-auto"
        >
          <Send className="w-4 h-4" /> Send / Broadcast Message
        </button>
      </div>

      {/* Tabs & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Sub-tabs */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
          <button
            onClick={() => setActiveSubTab('inbox')}
            className={`px-4 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all flex items-center gap-2 ${
              activeSubTab === 'inbox'
                ? 'bg-white text-slate-900 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Inbox className="w-3.5 h-3.5" /> Inbox
            {unreadInboxCount > 0 && (
              <span className="bg-rose-600 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                {unreadInboxCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveSubTab('sent')}
            className={`px-4 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all flex items-center gap-2 ${
              activeSubTab === 'sent'
                ? 'bg-white text-slate-900 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <SendHorizontal className="w-3.5 h-3.5" /> Sent Messages
          </button>

          <button
            onClick={() => setActiveSubTab('broadcasts')}
            className={`px-4 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all flex items-center gap-2 ${
              activeSubTab === 'broadcasts'
                ? 'bg-white text-slate-900 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Megaphone className="w-3.5 h-3.5" /> System Broadcasts
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search messages by subject or sender..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>

      </div>

      {/* Message Feed */}
      <div className="space-y-3">
        {filteredList.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-400 text-xs">
            No messages found in {activeSubTab}.
          </div>
        ) : (
          filteredList.map((msg) => {
            const isUnread = !msg.isRead && msg.recipientId === currentUser.id;

            return (
              <div
                key={msg.id}
                onClick={() => isUnread && markMessageAsRead(msg.id)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                  isUnread
                    ? 'bg-cyan-50/60 border-cyan-300 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
                      {msg.senderName.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-xs">{msg.senderName}</span>
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full capitalize font-semibold">
                          {msg.senderRole.replace('_', ' ')}
                        </span>
                        {msg.isBroadcast && (
                          <span className="text-[10px] bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                            <Megaphone className="w-3 h-3" /> Broadcast
                          </span>
                        )}
                        {msg.priority === 'urgent' && (
                          <span className="text-[10px] bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full font-bold flex items-center gap-1 animate-pulse">
                            <MailWarning className="w-3 h-3" /> URGENT
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        To: <span className="font-semibold text-slate-700">{msg.recipientName}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-slate-400 self-end sm:self-auto">
                    <span className="flex items-center gap-1 font-mono">
                      <Clock className="w-3.5 h-3.5 text-slate-400" /> {msg.timestamp}
                    </span>
                    {msg.senderId === currentUser.id && (
                      <span className="flex items-center gap-1 text-slate-500">
                        <CheckCheck className={`w-4 h-4 ${msg.isRead ? 'text-cyan-600' : 'text-slate-300'}`} />
                        {msg.isRead ? 'Read' : 'Delivered'}
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-3">
                  <h3 className="font-bold text-slate-900 text-sm">{msg.subject}</h3>
                  <p className="text-xs text-slate-600 mt-1.5 whitespace-pre-line leading-relaxed">{msg.body}</p>
                </div>

                {/* Quick Reply Button */}
                {msg.senderId !== currentUser.id && (
                  <div className="mt-3 pt-2 flex justify-end">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsComposeOpen(true);
                        setTargetType('individual');
                        setRecipientUserId(msg.senderId);
                        setMessageSubject(`Re: ${msg.subject}`);
                      }}
                      className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer"
                    >
                      <Send className="w-3 h-3" /> Quick Reply
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Compose Modal */}
      <Modal
        isOpen={isComposeOpen}
        onClose={() => setIsComposeOpen(false)}
        title="Compose Internal System Message"
        subtitle="Send direct messages or broadcast operational notices"
        maxWidth="lg"
      >
        <form onSubmit={handleComposeSubmit} className="space-y-4">
          
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Target Audience</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'individual', label: 'Specific Individual' },
                { id: 'role', label: 'Group by Role' },
                { id: 'all', label: 'System Announcement (All)' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setTargetType(opt.id as any)}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border cursor-pointer text-center ${
                    targetType === opt.id
                      ? 'bg-cyan-700 text-white border-cyan-700'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {targetType === 'individual' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Select Recipient</label>
              <select
                required
                value={recipientUserId}
                onChange={(e) => setRecipientUserId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
              >
                <option value="">-- Choose Recipient --</option>
                {users
                  .filter((u) => u.id !== currentUser.id)
                  .map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.role.replace('_', ' ')}) — 📞 {u.phone}
                    </option>
                  ))}
              </select>
            </div>
          )}

          {targetType === 'role' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Select User Role</label>
              <select
                value={recipientRole}
                onChange={(e) => setRecipientRole(e.target.value as UserRole)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
              >
                <option value="manager">All Managers</option>
                <option value="operator">All Factory Operators</option>
                <option value="driver">All Logistics Drivers</option>
                <option value="customer">All Distributors & Customers</option>
              </select>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Priority Level</label>
              <select
                value={messagePriority}
                onChange={(e) => setMessagePriority(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
              >
                <option value="normal">Normal Priority</option>
                <option value="urgent">Urgent Priority (High Alert)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Subject</label>
              <input
                type="text"
                required
                placeholder="e.g. Daily shift report review / Water production quota"
                value={messageSubject}
                onChange={(e) => setMessageSubject(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Message Content</label>
            <textarea
              required
              rows={4}
              placeholder="Type your message or directive here..."
              value={messageBody}
              onChange={(e) => setMessageBody(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsComposeOpen(false)}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-xs cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-cyan-700 hover:bg-cyan-800 text-white rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" /> Send Message
            </button>
          </div>

        </form>
      </Modal>

    </div>
  );
};
