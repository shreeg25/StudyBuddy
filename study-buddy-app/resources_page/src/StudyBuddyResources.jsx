import React, { useState, useEffect, useRef } from 'react';
import { 
  BookOpen, Brain, FileText, MessageSquare, PlayCircle, 
  CheckCircle, XCircle, Menu, Zap, GraduationCap, 
  LayoutDashboard, ArrowRight, AlertTriangle, Moon, Sun, 
  Download, Clock, Lightbulb, Save, Trash2, PenTool, Flame, Wind,
  ChevronRight, CheckCircle2, RefreshCw, AlertCircle, Loader2, Video, 
  ExternalLink, Timer, Play, Pause, RotateCcw, Layers, MessageCircle, 
  Upload, Send, Bot, User
} from 'lucide-react';

// --- MOCK DATA FALLBACKS ---
const MOCK_RECOMMENDATIONS = [
  { 
    title: "Entropy and The Second Law", type: "Video", source: "PhysicsTube", 
    desc: "A deep dive into entropy and how it dictates the direction of time.", link: "#"
  }
];

const MOCK_FLASHCARDS = [
  { front: "First Law of Thermodynamics", back: "Energy cannot be created or destroyed, only altered in form. (ΔU = Q - W)" },
  { front: "Entropy (S)", back: "A measure of the disorder or randomness in a closed system." },
  { front: "Second Law of Thermodynamics", back: "The total entropy of an isolated system can never decrease over time." }
];

export default function App() {
  // --- CORE STATE ---
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isStudyMode, setIsStudyMode] = useState(false);
  const isDarkMode = isStudyMode;

  // --- DATA STATE ---
  const [notes, setNotes] = useState("");
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // --- POMODORO STATE ---
  const [timeLeft, setTimeLeft] = useState(25 * 60); 
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerMode, setTimerMode] = useState('study'); 

  // --- FLASHCARD STATE ---
  const [flashcards, setFlashcards] = useState(MOCK_FLASHCARDS);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [isCreatingCard, setIsCreatingCard] = useState(false);
  const [newCardFront, setNewCardFront] = useState("");
  const [newCardBack, setNewCardBack] = useState("");

  // --- AI ASSISTANT & UPLOAD STATE ---
  const [chatMessages, setChatMessages] = useState([
    { role: 'model', content: "Hi! I'm your AI Study Buddy. Paste your notes here, upload a document, or ask me anything about Thermodynamics!" }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  
  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null); 
  const STUDENT_ID = "student_123";

  // --- HANDLERS ---
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const toggleStudyMode = () => { setIsStudyMode(!isStudyMode); if (!isStudyMode) setIsSidebarOpen(false); };
  const clearNotes = () => setNotes("");

  const handleAddFlashcard = () => {
    if (!newCardFront.trim() || !newCardBack.trim()) return;
    setFlashcards([...flashcards, { front: newCardFront.trim(), back: newCardBack.trim() }]);
    setNewCardFront(""); setNewCardBack("");
    setIsCreatingCard(false); setCurrentCardIndex(flashcards.length); setIsCardFlipped(false);
  };

  // --- BACKEND INTEGRATION: SAVE NOTES ---
  const handleSaveNotes = async () => {
    if (!notes.trim()) return;
    setIsSavingNotes(true);
    try {
      const response = await fetch("http://localhost:8000/api/notes", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ student_id: STUDENT_ID, content: notes })
      });
      if (!response.ok) throw new Error("Failed to save to database");
      setChatMessages(prev => [...prev, { role: 'model', content: `✅ I've backed up your notes to your dashboard!` }]);
    } catch (err) {
      const blob = new Blob([notes], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'StudyBuddy_Notes.txt'; a.click();
      setChatMessages(prev => [...prev, { role: 'model', content: `⚠️ Backend unreachable. Downloaded notes locally instead.` }]);
    } finally {
      setIsSavingNotes(false);
    }
  };

  // --- BACKEND INTEGRATION: UPLOAD FILE ---
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file); formData.append("student_id", STUDENT_ID);

    try {
      const response = await fetch("http://localhost:8000/api/upload", { method: "POST", body: formData });
      if (!response.ok) throw new Error(`Server status ${response.status}`);
      const data = await response.json();
      setChatMessages(prev => [...prev, { role: 'model', content: `✅ Successfully uploaded: **${data.filename}**.` }]);
      setNotes(prev => prev + `\n[Uploaded Document: ${data.filename}]`);
    } catch (err) {
      setChatMessages(prev => [...prev, { role: 'model', content: `❌ Error uploading: ${err.message}` }]);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // --- BACKEND INTEGRATION: AI CHAT ---
  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;
    const userMessage = chatInput.trim();
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setChatInput("");
    setIsAiLoading(true);

    const systemPrompt = `You are a helpful AI tutor. The student is studying Thermodynamics. 
    Notes/context:\n${notes}\n\nAnswer concisely.`;

    try {
      const response = await fetch("http://localhost:8000/api/chat", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: `${systemPrompt}\n\nStudent Question: ${userMessage}` })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || "Is your Python backend running?");
      }

      const data = await response.json();
      setChatMessages(prev => [...prev, { role: 'model', content: data.text }]);
    } catch (err) {
      setChatMessages(prev => [...prev, { role: 'model', content: `❌ Error connecting to backend: ${err.message}` }]);
    } finally {
      setIsAiLoading(false);
      scrollToBottom();
    }
  };

  // --- BACKEND INTEGRATION: RECOMMENDATIONS ---
  const fetchRecommendations = async () => {
    setErrorMsg(null); setLoading(true);
    try {
      const response = await fetch("http://localhost:8000/api/recommendations", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weakAreas: ["Thermodynamics", "Entropy"] })
      });
      if (!response.ok) throw new Error("Backend failed to fetch recommendations");
      const data = await response.json();
      setRecommendations(data);
    } catch (err) {
      setErrorMsg(err.message);
      setRecommendations(MOCK_RECOMMENDATIONS);
    } finally {
      setLoading(false);
    }
  };

  // --- POMODORO LOGIC ---
  useEffect(() => {
    let interval = null;
    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0) {
      if (timerMode === 'study') { setTimerMode('break'); setTimeLeft(5 * 60); } 
      else { setTimerMode('study'); setTimeLeft(25 * 60); }
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timeLeft, timerMode]);

  const toggleTimer = () => setIsTimerRunning(!isTimerRunning);
  const resetTimer = () => { setIsTimerRunning(false); setTimeLeft(timerMode === 'study' ? 25 * 60 : 5 * 60); };
  const formatTime = (sec) => `${Math.floor(sec / 60).toString().padStart(2, '0')}:${(sec % 60).toString().padStart(2, '0')}`;

  // --- EFFECTS ---
  const scrollToBottom = () => chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(() => { scrollToBottom(); }, [chatMessages]);

  useEffect(() => {
    fetchRecommendations();
    const saved = localStorage.getItem('sb_notes');
    if (saved) setNotes(saved);
  }, []);

  useEffect(() => localStorage.setItem('sb_notes', notes), [notes]);

  // --- RENDERERS ---
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="bg-slate-900 rounded-2xl p-8 text-white relative overflow-hidden shadow-xl">
              <div className="relative z-10">
                <span className="bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded uppercase">Current Focus</span>
                <h2 className="text-3xl font-bold mt-2">Physics: Thermodynamics</h2>
                <p className="text-slate-300 mt-2 max-w-lg">
                  You've mastered 45% of this unit. AI recommends focusing on <strong>Entropy</strong>.
                </p>
                <button 
                  onClick={() => setActiveTab('ai')}
                  className="mt-6 bg-emerald-500 hover:bg-emerald-400 text-white px-6 py-2 rounded-lg font-semibold transition-colors inline-flex items-center shadow-lg shadow-emerald-500/20"
                >
                  Get Resources <ChevronRight size={18} className="ml-2"/>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={`p-6 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'}`}>
                <h3 className="font-bold flex items-center mb-4"><Clock className="text-emerald-500 mr-2" size={20} /> Recent Activity</h3>
                <ul className="space-y-3 text-sm opacity-80">
                  <li className="flex items-center"><CheckCircle2 size={16} className="mr-2 text-emerald-500"/> Completed Flashcards</li>
                  <li className="flex items-center"><PlayCircle size={16} className="mr-2 text-blue-500"/> Watched "Heat Engines"</li>
                </ul>
              </div>
              <div className={`p-6 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'}`}>
                <h3 className="font-bold mb-2">Study Streak</h3>
                <div className="text-4xl font-bold text-emerald-500">12 Days</div>
                <p className="text-sm mt-2 opacity-70">Keep it up! You're on fire.</p>
              </div>
            </div>
          </div>
        );

      case 'ai':
        return (
          <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl mx-auto">
             <div className="flex justify-between items-center">
                <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>AI Recommendations</h2>
                <button onClick={fetchRecommendations} disabled={loading} className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors flex items-center disabled:opacity-50">
                    <RefreshCw size={18} className={`mr-2 ${loading ? "animate-spin" : ""}`} /> Refresh
                </button>
             </div>
             
             {errorMsg && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-start">
                    <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                    <div><p className="font-bold">Backend Error:</p><p>{errorMsg}</p></div>
                </div>
             )}

             <div className="grid gap-4">
                {loading && <div className="text-center p-8 text-slate-400 flex flex-col items-center justify-center"><Loader2 className="animate-spin mb-4 text-emerald-500" size={32}/>Fetching tailored resources...</div>}
                {!loading && recommendations.map((rec, idx) => (
                    <a key={idx} href={rec.link} target="_blank" rel="noopener noreferrer" className={`block p-4 rounded-xl border hover:border-emerald-500 transition-all cursor-pointer group ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                        <div className="flex items-start">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center mr-4 flex-shrink-0 ${rec.type === 'Video' ? 'bg-red-100 text-red-500' : 'bg-blue-100 text-blue-500'}`}>
                            {rec.type === 'Video' ? <Video size={20}/> : <FileText size={20}/>}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                            <h4 className={`font-bold text-lg truncate pr-2 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{rec.title}</h4>
                            <ExternalLink size={16} className="text-slate-400 group-hover:text-emerald-500" />
                            </div>
                            <p className={`text-sm mt-1 line-clamp-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{rec.desc}</p>
                            <span className="text-xs font-semibold text-emerald-500 mt-2 block uppercase tracking-wide">{rec.source}</span>
                        </div>
                        </div>
                    </a>
                ))}
             </div>
          </div>
        );

      case 'flashcards':
        return (
          <div className="flex flex-col items-center h-full animate-in fade-in duration-500 max-w-4xl mx-auto pt-4">
             <div className="flex justify-between items-center w-full mb-8">
               <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                 Unit: Thermodynamics ({flashcards.length > 0 ? currentCardIndex + 1 : 0}/{flashcards.length})
               </h2>
               <button 
                 onClick={() => setIsCreatingCard(!isCreatingCard)}
                 className={`px-4 py-2 rounded-lg font-bold transition-colors shadow-sm ${
                   isCreatingCard 
                     ? (isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-200 text-slate-600 hover:bg-slate-300')
                     : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-500/20'
                 }`}
               >
                 {isCreatingCard ? "Cancel" : "+ Create Card"}
               </button>
             </div>
             
             {isCreatingCard ? (
               <div className={`w-full max-w-2xl rounded-3xl p-8 border-2 shadow-xl transition-all duration-300 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                 <h3 className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Create New Flashcard</h3>
                 <div className="space-y-4">
                   <div>
                     <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Front (Question)</label>
                     <input 
                       type="text" value={newCardFront} onChange={(e) => setNewCardFront(e.target.value)}
                       className={`w-full p-3 rounded-xl outline-none focus:ring-2 ring-emerald-500/50 border ${isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'}`}
                       placeholder="e.g., What is absolute zero?"
                     />
                   </div>
                   <div>
                     <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Back (Answer)</label>
                     <textarea 
                       value={newCardBack} onChange={(e) => setNewCardBack(e.target.value)}
                       className={`w-full p-3 rounded-xl outline-none focus:ring-2 ring-emerald-500/50 border resize-none h-24 ${isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'}`}
                       placeholder="e.g., 0 Kelvin, the lowest limit of the thermodynamic temperature scale."
                     />
                   </div>
                   <div className="flex justify-end pt-4">
                     <button onClick={handleAddFlashcard} disabled={!newCardFront.trim() || !newCardBack.trim()} className="px-6 py-2.5 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition-colors disabled:opacity-50">
                       Save Flashcard
                     </button>
                   </div>
                 </div>
               </div>
             ) : (
               <>
                 {flashcards.length > 0 ? (
                   <>
                     <div onClick={() => setIsCardFlipped(!isCardFlipped)} className={`w-full max-w-2xl h-80 rounded-3xl cursor-pointer perspective-1000 transition-all duration-300 shadow-xl flex items-center justify-center p-10 text-center border-2 ${isDarkMode ? 'bg-slate-800 border-slate-700 hover:border-emerald-500/50' : 'bg-white border-slate-200 hover:border-emerald-400'}`}>
                       <div className="animate-in fade-in zoom-in-95 duration-300">
                         {isCardFlipped ? (
                            <div>
                              <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest mb-4 block">Answer</span>
                              <p className={`text-2xl font-medium ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>{flashcards[currentCardIndex].back}</p>
                            </div>
                         ) : (
                            <div>
                              <span className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-4 block">Question</span>
                              <p className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{flashcards[currentCardIndex].front}</p>
                            </div>
                         )}
                       </div>
                     </div>
                     <div className="flex items-center space-x-6 mt-10">
                        <button onClick={() => { setCurrentCardIndex(Math.max(0, currentCardIndex - 1)); setIsCardFlipped(false); }} disabled={currentCardIndex === 0} className="p-3 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 disabled:opacity-50 transition-colors">
                          <ChevronRight size={24} className="rotate-180"/>
                        </button>
                        <button onClick={() => setIsCardFlipped(!isCardFlipped)} className="px-6 py-3 rounded-xl bg-emerald-500 text-white font-bold hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20">Flip Card</button>
                        <button onClick={() => { setCurrentCardIndex(Math.min(flashcards.length - 1, currentCardIndex + 1)); setIsCardFlipped(false); }} disabled={currentCardIndex === flashcards.length - 1} className="p-3 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 disabled:opacity-50 transition-colors">
                          <ChevronRight size={24}/>
                        </button>
                     </div>
                   </>
                 ) : (
                    <div className="flex flex-col items-center justify-center p-12 mt-8 rounded-3xl border-2 border-dashed border-slate-300 dark:border-slate-700 text-center">
                      <Layers size={48} className="text-slate-400 mb-4" />
                      <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>No Flashcards Yet</h3>
                    </div>
                 )}
               </>
             )}
          </div>
        );

      case 'assistant':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full pb-4 animate-in fade-in duration-500">
            {/* Left Col: Notes / Resources */}
            <div className={`flex flex-col rounded-2xl border overflow-hidden ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-sm`}>
              <div className={`p-4 border-b flex justify-between items-center ${isDarkMode ? 'border-slate-800 bg-slate-950/50' : 'border-slate-100 bg-slate-50'}`}>
                <h3 className={`font-bold flex items-center ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                   <FileText size={18} className="mr-2 text-blue-500"/> My Resources & Notes
                </h3>
                <div className="flex space-x-2">
                  <button onClick={handleSaveNotes} disabled={isSavingNotes || !notes.trim()} className={`p-2 rounded-lg transition-colors flex items-center ${isSavingNotes ? 'text-emerald-500' : 'text-slate-400 hover:text-emerald-500'}`} title="Save Notes">
                    {isSavingNotes ? <Loader2 size={16} className="animate-spin" /> : <Save size={16}/>}
                  </button>
                  <button onClick={clearNotes} className="p-2 text-slate-400 hover:text-red-500 rounded-lg transition-colors" title="Clear Notes"><Trash2 size={16}/></button>
                  
                  <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".pdf,.txt,.doc,.docx,.png,.jpg" />
                  <button onClick={() => fileInputRef.current?.click()} disabled={isUploading} className={`p-2 rounded-lg transition-colors flex items-center ${isUploading ? 'text-emerald-500' : 'text-slate-400 hover:text-emerald-500'}`} title="Upload Resource">
                    {isUploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16}/>} 
                    <span className="text-xs ml-1 hidden sm:inline">{isUploading ? 'Uploading...' : 'Upload'}</span>
                  </button>
                </div>
              </div>
              <textarea 
                value={notes} onChange={(e) => setNotes(e.target.value)}
                className={`flex-1 w-full p-6 resize-none outline-none custom-scrollbar ${isDarkMode ? 'bg-transparent text-slate-300 placeholder-slate-600' : 'bg-transparent text-slate-700 placeholder-slate-400'}`}
                placeholder="Type your notes here! The AI automatically reads this context in real-time."
              />
            </div>

            {/* Right Col: AI Chat */}
            <div className={`flex flex-col rounded-2xl border overflow-hidden ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-sm`}>
              <div className={`p-4 border-b ${isDarkMode ? 'border-slate-800 bg-slate-950/50' : 'border-slate-100 bg-slate-50'}`}>
                 <h3 className={`font-bold flex items-center ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                   <Bot size={18} className="mr-2 text-emerald-500"/> AI Study Assistant
                 </h3>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-2xl p-4 flex gap-3 ${msg.role === 'user' ? 'bg-emerald-500 text-white rounded-tr-sm' : isDarkMode ? 'bg-slate-800 text-slate-200 rounded-tl-sm' : 'bg-slate-100 text-slate-800 rounded-tl-sm'}`}>
                      {msg.role === 'model' && <Bot size={20} className="shrink-0 mt-1 opacity-70"/>}
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                ))}
                {isAiLoading && (
                  <div className="flex justify-start">
                    <div className={`rounded-2xl p-4 rounded-tl-sm flex items-center space-x-2 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
                      <Loader2 size={16} className="animate-spin text-emerald-500" />
                      <span className="text-sm text-slate-400">Thinking...</span>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              <div className={`p-4 border-t ${isDarkMode ? 'border-slate-800 bg-slate-900' : 'border-slate-100 bg-white'}`}>
                <div className={`flex items-center rounded-xl border p-1 pl-4 focus-within:ring-2 ring-emerald-500/50 ${isDarkMode ? 'border-slate-700 bg-slate-950' : 'border-slate-200 bg-white'}`}>
                  <input 
                    type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Ask a question..."
                    className={`flex-1 bg-transparent border-none outline-none text-sm p-2 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}
                  />
                  <button onClick={handleSendMessage} disabled={isAiLoading || !chatInput.trim()} className="p-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50 transition-colors m-1">
                    <Send size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className={`flex h-screen font-sans transition-colors duration-500 ${isStudyMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
      <aside className={`bg-slate-900 text-white flex flex-col transition-all duration-300 z-20 overflow-hidden border-r border-slate-800 ${isSidebarOpen ? 'w-72' : 'w-20'}`}>
        <div className="h-24 flex items-center justify-center border-b border-slate-800 bg-slate-950">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20"><Brain className="text-white" size={24} /></div>
            {isSidebarOpen && <span className="ml-3 text-2xl font-bold tracking-tight text-white">Study<span className="text-emerald-400">Buddy</span></span>}
        </div>
        <nav className="flex-1 px-4 mt-8 space-y-2">
          {[
            { id: 'dashboard', icon: <LayoutDashboard size={22}/>, label: 'Dashboard' },
            { id: 'ai', icon: <Lightbulb size={22}/>, label: 'AI Resources' },
            { id: 'flashcards', icon: <Layers size={22}/>, label: 'Flashcards' },
            { id: 'assistant', icon: <MessageCircle size={22}/>, label: 'AI Assistant' }
          ].map((item) => (
            <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center px-4 py-4 rounded-xl transition-all duration-200 ${activeTab === item.id ? 'bg-emerald-500 text-white font-semibold' : 'text-slate-400 hover:bg-slate-800'}`}>
              {item.icon}{isSidebarOpen && <span className="ml-3 text-sm">{item.label}</span>}
            </button>
          ))}
        </nav>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className={`h-20 flex items-center justify-between px-8 border-b ${isStudyMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center">
            <button onClick={toggleSidebar} className="p-2 text-slate-500"><Menu size={24} /></button>
            <h1 className={`ml-6 text-xl font-bold capitalize ${isStudyMode ? "text-slate-100" : "text-slate-800"}`}>{activeTab === 'ai' ? 'AI Resources' : activeTab}</h1>
          </div>
          
          <div className="flex items-center space-x-6">
            {/* Pomodoro Timer */}
            <div className={`flex items-center space-x-4 px-4 py-2 rounded-xl border ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
               <div className="flex items-center text-emerald-500 font-mono font-bold text-lg">
                 <Timer size={18} className="mr-2" />
                 {formatTime(timeLeft)}
               </div>
               <div className="flex items-center space-x-2 border-l pl-4 border-slate-300 dark:border-slate-700">
                  <button onClick={toggleTimer} className="text-slate-500 hover:text-emerald-500 transition-colors">
                    {isTimerRunning ? <Pause size={18}/> : <Play size={18}/>}
                  </button>
                  <button onClick={resetTimer} className="text-slate-500 hover:text-emerald-500 transition-colors">
                    <RotateCcw size={18}/>
                  </button>
               </div>
            </div>

            <button onClick={toggleStudyMode} className={`flex items-center px-5 py-2.5 rounded-full font-bold text-sm border transition-colors ${isStudyMode ? 'bg-slate-800 text-emerald-400 border-emerald-500/30' : 'bg-slate-100 text-slate-600 border-transparent hover:bg-slate-200'}`}>
              <Zap size={16} className={`mr-2 ${isStudyMode ? 'fill-emerald-400' : 'text-slate-400'}`} /> {isStudyMode ? "Focus Mode: ON" : "Focus Mode: OFF"}
            </button>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-8 max-w-6xl mx-auto w-full">{renderContent()}</div>
      </main>
    </div>
  );
}