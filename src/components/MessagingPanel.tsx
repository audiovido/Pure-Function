import React, { useState } from 'react';
import {
  MessageSquare,
  Send,
  Video,
  Dumbbell,
  Megaphone,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react';
import { ClientProfile, DirectMessage, ThemeMode } from '../types';

interface MessagingPanelProps {
  client: ClientProfile;
  allClients?: ClientProfile[];
  onSelectClient?: (clientId: string) => void;
  mode: 'trainer' | 'client';
  messages: DirectMessage[];
  onSendMessage: (
    text: string,
    options?: { videoUrl?: string; exerciseTag?: string; broadcastAll?: boolean }
  ) => void;
  theme?: ThemeMode;
}

export const MessagingPanel: React.FC<MessagingPanelProps> = ({
  client,
  allClients = [],
  onSelectClient,
  mode,
  messages,
  onSendMessage,
  theme = 'dark',
}) => {
  const isDark = theme === 'dark';
  const [text, setText] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [exerciseTag, setExerciseTag] = useState('');
  const [showAttachFields, setShowAttachFields] = useState(false);
  const [broadcastAll, setBroadcastAll] = useState(false);
  const [sentNotice, setSentNotice] = useState<string | null>(null);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    onSendMessage(text.trim(), {
      videoUrl: videoUrl.trim() || undefined,
      exerciseTag: exerciseTag.trim() || undefined,
      broadcastAll: mode === 'trainer' && broadcastAll,
    });

    if (mode === 'trainer' && broadcastAll) {
      setSentNotice(`Broadcast sent to all ${allClients.length} athletes`);
      setTimeout(() => setSentNotice(null), 2400);
    }

    setText('');
    setVideoUrl('');
    setExerciseTag('');
    setShowAttachFields(false);
    setBroadcastAll(false);
  };

  return (
    <div
      className={`rounded-2xl border overflow-hidden flex flex-col ${
        isDark
          ? 'bg-[#141822]/90 border-neutral-800'
          : 'bg-slate-50/90 border-neutral-200'
      }`}
    >
      {/* Top Bar */}
      <div
        className={`p-3.5 sm:p-4 border-b flex items-center justify-between flex-wrap gap-3 ${
          isDark
            ? 'bg-[#161b26] border-neutral-800'
            : 'bg-white border-neutral-200'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-400/10 border border-amber-400/30 text-amber-400 flex items-center justify-center shrink-0">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold leading-tight">
              {mode === 'trainer'
                ? `Direct Coaching Thread · ${client.name}`
                : `Direct Message with Coach ${client.coach || 'Marcus Vance, CSCS'}`}
            </h3>
            <p
              className={`text-xs ${
                isDark ? 'text-neutral-400' : 'text-neutral-500'
              }`}
            >
              {mode === 'trainer'
                ? `${client.currentProgram} · Form checks & daily feedback`
                : 'Ask technique questions, share form-check videos, or report recovery'}
            </p>
          </div>
        </div>

        {/* Trainer Quick Client Switcher in Inbox */}
        {mode === 'trainer' && allClients.length > 1 && onSelectClient && (
          <select
            value={client.id}
            onChange={(e) => onSelectClient(e.target.value)}
            aria-label="Switch athlete conversation"
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold outline-none cursor-pointer ${
              isDark
                ? 'bg-[#11141d] border-neutral-700 text-amber-400'
                : 'bg-slate-100 border-neutral-300 text-neutral-900'
            }`}
          >
            {allClients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.membershipStatus})
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Message History Feed */}
      <div className="p-4 space-y-3 max-h-[380px] overflow-y-auto">
        {messages.length === 0 ? (
          <div
            className={`text-center py-8 text-xs ${
              isDark ? 'text-neutral-500' : 'text-neutral-400'
            }`}
          >
            No messages yet. Start the coaching conversation below.
          </div>
        ) : (
          messages.map((msg) => {
            const isOwnMessage = msg.senderRole === mode;
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  isOwnMessage ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`max-w-xl rounded-2xl p-3.5 border space-y-1.5 ${
                    isOwnMessage
                      ? isDark
                        ? 'bg-amber-400/15 border-amber-400/40 text-slate-100'
                        : 'bg-amber-50 border-amber-300 text-neutral-900'
                      : isDark
                      ? 'bg-[#191e2b] border-neutral-800 text-slate-100'
                      : 'bg-white border-neutral-200 text-neutral-900'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4 text-[11px]">
                    <span className="font-bold text-amber-500">
                      {msg.senderName}
                      {msg.isBroadcast ? ' · Roster Broadcast' : ''}
                    </span>
                    <span
                      className={`font-mono ${
                        isDark ? 'text-neutral-400' : 'text-neutral-500'
                      }`}
                    >
                      {msg.timestamp}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm leading-relaxed">
                    {msg.text}
                  </p>

                  {(msg.exerciseTag || msg.videoUrl) && (
                    <div className="pt-1.5 flex items-center flex-wrap gap-3 text-xs">
                      {msg.exerciseTag && (
                        <span
                          className={`inline-flex items-center gap-1 font-semibold ${
                            isDark ? 'text-neutral-300' : 'text-neutral-700'
                          }`}
                        >
                          <Dumbbell className="w-3 h-3 text-amber-400" />
                          <span>Movement: {msg.exerciseTag}</span>
                        </span>
                      )}
                      {msg.videoUrl && (
                        <a
                          href={msg.videoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-amber-400 hover:underline font-semibold"
                        >
                          <Video className="w-3 h-3" />
                          <span>Form Check Video</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Composer */}
      <form
        onSubmit={handleSend}
        className={`p-3.5 sm:p-4 border-t space-y-2.5 ${
          isDark
            ? 'bg-[#161b26] border-neutral-800'
            : 'bg-white border-neutral-200'
        }`}
      >
        {showAttachFields && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <input
              type="text"
              placeholder="Movement tag (e.g. Bulgarian Split Squat)"
              value={exerciseTag}
              onChange={(e) => setExerciseTag(e.target.value)}
              className={`px-3 py-2 rounded-xl border text-xs outline-none ${
                isDark
                  ? 'bg-[#11141d] border-neutral-700 text-white'
                  : 'bg-slate-50 border-neutral-300 text-neutral-900'
              }`}
            />
            <input
              type="url"
              placeholder="Form check video URL (YouTube / Loom / Drive)"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              className={`px-3 py-2 rounded-xl border text-xs outline-none ${
                isDark
                  ? 'bg-[#11141d] border-neutral-700 text-white'
                  : 'bg-slate-50 border-neutral-300 text-neutral-900'
              }`}
            />
          </div>
        )}

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowAttachFields((prev) => !prev)}
            title="Attach movement tag or form-check video link"
            className={`px-2.5 py-2.5 rounded-xl border text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 ${
              showAttachFields
                ? 'bg-amber-400 text-black border-amber-400 font-bold'
                : isDark
                ? 'bg-[#11141d] border-neutral-700 text-neutral-300 hover:text-white'
                : 'bg-slate-100 border-neutral-300 text-neutral-700 hover:text-black'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Form Check</span>
          </button>

          {mode === 'trainer' && (
            <button
              type="button"
              onClick={() => setBroadcastAll((prev) => !prev)}
              title="Broadcast message to all clients on roster"
              className={`px-2.5 py-2.5 rounded-xl border text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 ${
                broadcastAll
                  ? 'bg-amber-400 text-black border-amber-400 font-bold'
                  : isDark
                  ? 'bg-[#11141d] border-neutral-700 text-neutral-300 hover:text-white'
                  : 'bg-slate-100 border-neutral-300 text-neutral-700 hover:text-black'
              }`}
            >
              <Megaphone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Broadcast</span>
            </button>
          )}

          <input
            type="text"
            placeholder={
              mode === 'trainer'
                ? broadcastAll
                  ? 'Write announcement to broadcast to all clients...'
                  : `Message ${client.name}...`
                : 'Write a message or workout note to your coach...'
            }
            value={text}
            onChange={(e) => setText(e.target.value)}
            className={`flex-1 px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm outline-none ${
              isDark
                ? 'bg-[#11141d] border-neutral-700 focus:border-amber-400 text-white'
                : 'bg-slate-50 border-neutral-300 focus:border-amber-500 text-neutral-900'
            }`}
          />

          <button
            type="submit"
            className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs cursor-pointer flex items-center gap-1.5 shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send</span>
          </button>
        </div>

        {sentNotice && (
          <div className="text-xs text-emerald-400 flex items-center gap-1.5 pt-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{sentNotice}</span>
          </div>
        )}
      </form>
    </div>
  );
};
