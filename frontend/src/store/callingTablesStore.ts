import { create } from 'zustand';

interface CallingTablesState {
  callingTables: Set<string>;
  addCall: (tableId: string) => void;
  removeCall: (tableId: string) => void;
}

export const useCallingTablesStore = create<CallingTablesState>((set) => ({
  callingTables: new Set(),
  addCall: (tableId) =>
    set((s) => ({ callingTables: new Set(s.callingTables).add(tableId) })),
  removeCall: (tableId) =>
    set((s) => {
      const n = new Set(s.callingTables);
      n.delete(tableId);
      return { callingTables: n };
    }),
}));
