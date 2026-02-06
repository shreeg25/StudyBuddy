import React, { useState, useEffect } from 'react';
import { 
  Brain, LayoutDashboard, Lightbulb, GraduationCap, 
  Menu, Zap, PenTool, Save, Trash2, RefreshCw, Loader2, 
  ChevronRight, PlayCircle, FileText, CheckCircle2,
  Video, Clock, AlertTriangle, LogOut
} from 'lucide-react';

// --- CONFIGURATION ---
const MOCK_DATA = [
  { title: "Laws of Thermodynamics", type: "Video", source: "Khan Academy", desc: "Comprehensive breakdown of the 3 laws." },
  { title: "Entropy Cheat Sheet", type: "Notes", source: "StudyBuddy AI", desc: "Formula list for quick revision." },
  { title: "Heat Engines Quiz", type: "Quiz", source: "Internal Bank", desc: "10 high-yield questions." }
];

const StudyBuddyResourcesGUI = () => {
  // --- STATE ---
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isStudyMode, setIsStudyMode] = useState(false);
  
  // Data State
  const [notes, setNotes] = useState("");
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // User Context
  const user = { name: "Krish", weakAreas: ["Thermodynamics", "Entropy"] };

  // --- HANDLERS ---

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const toggleStudyMode = () => {
    setIsStudyMode(!isStudyMode);
    if (!isStudyMode) setIsSidebarOpen(false); // Auto-focus
  };

  // API Call (Strictly using .env)
  const fetchRecommendations = async () => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    if (!apiKey) {
      alert("API Key missing! Please set VITE_GEMINI_API_KEY in your .env file.");
      setRecommendations(MOCK_DATA);
      return;
    }

    setLoading(true);
    try {
      const prompt = `I am a Class 12 student weak in ${user.weakAreas.join(", ")}. Suggest 3 short resources (Video/Notes). Return ONLY a JSON array with keys: title, type, source, desc.`;
      
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });

      const data = await response.json();
      
      if (data.error) throw new Error(data.error.message);

      const raw = data.candidates?.[0]?.content?.parts?.[0]?.text;
      const json = JSON.parse(raw.replace(/```json|```/g, '').trim());
      setRecommendations(json);
      
    } catch (err) {
      console.error(err);
      alert("AI Fetch failed. Using demo data.");
      setRecommendations(MOCK_DATA);
    } finally {
      setLoading(false);
    }
  };

  // Notes Persistence
  useEffect(() => {
    const saved = localStorage.getItem('sb_notes');
    if (saved) setNotes(saved);
  }, []);

  useEffect(() => localStorage.setItem('sb_notes', notes), [notes]);

  // --- RENDER CONTENT ---
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6 animate-in fade-in duration-500">
            {/* Hero Section - Deep Blue */}
            <div className="bg-[#0B1120] rounded-2xl p-8 text-white relative overflow-hidden shadow-xl">
              <div className="relative z-10">
                <span className="bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded uppercase">Current Focus</span>
                <h2 className="text-3xl font-bold mt-2">Physics: Thermodynamics</h2>
                <p className="text-slate-300 mt-2 max-w-lg">
                  You've mastered 45% of this unit. AI recommends focusing on <strong>Entropy</strong>.
                </p>
                <button 
                  onClick={() => setActiveTab('ai')}
                  className="mt-6 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors inline-flex items-center shadow-lg shadow-emerald-500/20"
                >
                  Get AI Resources <ChevronRight size={18} className="ml-2"/>
                </button>
              </div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={`p-6 rounded-xl border ${isStudyMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-100 text-slate-800'}`}>
                <h3 className="font-bold flex items-center mb-4">
                  <Clock className="text-emerald-500 mr-2" size={20} /> Recent Activity
                </h3>
                <ul className="space-y-3 text-sm opacity-80">
                  <li className="flex items-center"><CheckCircle2 size={16} className="mr-2 text-emerald-500"/> Unit Test 2 (B+)</li>
                  <li className="flex items-center"><PlayCircle size={16} className="mr-2 text-blue-500"/> Watched "Heat Engines"</li>
                </ul>
              </div>
              <div className={`p-6 rounded-xl border ${isStudyMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-100 text-slate-800'}`}>
                <h3 className="font-bold mb-2">Study Streak</h3>
                <div className="text-4xl font-bold text-emerald-500">12 Days</div>
                <p className="text-xs opacity-60 mt-1">Consistency is key!</p>
              </div>
            </div>
          </div>
        );

      case 'ai':
        return (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
              <div>
                <h2 className={`text-2xl font-bold ${isStudyMode ? 'text-white' : 'text-slate-800'}`}>AI Recommendations</h2>
                <p className={`text-sm ${isStudyMode ? 'text-slate-400' : 'text-slate-500'}`}>Personalized resources for {user.name}</p>
              </div>
              <button onClick={fetchRecommendations} className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors flex items-center shadow-lg shadow-emerald-500/20">
                <RefreshCw size={18} className={`mr-2 ${loading ? "animate-spin" : ""}`} /> Refresh
              </button>
            </div>

            <div className="grid gap-4">
              {loading && <div className="text-center p-8 text-slate-400"><Loader2 className="animate-spin mx-auto mb-2 text-emerald-500"/>AI is analyzing...</div>}
              
              {!loading && recommendations.map((rec, idx) => (
                <div key={idx} className={`p-4 rounded-xl border hover:border-emerald-500 transition-all cursor-pointer group ${isStudyMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
                  <div className="flex items-start">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center mr-4 ${rec.type === 'Video' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>
                      {rec.type === 'Video' ? <Video size={20}/> : <FileText size={20}/>}
                    </div>
                    <div>
                      <h4 className={`font-bold text-lg ${isStudyMode ? 'text-white' : 'text-slate-800'}`}>{rec.title}</h4>
                      <p className={`text-sm mt-1 ${isStudyMode ? 'text-slate-400' : 'text-slate-500'}`}>{rec.desc}</p>
                      <span className="text-xs font-semibold text-emerald-500 mt-2 block uppercase tracking-wide">{rec.source}</span>
                    </div>
                  </div>
                </div>
              ))}
              
              {!loading && recommendations.length === 0 && (
                <div className="text-center text-slate-400 py-10 border-2 border-dashed border-slate-200 rounded-xl">
                    <p>No resources loaded.</p>
                    <button onClick={fetchRecommendations} className="text-emerald-500 font-bold hover:underline">Click to generate</button>
                </div>
              )}
            </div>
          </div>
        );

      case 'notes':
        return (
          <div className="h-full flex flex-col animate-in fade-in duration-500">
            <div className="flex justify-between items-center mb-4">
              <h2 className={`text-2xl font-bold ${isStudyMode ? 'text-white' : 'text-slate-800'}`}>Quick Notes</h2>
              <button onClick={() => setNotes('')} className="text-slate-400 hover:text-red-500 transition-colors"><Trash2/></button>
            </div>
            <div className={`flex-1 rounded-xl border p-6 relative overflow-hidden shadow-inner ${isStudyMode ? 'bg-slate-800 border-slate-700' : 'bg-[#fffdf0] border-yellow-200'}`}>
               {!isStudyMode && <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(transparent, transparent 31px, #000 31px, #000 32px)' }}></div>}
               <textarea 
                className={`w-full h-full bg-transparent border-none resize-none focus:ring-0 leading-8 text-lg font-medium ${isStudyMode ? 'text-slate-200' : 'text-slate-800'}`}
                placeholder="Type your observations and formulas here..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
               />
            </div>
            <div className="mt-2 flex justify-end text-xs font-bold text-emerald-500 uppercase tracking-widest">
                <span className="flex items-center"><Save size={12} className="mr-1"/> Auto-Saved</span>
            </div>
          </div>
        );
        
      default: return null;
    }
  };

  // --- MAIN LAYOUT ---
  return (
    <div className={`flex h-screen font-sans transition-colors duration-500 ${isStudyMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
      
      {/* 1. SIDEBAR PANEL (Deep Navy Blue) */}
      <aside 
        className={`bg-[#0B1120] text-white flex flex-col transition-all duration-300 z-20 overflow-hidden border-r border-slate-800 ${isSidebarOpen ? 'w-72' : 'w-20'}`}
      >
        {/* Logo Area */}
        <div className="h-20 flex items-center px-6 border-b border-slate-800">
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-500/20">
            <Brain className="text-white" size={24} />
          </div>
          {isSidebarOpen && <span className="ml-3 text-xl font-bold tracking-tight">Study<span className="text-emerald-400">Buddy</span></span>}
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 mt-8 space-y-2">
          {[
            { id: 'dashboard', icon: <LayoutDashboard size={22}/>, label: 'Dashboard' },
            { id: 'ai', icon: <Lightbulb size={22}/>, label: 'AI Recommendations' },
            { id: 'notes', icon: <PenTool size={22}/>, label: 'Quick Notes' },
            { id: 'test', icon: <GraduationCap size={22}/>, label: 'Test Results' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center px-4 py-4 rounded-xl transition-all duration-200 group ${
                activeTab === item.id 
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20 font-semibold' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {item.icon}
              {isSidebarOpen && <span className="ml-3 text-sm">{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-slate-800 bg-[#080d19]">
            <button className={`w-full flex items-center px-4 py-3 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all ${!isSidebarOpen && 'justify-center'}`}>
                <LogOut size={20} />
                {isSidebarOpen && <span className="ml-3 text-sm font-medium">Logout</span>}
            </button>
        </div>
      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        
        {/* Top Header */}
        <header className={`h-20 flex items-center justify-between px-8 border-b transition-colors ${isStudyMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center">
            <button onClick={toggleSidebar} className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors">
              <Menu size={24} className={isStudyMode ? "text-slate-300" : "text-slate-600"} />
            </button>
            <div className="ml-6">
                <h1 className={`text-xl font-bold capitalize ${isStudyMode ? "text-slate-100" : "text-slate-800"}`}>{activeTab.replace('-', ' ')}</h1>
            </div>
          </div>

          <button 
            onClick={toggleStudyMode}
            className={`flex items-center px-5 py-2.5 rounded-full font-bold text-sm transition-all border ${
              isStudyMode 
              ? 'bg-slate-800 text-emerald-400 border-emerald-500/30 shadow-lg shadow-emerald-500/10' 
              : 'bg-slate-100 text-slate-600 border-transparent hover:bg-slate-200'
            }`}
          >
            <Zap size={16} className={`mr-2 ${isStudyMode ? 'fill-emerald-400' : 'text-slate-400'}`} />
            {isStudyMode ? "Focus Mode: ON" : "Focus Mode: OFF"}
          </button>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto h-full">
            {renderContent()}
          </div>
        </div>

      </main>
    </div>
  );
};

export default StudyBuddyResourcesGUI;