import React, { useState } from 'react';
import { useBoardStore } from '../store/useBoardStore';
import type { Card as CardType } from '../store/useBoardStore';
import styles from './CardModal.module.css';
import { X, Calendar, Paperclip, Tag, MessageSquare, CheckSquare, Image as ImageIcon } from 'lucide-react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';

// --- サブコンポーネント: チェックリスト描画用 ---
const ChecklistRenderer = ({ 
  checklist, 
  onUpdate, 
  onDelete 
}: { 
  checklist: any; 
  onUpdate: (lc: any) => void; 
  onDelete: () => void; 
}) => {
  const [newItemText, setNewItemText] = useState('');
  
  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemText.trim()) return;
    const newItem = { id: uuidv4(), text: newItemText, isCompleted: false };
    onUpdate({ ...checklist, items: [...checklist.items, newItem] });
    setNewItemText('');
  };

  const toggleItem = (itemId: string) => {
    const items = checklist.items.map((item: any) => 
      item.id === itemId ? { ...item, isCompleted: !item.isCompleted } : item
    );
    onUpdate({ ...checklist, items });
  };
  
  const deleteItem = (itemId: string) => {
    const items = checklist.items.filter((item: any) => item.id !== itemId);
    onUpdate({ ...checklist, items });
  };

  const progress = checklist.items.length === 0 
    ? 0 
    : Math.round((checklist.items.filter((i: any) => i.isCompleted).length / checklist.items.length) * 100);

  return (
    <div className={styles.checklistContainer}>
      <div className={styles.checklistHeader}>
        <h3 className={styles.sectionTitle}><CheckSquare size={16} /> {checklist.title}</h3>
        <button className={styles.btnDelete} onClick={onDelete}>削除</button>
      </div>
      
      <div className={styles.progressBarWrapper}>
        <span className={styles.progressPercent}>{progress}%</span>
        <div className={styles.progressBarBg}>
          <div 
            className={styles.progressBarFill} 
            style={{ 
              width: `${progress}%`, 
              backgroundColor: progress === 100 ? 'var(--success-color)' : 'var(--accent-color)' 
            }} 
          />
        </div>
      </div>

      <div className={styles.checklistItems}>
        {checklist.items.map((item: any) => (
          <div key={item.id} className={styles.checkItem}>
            <input 
              type="checkbox" 
              className={styles.checkInput} 
              checked={item.isCompleted} 
              onChange={() => toggleItem(item.id)} 
            />
            <span className={`${styles.checkText} ${item.isCompleted ? styles.checkTextDone : ''}`}>
              {item.text}
            </span>
            <button className={styles.btnDeleteSm} onClick={() => deleteItem(item.id)}><X size={14} /></button>
          </div>
        ))}
      </div>
      
      <form onSubmit={handleAddItem} className={styles.addItemForm}>
        <input 
          type="text" 
          placeholder="アイテムを追加..." 
          className={styles.addItemInput}
          value={newItemText}
          onChange={e => setNewItemText(e.target.value)}
        />
        <button type="submit" className={styles.btnAddConfirm} style={{ padding: '6px 12px' }} disabled={!newItemText.trim()}>追加</button>
      </form>
    </div>
  );
};
// --- サブコンポーネント: 期限ピッカー ---
const DatePickerPopover = ({ 
  initialDueDate, 
  onSave, 
  onClose 
}: { 
  initialDueDate?: string, 
  onSave: (dateStr: string | null) => void, 
  onClose: () => void 
}) => {
  const [currentMonth, setCurrentMonth] = useState(initialDueDate ? new Date(initialDueDate) : new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(initialDueDate ? new Date(initialDueDate) : null);
  
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  const dateGrid = eachDayOfInterval({ start: startDate, end: endDate });

  const handleSave = () => {
    if (selectedDate) onSave(selectedDate.toISOString());
    else onSave(null);
  };

  return (
    <div className={styles.datePickerPopover}>
      <div className={styles.dpHeader}>
        <span className={styles.dpTitle}>日付</span>
        <button className={styles.btnDeleteSm} style={{ position: 'absolute', right: 0 }} onClick={onClose}><X size={14}/></button>
      </div>
      
      <div className={styles.dpMonthNav}>
        <button className={styles.btnDeleteSm} onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>{'<'}</button>
        <span>{format(currentMonth, 'M月 yyyy')}</span>
        <button className={styles.btnDeleteSm} onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>{'>'}</button>
      </div>

      <div className={styles.dpGrid}>
        {['日', '月', '火', '水', '木', '金', '土'].map(d => (
          <div key={d} className={styles.dpDayName}>{d}</div>
        ))}
        {dateGrid.map((day, i) => {
          const isOutside = !isSameMonth(day, monthStart);
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const isToday = isSameDay(day, new Date());
          return (
            <div 
              key={i} 
              className={`${styles.dpDay} ${isOutside ? styles.dpDayOutside : ''} ${isSelected ? styles.dpDaySelected : ''} ${isToday && !isSelected ? styles.dpDayToday : ''}`}
              onClick={() => setSelectedDate(day)}
            >
              {format(day, 'd')}
            </div>
          );
        })}
      </div>

      <div className={styles.dpSection}>
        <h5 className={styles.dpLabel}>期限</h5>
        <div className={styles.dpInputRow}>
           <input type="checkbox" checked={!!selectedDate} onChange={(e) => {
             if (e.target.checked) setSelectedDate(new Date());
             else setSelectedDate(null);
           }} className={styles.dpCheck} />
           <input 
             type="text" 
             className={styles.pickerInput} 
             style={{ width: '120px', marginBottom: 0 }} 
             value={selectedDate ? format(selectedDate, 'yyyy/MM/dd') : ''}
             readOnly
           />
        </div>
      </div>

      <div className={styles.dpActions}>
        <button className={styles.btnPrimary} style={{ width: '100%', marginBottom: '8px', padding: '6px' }} onClick={handleSave}>保存</button>
        <button className={styles.btnSecondary} style={{ width: '100%' }} onClick={() => onSave(null)}>削除</button>
      </div>
    </div>
  );
};
// ---------------------------------------------

interface CardModalProps {
  cardId: string;
  onClose: () => void;
}

export const CardModal: React.FC<CardModalProps> = ({ cardId, onClose }) => {
  const boards = useBoardStore(state => state.boards);
  const activeBoardId = useBoardStore(state => state.activeBoardId);
  const updateActiveBoard = useBoardStore(state => state.updateActiveBoard);
  const board = boards.find(b => b.id === activeBoardId);

  let currentCard: CardType | null = null;
  let currentListTitle = '';
  
  if (!board) return null;

  for (const list of board.lists) {
    const found = list.cards.find(c => c.id === cardId);
    if (found) {
      currentCard = found;
      currentListTitle = list.title;
      break;
    }
  }

  if (!currentCard) return null;

  const handleUpdateCard = (updates: Partial<CardType>) => {
    const newLists = [...board.lists];
    const listIndex = newLists.findIndex(l => l.cards.some(c => c.id === cardId));
    if (listIndex > -1) {
      newLists[listIndex].cards = newLists[listIndex].cards.map(c => c.id === cardId ? { ...c, ...updates } : c);
      updateActiveBoard({ lists: newLists });
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    const newComment = { id: uuidv4(), text: commentText, createdAt: new Date().toISOString() };
    const comments = currentCard?.comments ? [...currentCard.comments, newComment] : [newComment];
    handleUpdateCard({ comments });
    setCommentText('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const fileData = {
          id: uuidv4(),
          name: file.name,
          url: event.target?.result as string,
        };
        const attachments = currentCard?.attachments ? [...currentCard.attachments, fileData] : [fileData];
        handleUpdateCard({ attachments });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddChecklist = () => {
    const title = prompt('チェックリストのタイトル:', 'チェックリスト');
    if (title) {
      const newChecklist = { id: uuidv4(), title, items: [] };
      const checklists = currentCard?.checklists ? [...currentCard?.checklists, newChecklist] : [newChecklist];
      handleUpdateCard({ checklists });
    }
  };

  const [showLabelPicker, setShowLabelPicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [newLabelText, setNewLabelText] = useState('');
  const [newLabelColor, setNewLabelColor] = useState('#ef4444');

  const toggleLabel = (label: { id: string; color: string; text: string }) => {
    const hasLabel = currentCard?.labels?.find(l => l.id === label.id);
    let newLabels;
    if (hasLabel) {
      newLabels = currentCard!.labels!.filter(l => l.id !== label.id);
    } else {
      newLabels = currentCard?.labels ? [...currentCard.labels, label] : [label];
    }
    handleUpdateCard({ labels: newLabels });
  };

  const handleCreateLabel = () => {
    if (!newLabelText.trim()) return;
    const newLabel = { id: uuidv4(), color: newLabelColor, text: newLabelText.trim() };
    updateActiveBoard({ availableLabels: [...(board.availableLabels || []), newLabel] });
    toggleLabel(newLabel);
    setNewLabelText('');
    setShowLabelPicker(false);
  };

  const [commentText, setCommentText] = useState('');

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose}><X size={20} /></button>
        
        <div className={styles.modalHeader}>
          <h2 className={styles.title}>{currentCard.title}</h2>
          <p className={styles.subtitle}>リスト「{currentListTitle}」にあります</p>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.mainColumn}>
             <div className={styles.metaRow}>
               {currentCard.dueDate && (
                 <div className={styles.metaBadge}>
                   <Calendar size={14} /> {format(new Date(currentCard.dueDate), 'yyyy/MM/dd')}
                 </div>
               )}
               {currentCard.labels && currentCard.labels.map(l => (
                 <span key={l.id} className={styles.tagBadge} style={{ background: l.color }}>{l.text}</span>
               ))}
             </div>

             {/* チェックリストコンポーネント描画 */}
             {currentCard.checklists && currentCard.checklists.map(list => (
               <ChecklistRenderer 
                 key={list.id} 
                 checklist={list} 
                 onUpdate={(updatedList) => {
                   const checklists = currentCard!.checklists!.map(l => l.id === updatedList.id ? updatedList : l);
                   handleUpdateCard({ checklists });
                 }} 
                 onDelete={() => {
                   const checklists = currentCard!.checklists!.filter(l => l.id !== list.id);
                   handleUpdateCard({ checklists });
                 }}
               />
             ))}

             {currentCard.attachments && currentCard.attachments.length > 0 && (
               <div className={styles.section}>
                 <h3 className={styles.sectionTitle}><Paperclip size={16} /> 添付ファイル</h3>
                 <div className={styles.attachmentGrid}>
                   {currentCard.attachments.map(att => (
                     <div key={att.id} className={styles.attachmentItem}>
                       {att.url.startsWith('data:image') ? (
                         <img src={att.url} alt={att.name} className={styles.attachmentImage} />
                       ) : (
                         <div className={styles.attachmentIcon}><ImageIcon size={32} /></div>
                       )}
                       <span className={styles.attachmentName}>{att.name}</span>
                     </div>
                   ))}
                 </div>
               </div>
             )}

             <div className={styles.section}>
               <h3 className={styles.sectionTitle}><MessageSquare size={16} /> コメント</h3>
               <form onSubmit={handleAddComment} className={styles.commentForm}>
                 <textarea 
                   placeholder="コメントを追加..." 
                   className={styles.commentInput}
                   value={commentText}
                   onChange={e => setCommentText(e.target.value)}
                 />
                 <button type="submit" className={styles.btnPrimary} disabled={!commentText.trim()}>保存</button>
               </form>

               <div className={styles.commentsList}>
                 {currentCard.comments?.map(c => (
                   <div key={c.id} className={styles.commentItem}>
                     <div className={styles.commentAvatar}>U</div>
                     <div className={styles.commentBox}>
                       <span className={styles.commentDate}>{format(new Date(c.createdAt), 'M/d HH:mm')}</span>
                       <p className={styles.commentText}>{c.text}</p>
                     </div>
                   </div>
                 ))}
               </div>
             </div>
          </div>

          <div className={styles.sidebarColumn}>
             <h4 className={styles.sidebarTitle}>カードに追加</h4>
             
             <div style={{ position: 'relative' }}>
               <button className={styles.sidebarBtn} onClick={() => setShowLabelPicker(!showLabelPicker)}>
                 <Tag size={16} /> ラベル
               </button>
               
               {showLabelPicker && (
                 <div className={styles.labelPicker}>
                   <h4 className={styles.pickerTitle}>ラベルを選択</h4>
                   <div className={styles.pickerLabels}>
                     {board.availableLabels?.map(label => {
                       const isSelected = currentCard?.labels?.some(l => l.id === label.id);
                       return (
                         <div 
                           key={label.id} 
                           className={`${styles.pickerLabel} ${isSelected ? styles.pickerLabelSelected : ''}`}
                           style={{ backgroundColor: label.color }}
                           onClick={() => toggleLabel(label)}
                         >
                           {label.text}
                           {isSelected && <CheckSquare size={14} />}
                         </div>
                       );
                     })}
                   </div>
                   <hr className={styles.pickerDivider} />
                   <h4 className={styles.pickerTitle}>新しいラベルを作成</h4>
                   <input 
                     type="text" 
                     className={styles.pickerInput} 
                     placeholder="ラベル名..."
                     value={newLabelText}
                     onChange={e => setNewLabelText(e.target.value)}
                   />
                   <div className={styles.pickerColors}>
                     {['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#64748b'].map(c => (
                       <button 
                         key={c}
                         className={`${styles.colorCircle} ${newLabelColor === c ? styles.colorCircleSelected : ''}`}
                         style={{ backgroundColor: c }}
                         onClick={() => setNewLabelColor(c)}
                       />
                     ))}
                   </div>
                   <button className={styles.btnPrimary} style={{ width: '100%', padding: '6px 0' }} onClick={handleCreateLabel} disabled={!newLabelText.trim()}>
                     作成
                   </button>
                 </div>
               )}
             </div>
             
             <button className={styles.sidebarBtn} onClick={handleAddChecklist}><CheckSquare size={16} /> チェックリスト</button>
             
             <div className={styles.uploadWrapper}>
               <button className={styles.sidebarBtn}><Paperclip size={16} /> 添付ファイル</button>
               <input type="file" className={styles.fileInput} onChange={handleFileUpload} />
             </div>
             
             <div style={{ position: 'relative' }}>
               <button className={styles.sidebarBtn} onClick={() => setShowDatePicker(!showDatePicker)}>
                 <Calendar size={16} /> 期限
               </button>
               {showDatePicker && (
                 <DatePickerPopover 
                   initialDueDate={currentCard.dueDate}
                   onSave={(dateStr) => {
                     handleUpdateCard({ dueDate: dateStr || undefined });
                     setShowDatePicker(false);
                   }}
                   onClose={() => setShowDatePicker(false)}
                 />
               )}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
