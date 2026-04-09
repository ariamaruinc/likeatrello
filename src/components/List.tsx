import { useState } from 'react';
import type { List as ListType } from '../store/useBoardStore';
import { useBoardStore } from '../store/useBoardStore';
import { Card } from './Card';
import styles from './List.module.css';
import { Plus, MoreHorizontal, X } from 'lucide-react';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface ListProps {
  list: ListType;
  isOverlay?: boolean;
}

export const List = ({ list, isOverlay }: ListProps) => {
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState('');
  const addCard = useBoardStore(state => state.addCard);

  const handleAddCard = () => {
    if (newCardTitle.trim()) {
      addCard(list.id, newCardTitle.trim());
      setNewCardTitle('');
      setIsAddingCard(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAddCard();
    if (e.key === 'Escape') setIsAddingCard(false);
  };

  // List自体のドラッグ定義
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: list.id,
    data: {
      type: 'List',
      list,
    },
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
    opacity: isDragging ? 0.3 : 1,
  };

  if (isOverlay) {
    return (
      <div className={`glass-panel ${styles.listContainer} ${styles.listDragging}`}>
        <div className={styles.listHeader}>
          <h2 className={styles.listTitle}>{list.title}</h2>
        </div>
        <div className={styles.cardList}>
          {list.cards.map(card => (
            <Card key={card.id} card={card} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={`glass-panel ${styles.listContainer}`}
    >
      <div className={styles.listHeader} {...attributes} {...listeners} style={{ cursor: 'grab' }}>
        <h2 className={styles.listTitle}>{list.title}</h2>
        <button className={styles.moreBtn}>
          <MoreHorizontal size={18} />
        </button>
      </div>
      
      <div className={styles.cardList}>
        <SortableContext items={list.cards.map(c => c.id)} strategy={verticalListSortingStrategy}>
          {list.cards.map(card => (
            <Card key={card.id} card={card} />
          ))}
        </SortableContext>

        {isAddingCard && (
          <div className={styles.addCardForm}>
            <textarea
              autoFocus
              className={styles.addCardInput}
              placeholder="カードのタイトルを入力..."
              value={newCardTitle}
              onChange={(e) => setNewCardTitle(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <div className={styles.addCardActions}>
              <button 
                className={styles.btnAddConfirm}
                onClick={handleAddCard}
              >
                追加
              </button>
              <button 
                className={styles.btnAddCancel}
                onClick={() => setIsAddingCard(false)}
              >
                <X size={20} />
              </button>
            </div>
          </div>
        )}
      </div>
      
      {!isAddingCard && (
        <button 
          className={styles.addCardBtn}
          onClick={() => setIsAddingCard(true)}
        >
          <Plus size={16} />
          カードを追加
        </button>
      )}
    </div>
  );
};
