import { ArrowLeft, Check, CheckCheck, FileVideo, Image, LoaderCircle, Mic, Palette, Paperclip, Send, Smile, StopCircle } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import Alert from '../components/Alert';
import SafetyActions from '../components/SafetyActions';
import matchService from '../services/matchService';
import messageService from '../services/messageService';
import { getSocket } from '../services/socket';
import { getApiError } from '../utils/apiError';

const time = (date) => new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(new Date(date));
const chatThemes = { coral: 'from-rose-400 to-orange-400', violet: 'from-pink-500 to-purple-600', ocean: 'from-sky-400 to-cyan-500', mint: 'from-emerald-400 to-teal-500' };
const emojis = ['😊', '😂', '😍', '🥰', '😘', '❤️', '🔥', '✨', '👍', '🙏', '😎', '😭', '🤔', '🎉', '💜', '🌹'];
const statusLabel = (message) => message.readAt ? 'Read' : message.deliveredAt ? 'Delivered' : 'Sent';
const mediaUrl = (url = '') => url.replace('http://localhost:5000', '').replace('http://127.0.0.1:5000', '');

export default function ChatPage() {
  const { matchId: chatId } = useParams();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const [match, setMatch] = useState(null);
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [typing, setTyping] = useState(false);
  const [online, setOnline] = useState(false);
  const [error, setError] = useState('');
  const [chatTheme, setChatTheme] = useState(localStorage.getItem('cybernest_chat_theme') || 'coral');
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [gifOpen, setGifOpen] = useState(false);
  const [gifUrl, setGifUrl] = useState('');
  const [recording, setRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [voiceLevels, setVoiceLevels] = useState(Array(36).fill(10));
  const bottomRef = useRef(null);
  const typingTimer = useRef(null);
  const fileRef = useRef(null);
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const audioContextRef = useRef(null);
  const animationRef = useRef(null);
  const recordingTimerRef = useRef(null);
  const streamRef = useRef(null);
  const shouldUploadVoiceRef = useRef(true);

  const load = useCallback(async () => {
    try {
      const [messagesData, matchesData] = await Promise.all([messageService.getMessages(chatId), matchService.getMatches()]);
      setMessages(messagesData.messages);
      setConversation(messagesData.conversation);
      setMatch(matchesData.matches.find((item) => item._id === messagesData.match?._id || item.conversation?._id === chatId));
    } catch (requestError) { setError(getApiError(requestError)); }
  }, [chatId]);
  useEffect(() => { load(); }, [load]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, typing]);

  useEffect(() => {
    const socket = getSocket();
    socket.emit('match:join', { conversationId: conversation?._id || chatId, matchId: match?._id });
    socket.emit('messages:read', { conversationId: conversation?._id || chatId, matchId: match?._id });
    const newMessage = (message) => {
      if (String(message.conversationId) !== String(conversation?._id || chatId) && String(message.matchId) !== String(match?._id)) return;
      setMessages((items) => items.some((item) => item._id === message._id) ? items : [...items, message]);
      if (String(message.receiverId) === String(user.id)) socket.emit('messages:read', { conversationId: conversation?._id || chatId, matchId: match?._id });
    };
    const typingUpdate = (event) => {
      if ((event.conversationId === String(conversation?._id || chatId) || event.matchId === String(match?._id)) && String(event.userId) !== String(user.id)) setTyping(event.isTyping);
    };
    const seen = ({ matchId: seenMatch, readAt }) => {
      if (seenMatch === String(match?._id)) setMessages((items) => items.map((message) => String(message.senderId) === String(user.id) ? { ...message, readAt } : message));
    };
    const delivered = ({ matchId: deliveredMatch, deliveredAt }) => {
      if (deliveredMatch === String(match?._id)) setMessages((items) => items.map((message) => String(message.senderId) === String(user.id) && !message.deliveredAt ? { ...message, deliveredAt } : message));
    };
    const presenceList = (ids) => { if (match?.otherUserId) setOnline(ids.map(String).includes(String(match.otherUserId))); };
    const presenceUpdate = ({ userId, online: isOnline }) => { if (String(userId) === String(match?.otherUserId)) setOnline(isOnline); };
    socket.on('message:new', newMessage);
    socket.on('typing:update', typingUpdate);
    socket.on('messages:seen', seen);
    socket.on('messages:delivered', delivered);
    socket.on('presence:list', presenceList);
    socket.on('presence:update', presenceUpdate);
    return () => {
      socket.off('message:new', newMessage);
      socket.off('typing:update', typingUpdate);
      socket.off('messages:seen', seen);
      socket.off('messages:delivered', delivered);
      socket.off('presence:list', presenceList);
      socket.off('presence:update', presenceUpdate);
    };
  }, [chatId, conversation?._id, match?._id, match?.otherUserId, user.id]);

  const setTheme = (theme) => { setChatTheme(theme); localStorage.setItem('cybernest_chat_theme', theme); };
  const changeText = (value) => {
    setText(value);
    const socket = getSocket();
    socket.emit('typing:start', { conversationId: conversation?._id || chatId, matchId: match?._id });
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => socket.emit('typing:stop', { conversationId: conversation?._id || chatId, matchId: match?._id }), 900);
  };
  const sendSocketText = (body) => {
    const socket = getSocket();
    socket.emit('typing:stop', { conversationId: conversation?._id || chatId, matchId: match?._id });
    socket.emit('message:send', { conversationId: conversation?._id || chatId, matchId: match?._id, text: body }, (result) => {
      if (!result?.success) setError(result?.error || 'Unable to send message');
    });
  };
  const send = (event) => {
    event.preventDefault();
    if (!text.trim()) return;
    const body = text.trim();
    setText('');
    clearTimeout(typingTimer.current);
    sendSocketText(body);
  };
  const sendGif = () => {
    if (!gifUrl.trim()) return;
    sendSocketText(`GIF: ${gifUrl.trim()}`);
    setGifUrl('');
    setGifOpen(false);
  };
  const uploadFiles = async (files) => {
    if (!files?.length) return;
    const formData = new FormData();
    formData.append('conversationId', conversation?._id || chatId);
    if (match?._id) formData.append('matchId', match._id);
    [...files].slice(0, 6).forEach((file) => formData.append('media', file));
    try {
      const response = await messageService.uploadMedia(formData);
      setMessages((items) => items.some((item) => item._id === response.message._id) ? items : [...items, response.message]);
    } catch (requestError) { setError(getApiError(requestError)); }
    finally { if (fileRef.current) fileRef.current.value = ''; }
  };
  const cleanupVoiceVisualizer = () => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    animationRef.current = null;
    clearInterval(recordingTimerRef.current);
    recordingTimerRef.current = null;
    audioContextRef.current?.close?.();
    audioContextRef.current = null;
  };
  const startVoice = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];
      setRecordingSeconds(0);
      setVoiceLevels(Array(36).fill(10));
      const recorder = new MediaRecorder(stream);
      recorderRef.current = recorder;
      shouldUploadVoiceRef.current = true;
      recorder.ondataavailable = (event) => { if (event.data.size > 0) chunksRef.current.push(event.data); };
      recorder.onstop = async () => {
        cleanupVoiceVisualizer();
        stream.getTracks().forEach((track) => track.stop());
        if (!shouldUploadVoiceRef.current || !chunksRef.current.length) return;
        const file = new File([new Blob(chunksRef.current, { type: 'audio/webm' })], `voice-${Date.now()}.webm`, { type: 'audio/webm' });
        await uploadFiles([file]);
      };
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.72;
      audioContext.createMediaStreamSource(stream).connect(analyser);
      const dataArray = new Uint8Array(analyser.fftSize);
      const tick = () => {
        analyser.getByteTimeDomainData(dataArray);
        const bars = Array.from({ length: 36 }, (_, index) => {
          const start = Math.floor((index / 36) * dataArray.length);
          const end = Math.floor(((index + 1) / 36) * dataArray.length);
          let peak = 0;
          for (let cursor = start; cursor < end; cursor += 1) {
            peak = Math.max(peak, Math.abs((dataArray[cursor] || 128) - 128));
          }
          const boosted = Math.min(1, (peak / 48) ** 0.75);
          return Math.max(10, Math.round(10 + boosted * 58));
        });
        setVoiceLevels(bars);
        animationRef.current = requestAnimationFrame(tick);
      };
      tick();
      recordingTimerRef.current = setInterval(() => setRecordingSeconds((value) => value + 1), 1000);
      recorder.start();
      setRecording(true);
    } catch { setError('Microphone permission is needed to record voice notes.'); }
  };
  const stopVoice = () => { recorderRef.current?.stop(); setRecording(false); };
  const cancelVoice = () => {
    shouldUploadVoiceRef.current = false;
    cleanupVoiceVisualizer();
    chunksRef.current = [];
    recorderRef.current?.state === 'recording' && recorderRef.current.stop();
    recorderRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setRecording(false);
    setRecordingSeconds(0);
    setVoiceLevels(Array(36).fill(10));
  };
  const recordingLabel = `${String(Math.floor(recordingSeconds / 60)).padStart(2, '0')}:${String(recordingSeconds % 60).padStart(2, '0')}`;

  if (!match && !error) return <div className="flex min-h-screen items-center justify-center"><LoaderCircle className="animate-spin text-coral-400" /></div>;

  return (
    <section className="mx-auto flex h-screen max-w-4xl flex-col px-0 pt-16 sm:px-4 sm:pt-20">
      <div className="flex items-center gap-3 border-b border-coral-100 bg-white/85 px-4 py-3 text-slate-800 shadow-soft backdrop-blur sm:rounded-t-3xl sm:border">
        <button onClick={() => navigate('/connections')} className="rounded-full p-2 text-slate-500 hover:bg-coral-50"><ArrowLeft size={20} /></button>
        {match?.photo ? <img src={match.photo.imageUrl} alt="" className="h-11 w-11 rounded-full object-cover" /> : <div className="h-11 w-11 rounded-full bg-coral-gradient" />}
        <div><h1 className="font-semibold">{match?.profile?.firstName}</h1><p className={`text-xs ${online ? 'text-emerald-500' : 'text-slate-400'}`}>{typing ? 'typing…' : online ? 'online' : 'offline'}</p></div>
        <div className="ml-auto hidden items-center gap-1 rounded-full bg-coral-50 p-1 sm:flex">
          <Palette size={15} className="mx-1 text-coral-400" />
          {Object.keys(chatThemes).map((theme) => <button key={theme} onClick={() => setTheme(theme)} className={`h-5 w-5 rounded-full bg-gradient-to-br ${chatThemes[theme]} ${chatTheme === theme ? 'ring-2 ring-coral-400 ring-offset-2' : ''}`} title={`${theme} theme`} />)}
        </div>
        {match?.otherUserId && <SafetyActions compact userId={match.otherUserId} onBlocked={() => navigate('/connections')} />}
      </div>
      <div className="px-4 pt-3"><Alert>{error}</Alert></div>
      <div className="flex-1 space-y-3 overflow-y-auto bg-gradient-to-b from-rose-50/80 to-orange-50/70 px-4 py-5 text-slate-800 sm:border-x sm:border-coral-100">
        {messages.map((message) => {
          const own = String(message.senderId) === String(user.id);
          return (
            <div key={message._id} className={`flex ${own ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[78%] rounded-3xl px-4 py-2.5 shadow-soft ${own ? `rounded-br-md bg-gradient-to-r ${chatThemes[chatTheme]} text-white` : 'rounded-bl-md bg-white text-slate-700'}`}>
                {!!message.attachments?.length && <div className="mb-2 space-y-2">{message.attachments.map((file) => {
                  const src = mediaUrl(file.url);
                  return <a key={file.url} href={src} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-2xl bg-black/5">
                    {file.kind === 'image' && <img src={src} alt={file.originalName} className="max-h-72 w-full object-cover" />}
                    {file.kind === 'video' && <video src={src} controls className="max-h-72 w-full" />}
                    {file.kind === 'audio' && <audio src={src} controls className="w-full p-2" />}
                    {!['image', 'video', 'audio'].includes(file.kind) && <span className="flex items-center gap-2 p-3 text-sm"><Paperclip size={16} /> {file.originalName || 'Download file'}</span>}
                  </a>;
                })}</div>}
                {(message.text || (message.message && message.message !== '[Media]')) && (
                  String(message.text || message.message).startsWith('GIF: ')
                    ? <img src={String(message.text || message.message).replace('GIF: ', '')} alt="GIF" className="max-h-72 rounded-2xl object-cover" />
                    : <p className="whitespace-pre-wrap break-words text-sm">{message.text || message.message}</p>
                )}
                <div className={`mt-1 flex items-center justify-end gap-1 text-[10px] ${own ? 'text-white/75' : 'text-slate-400'}`}><span>{time(message.createdAt)}</span>{own && <><span>{statusLabel(message)}</span>{message.readAt || message.deliveredAt ? <CheckCheck size={13} /> : <Check size={13} />}</>}</div>
              </div>
            </div>
          );
        })}
        {typing && <div className="w-fit rounded-2xl rounded-bl-md bg-white px-4 py-2 text-sm text-slate-400 shadow-soft">typing…</div>}
        <div ref={bottomRef} />
      </div>
      {recording && (
        <div className="border-t border-coral-100 bg-white/95 px-4 py-3 sm:border-x sm:border-coral-100">
          <div className="flex flex-wrap items-center gap-3 rounded-3xl border border-rose-200 bg-rose-50 px-4 py-3 text-slate-900 shadow-soft sm:flex-nowrap">
            <span className="relative flex h-4 w-4">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
              <span className="relative inline-flex h-4 w-4 rounded-full bg-rose-500" />
            </span>
            <span className="min-w-12 font-mono text-sm font-bold text-rose-600">{recordingLabel}</span>
            <div className="relative flex h-16 min-w-[220px] flex-1 items-center justify-center gap-1 overflow-hidden rounded-2xl bg-white px-4 shadow-inner">
              <span className="absolute left-4 right-4 top-1/2 h-px -translate-y-1/2 bg-rose-100" />
              {voiceLevels.map((level, index) => (
                <span key={index} className="relative z-10 w-1.5 rounded-full bg-gradient-to-t from-rose-500 via-orange-400 to-rose-500 transition-all duration-75" style={{ height: `${level}px` }} />
              ))}
            </div>
            <button type="button" onClick={cancelVoice} className="rounded-2xl px-3 py-2 text-sm font-bold text-slate-500 hover:bg-white">Cancel</button>
            <button type="button" onClick={stopVoice} className="rounded-2xl bg-rose-500 px-4 py-2 text-sm font-bold text-white">Send voice</button>
          </div>
        </div>
      )}
      <form onSubmit={send} className="relative flex gap-2 border-t border-coral-100 bg-white/90 p-3 sm:rounded-b-3xl sm:border">
        <input ref={fileRef} type="file" multiple accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip" className="hidden" onChange={(event) => uploadFiles(event.target.files)} />
        <button type="button" onClick={() => setEmojiOpen((value) => !value)} className="flex h-12 w-12 items-center justify-center rounded-2xl bg-coral-50 text-coral-500"><Smile size={19} /></button>
        {emojiOpen && <div className="absolute bottom-16 left-3 z-20 grid w-56 grid-cols-8 gap-1 rounded-2xl border border-coral-100 bg-white p-3 shadow-2xl">{emojis.map((emoji) => <button type="button" key={emoji} onClick={() => { changeText(`${text}${emoji}`); setEmojiOpen(false); }} className="rounded-lg p-1 text-xl hover:bg-coral-50">{emoji}</button>)}</div>}
        <button type="button" onClick={() => fileRef.current?.click()} className="flex h-12 w-12 items-center justify-center rounded-2xl bg-coral-50 text-coral-500" title="Attach media/files"><Image size={19} /></button>
        <button type="button" onClick={() => fileRef.current?.click()} className="hidden h-12 w-12 items-center justify-center rounded-2xl bg-coral-50 text-coral-500 sm:flex" title="Send video"><FileVideo size={19} /></button>
        <button type="button" onClick={() => setGifOpen((value) => !value)} className="hidden h-12 items-center justify-center rounded-2xl bg-coral-50 px-3 text-xs font-bold text-coral-500 sm:flex">GIF</button>
        {gifOpen && <div className="absolute bottom-16 left-1/2 z-20 flex w-[min(92vw,520px)] -translate-x-1/2 gap-2 rounded-2xl border border-coral-100 bg-white p-3 shadow-2xl"><input value={gifUrl} onChange={(event) => setGifUrl(event.target.value)} placeholder="Paste a GIF URL..." className="input" /><button type="button" onClick={sendGif} className="rounded-2xl bg-coral-gradient px-4 font-bold text-white">Send</button></div>}
        <input value={text} onChange={(event) => changeText(event.target.value)} maxLength={2000} placeholder="Write a message…" className="input min-w-0 flex-1" />
        <button type="button" onClick={recording ? stopVoice : startVoice} className={`flex h-12 w-12 items-center justify-center rounded-2xl ${recording ? 'bg-rose-500 text-white' : 'bg-coral-50 text-coral-500'}`} title={recording ? 'Stop and send recording' : 'Record voice'}>{recording ? <StopCircle size={20} /> : <Mic size={19} />}</button>
        <button type="submit" disabled={!text.trim()} className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${chatThemes[chatTheme]} text-white disabled:opacity-40`}><Send size={19} /></button>
      </form>
    </section>
  );
}
