import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

export type Card = {
  id: string;
  listId: string;
  title: string;
  description?: string;
  members?: string[];
  labels?: { id: string; color: string; text: string }[];
  dueDate?: string;
  attachments?: { id: string; name: string; url: string }[];
  comments?: { id: string; text: string; createdAt: string }[];
  checklists?: { id: string; title: string; items: { id: string; text: string; isCompleted: boolean }[] }[];
};

export type List = {
  id: string;
  boardId: string;
  title: string;
  cards: Card[];
};

export type Label = { id: string; color: string; text: string };

export type Board = {
  id: string;
  title: string;
  thumbnail?: string; // ワークスペース画面での背景識別用
  lists: List[];
  availableLabels: Label[];
};

interface BoardState {
  boards: Board[];
  activeBoardId: string | null;  // null の場合はワークスペースホームを表示
  selectedCardId: string | null;
  
  // Board management Actions
  addBoard: (title: string, thumbnail?: string) => void;
  setActiveBoardId: (id: string | null) => void;
  updateActiveBoard: (updates: Partial<Board>) => void;
  
  // List/Card within active board Actions
  addList: (title: string) => void;
  addCard: (listId: string, title: string) => void;
  setSelectedCardId: (id: string | null) => void;
}

const defaultLabels: Label[] = [
  { id: 'label-1', color: '#ef4444', text: '重要' },
  { id: 'label-2', color: '#f59e0b', text: '至急' },
  { id: 'label-3', color: '#10b981', text: '後回し可' },
  { id: 'label-4', color: '#3b82f6', text: '開発' },
  { id: 'label-5', color: '#8b5cf6', text: 'デザイン' },
];

// 初期データ：デフォルトボードに加え、サンプルボードを1つ追加
const initialBoards: Board[] = [
  {
    id: 'board-1',
    title: 'SNS運用案件',
    thumbnail: 'bg-1',
    lists: [
      {
        id: 'list-1',
        boardId: 'board-1',
        title: 'To Do（未着手）',
        cards: [
          { id: 'card-1', listId: 'list-1', title: '競合アカウントの投稿分析' },
          { id: 'card-2', listId: 'list-1', title: '11月キャンペーン企画書作成' },
        ],
      },
      {
        id: 'list-2',
        boardId: 'board-1',
        title: 'In Progress（進行中）',
        cards: [
          { id: 'card-3', listId: 'list-2', title: '動画コンテンツのコンテ作成' },
        ],
      },
      {
        id: 'list-3',
        boardId: 'board-1',
        title: 'Done（完了）',
        cards: [
          { id: 'card-4', listId: 'list-3', title: '10月レポート提出' },
        ],
      },
    ],
    availableLabels: [...defaultLabels],
  },
  {
    id: 'board-2',
    title: 'DX推進プロジェクト',
    thumbnail: 'bg-2',
    lists: [],
    availableLabels: [...defaultLabels],
  }
];

export const useBoardStore = create<BoardState>((set) => ({
  boards: initialBoards,
  activeBoardId: null, // 初期表示をワークスペース画面にする
  selectedCardId: null,

  addBoard: (title, thumbnail) =>
    set((state) => ({
      boards: [
        ...state.boards,
        { 
          id: uuidv4(), 
          title, 
          thumbnail: thumbnail || 'bg-1', 
          lists: [], 
          availableLabels: [...defaultLabels] 
        },
      ],
    })),

  setActiveBoardId: (id) => set({ activeBoardId: id }),

  updateActiveBoard: (updates) =>
    set((state) => {
      if (!state.activeBoardId) return state;
      const boards = state.boards.map((b) =>
        b.id === state.activeBoardId ? { ...b, ...updates } : b
      );
      return { boards };
    }),

  addList: (title) =>
    set((state) => {
      if (!state.activeBoardId) return state;
      const boards = state.boards.map((b) => {
        if (b.id === state.activeBoardId) {
          return {
            ...b,
            lists: [
              ...b.lists,
              { id: uuidv4(), boardId: b.id, title, cards: [] },
            ],
          };
        }
        return b;
      });
      return { boards };
    }),

  addCard: (listId, title) =>
    set((state) => {
      if (!state.activeBoardId) return state;
      const boards = state.boards.map((b) => {
        if (b.id === state.activeBoardId) {
          const lists = b.lists.map((list) => {
            if (list.id === listId) {
              return {
                ...list,
                cards: [...list.cards, { id: uuidv4(), listId, title }],
              };
            }
            return list;
          });
          return { ...b, lists };
        }
        return b;
      });
      return { boards };
    }),

  setSelectedCardId: (id) => set({ selectedCardId: id }),
}));
