import React, { useState, useEffect } from 'react';
import { 
  BookOpen, Brain, FileText, MessageSquare, PlayCircle, 
  CheckCircle, XCircle, Menu, Zap, GraduationCap, 
  LayoutDashboard, ArrowRight, AlertTriangle, Moon, Sun, 
  Download, Clock, Lightbulb, Save, Trash2, PenTool, Flame, Wind,
  RefreshCw, Loader2
} from 'lucide-react';

// --- SUB-COMPONENT: MASTERY CHART ---
const MasteryChart = ({ percentage, isDark }) => {
  const strokeDasharray = `${percentage} ${100 - percentage}`;
  
  return (
    <div className="relative flex items-center justify-center w-20 h-20 flex-shrink-0">
      <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
        <path 
          className={isDark ? "text-slate-800" : "text-slate-100"} 
          strokeWidth="3" 
          stroke="currentColor" 
          fill="none" 
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
        />
        <path 
          className="text-emerald-500 transition-all duration-1000 ease-out drop-shadow-md" 
          strokeDasharray={strokeDasharray} 
          strokeWidth="3" 
          strokeLinecap="round" 
          stroke="currentColor" 
          fill="none" 
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
        />
      </svg>
      <div className={`absolute font-bold text-lg ${isDark ? 'text-white' : 'text-slate-800'}`}>
        {percentage}%
      </div>
    </div>
  );
};

// --- MAIN COMPONENT ---
const StudyBuddyResourcesGUI = () => {
  // --- STATE MANAGEMENT ---
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isStudyMode, setIsStudyMode] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notes, setNotes] = useState("");
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isTimerActive, setIsTimerActive] = useState(false);

  // AI State
  const [aiLoading, setAiLoading] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [apiKeyError, setApiKeyError] = useState(false);

  // User Context
  const user = { name: "Krish", class: "12", stream: "PCM" };
  const mastery = 45;
  const weakAreas = ["Thermodynamics", "Entropy"];

  // --- API LOGIC ---
  const fetchAIRecommendations = async () => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    if (!apiKey || apiKey === "your_actual_api_key_here") {
      setApiKeyError(true);
      // Fallback to mock data if no key
      setRecommendations([
        { title: "Carnot Cycle (Mock)", type: "Video", source: "Khan Academy" },
        { title: "Entropy Formulas (Mock)", type: "Notes", source: "StudyBuddy" }
      ]);
      return;
    }

    setAiLoading(true);
    setApiKeyError(false);

    try {
      // Prompt construction based on User Profile (Slide 13/14)
      const prompt = `I am a Class 12 PCM student. My weak areas are ${weakAreas.join(", ")}. 
      Suggest 3 specific, short study resources. Format as JSON array with keys: title, type (Video/Notes/Quiz), desc. 
      Do not include markdown formatting.`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });

      const data = await response.json();
      const rawText = data.candidates[0].content.parts[0].text;
      
      // Basic cleaning to parse the JSON response from AI
      const cleanJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
      setRecommendations(JSON.parse(cleanJson));

    } catch (error) {
      console.error("AI Fetch Error:", error);
      setRecommendations([
        { title: "Error fetching AI", type: "Error", desc: "Please check internet/API key." }
      ]);
    } finally {
      setAiLoading(false);
    }
  };

  // Initial Fetch on Mount
  useEffect(() => {
    fetchAIRecommendations();
  }, []);

  // --- EFFECTS ---
  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDarkMode]);

  useEffect(() => {
    const savedNotes = localStorage.getItem('studyBuddyNotes');
    if (savedNotes) setNotes(savedNotes);
  }, []);

  useEffect(() => {
    localStorage.setItem('studyBuddyNotes', notes);
  }, [notes]);

  useEffect(() => {
    let interval = null;
    if (isTimerActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    } else if (timeLeft === 0) {
      setIsTimerActive(false);
      alert("Time's up!");
      setTimeLeft(25 * 60);
    }
    return () => clearInterval(interval);
  }, [isTimerActive, timeLeft]);

  // --- HELPERS ---
  const toggleStudyMode = () => {
    if (!isStudyMode) {
      setIsStudyMode(true);
      setIsDarkMode(true);
      setIsSidebarOpen(false);
    } else {
      setIsStudyMode(false);
      if (!localStorage.getItem('theme') === 'dark') setIsDarkMode(false); 
      setIsSidebarOpen(true);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const clearNotes = () => {
    if (window.confirm("Clear all notes?")) setNotes("");
  };

  return (
    <div className={`flex h-screen transition-colors duration-300 font-sans overflow-hidden ${isDarkMode ? 'bg-slate-950 text-white' : 'bg-sky-50 text-slate-900'}`}>
      
      {/* SIDEBAR */}
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-blue-950 dark:bg-slate-900 text-white flex flex-col shadow-2xl z-20 transition-all duration-300 border-r border-transparent dark:border-slate-800`}>
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center space-x-2 overflow-hidden whitespace-nowrap">
            <div className="w-8 h-8 min-w-[2rem] bg-emerald-500 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-900/20">
              <Brain className="w-5 h-5 text-white" />
            </div>
            {isSidebarOpen && (
              <span className="text-xl font-bold tracking-tight animate-in fade-in duration-300">
                Study<span className="text-emerald-400">Buddy</span>
              </span>
            )}
          </div>
        </div>

        <nav className="flex-1 mt-6 px-4 space-y-2">
          <NavItem icon={<LayoutDashboard size={20}/>} label="Dashboard" isOpen={isSidebarOpen} active />
          <NavItem icon={<Lightbulb size={20}/>} label="Formulas" isOpen={isSidebarOpen} />
          <NavItem icon={<GraduationCap size={20}/>} label="Test Results" isOpen={isSidebarOpen} />
        </nav>

        <div className="p-4 border-t border-white/10 bg-black/10">
          <div className={`flex items-center ${isSidebarOpen ? 'space-x-3' : 'justify-center'}`}>
            <div className="w-10 h-10 min-w-[2.5rem] rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-blue-950 font-bold shadow-lg">
              {user.name[0]}
            </div>
            {isSidebarOpen && (
              <div className="overflow-hidden">
                <p className="text-sm font-semibold truncate text-white">{user.name}</p>
                <p className="text-xs text-blue-200 truncate">Class {user.class} • {user.stream}</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        
        {/* HEADER */}
        <header className={`h-16 border-b flex items-center justify-between px-6 shadow-sm z-10 transition-colors duration-300 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-blue-100'}`}>
          <div className="flex items-center space-x-4">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-100 text-slate-600'}`}>
              <Menu size={20} />
            </button>
            <div className={`hidden sm:flex items-center space-x-3 px-4 py-1.5 rounded-full border transition-colors ${isDarkMode ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-slate-50'}`}>
              <Clock size={16} className="text-emerald-500" />
              <span className={`text-sm font-mono font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>{formatTime(timeLeft)}</span>
              <div className={`h-4 w-px mx-2 ${isDarkMode ? 'bg-slate-600' : 'bg-slate-300'}`}></div>
              <button onClick={() => setIsTimerActive(!isTimerActive)} className={`text-[10px] font-black uppercase hover:opacity-80 ${isTimerActive ? 'text-red-500' : 'text-emerald-500'}`}>
                {isTimerActive ? 'Pause' : 'Start'}
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button onClick={() => setIsDarkMode(!isDarkMode)} className={`p-2 rounded-full shadow-sm transition-all ${isDarkMode ? 'bg-slate-800 text-yellow-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button onClick={toggleStudyMode} className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-bold text-white shadow-lg transition-all ${isStudyMode ? 'bg-red-500 hover:bg-red-600 shadow-red-500/20' : 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20'}`}>
              <Zap size={16} />
              <span>{isStudyMode ? 'Exit Focus' : 'Study Mode'}</span>
            </button>
          </div>
        </header>

        {/* DASHBOARD BODY */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 relative">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* LEFT COLUMN */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Mastery Card */}
              <div className={`p-6 rounded-2xl border shadow-sm transition-all ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-blue-50'}`}>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${isDarkMode ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-100 text-emerald-700'}`}>
                        Current Focus
                      </span>
                    </div>
                    <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                      Physics: Thermodynamics
                    </h1>
                    <p className={`text-sm mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      You've mastered {mastery}% of this unit. Keep going!
                    </p>
                  </div>
                  <MasteryChart percentage={mastery} isDark={isDarkMode} />
                </div>
              </div>

              {/* AI RECOMMENDATIONS SECTION */}
              <div className={`p-6 rounded-2xl border shadow-sm transition-all ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-blue-50'}`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`font-bold text-lg flex items-center ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    <Brain className="mr-2 text-purple-500" /> AI Recommendations
                  </h3>
                  <button onClick={fetchAIRecommendations} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full hover:rotate-180 transition-all duration-500">
                    <RefreshCw size={16} className={isDarkMode ? 'text-white' : 'text-slate-700'} />
                  </button>
                </div>

                {apiKeyError && (
                  <div className="mb-4 p-3 bg-amber-100 text-amber-800 text-sm rounded-lg flex items-center">
                    <AlertTriangle size={16} className="mr-2" />
                    <span>API Key missing! Using mock data. Check your .env file.</span>
                  </div>
                )}

                {aiLoading ? (
                  <div className="flex justify-center p-8">
                    <Loader2 className="animate-spin text-emerald-500" size={32} />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {recommendations.map((rec, idx) => (
                      <div key={idx} className={`p-4 rounded-xl border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-xs font-bold px-2 py-1 rounded ${isDarkMode ? 'bg-purple-900 text-purple-200' : 'bg-purple-100 text-purple-700'}`}>
                            {rec.type || "Resource"}
                          </span>
                        </div>
                        <h4 className={`font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{rec.title}</h4>
                        <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{rec.desc || rec.source}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div className="lg:col-span-1 space-y-6">
              
              {/* Notes App */}
              <div className={`p-6 rounded-2xl border shadow-sm flex flex-col h-[400px] relative transition-all ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-yellow-50 border-yellow-100'}`}>
                <div className="absolute inset-0 pointer-events-none opacity-50" style={{ backgroundImage: `repeating-linear-gradient(transparent, transparent 31px, ${isDarkMode ? '#334155' : '#e2e8f0'} 31px, ${isDarkMode ? '#334155' : '#e2e8f0'} 32px)` }}></div>
                
                <div className="flex items-center justify-between mb-4 relative z-10">
                  <h3 className={`font-bold flex items-center ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                    <PenTool size={16} className="mr-2 text-emerald-500" /> Quick Notes
                  </h3>
                  <button onClick={clearNotes} className="text-slate-400 hover:text-red-500 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
                
                <textarea 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className={`flex-1 w-full bg-transparent border-none resize-none focus:ring-0 text-sm leading-8 font-medium placeholder-slate-400 relative z-10 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}
                  placeholder="Type here... (Auto-saves)"
                />
                
                <div className="mt-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center justify-end relative z-10">
                  <Save size={12} className="mr-1" /> Auto-Saved
                </div>
              </div>

              {/* Quick Formulas */}
              <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-indigo-50 border-indigo-100'}`}>
                <h4 className={`text-xs font-bold uppercase tracking-widest mb-3 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-500'}`}>
                  Formula Cheat Sheet
                </h4>
                <div className="space-y-3">
                  <FormulaRow label="First Law" math="ΔQ = ΔU + ΔW" isDark={isDarkMode} />
                  <div className={`h-px ${isDarkMode ? 'bg-slate-800' : 'bg-indigo-100'}`}></div>
                  <FormulaRow label="Ideal Gas" math="PV = nRT" isDark={isDarkMode} />
                </div>
              </div>

            </div>

          </div>
        </div>

      </main>
    </div>
  );
};

// --- HELPER COMPONENTS ---

const NavItem = ({ icon, label, isOpen, active }) => (
  <a 
    href="#" 
    className={`flex items-center px-3 py-3 rounded-xl transition-all duration-200 group ${
      active 
        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20' 
        : 'text-blue-200 hover:bg-white/10 hover:text-white'
    }`}
  >
    {React.cloneElement(icon, { size: 20 })}
    {isOpen && <span className="ml-3 text-sm font-medium animate-in fade-in">{label}</span>}
  </a>
);

const TopicCard = ({ title, desc, icon, bgIcon, isDark }) => (
  <div className={`p-6 rounded-2xl border shadow-sm group cursor-pointer relative overflow-hidden transition-all hover:border-emerald-400 ${isDark ? 'bg-slate-900 border-slate-800 hover:border-emerald-500/50' : 'bg-white border-blue-50'}`}>
    <div className={`absolute top-0 right-0 w-24 h-24 rounded-full -mr-8 -mt-8 pointer-events-none ${bgIcon}`}></div>
    <h3 className={`font-bold text-lg mb-2 flex items-center ${isDark ? 'text-white' : 'text-slate-900'}`}>
      <span className="mr-2">{icon}</span> {title}
    </h3>
    <p className={`text-sm mb-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{desc}</p>
    <button className={`w-full py-2.5 font-semibold rounded-lg text-sm transition-all group-hover:bg-emerald-500 group-hover:text-white ${isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-50 text-slate-700'}`}>
      Start Review
    </button>
  </div>
);

const FormulaRow = ({ label, math, isDark }) => (
  <div className="flex justify-between items-center text-sm">
    <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>{label}</span>
    <span className={`font-mono font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{math}</span>
  </div>
);

export default StudyBuddyResourcesGUI;