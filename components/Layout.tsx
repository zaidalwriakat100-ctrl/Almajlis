
import React, { useState, useEffect, useRef } from 'react';
import {
  FileText, Users, Menu, X, Scale, Home,
  Info, Hash
} from 'lucide-react';
import Logo from './Logo';
import Particles from './Particles';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const mainContentRef = useRef<HTMLElement>(null);

  // Scroll to top when activeTab changes
  useEffect(() => {
    if (mainContentRef.current) {
      mainContentRef.current.scrollTop = 0;
    }
    // Also scroll window just in case
    window.scrollTo(0, 0);
  }, [activeTab]);

  const navItems = [
    { id: 'dashboard', label: 'الرئيسية', icon: Home },
    { id: 'sessions', label: 'الجلسات والملخصات', icon: FileText },
    { id: 'mps', label: 'النواب', icon: Users },
    { id: 'laws', label: 'القوانين', icon: Scale },
    { id: 'topics', label: 'القضايا والمواضيع', icon: Hash },
    { id: 'parties', label: 'الكتل والأحزاب', icon: Users },
    { id: 'about', label: 'عن المجلس', icon: Info },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row font-sans bg-parliament-wall/5" dir="rtl">

      {/* Floating Particles Background */}
      <Particles count={15} />

      {/* Mobile Header */}
      <header className="md:hidden bg-parliament-greenMain text-white p-4 flex justify-between items-center shadow-lg z-40 sticky top-0 border-b border-parliament-wood">
        <div className="flex items-end gap-2 cursor-pointer hover:opacity-90 transition-opacity" onClick={() => setActiveTab('dashboard')}>
          <Logo size="small" variant="light" />
          <span className="font-black text-xl pb-0.5">المجلس</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 bg-parliament-wood rounded-xl text-parliament-marble"
            aria-expanded={isSidebarOpen}
          >
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Sidebar (Desktop) */}
      <aside
        className={`
          fixed inset-y-0 right-0 border-l-[6px] z-50 w-80 bg-curtain-gradient text-parliament-wall transform transition-transform duration-500 ease-out shadow-2xl
          md:relative md:translate-x-0 border-parliament-wood overflow-hidden
          ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        {/* Subtle Pattern Overlay */}
        <div className="absolute inset-0 pattern-mashrabiyya opacity-5 pointer-events-none"></div>

        <div
          className="p-6 border-b border-white/10 flex flex-col items-center justify-center relative cursor-pointer group z-10"
          onClick={() => setActiveTab('dashboard')}
        >
          <div className="mb-3 transform group-hover:rotate-12 transition-transform duration-700">
            <Logo size="medium" variant="light" className="drop-shadow-[0_8px_8px_rgba(0,0,0,0.4)]" />
          </div>
          <h2 className="text-2xl font-black text-white group-hover:text-parliament-accent transition-all duration-500 drop-shadow-md">المجلس</h2>
          <div className="w-8 h-1 bg-parliament-accent mt-1.5 rounded-full opacity-50 group-hover:w-16 transition-all duration-500"></div>
        </div>

        <nav className="p-4 space-y-1.5" role="navigation">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setIsSidebarOpen(false);
              }}
              className={`
                    w-full flex items-center gap-3 px-4 py-2.5 transition-all duration-500 group rounded-xl relative overflow-hidden
                    ${activeTab === item.id
                  ? 'bg-wood-gradient text-white shadow-lg font-black translate-x-1'
                  : 'text-parliament-wall/60 hover:bg-white/10 hover:text-white hover:translate-x-2'}
                `}
            >
              {/* Active Indicator Dot */}
              {activeTab === item.id && (
                <div className="absolute right-0 top-0 bottom-0 w-1 bg-parliament-accent animate-pulse"></div>
              )}

              <div className={`
                p-1.5 rounded-lg transition-all duration-500
                ${activeTab === item.id ? 'bg-white/20' : 'bg-transparent group-hover:bg-white/5'}
              `}>
                <item.icon
                  size={18}
                  strokeWidth={activeTab === item.id ? 2.5 : 2}
                  className={activeTab === item.id ? 'text-white' : 'text-parliament-wood group-hover:text-parliament-accent'}
                />
              </div>

              <span className={`text-[13px] font-bold tracking-tight transition-all duration-300 ${activeTab === item.id ? 'mr-1' : ''}`}>
                {item.label}
              </span>

              {activeTab !== item.id && (
                <div className="mr-auto opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-1 group-hover:translate-x-0">
                  <div className="w-1 h-1 rounded-full bg-parliament-accent"></div>
                </div>
              )}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main ref={mainContentRef} className="flex-1 overflow-y-auto h-[calc(100vh-60px)] md:h-screen relative p-4 md:p-12">
        <div className="max-w-7xl mx-auto h-full">
          {/* Desktop Top Header Bar */}
          <div className="hidden md:flex justify-between items-center mb-12 bg-white/40 backdrop-blur-3xl p-6 rounded-[32px] border border-parliament-wood/10 shadow-sm sticky top-0 z-30">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-7 bg-parliament-wood rounded-full"></span>
              <h2 className="text-2xl font-black text-parliament-greenMain">
                {navItems.find(i => i.id === activeTab)?.label || 'الرئيسية'}
              </h2>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-left">
                <p className="text-parliament-textMuted text-[10px] font-black uppercase tracking-tighter">آخر رصد وتحديث</p>
                <p className="text-parliament-greenDark font-bold text-sm">
                  {new Date().toLocaleDateString('ar-JO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
            </div>
          </div>

          <div className="pb-24">
            {children}
          </div>
        </div>
      </main>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-parliament-greenDark/90 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        ></div>
      )}
    </div>
  );
};

export default Layout;
