import React, { useState, useMemo } from 'react';
import { 
  DndContext, 
  DragOverlay, 
  closestCorners, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors
} from '@dnd-kit/core';
import type { DragStartEvent, DragOverEvent, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import styles from './Board.module.css';
import { List } from './List';
import { Card } from './Card';
import { useBoardStore } from '../store/useBoardStore';
import type { Card as CardType } from '../store/useBoardStore';

export const Board: React.FC<{ boardId: string }> = ({ boardId }) => {
  const boards = useBoardStore(state => state.boards);
  const updateActiveBoard = useBoardStore(state => state.updateActiveBoard);
  const addList = useBoardStore(state => state.addList);
  
  const board = boards.find(b => b.id === boardId);

  const [newListTitle, setNewListTitle] = useState('');
  const [isAddingList, setIsAddingList] = useState(false);
  const [activeCard, setActiveCard] = useState<CardType | null>(null);
  const [activeListId, setActiveListId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  if (!board) return null;

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const isCard = active.data.current?.type === 'Card';
    const isList = active.data.current?.type === 'List';

    if (isCard) {
      const list = board.lists.find((l) => l.cards.some((c) => c.id === active.id));
      const card = list?.cards.find((c) => c.id === active.id);
      if (card) setActiveCard(card);
    } else if (isList) {
      setActiveListId(active.id as string);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    if (active.data.current?.type === 'Card' && (over.data.current?.type === 'Card' || over.data.current?.type === 'List')) {
      const activeId = active.id;
      const overId = over.id;

      if (activeId === overId) return;

      const activeListIndex = board.lists.findIndex((l) => l.cards.some((c) => c.id === activeId));
      let overListIndex;
      if (over.data.current?.type === 'List') {
        overListIndex = board.lists.findIndex((l) => l.id === overId);
      } else {
        overListIndex = board.lists.findIndex((l) => l.cards.some((c) => c.id === overId));
      }

      if (activeListIndex !== overListIndex && activeListIndex >= 0 && overListIndex >= 0) {
        const newLists = [...board.lists];
        const activeListCards = [...newLists[activeListIndex].cards];
        const overListCards = [...newLists[overListIndex].cards];

        const activeCardIndex = activeListCards.findIndex((c) => c.id === activeId);
        const cardToMove = activeListCards.splice(activeCardIndex, 1)[0];
        cardToMove.listId = newLists[overListIndex].id;

        let overCardIndex = -1;
        if (over.data.current?.type === 'Card') {
          overCardIndex = overListCards.findIndex((c) => c.id === overId);
        }
        
        if (overCardIndex >= 0) {
          overListCards.splice(overCardIndex, 0, cardToMove);
        } else {
          overListCards.push(cardToMove);
        }

        newLists[activeListIndex] = { ...newLists[activeListIndex], cards: activeListCards };
        newLists[overListIndex] = { ...newLists[overListIndex], cards: overListCards };
        updateActiveBoard({ lists: newLists });
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) {
      setActiveCard(null);
      setActiveListId(null);
      return;
    }

    if (active.data.current?.type === 'Card') {
      const activeId = active.id;
      const overId = over.id;
      if (activeId !== overId) {
        const listIndex = board.lists.findIndex((l) => l.cards.some((c) => c.id === activeId));
        if (listIndex > -1) {
          const newCards = [...board.lists[listIndex].cards];
          const oldIndex = newCards.findIndex((c) => c.id === activeId);
          const newIndex = newCards.findIndex((c) => c.id === overId);
          if (oldIndex !== newIndex && newIndex !== -1) {
            newCards.splice(newIndex, 0, newCards.splice(oldIndex, 1)[0]);
            const newLists = [...board.lists];
            newLists[listIndex] = { ...newLists[listIndex], cards: newCards };
            updateActiveBoard({ lists: newLists });
          }
        }
      }
    } else if (active.data.current?.type === 'List') {
      const activeId = active.id;
      const overId = over.id;
      if (activeId !== overId) {
        const oldIndex = board.lists.findIndex((l) => l.id === activeId);
        const newIndex = board.lists.findIndex((l) => l.id === overId);
        if (oldIndex !== newIndex && newIndex !== -1) {
          const newLists = arrayMove(board.lists, oldIndex, newIndex);
          updateActiveBoard({ lists: newLists });
        }
      }
    }
    setActiveCard(null);
    setActiveListId(null);
  };

  const handleAddListSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newListTitle.trim()) {
      addList(newListTitle);
      setNewListTitle('');
      setIsAddingList(false);
    }
  };

  const listIds = useMemo(() => board.lists.map((l) => l.id), [board.lists]);

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
      <div className={`${styles.boardWrapper} ${styles[board.thumbnail || 'bg-1']}`}>
        <div className={styles.boardInner}>
          <div className={styles.boardHeader}>
            <h2 className={styles.boardTitle}>{board.title}</h2>
          </div>
          <div className={styles.listsContainer}>
            <SortableContext items={listIds}>
              {board.lists.map((list) => (
                <List key={list.id} list={list} />
              ))}
            </SortableContext>
            <div className={styles.addListContainer}>
              {isAddingList ? (
                <form onSubmit={handleAddListSubmit} className={styles.addListForm}>
                  <input
                    type="text"
                    value={newListTitle}
                    onChange={(e) => setNewListTitle(e.target.value)}
                    placeholder="もう1つリストを追加..."
                    className={styles.addListInput}
                    autoFocus
                  />
                  <div className={styles.addListActions}>
                    <button type="submit" className={styles.btnPrimary} style={{ padding: '6px 12px' }}>
                      リストを追加
                    </button>
                    <button type="button" onClick={() => setIsAddingList(false)} className={styles.btnCancel}>
                      ✕
                    </button>
                  </div>
                </form>
              ) : (
                <button className={styles.addListBtn} onClick={() => setIsAddingList(true)}>
                  <Plus size={20} /> リストを追加
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      <DragOverlay>
        {activeCard ? <Card card={activeCard} /> : null}
        {activeListId ? (
          <div style={{ opacity: 0.8, transform: 'scale(1.05)' }}>
             <List list={board.lists.find(l => l.id === activeListId)!} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};
