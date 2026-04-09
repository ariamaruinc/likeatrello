import React, { useState } from 'react';
import { useBoardStore } from '../store/useBoardStore';
import styles from './Workspace.module.css';
import { LayoutDashboard, Users, Settings, KanbanSquare, Clock, X } from 'lucide-react';

export const Workspace: React.FC = () => {
  const boards = useBoardStore(state => state.boards);
  const setActiveBoardId = useBoardStore(state => state.setActiveBoardId);
  const addBoard = useBoardStore(state => state.addBoard);
  const [showCreatePop, setShowCreatePop] = useState(false);
  const [newBoardTitle, setNewBoardTitle] = useState('');
  const [newBoardBg, setNewBoardBg] = useState('bg-1');

  const handleCreateBoard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBoardTitle.trim()) return;
    addBoard(newBoardTitle, newBoardBg);
    setNewBoardTitle('');
    setShowCreatePop(false);
  };

  const bgs = ['bg-1', 'bg-2', 'bg-3', 'bg-4'];

  return (
    <div className={styles.workspaceContainer}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <nav className={styles.navMenu}>
          <a href="#" className={styles.navItemActive}><KanbanSquare size={18} /> ボード</a>
          <a href="#" className={styles.navItem}><LayoutDashboard size={18} /> テンプレート</a>
          <a href="#" className={styles.navItem}><LayoutDashboard size={18} /> ホーム</a>
        </nav>
        <div className={styles.workspaceSection}>
          <div className={styles.wsHeader}>
            <div className={styles.wsIcon}>E</div>
            <div>
              <div className={styles.wsTitle}>Emi Konishiさんのワークスペース</div>
              <div className={styles.wsSubtitle}>無料</div>
            </div>
          </div>
          <nav className={styles.wsMenu}>
            <a href="#" className={styles.wsNavItemActive}><KanbanSquare size={16} /> ボード</a>
            <a href="#" className={styles.wsNavItem}><Users size={16} /> メンバー</a>
            <a href="#" className={styles.wsNavItem}><Settings size={16} /> 設定</a>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className={styles.mainContent}>
        <div className={styles.contentInner}>
          <section className={styles.contentSection}>
            <h2 className={styles.sectionTitle}><Clock size={20} /> 最近の表示</h2>
            <div className={styles.boardGrid}>
              {boards.slice(0, 4).map(board => (
                <div key={`recent-${board.id}`} className={`${styles.boardTile} ${styles[board.thumbnail || 'bg-1']}`} onClick={() => setActiveBoardId(board.id)}>
                  <div className={styles.tileOverlay}></div>
                  <h3 className={styles.tileTitle}>{board.title}</h3>
                </div>
              ))}
            </div>
          </section>

          <section className={styles.contentSection}>
            <h2 className={styles.sectionTitle}><span className={styles.wsIconSmall}>E</span> Emi Konishiさんのワークスペース</h2>
            <div className={styles.boardGrid}>
              {boards.map(board => (
                <div key={board.id} className={`${styles.boardTile} ${styles[board.thumbnail || 'bg-1']}`} onClick={() => setActiveBoardId(board.id)}>
                  <div className={styles.tileOverlay}></div>
                  <h3 className={styles.tileTitle}>{board.title}</h3>
                </div>
              ))}
              
              <div className={styles.createTile} onClick={() => setShowCreatePop(true)}>
                <span>新しいボードを作成</span>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Create Board Popover */}
      {showCreatePop && (
        <div className={styles.popoverOverlay} onClick={() => setShowCreatePop(false)}>
          <div className={styles.popoverContent} onClick={e => e.stopPropagation()}>
            <button className={styles.closeBtn} onClick={() => setShowCreatePop(false)}><X size={16}/></button>
            <h3 className={styles.popoverTitle}>ボードを作成</h3>
            <form onSubmit={handleCreateBoard}>
              <div className={styles.bgPicker}>
                {bgs.map(bg => (
                  <div 
                    key={bg} 
                    className={`${styles.bgOption} ${styles[bg]} ${newBoardBg === bg ? styles.bgSelected : ''}`}
                    onClick={() => setNewBoardBg(bg)}
                  />
                ))}
              </div>
              <label className={styles.inputLabel}>ボードタイトル <span className={styles.required}>*</span></label>
              <input 
                type="text" 
                className={styles.boardInput} 
                autoFocus 
                value={newBoardTitle} 
                onChange={e => setNewBoardTitle(e.target.value)} 
              />
              <button type="submit" className={styles.btnPrimary} style={{ width: '100%', marginTop: '16px' }} disabled={!newBoardTitle.trim()}>
                作成
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
