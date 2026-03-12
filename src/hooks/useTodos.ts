import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createSafeStorage, isRecord, parseIsoTimestamp } from "@/lib/persist";

type Todo = {
    id: string;
    text: string;
    completed: boolean;
    createdAt: string;
};

export type TodoState = {
    todos: Todo[];
    activeTodoId: string | null;
    updatedAt: string;
    addTodo: (text: string) => void;
    toggleTodo: (id: string) => void;
    removeTodo: (id: string) => void;
    clearCompleted: () => void;
    setActiveTodo: (id: string | null) => void;
};

type PersistedTodoState = Pick<TodoState, "todos" | "activeTodoId" | "updatedAt">;

const STORAGE_VERSION = 1;
const DEFAULT_UPDATED_AT = new Date().toISOString();

export const useTodos = create<TodoState>()(
    persist(
        (set) => ({
            todos: [],
            activeTodoId: null,
            updatedAt: DEFAULT_UPDATED_AT,
            addTodo: (text) =>
                set((state) => ({
                    todos: [
                        {
                            id: crypto.randomUUID(),
                            text,
                            completed: false,
                            createdAt: new Date().toISOString(),
                        },
                        ...state.todos,
                    ],
                    updatedAt: new Date().toISOString(),
                })),
            toggleTodo: (id) =>
                set((state) => ({
                    todos: state.todos.map((t) =>
                        t.id === id ? { ...t, completed: !t.completed } : t
                    ),
                    // Clear active if completed
                    activeTodoId: state.activeTodoId === id && !state.todos.find((t) => t.id === id)?.completed
                        ? null
                        : state.activeTodoId,
                    updatedAt: new Date().toISOString(),
                })),
            removeTodo: (id) =>
                set((state) => ({
                    todos: state.todos.filter((t) => t.id !== id),
                    activeTodoId: state.activeTodoId === id ? null : state.activeTodoId,
                    updatedAt: new Date().toISOString(),
                })),
            clearCompleted: () =>
                set((state) => ({
                    todos: state.todos.filter((t) => !t.completed),
                    updatedAt: new Date().toISOString(),
                })),
            setActiveTodo: (id) => set({ activeTodoId: id, updatedAt: new Date().toISOString() }),
        }),
        {
            name: "focus-valley-todos",
            version: STORAGE_VERSION,
            storage: createSafeStorage<PersistedTodoState>(),
            migrate: (persistedState) => {
                const state = isRecord(persistedState) ? persistedState : {};
                const todos = Array.isArray(state.todos)
                    ? state.todos.filter((entry): entry is Todo =>
                        isRecord(entry)
                        && typeof entry.id === "string"
                        && typeof entry.text === "string"
                        && typeof entry.completed === "boolean"
                        && typeof entry.createdAt === "string")
                    : [];
                const activeTodoId = typeof state.activeTodoId === "string" && todos.some((todo) => todo.id === state.activeTodoId)
                    ? state.activeTodoId
                    : null;

                return {
                    todos,
                    activeTodoId,
                    updatedAt: parseIsoTimestamp(state.updatedAt, DEFAULT_UPDATED_AT),
                };
            },
        }
    )
);
