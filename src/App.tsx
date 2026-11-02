import React, { useState, useEffect } from 'react';
import { Web3Provider } from './context/Web3Context';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './views/HomePage';
import { MintPage } from './views/MintPage';
import { ExplorePage } from './views/ExplorePage';
import { NftDetailPage } from './views/NftDetailPage';
import { MarketplacePage } from './views/MarketplacePage';
import { ForgePage } from './views/ForgePage';
import { RewardsPage } from './views/RewardsPage';
import { QuestsPage } from './views/QuestsPage';
import { ActivityPage } from './views/ActivityPage';
import { LeaderboardPage } from './views/LeaderboardPage';
import { ProfilePage } from './views/ProfilePage';
import { AdminPage } from './views/AdminPage';

export default function App() {
  const [currentRoute, setCurrentRoute] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return window.location.pathname || '/';
    }
    return '/';
  });

  // Listen to browser forward/back buttons
  useEffect(() => {
    const handlePopState = () => {
      setCurrentRoute(window.location.pathname || '/');
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (newRoute: string) => {
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', newRoute);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    setCurrentRoute(newRoute);
  };

  // Render appropriate view based on route
  const renderPage = () => {
    // Check if route is /nft/:id
    if (currentRoute.startsWith('/nft/')) {
      const parts = currentRoute.split('/');
      const idStr = parts[2];
      const parsedId = parseInt(idStr, 10);
      return <NftDetailPage tokenId={isNaN(parsedId) ? 1 : parsedId} navigate={navigate} />;
    }

    switch (currentRoute) {
      case '/mint':
        return <MintPage navigate={navigate} />;
      case '/explore':
        return <ExplorePage navigate={navigate} />;
      case '/marketplace':
        return <MarketplacePage navigate={navigate} />;
      case '/forge':
        return <ForgePage navigate={navigate} />;
      case '/rewards':
        return <RewardsPage navigate={navigate} />;
      case '/quests':
        return <QuestsPage navigate={navigate} />;
      case '/activity':
        return <ActivityPage navigate={navigate} />;
      case '/leaderboard':
        return <LeaderboardPage navigate={navigate} />;
      case '/profile':
        return <ProfilePage navigate={navigate} />;
      case '/admin':
        return <AdminPage navigate={navigate} />;
      case '/':
      default:
        return <HomePage navigate={navigate} />;
    }
  };

  return (
    <Web3Provider>
      <div className="min-h-screen bg-[#080b18] text-white flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
        <Navbar currentRoute={currentRoute} navigate={navigate} />
        <main className="flex-1">
          {renderPage()}
        </main>
        <Footer navigate={navigate} />
      </div>
    </Web3Provider>
  );
}
