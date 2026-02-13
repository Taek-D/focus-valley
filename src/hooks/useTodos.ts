import { create } from "zustand";
import { persist } from "zustand/middleware";

type Todo = {
    id: string;
    text: string;
    completed: boolean;
    createdAt: string;
};

type TodoState = {
    todos: Todo[];
    activeTodoId: string | null;
    addTodo: (text: string) => void;
    toggleTodo: (id: string) => void;
    removeTodo: (id: string) => void;
    clearCompleted: () => void;
    setActiveTodo: (id: string | null) => void;
};

export const useTodos = create<TodoState>()(
    persist(
        (set) => ({
            todos: [],
            activeTodoId: null,
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
                })),
            removeTodo: (id) =>
                set((state) => ({
                    todos: state.todos.filter((t) => t.id !== id),
                    activeTodoId: state.activeTodoId === id ? null : state.activeTodoId,
                })),
            clearCompleted: () =>
                set((state) => ({
                    todos: state.todos.filter((t) => !t.completed),
                })),
            setActiveTodo: (id) => set({ activeTodoId: id }),
        }),
        { name: "focus-valley-todos" }
    )
);
