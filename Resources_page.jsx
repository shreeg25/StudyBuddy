import React, { useState } from 'react';
import { 
  BookOpen, 
  Brain, 
  FileText, 
  MessageSquare, 
  Upload, 
  PlayCircle, 
  CheckCircle, 
  XCircle,
  Search,
  ChevronRight,
  Menu,
  Zap,
  GraduationCap,
  LayoutDashboard,
  ArrowRight,
  AlertTriangle,
  BarChart3
} from 'lucide-react';

const StudyBuddyResources = () => {
  const [activeTab, setActiveTab] = useState('analysis'); 
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedTestId, setSelectedTestId] = useState(1);

  // User Context
  const user = {
    name: "Krish",
    class: "12",
    stream: "PCM"
  };

  // Mock Data
  const tests = [
    {
      id: 1,
      subject: "Physics",
      title: "Unit Test: Thermodynamics & Thermal Properties",
      date: "Oct 12, 2023",
      score: "35/50",
      grade: "B",
      status: "Analyzed",
      questions: [
        { id: 1, text: "Zeroth Law definition", topic: "Thermodynamics Basics", isCorrect: true },
        { id: 2, text: "Work done in Isobaric process", topic: "Thermodynamic Processes", isCorrect: true },
        { id: 3, text: "Efficiency of Carnot Engine calculation", topic: "Heat Engines", isCorrect: false }, 
        { id: 4, text: "Entropy change in reversible process", topic: "Entropy", isCorrect: false }, 
        { id: 5, text: "First Law application", topic: "Thermodynamics Basics", isCorrect: true },
        { id: 6, text: "Cp - Cv relation", topic: "Specific Heat", isCorrect: true },
        { id: 7, text: "Adiabatic expansion formula", topic: "Thermodynamic Processes", isCorrect: false } 
      ]
    }
  ];

  const remedialResources = {
    "Heat Engines": [
      { id: 101, type: "video", title: "Carnot Cycle & Efficiency Made Easy", source: "Khan Academy", duration: "10m" },
      { id: 102, type: "note", title: "Heat Engines Formula Sheet", source: "StudyBuddy Smart Notes", pages: "1 pg" }
    ],
    "Entropy": [
      { id: 201, type: "video", title: "Understanding Entropy Visualized", source: "Veritasium", duration: "15m" }
    ],
    "Thermodynamic Processes": [
      { id: 301, type: "quiz", title: "Adiabatic vs Isothermal Practice", source: "Question Bank", questions: "10 Qs" }
    ]
  };

  const getMistakes = () => {
    const test = tests.find(t => t.id === selectedTestId);
    if (!test) return [];
    return test.questions.filter(q => !q.isCorrect);
  };

  const currentMistakes = getMistakes();

  return (
    // Background changed to sky-50 to match the light blue logo background
    <div className="flex h-screen bg-sky-50 font-sans text-slate-900 overflow-hidden">
      
      {/* Sidebar Navigation - Deep Blue (Logo Outline Color) */}
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-blue-950 text-white transition-all duration-300 flex flex-col shadow-xl z-20`}>
        <div className="p-6 flex items-center justify-between">
          {isSidebarOpen ? (
            <div className="flex items-center space-x-2">
              {/* Icon container matches the logo's graph green */}
              <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              {/* Logo Text: Study (White) Buddy (Green) */}
              <span className="text-xl font-bold tracking-tight">
                Study<span className="text-emerald-400">Buddy</span>
              </span>
            </div>
          ) : (
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center mx-auto">
              <Brain className="w-5 h-5 text-white" />
            </div>
          )}
        </div>

        <nav className="flex-1 mt-6 px-4 space-y-2">
          <NavItem icon={<LayoutDashboard size={20} />} label="Dashboard" isOpen={isSidebarOpen} />
          <NavItem icon={<Zap size={20} />} label="AI Recommendations" isOpen={isSidebarOpen} active />
          <NavItem icon={<GraduationCap size={20} />} label="Test Results" isOpen={isSidebarOpen} />
          <NavItem icon={<FileText size={20} />} label="My Notes" isOpen={isSidebarOpen} />
        </nav>

        <div className="p-4 border-t border-blue-900">
          <div className={`flex items-center ${isSidebarOpen ? 'space-x-3' : 'justify-center'}`}>
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-400 to-cyan-300 flex items-center justify-center text-blue-950 font-bold shadow-lg">
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

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        
        {/* Header */}
        <header className="h-16 bg-white border-b border-blue-100 flex items-center justify-between px-6 shadow-sm z-10">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-blue-50 rounded-lg text-blue-900 transition-colors">
            <Menu size={20} />
          </button>
          <div className="flex items-center space-x-4">
             <span className="text-sm text-slate-500 font-medium bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
               Current Focus: <span className="text-blue-700 font-semibold">Post-Test Analysis</span>
             </span>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          
          <div className="max-w-6xl mx-auto">
            
            {/* 1. Test Selection & Score Summary */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-blue-950 mb-4">Performance Analysis</h1>
              <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-6 flex flex-col md:flex-row items-center justify-between">
                 
                 <div className="flex items-center space-x-4 mb-4 md:mb-0">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <BarChart3 className="text-blue-700 w-8 h-8" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">{tests.find(t => t.id === selectedTestId).title}</h2>
                      <p className="text-sm text-slate-500">Completed on {tests.find(t => t.id === selectedTestId).date}</p>
                    </div>
                 </div>

                 <div className="flex items-center space-x-8">
                    <div className="text-center">
                      <p className="text-xs text-slate-500 uppercase font-semibold">Score</p>
                      <p className="text-3xl font-bold text-slate-900">{tests.find(t => t.id === selectedTestId).score}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-slate-500 uppercase font-semibold">Grade</p>
                      {/* Uses Emerald Green for Grade to match Logo's positive graph */}
                      <p className="text-3xl font-bold text-emerald-500">{tests.find(t => t.id === selectedTestId).grade}</p>
                    </div>
                 </div>

              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* 2. Left Column: Question Breakdown */}
              <div className="lg:col-span-5 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-blue-900 flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-blue-500" />
                    Test Question Breakdown
                  </h3>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-blue-100 overflow-hidden">
                  <div className="p-4 bg-blue-50 border-b border-blue-100 flex justify-between items-center">
                     <span className="text-xs font-bold text-slate-500 uppercase">Question / Topic</span>
                     <span className="text-xs font-bold text-slate-500 uppercase">Status</span>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {tests.find(t => t.id === selectedTestId).questions.map((q) => (
                      <div key={q.id} className={`p-4 flex items-start justify-between ${!q.isCorrect ? 'bg-red-50/50' : ''}`}>
                        <div>
                          <p className="text-sm font-medium text-slate-800">Q{q.id}. {q.text}</p>
                          <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200">
                            {q.topic}
                          </span>
                        </div>
                        <div className="ml-4">
                          {q.isCorrect ? (
                            <CheckCircle className="w-5 h-5 text-emerald-500" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-500" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 3. Center Arrow (Visual Flow) */}
              <div className="hidden lg:flex lg:col-span-1 items-center justify-center">
                 <div className="bg-blue-100 p-2 rounded-full">
                    <ArrowRight className="text-blue-600 w-6 h-6 animate-pulse" />
                 </div>
              </div>

              {/* 4. Right Column: AI Analysis & Resources */}
              <div className="lg:col-span-6 space-y-6">
                
                <h3 className="font-bold text-blue-900 flex items-center">
                  <Brain className="w-5 h-5 mr-2 text-emerald-500" />
                  AI Weak Area Detection
                </h3>

                {/* Detected Areas Card - Deep Blue Brand Background */}
                <div className="bg-gradient-to-br from-blue-900 to-blue-950 rounded-xl p-6 text-white shadow-lg relative overflow-hidden border border-blue-800">
                  {/* Subtle Green Glow matching logo graph */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500 opacity-20 rounded-full blur-2xl -mr-10 -mt-10"></div>
                  
                  <div className="flex items-start mb-4">
                    <AlertTriangle className="text-amber-400 w-6 h-6 mr-3 flex-shrink-0" />
                    <div>
                      <h4 className="font-bold text-lg">3 Weak Areas Detected</h4>
                      <p className="text-blue-200 text-sm mt-1">
                        Based on your incorrect answers in Q3, Q4, and Q7, AI has identified conceptual gaps in the following topics:
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-2">
                    {currentMistakes.map((m, idx) => (
                      <span key={idx} className="bg-white/10 border border-white/20 px-3 py-1 rounded-full text-sm font-medium text-emerald-300">
                        {m.topic}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Remedial Resources List */}
                <div className="space-y-4">
                   <h4 className="font-semibold text-slate-700 text-sm uppercase tracking-wide">Suggested Remedial Resources</h4>
                   
                   {currentMistakes.length > 0 ? (
                     currentMistakes.map((mistake) => {
                       const resources = remedialResources[mistake.topic];
                       if (!resources) return null;

                       return (
                         // Left border uses Emerald Green (Logo Accent)
                         <div key={mistake.topic} className="bg-white border border-l-4 border-l-emerald-500 border-blue-100 rounded-lg p-4 shadow-sm">
                           <div className="flex items-center justify-between mb-3">
                             <p className="text-xs font-bold text-blue-900 uppercase">Because you missed: {mistake.topic}</p>
                             <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-semibold">AI Recommended</span>
                           </div>
                           
                           <div className="space-y-3">
                             {resources.map(res => (
                               <div key={res.id} className="flex items-center group cursor-pointer hover:bg-sky-50 p-2 -mx-2 rounded transition-colors">
                                  <div className={`w-10 h-10 rounded flex items-center justify-center mr-3 ${res.type === 'video' ? 'bg-red-50 text-red-500' : res.type === 'quiz' ? 'bg-emerald-50 text-emerald-500' : 'bg-blue-50 text-blue-500'}`}>
                                     {res.type === 'video' ? <PlayCircle size={20} /> : res.type === 'quiz' ? <CheckCircle size={20} /> : <FileText size={20} />}
                                  </div>
                                  <div className="flex-1">
                                     <p className="text-sm font-semibold text-slate-800 group-hover:text-blue-700 transition-colors">{res.title}</p>
                                     <p className="text-xs text-slate-500">{res.source} • {res.duration || res.pages || res.questions}</p>
                                  </div>
                                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500" />
                               </div>
                             ))}
                           </div>
                         </div>
                       );
                     })
                   ) : (
                     <div className="p-8 text-center text-slate-500 bg-white rounded-lg border border-dashed border-slate-300">
                       No weak areas detected in this test! Great job.
                     </div>
                   )}
                </div>

              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

// NavItem Updated to use Emerald Green for Active State
const NavItem = ({ icon, label, isOpen, active = false }) => (
  <a href="#" className={`flex items-center px-3 py-3 rounded-lg transition-colors group ${active ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20' : 'text-blue-200 hover:bg-blue-900 hover:text-white'}`}>
    <span className={`${active ? 'text-white' : 'text-blue-300 group-hover:text-white'}`}>{icon}</span>
    {isOpen && <span className="ml-3 text-sm font-medium">{label}</span>}
  </a>
);

export default StudyBuddyResources;