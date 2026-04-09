import React from 'react';
import type { Card as CardType } from '../store/useBoardStore';
import { useBoardStore } from '../store/useBoardStore';
import styles from './Card.module.css';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface CardProps {
  card: CardType;
  isOverlay?: boolean;
}

export const Card: React.FC<CardProps> = ({ card, isOverlay }) => {
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: card.id,
    data: {
      type: 'Card',
      card,
    },
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
    opacity: isDragging ? 0.3 : 1,
  };

  // オーバーレイ（ドラッグ中）用のスタイル
  if (isOverlay) {
    return (
      <div className={`${styles.cardContainer} ${styles.cardDragging}`}>
        <h3 className={styles.cardTitle}>{card.title}</h3>
      </div>
    );
  }

  const setSelectedCardId = useBoardStore(state => state.setSelectedCardId);

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...listeners} 
      onClick={() => setSelectedCardId(card.id)}
      className={styles.cardContainer}
    >
      {card.labels && card.labels.length > 0 && (
        <div className={styles.cardLabels}>
          {card.labels.map(label => (
            <span key={label.id} className={styles.cardLabelBadge} style={{ backgroundColor: label.color }}>
              {label.text}
            </span>
          ))}
        </div>
      )}
      <h3 className={styles.cardTitle}>{card.title}</h3>
    </div>
  );
};
