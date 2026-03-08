import React, { useState, useEffect, useRef } from 'react';
import { 
  BookOpen, Brain, FileText, MessageSquare, PlayCircle, 
  CheckCircle, XCircle, Menu, Zap, GraduationCap, 
  LayoutDashboard, ArrowRight, AlertTriangle, Moon, Sun, 
  Download, Clock, Lightbulb, Save, Trash2, PenTool, Flame, Wind,
  ChevronRight, CheckCircle2, RefreshCw, AlertCircle, Loader2, Video, 
  ExternalLink, Timer, Play, Pause, RotateCcw, Layers, MessageCircle, 
  Upload, Send, Bot, User, BarChart3, Trophy, Users, Building, Settings, Target, Mail
} from 'lucide-react';

// --- MOCK DATA FALLBACKS ---
const MOCK_RECOMMENDATIONS = [
  { title: "Entropy and The Second Law", type: "Video", source: "PhysicsTube", desc: "A deep dive into entropy and how it dictates the direction of time.", link: "#" }
];
const MOCK_FLASHCARDS = [
  { front: "First Law of Thermodynamics", back: "Energy cannot be created or destroyed, only altered in form. (ΔU = Q - W)" },
  { front: "Entropy (S)", back: "A measure of the disorder or randomness in a closed system." },
];
const MOCK_ORGS = [
  { id: 'org_1', name: "Global High School", role: "Student", active: true },
  { id: 'org_2', name: "Physics Masters Academy", role: "Premium Scholar", active: false }
];
const MOCK_LEADERBOARD = [
  { rank: 1, name: "Sarah Jenkins", score: 98, trend: "up" },
  { rank: 2, name: "Krish (You)", score: 95, trend: "up" },
  { rank: 3, name: "David Chen", score: 91, trend: "down" },
  { rank: 4, name: "Priya Sharma", score: 88, trend: "same" },
];
const MOCK_CHATS = [
  { id: 1, sender: "Mr. Anderson (Physics)", text: "Don't forget the mid-term covers up to the Second Law.", type: "educator", time: "10:30 AM" },
  { id: 2, sender: "Study Group A", text: "Are we meeting at the library later?", type: "peer", time: "11:15 AM" },
];

export default function App() {
  // --- CORE STATE ---
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isStudyMode, setIsStudyMode] = useState(false);
  const isDarkMode = isStudyMode;

  // --- USER & ORG STATE ---
  const [profile, setProfile] = useState({ name: "Krish", email: "krish@student.edu", grade: "Class 12" });
  const [organizations, setOrganizations] = useState(MOCK_ORGS);

  // --- DATA STATE (Study Tools) ---
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
    { role: 'model', content: "Hi! I'm your AI Study Buddy. Paste your notes here, upload a document, or ask me anything!" }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  
  // --- COMMUNICATION STATE ---
  const [commInput, setCommInput] = useState("");
  const [commMessages, setCommMessages] = useState(MOCK_CHATS);
  const [activeChatFilter, setActiveChatFilter] = useState('all');

  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null); 
  const STUDENT_ID = "student_123";

  // --- HANDLERS ---
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const toggleStudyMode = () => { setIsStudyMode(!isStudyMode); if (!isStudyMode) setIsSidebarOpen(false); };
  const clearNotes = () => setNotes("");

  const handleSwitchOrg = (id) => {
    setOrganizations(orgs => orgs.map(o => ({ ...o, active: o.id === id })));
  };

  const handleAddFlashcard = () => {
    if (!newCardFront.trim() || !newCardBack.trim()) return;
    setFlashcards([...flashcards, { front: newCardFront.trim(), back: newCardBack.trim() }]);
    setNewCardFront(""); setNewCardBack("");
    setIsCreatingCard(false); setCurrentCardIndex(flashcards.length); setIsCardFlipped(false);
  };

  const handleSendCommMessage = () => {
    if (!commInput.trim()) return;
    setCommMessages([...commMessages, { id: Date.now(), sender: "You", text: commInput, type: "self", time: "Just now" }]);
    setCommInput("");
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
            {/* Welcome Banner */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-800 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl">
              <div className="relative z-10">
                <h2 className="text-3xl font-bold mt-2">Welcome back, {profile.name}! 👋</h2>
                <p className="text-emerald-100 mt-2 max-w-lg text-lg">
                  You are viewing the dashboard for <strong>{organizations.find(o => o.active)?.name}</strong>.
                  Your next physics test is in 4 days.
                </p>
                <div className="mt-6 flex space-x-4">
                  <button onClick={() => setActiveTab('performance')} className="bg-white text-emerald-700 hover:bg-emerald-50 px-6 py-2.5 rounded-xl font-bold transition-colors shadow-lg">
                    View Analytics
                  </button>
                  <button onClick={() => setActiveTab('ai')} className="bg-emerald-800/50 hover:bg-emerald-800 border border-emerald-500/30 text-white px-6 py-2.5 rounded-xl font-bold transition-colors">
                    Jump to Study Tools
                  </button>
                </div>
              </div>
              <Target size={180} className="absolute -right-10 -bottom-10 opacity-20 text-white transform -rotate-12" />
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'}`}>
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl"><BarChart3 className="text-blue-600 dark:text-blue-400" size={24}/></div>
                  <span className="text-emerald-500 flex items-center text-sm font-bold"><ArrowRight className="rotate-[-45deg] mr-1" size={16}/> +5%</span>
                </div>
                <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium">Average Score</h3>
                <div className="text-3xl font-bold mt-1">88.5%</div>
              </div>
              
              <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'}`}>
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-xl"><Flame className="text-orange-600 dark:text-orange-400" size={24}/></div>
                </div>
                <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium">Study Streak</h3>
                <div className="text-3xl font-bold mt-1">12 Days</div>
              </div>

              <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'}`}>
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl"><Trophy className="text-purple-600 dark:text-purple-400" size={24}/></div>
                </div>
                <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium">Class Rank</h3>
                <div className="text-3xl font-bold mt-1 flex items-baseline">
                  2nd <span className="text-sm font-normal text-slate-500 ml-2">/ 45</span>
                </div>
              </div>
            </div>

            {/* Current Focus Area */}
            <div className={`p-6 rounded-2xl border flex items-center justify-between ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'}`}>
              <div>
                 <h3 className="font-bold flex items-center"><Brain className="text-emerald-500 mr-2" size={20} /> Current AI Focus</h3>
                 <p className="text-sm opacity-80 mt-1">Based on your recent tests, you should focus on <strong>Thermodynamics (Entropy)</strong>.</p>
              </div>
              <button onClick={() => setActiveTab('ai')} className="px-4 py-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-bold rounded-lg hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-colors">
                Start Studying
              </button>
            </div>
          </div>
        );

      case 'performance':
        return (
          <div className="space-y-6 animate-in fade-in duration-500">
            <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Performance & Leaderboard</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Subject Breakdown */}
              <div className={`lg:col-span-2 p-6 rounded-2xl border ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'}`}>
                 <h3 className="font-bold mb-6 flex items-center"><Target className="mr-2 text-blue-500"/> Subject Mastery</h3>
                 <div className="space-y-6">
                   {[
                     { name: "Physics", score: 85, color: "bg-blue-500" },
                     { name: "Mathematics", score: 92, color: "bg-emerald-500" },
                     { name: "Chemistry", score: 78, color: "bg-orange-500" },
                     { name: "Computer Science", score: 95, color: "bg-purple-500" }
                   ].map(sub => (
                     <div key={sub.name}>
                       <div className="flex justify-between text-sm mb-2 font-medium">
                         <span>{sub.name}</span>
                         <span>{sub.score}%</span>
                       </div>
                       <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2.5">
                         <div className={`${sub.color} h-2.5 rounded-full`} style={{ width: `${sub.score}%` }}></div>
                       </div>
                     </div>
                   ))}
                 </div>
              </div>

              {/* Leaderboard */}
              <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'}`}>
                <h3 className="font-bold mb-6 flex items-center"><Trophy className="mr-2 text-yellow-500"/> Global Top 5</h3>
                <div className="space-y-4">
                  {MOCK_LEADERBOARD.map((user, idx) => (
                    <div key={idx} className={`flex items-center justify-between p-3 rounded-xl border ${user.name.includes('(You)') ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/50' : 'bg-slate-50 dark:bg-slate-950/50 border-transparent'}`}>
                      <div className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${idx === 0 ? 'bg-yellow-100 text-yellow-700' : idx === 1 ? 'bg-slate-200 text-slate-700' : idx === 2 ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                          {user.rank}
                        </div>
                        <span className="ml-3 font-medium text-sm">{user.name}</span>
                      </div>
                      <div className="font-bold text-emerald-600 dark:text-emerald-400">{user.score}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 'communication':
        return (
          <div className="h-full flex flex-col animate-in fade-in duration-500">
            <h2 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Messages & Forums</h2>
            
            <div className={`flex-1 flex rounded-2xl border overflow-hidden ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              {/* Contacts Sidebar */}
              <div className={`w-1/3 border-r flex flex-col ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
                <div className="p-4 flex space-x-2 border-b dark:border-slate-800">
                  <button onClick={() => setActiveChatFilter('all')} className={`px-3 py-1.5 text-sm rounded-lg font-medium ${activeChatFilter === 'all' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>All</button>
                  <button onClick={() => setActiveChatFilter('educator')} className={`px-3 py-1.5 text-sm rounded-lg font-medium ${activeChatFilter === 'educator' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>Educators</button>
                  <button onClick={() => setActiveChatFilter('peer')} className={`px-3 py-1.5 text-sm rounded-lg font-medium ${activeChatFilter === 'peer' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>Peers</button>
                </div>
                <div className="flex-1 overflow-y-auto">
                   {MOCK_CHATS.filter(c => activeChatFilter === 'all' || c.type === activeChatFilter).map(chat => (
                     <div key={chat.id} className="p-4 border-b dark:border-slate-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                       <div className="flex justify-between items-baseline mb-1">
                         <span className={`font-bold text-sm ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{chat.sender}</span>
                         <span className="text-xs text-slate-400">{chat.time}</span>
                       </div>
                       <p className="text-xs text-slate-500 truncate">{chat.text}</p>
                     </div>
                   ))}
                </div>
              </div>

              {/* Chat Window */}
              <div className="flex-1 flex flex-col bg-slate-50/50 dark:bg-slate-950/20">
                <div className="p-4 border-b dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between">
                  <h3 className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Active Chat</h3>
                  <Users size={18} className="text-slate-400"/>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                   {commMessages.map((msg, i) => (
                      <div key={i} className={`flex ${msg.type === 'self' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] rounded-2xl p-3 text-sm ${msg.type === 'self' ? 'bg-emerald-500 text-white rounded-tr-sm' : isDarkMode ? 'bg-slate-800 text-slate-200 rounded-tl-sm' : 'bg-white border text-slate-800 rounded-tl-sm'}`}>
                          {msg.type !== 'self' && <div className="text-xs font-bold opacity-70 mb-1">{msg.sender}</div>}
                          {msg.text}
                        </div>
                      </div>
                   ))}
                </div>

                <div className="p-4 bg-white dark:bg-slate-900 border-t dark:border-slate-800">
                  <div className="flex items-center bg-slate-100 dark:bg-slate-950 rounded-xl p-1 pr-2">
                    <input 
                      type="text" value={commInput} onChange={(e) => setCommInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendCommMessage()}
                      placeholder="Type a message to peers or educators..."
                      className="flex-1 bg-transparent border-none outline-none text-sm p-3 text-slate-800 dark:text-white"
                    />
                    <button onClick={handleSendCommMessage} className="p-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors">
                      <Send size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'profile':
        return (
          <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl mx-auto">
            <h2 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Profile & Organizations</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Profile Editor */}
              <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <h3 className={`font-bold mb-6 flex items-center ${isDarkMode ? 'text-white' : 'text-slate-800'}`}><User className="mr-2 text-blue-500"/> Personal Details</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-slate-500">Full Name</label>
                    <input type="text" value={profile.name} onChange={(e) => setProfile({...profile, name: e.target.value})} className={`w-full p-3 rounded-xl outline-none focus:ring-2 ring-emerald-500/50 border ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'}`} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-slate-500">Email Address</label>
                    <input type="email" value={profile.email} onChange={(e) => setProfile({...profile, email: e.target.value})} className={`w-full p-3 rounded-xl outline-none focus:ring-2 ring-emerald-500/50 border ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'}`} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-slate-500">Grade / Level</label>
                    <input type="text" value={profile.grade} onChange={(e) => setProfile({...profile, grade: e.target.value})} className={`w-full p-3 rounded-xl outline-none focus:ring-2 ring-emerald-500/50 border ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'}`} />
                  </div>
                  <button className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-colors mt-4">
                    Save Changes
                  </button>
                </div>
              </div>

              {/* Organization Switcher */}
              <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <h3 className={`font-bold mb-6 flex items-center ${isDarkMode ? 'text-white' : 'text-slate-800'}`}><Building className="mr-2 text-purple-500"/> My Organizations</h3>
                <p className="text-sm text-slate-500 mb-6">Switching organizations updates your dashboard, leaderboards, and chat rooms automatically.</p>
                
                <div className="space-y-3">
                  {organizations.map(org => (
                    <div key={org.id} className={`p-4 rounded-xl border-2 transition-all ${org.active ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/10' : 'border-slate-200 dark:border-slate-800 cursor-pointer hover:border-emerald-300'}`} onClick={() => handleSwitchOrg(org.id)}>
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{org.name}</h4>
                          <span className="text-xs text-slate-500 bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded-full mt-1 inline-block">{org.role}</span>
                        </div>
                        {org.active ? (
                          <div className="flex items-center text-emerald-600 text-sm font-bold"><CheckCircle2 size={18} className="mr-1"/> Active</div>
                        ) : (
                          <button className="text-sm text-blue-500 font-medium hover:underline">Switch</button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <button className="w-full py-3 mt-6 border-2 border-dashed border-slate-300 dark:border-slate-700 text-slate-500 hover:text-emerald-500 hover:border-emerald-500 font-bold rounded-xl transition-colors flex items-center justify-center">
                  + Join New Organization
                </button>
              </div>
            </div>
          </div>
        );

      case 'ai':
      case 'flashcards':
      case 'assistant':
        // Study Tools rendering container (to keep the layout clean)
        return (
          <div className="h-full flex flex-col">
            {/* Inner Tabs for Study Tools */}
            <div className="flex space-x-4 mb-6 border-b dark:border-slate-800 pb-2">
               <button onClick={() => setActiveTab('ai')} className={`px-4 py-2 font-bold transition-all border-b-2 ${activeTab === 'ai' ? 'border-emerald-500 text-emerald-500' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}>AI Recommendations</button>
               <button onClick={() => setActiveTab('flashcards')} className={`px-4 py-2 font-bold transition-all border-b-2 ${activeTab === 'flashcards' ? 'border-emerald-500 text-emerald-500' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}>Flashcards</button>
               <button onClick={() => setActiveTab('assistant')} className={`px-4 py-2 font-bold transition-all border-b-2 ${activeTab === 'assistant' ? 'border-emerald-500 text-emerald-500' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}>AI Chat & Notes</button>
            </div>

            {/* Render sub-content based on Study Tool tab */}
            {activeTab === 'ai' && (
              <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl mx-auto w-full">
                <div className="flex justify-between items-center">
                    <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Curated for You</h2>
                    <button onClick={fetchRecommendations} disabled={loading} className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors flex items-center disabled:opacity-50">
                        <RefreshCw size={18} className={`mr-2 ${loading ? "animate-spin" : ""}`} /> Refresh
                    </button>
                </div>
                {errorMsg && <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-start"><AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" /><div><p className="font-bold">Backend Error:</p><p>{errorMsg}</p></div></div>}
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
            )}

            {activeTab === 'flashcards' && (
              <div className="flex flex-col items-center h-full animate-in fade-in duration-500 w-full max-w-4xl mx-auto">
                <div className="flex justify-between items-center w-full mb-8">
                  <h2 className={`text-xl font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Deck: Thermodynamics ({flashcards.length > 0 ? currentCardIndex + 1 : 0}/{flashcards.length})</h2>
                  <button onClick={() => setIsCreatingCard(!isCreatingCard)} className={`px-4 py-2 rounded-lg font-bold transition-colors shadow-sm ${isCreatingCard ? (isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-200 text-slate-600 hover:bg-slate-300') : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-500/20'}`}>
                    {isCreatingCard ? "Cancel" : "+ Create Card"}
                  </button>
                </div>
                {isCreatingCard ? (
                  <div className={`w-full max-w-2xl rounded-3xl p-8 border-2 shadow-xl transition-all duration-300 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                    <h3 className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Create New Flashcard</h3>
                    <div className="space-y-4">
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Front (Question)</label>
                        <input type="text" value={newCardFront} onChange={(e) => setNewCardFront(e.target.value)} className={`w-full p-3 rounded-xl outline-none focus:ring-2 ring-emerald-500/50 border ${isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'}`} placeholder="e.g., What is absolute zero?"/>
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Back (Answer)</label>
                        <textarea value={newCardBack} onChange={(e) => setNewCardBack(e.target.value)} className={`w-full p-3 rounded-xl outline-none focus:ring-2 ring-emerald-500/50 border resize-none h-24 ${isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'}`} placeholder="e.g., 0 Kelvin, the lowest limit of the thermodynamic temperature scale."/>
                      </div>
                      <div className="flex justify-end pt-4">
                        <button onClick={handleAddFlashcard} disabled={!newCardFront.trim() || !newCardBack.trim()} className="px-6 py-2.5 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition-colors disabled:opacity-50">Save Flashcard</button>
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
                              <div><span className="text-xs font-bold text-emerald-500 uppercase tracking-widest mb-4 block">Answer</span><p className={`text-2xl font-medium ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>{flashcards[currentCardIndex].back}</p></div>
                            ) : (
                              <div><span className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-4 block">Question</span><p className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{flashcards[currentCardIndex].front}</p></div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-6 mt-10">
                          <button onClick={() => { setCurrentCardIndex(Math.max(0, currentCardIndex - 1)); setIsCardFlipped(false); }} disabled={currentCardIndex === 0} className="p-3 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 disabled:opacity-50 transition-colors"><ChevronRight size={24} className="rotate-180"/></button>
                          <button onClick={() => setIsCardFlipped(!isCardFlipped)} className="px-6 py-3 rounded-xl bg-emerald-500 text-white font-bold hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20">Flip Card</button>
                          <button onClick={() => { setCurrentCardIndex(Math.min(flashcards.length - 1, currentCardIndex + 1)); setIsCardFlipped(false); }} disabled={currentCardIndex === flashcards.length - 1} className="p-3 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 disabled:opacity-50 transition-colors"><ChevronRight size={24}/></button>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center p-12 mt-8 rounded-3xl border-2 border-dashed border-slate-300 dark:border-slate-700 text-center"><Layers size={48} className="text-slate-400 mb-4" /><h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>No Flashcards Yet</h3></div>
                    )}
                  </>
                )}
              </div>
            )}

            {activeTab === 'assistant' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full pb-4 animate-in fade-in duration-500 flex-1 min-h-0">
                <div className={`flex flex-col rounded-2xl border overflow-hidden ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-sm`}>
                  <div className={`p-4 border-b flex justify-between items-center ${isDarkMode ? 'border-slate-800 bg-slate-950/50' : 'border-slate-100 bg-slate-50'}`}>
                    <h3 className={`font-bold flex items-center ${isDarkMode ? 'text-white' : 'text-slate-800'}`}><FileText size={18} className="mr-2 text-blue-500"/> My Resources & Notes</h3>
                    <div className="flex space-x-2">
                      <button onClick={handleSaveNotes} disabled={isSavingNotes || !notes.trim()} className={`p-2 rounded-lg transition-colors flex items-center ${isSavingNotes ? 'text-emerald-500' : 'text-slate-400 hover:text-emerald-500'}`} title="Save Notes">{isSavingNotes ? <Loader2 size={16} className="animate-spin" /> : <Save size={16}/>}</button>
                      <button onClick={clearNotes} className="p-2 text-slate-400 hover:text-red-500 rounded-lg transition-colors" title="Clear Notes"><Trash2 size={16}/></button>
                      <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".pdf,.txt,.doc,.docx,.png,.jpg" />
                      <button onClick={() => fileInputRef.current?.click()} disabled={isUploading} className={`p-2 rounded-lg transition-colors flex items-center ${isUploading ? 'text-emerald-500' : 'text-slate-400 hover:text-emerald-500'}`} title="Upload Resource">{isUploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16}/>} <span className="text-xs ml-1 hidden sm:inline">{isUploading ? 'Uploading...' : 'Upload'}</span></button>
                    </div>
                  </div>
                  <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className={`flex-1 w-full p-6 resize-none outline-none custom-scrollbar ${isDarkMode ? 'bg-transparent text-slate-300 placeholder-slate-600' : 'bg-transparent text-slate-700 placeholder-slate-400'}`} placeholder="Type your notes here! The AI automatically reads this context in real-time."/>
                </div>

                <div className={`flex flex-col rounded-2xl border overflow-hidden ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-sm`}>
                  <div className={`p-4 border-b ${isDarkMode ? 'border-slate-800 bg-slate-950/50' : 'border-slate-100 bg-slate-50'}`}>
                    <h3 className={`font-bold flex items-center ${isDarkMode ? 'text-white' : 'text-slate-800'}`}><Bot size={18} className="mr-2 text-emerald-500"/> AI Study Assistant</h3>
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
                    {isAiLoading && <div className="flex justify-start"><div className={`rounded-2xl p-4 rounded-tl-sm flex items-center space-x-2 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}><Loader2 size={16} className="animate-spin text-emerald-500" /><span className="text-sm text-slate-400">Thinking...</span></div></div>}
                    <div ref={chatEndRef} />
                  </div>
                  <div className={`p-4 border-t ${isDarkMode ? 'border-slate-800 bg-slate-900' : 'border-slate-100 bg-white'}`}>
                    <div className={`flex items-center rounded-xl border p-1 pl-4 focus-within:ring-2 ring-emerald-500/50 ${isDarkMode ? 'border-slate-700 bg-slate-950' : 'border-slate-200 bg-white'}`}>
                      <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} placeholder="Ask a question..." className={`flex-1 bg-transparent border-none outline-none text-sm p-2 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}/>
                      <button onClick={handleSendMessage} disabled={isAiLoading || !chatInput.trim()} className="p-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50 transition-colors m-1"><Send size={18} /></button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      default: return null;
    }
  };

  return (
    <div className={`flex h-screen font-sans transition-colors duration-500 ${isStudyMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
      
      {/* GLOBAL SIDEBAR */}
      <aside className={`bg-slate-900 text-white flex flex-col transition-all duration-300 z-20 overflow-y-auto custom-scrollbar border-r border-slate-800 ${isSidebarOpen ? 'w-72' : 'w-20'}`}>
        <div className="h-20 flex items-center justify-center border-b border-slate-800 bg-slate-950 sticky top-0 z-10 shrink-0">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20"><Brain className="text-white" size={24} /></div>
            {isSidebarOpen && <span className="ml-3 text-2xl font-bold tracking-tight text-white">Study<span className="text-emerald-400">Buddy</span></span>}
        </div>
        
        <div className="flex-1 px-4 py-6 space-y-8">
          {/* Main Group */}
          <div>
            {isSidebarOpen && <div className="px-4 mb-2 text-xs font-bold text-slate-500 uppercase tracking-wider">Main Menu</div>}
            <div className="space-y-1">
              {[
                { id: 'dashboard', icon: <LayoutDashboard size={20}/>, label: 'Dashboard' },
                { id: 'performance', icon: <BarChart3 size={20}/>, label: 'Performance & Rank' }
              ].map((item) => (
                <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${activeTab === item.id ? 'bg-emerald-500 text-white font-semibold shadow-md shadow-emerald-500/20' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}>
                  {item.icon}{isSidebarOpen && <span className="ml-3 text-sm">{item.label}</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Tools Group */}
          <div>
            {isSidebarOpen && <div className="px-4 mb-2 text-xs font-bold text-slate-500 uppercase tracking-wider">Study Center</div>}
            <div className="space-y-1">
              {[
                { id: 'ai', icon: <Lightbulb size={20}/>, label: 'AI Resources' },
                { id: 'flashcards', icon: <Layers size={20}/>, label: 'Flashcards' },
                { id: 'assistant', icon: <Bot size={20}/>, label: 'AI Assistant' }
              ].map((item) => (
                <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${['ai', 'flashcards', 'assistant'].includes(activeTab) && activeTab === item.id ? 'bg-emerald-500 text-white font-semibold shadow-md shadow-emerald-500/20' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}>
                  {item.icon}{isSidebarOpen && <span className="ml-3 text-sm">{item.label}</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Connect Group */}
          <div>
            {isSidebarOpen && <div className="px-4 mb-2 text-xs font-bold text-slate-500 uppercase tracking-wider">Connect</div>}
            <div className="space-y-1">
              {[
                { id: 'communication', icon: <MessageCircle size={20}/>, label: 'Messages & Forums' }
              ].map((item) => (
                <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${activeTab === item.id ? 'bg-emerald-500 text-white font-semibold shadow-md shadow-emerald-500/20' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}>
                  {item.icon}{isSidebarOpen && <span className="ml-3 text-sm">{item.label}</span>}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Profile Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/50 sticky bottom-0">
          <button onClick={() => setActiveTab('profile')} className={`w-full flex items-center p-3 rounded-xl transition-all duration-200 ${activeTab === 'profile' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}>
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-sm shrink-0">
              {profile.name.charAt(0)}
            </div>
            {isSidebarOpen && (
              <div className="ml-3 text-left overflow-hidden">
                <p className="text-sm font-bold text-slate-200 truncate">{profile.name}</p>
                <p className="text-xs text-slate-500 truncate">{organizations.find(o => o.active)?.name || "No Org"}</p>
              </div>
            )}
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* GLOBAL HEADER */}
        <header className={`h-20 flex items-center justify-between px-8 border-b shrink-0 transition-colors duration-500 ${isStudyMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center">
            <button onClick={toggleSidebar} className="p-2 text-slate-500 hover:text-emerald-500 transition-colors"><Menu size={24} /></button>
            <h1 className={`ml-4 text-xl font-bold capitalize ${isStudyMode ? "text-slate-100" : "text-slate-800"}`}>
              {['ai', 'flashcards', 'assistant'].includes(activeTab) ? 'Study Center' : activeTab.replace('_', ' ')}
            </h1>
          </div>
          
          <div className="flex items-center space-x-6">
            {/* Pomodoro Timer */}
            <div className={`flex items-center space-x-4 px-4 py-2 rounded-xl border transition-colors duration-500 ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
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

            <button onClick={toggleStudyMode} className={`flex items-center px-5 py-2.5 rounded-full font-bold text-sm border transition-all duration-300 ${isStudyMode ? 'bg-slate-800 text-emerald-400 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'bg-slate-100 text-slate-600 border-transparent hover:bg-slate-200'}`}>
              <Zap size={16} className={`mr-2 transition-transform duration-300 ${isStudyMode ? 'fill-emerald-400 scale-110' : 'text-slate-400'}`} /> {isStudyMode ? "Focus Mode: ON" : "Focus Mode: OFF"}
            </button>
          </div>
        </header>

        {/* MAIN CONTENT AREA */}
        <div className="flex-1 overflow-y-auto p-8 max-w-7xl mx-auto w-full">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}