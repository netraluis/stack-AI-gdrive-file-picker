// stores/knowledgeBaseStore.js
import { create } from 'zustand';

interface KnowledgeBaseState {
  knowledgeBaseId: string | undefined;
  exists: boolean;
  isSyncing: boolean;
  knowledgeBaseHistory: string[];
  setKnowledgeBase: (id: string) => void;
  clearKnowledgeBase: () => void;
  switchToKnowledgeBase: (id: string) => void;
  removeFromHistory: (id: string) => void;
  setSyncing: (isSyncing: boolean) => void;
}

export const useKnowledgeBaseStore = create<KnowledgeBaseState>((set, get) => ({
  // Current active knowledge base
  knowledgeBaseId: undefined,
  exists: false,
  isSyncing: false,
  
  // History of previous knowledge bases
  knowledgeBaseHistory: [],
  
  setKnowledgeBase: (id) => {
    const current = get().knowledgeBaseId;
    
    // If we already have a different KB, add it to history
    if (current && current !== id) {
      const history = get().knowledgeBaseHistory;
      // Only add to history if not already in there
      if (!history.includes(current)) {
        set({ knowledgeBaseHistory: [...history, current] });
      }
    }
    
    set({ knowledgeBaseId: id, exists: true });
  },
  
  clearKnowledgeBase: () => {
    const current = get().knowledgeBaseId;
    const history = get().knowledgeBaseHistory;
    
    // Add current to history if it exists and not already in history
    if (current && !history.includes(current)) {
      set({ knowledgeBaseHistory: [...history, current] });
    }
    
    set({ knowledgeBaseId: undefined, exists: false });
  },
  
  switchToKnowledgeBase: (id) => {
    set({ knowledgeBaseId: id, exists: true });
  },
  
  removeFromHistory: (id) => {
    set({ 
      knowledgeBaseHistory: get().knowledgeBaseHistory.filter(kbId => kbId !== id) 
    });
  },
  
  setSyncing: (isSyncing) => set({ isSyncing }),
}));