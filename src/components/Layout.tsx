import React, { useState } from 'react';
import {
  FileText,
  Vote,
  Users,
  Newspaper,
  Menu,
  X,
  Scale,
  Search,
  Home,
  Info,
  Activity
} from 'lucide-react';
import Logo from './Logo';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const navItems = [
    { id: 'dashboard', label: 'الرئيسية', icon: Home },
    { id: 'sessions', label: 'الجلسات', icon: FileText },

    // ✅ التاب الجديد
    { id: 'analyze', label: 'تحليل الجلسة', icon: Activity },

    { id: 'mps', label: 'النواب', icon: Users },
    { id: 'voting', label: 'تحليل التصويت', icon: Vote },
    { id: 'parties', label: 'الكتل', icon: Users },
    { id: 'citizen', label: 'تشريعات', icon: Scale },
    { id: 'news', label: 'الأخبار', icon: Newspaper },
    { id: 'about', label: 'عن المرصد', icon: Info },
  ];

  const mobileNavItems = [
    { id: 'dashboard', icon: Home, label: 'الرئيسية' },
    { id: 'sessions', icon: FileText, label: 'الجلسات' },
    { id: 'analyze', icon: Activity, label: 'تحليل' },
    { id: 'mps', icon: Users, label: 'النواب' },
    { id: 'citizen', icon: Scale, label: 'تشريعات' },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row text-right font-sans" dir="rtl">

      {/* Mobile Top Header */}
      <div className="md:hidden bg-parliament-emblem text-white p-4 flex justify-between items-center shadow-md z-30 sticky top-0">
        <div className="flex items-center gap-2">
          <Logo size="small" variant="light" />
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1">
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 right-0 z-20 w-72 bg-parliament-emblem text-parliament-stone
          transform transition-transform duration-300 ease-in-out shadow-2xl
          md:relative md:translate-x-0
          ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        <div className="p-8 border-b border-parliament-dome/30 flex flex-col items-center bg-black/10">
          <Logo size="large" variant="light" />
        </div>

        <div className="p-6">
          <div className="relative mb-8">
            <input
              type="text"
              placeholder="بحث عام..."
              className="w-full bg-black/20 border border-parliament-dome/40 text-white text-sm rounded-t-xl rounded-b-lg pl-4 pr-10 py-3 focus:outline-none focus:ring-2 focus:ring-parliament-sand/50 placeholder-parliament-stone/30"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute right-3 top-3 text-parliament-stone/50" size={18} />
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsSidebarOpen(false);
                }}
                className={`
                  w-full flex items-center space-x-3 space-x-reverse px-4 py-3.5 rounded-t-xl rounded-b-md
                  transition-all duration-200
                  ${activeTab === item.id
                    ? 'bg-parliament-dome text-white font-bold border-r-4 border-parliament-sand'
                    : 'text-parliament-stone/70 hover:bg-white/5 hover:text-white'}
                `}
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto h-screen p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="hidden md:flex justify-between items-center mb-8 bg-white/50 p-4 rounded-xl border">
            <h2 className="text-2xl font-bold">
              {navItems.find(i => i.id === activeTab)?.label}
            </h2>
          </div>
          {children}
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-parliament-stone border-t px-6 py-3 flex justify-between z-30">
        {mobileNavItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center gap-1 ${
              activeTab === item.id ? 'text-parliament-dome' : 'text-parliament-shadow/50'
            }`}
          >
            <item.icon size={22} />
            <span className="text-[10px]">{item.label}</span>
          </button>
        ))}
      </div>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-10 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;
