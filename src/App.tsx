import styles from './App.module.css';
import { Grip, KanbanSquare, Bell, Info } from 'lucide-react';
import { Board } from './components/Board';
import { useBoardStore } from './store/useBoardStore';
import { CardModal } from './components/CardModal';
import { Workspace } from './components/Workspace';
import { useAuthStore } from './store/useAuthStore';
import { Login } from './components/Login';
import { LogOut } from 'lucide-react';

function App() {
  const activeBoardId = useBoardStore(state => state.activeBoardId);
  const setActiveBoardId = useBoardStore(state => state.setActiveBoardId);
  const selectedCardId = useBoardStore(state => state.selectedCardId);
  const setSelectedCardId = useBoardStore(state => state.setSelectedCardId);
  const { isAuthenticated, isLoading, user, signOut } = useAuthStore();

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0f172a', color: 'white' }}>
         <div className={styles.loader} style={{ border: '4px solid rgba(255,255,255,0.1)', borderLeftColor: '#60a5fa', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite' }}></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <div className={`${styles.appContainer} ${activeBoardId ? styles.appContainerBoard : ''}`}>
      {/* Global Header (Appears across all screens) */}
      <header className={styles.globalHeader}>
        <div className={styles.headerLeft}>
          <button className={styles.iconBtn}><Grip size={20} /></button>
          <div className={styles.logo} onClick={() => setActiveBoardId(null)}>
            <KanbanSquare size={20} className={styles.logoIcon} />
            <span className={styles.logoText}>管理くん</span>
          </div>
        </div>
        <div className={styles.headerRight}>
          <button className={styles.iconBtn}><Bell size={20} /></button>
          <button className={styles.iconBtn}><Info size={20} /></button>
          <div className={styles.avatar} style={{ position: 'relative', cursor: 'pointer' }} onClick={() => signOut()} title="ログアウト">
            {user?.email?.[0].toUpperCase() || 'U'}
            <div style={{ position: 'absolute', right: -10, top: 25, color: '#ef4444', background: '#fff', borderRadius: '50%', padding: '2px', display: 'flex' }}>
               <LogOut size={12} />
            </div>
          </div>
        </div>
      </header>

      {/* Internal Routing / View Switcher */}
      <main className={styles.mainArea}>
        {activeBoardId ? <Board key={activeBoardId} boardId={activeBoardId} /> : <Workspace />}
      </main>

      {/* Global Modals */}
      {selectedCardId && (
        <CardModal cardId={selectedCardId} onClose={() => setSelectedCardId(null)} />
      )}
    </div>
  );
}

export default App;
