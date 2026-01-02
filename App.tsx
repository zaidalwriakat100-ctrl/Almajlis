import React, { useState, useEffect, useCallback } from 'react';
import Layout from './components/Layout';
import DashboardHome from './components/DashboardHome';
import SessionView from './components/SessionView';
import SessionDetailView from './components/SessionDetailView';
import MPListView from './components/MPListView';
import MPDetailView from './components/MPDetailView';
import PartiesView from './components/PartiesView';
import PartyDetailView from './components/PartyDetailView';
import AboutView from './components/AboutView';
import VotingView from './components/VotingView';
import TopicsView from './components/TopicsView';
import LawsView from './components/LawsView';
import AnalyzePage from './src/pages/AnalyzePage';

import { MP, ParliamentSession, Party } from './types';
import { getMPById, getSessionById, getPartyById, getMPs } from './services/api';
import { normalizeForSearch } from './utils/dataProcessing';

// Parse hash to get current route
const parseHash = (): { tab: string; entity?: string; id?: string } => {
  const hash = window.location.hash.slice(1); // Remove #
  if (!hash) return { tab: 'dashboard' };

  const parts = hash.split('/');
  if (parts.length === 1) {
    return { tab: parts[0] || 'dashboard' };
  } else if (parts.length >= 2) {
    // Format: #sessions/session_43 or #mps/mp_001
    return { tab: parts[0], entity: parts[0], id: parts[1] };
  }
  return { tab: 'dashboard' };
};

// Build hash string
const buildHash = (tab: string, entity?: string, id?: string): string => {
  if (entity && id) {
    return `#${tab}/${id}`;
  }
  return `#${tab}`;
};

const App: React.FC = () => {
  const initialRoute = parseHash();
  const [activeTab, setActiveTab] = useState(initialRoute.tab);
  const [topicSearchQuery, setTopicSearchQuery] = useState('');
  const [selectedCommittee, setSelectedCommittee] = useState<{ name: string, session: string } | null>(null);

  const [viewState, setViewState] = useState<{
    type: 'list' | 'detail',
    id?: string,
    entity?: 'mp' | 'session' | 'party',
    data?: any,
    relatedData?: any,
    highlightId?: string
  }>({ type: 'list' });

  const [mps, setMps] = useState<MP[]>([]);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Load entity data by ID
  const loadEntityData = useCallback(async (entity: string, id: string) => {
    let data = null;
    let relatedData = null;

    if (entity === 'sessions' || entity === 'session') {
      data = await getSessionById(id);
      if (data) {
        setViewState({ type: 'detail', id, entity: 'session', data });
        setActiveTab('sessions');
      }
    } else if (entity === 'mps' || entity === 'mp') {
      data = await getMPById(id);
      if (data) {
        setViewState({ type: 'detail', id, entity: 'mp', data });
        setActiveTab('mps');
      }
    } else if (entity === 'parties' || entity === 'party') {
      data = await getPartyById(id);
      if (data) {
        const allMps = await getMPs();
        relatedData = allMps.filter(mp =>
          (mp.party && mp.party.includes(data.name)) ||
          (mp.parliamentaryBloc && mp.parliamentaryBloc.includes(data.name))
        );
        setViewState({ type: 'detail', id, entity: 'party', data, relatedData });
        setActiveTab('parties');
      }
    }
  }, []);

  useEffect(() => {
    document.documentElement.dir = 'rtl';
    document.documentElement.lang = 'ar';

    const loadMps = async () => {
      const loadedMps = await getMPs();
      setMps(loadedMps);
    };

    loadMps();

    // Handle initial URL on page load
    const route = parseHash();
    if (route.entity && route.id) {
      loadEntityData(route.entity, route.id);
    } else if (route.tab) {
      setActiveTab(route.tab);
      setViewState({ type: 'list' });
    }
    setIsInitialLoad(false);

    // Handle browser back/forward buttons
    const handlePopState = () => {
      const route = parseHash();
      if (route.entity && route.id) {
        loadEntityData(route.entity, route.id);
      } else {
        setActiveTab(route.tab || 'dashboard');
        setViewState({ type: 'list' });
      }
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [loadEntityData]);

  const handleNavigation = (tab: string) => {
    setActiveTab(tab);
    setViewState({ type: 'list' });
    if (tab !== 'topics') setTopicSearchQuery('');

    // Update URL hash
    window.history.pushState(null, '', buildHash(tab));

    const mainElement = document.querySelector('main');
    if (mainElement) mainElement.scrollTo(0, 0);
    window.scrollTo(0, 0);
  };

  const handleTopicClick = (topic: string) => {
    setTopicSearchQuery(topic);
    setActiveTab('topics');
    setViewState({ type: 'list' });
    window.history.pushState(null, '', buildHash('topics'));
    const mainElement = document.querySelector('main');
    if (mainElement) mainElement.scrollTo(0, 0);
    window.scrollTo(0, 0);
  };

  const handleCommitteeClick = (committeeName: string, session: string) => {
    setSelectedCommittee({ name: committeeName, session });
    setActiveTab('mps');
    setViewState({ type: 'list' });
    window.history.pushState(null, '', buildHash('mps'));
    const mainElement = document.querySelector('main');
    if (mainElement) mainElement.scrollTo(0, 0);
    window.scrollTo(0, 0);
  };

  const handleMpNameClick = async (name: string) => {
    const allMps = await getMPs();
    const normalizedSearchName = normalizeForSearch(name);

    const foundMp = allMps.find(mp =>
      normalizeForSearch(mp.fullName) === normalizedSearchName ||
      normalizeForSearch(mp.fullName).includes(normalizedSearchName)
    );

    if (foundMp) {
      handleEntityClick('mp', foundMp.id);
    }
  };

  const handleEntityClick = async (
    entity: 'mp' | 'session' | 'party',
    id: string,
    highlightId?: string
  ) => {
    let data = null;
    let relatedData = null;

    if (entity === 'session') data = await getSessionById(id);
    if (entity === 'mp') data = await getMPById(id);

    if (entity === 'party') {
      data = await getPartyById(id);
      if (data) {
        const allMps = await getMPs();
        relatedData = allMps.filter(mp =>
          (mp.party && mp.party.includes(data.name)) ||
          (mp.parliamentaryBloc && mp.parliamentaryBloc.includes(data.name))
        );
      }
    }

    if (data) {
      const newViewState = { type: 'detail' as const, id, entity, data, relatedData, highlightId };
      setViewState(newViewState);

      // Update URL hash based on entity type
      const tabName = entity === 'session' ? 'sessions' : entity === 'mp' ? 'mps' : 'parties';
      setActiveTab(tabName);
      window.history.pushState(null, '', buildHash(tabName, entity, id));

      // التمرير للأعلى دائماً عند فتح تفاصيل أي كيان
      const mainElement = document.querySelector('main');
      if (mainElement) mainElement.scrollTo(0, 0);
      window.scrollTo(0, 0);
    }
  };

  const handleBack = () => {
    window.history.back();
  };

  const renderContent = () => {
    if (viewState.type === 'detail' && viewState.data) {
      if (viewState.entity === 'mp') {
        return (
          <MPDetailView
            mp={viewState.data as MP}
            onBack={handleBack}
            onSessionClick={(id, segId) => handleEntityClick('session', id, segId)}
            onTopicClick={handleTopicClick}
            onCommitteeClick={handleCommitteeClick}
          />
        );
      }

      if (viewState.entity === 'session') {
        return (
          <SessionDetailView
            session={viewState.data as ParliamentSession}
            mps={mps}
            onBack={handleBack}
            onMpClick={(id) => handleEntityClick('mp', id)}
          />
        );
      }

      if (viewState.entity === 'party') {
        return (
          <PartyDetailView
            party={viewState.data as Party}
            partyMps={viewState.relatedData}
            onBack={handleBack}
            onMpClick={(id) => handleEntityClick('mp', id)}
          />
        );
      }
    }

    switch (activeTab) {
      case 'dashboard':
        return <DashboardHome onNavigate={handleNavigation} onSessionSelect={(id) => handleEntityClick('session', id)} onMpSelect={(id) => handleEntityClick('mp', id)} />;

      case 'sessions':
        return <SessionView onSessionSelect={(id) => handleEntityClick('session', id)} mps={mps} onMpClick={(id) => handleEntityClick('mp', id)} />;

      case 'mps':
        return <MPListView onMpSelect={(id) => handleEntityClick('mp', id)} selectedCommittee={selectedCommittee} onClearCommittee={() => setSelectedCommittee(null)} />;

      case 'voting':
        return <VotingView onMpSelect={(id) => handleEntityClick('mp', id)} />;

      case 'parties':
        return <PartiesView onPartySelect={(id) => handleEntityClick('party', id)} onMpSelect={handleMpNameClick} />;

      case 'laws':
        return <LawsView />;

      case 'topics':
        return <TopicsView initialQuery={topicSearchQuery} onSessionSelect={(id, segId) => handleEntityClick('session', id, segId)} />;

      case 'about':
        return <AboutView />;

      case 'analyze':
        return <AnalyzePage mps={mps} />;

      default:
        return <DashboardHome onNavigate={handleNavigation} onSessionSelect={(id) => handleEntityClick('session', id)} onMpSelect={(id) => handleEntityClick('mp', id)} />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={handleNavigation}>
      {renderContent()}
    </Layout>
  );
};

export default App;
