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
    addTodo: (text: string) => void;
    toggleTodo: (id: string) => void;
    removeTodo: (id: string) => void;
    clearCompleted: () => void;
};

export const useTodos = create<TodoState>()(
    persist(
        (set) => ({
            todos: [],
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
                })),
            removeTodo: (id) =>
                set((state) => ({
                    todos: state.todos.filter((t) => t.id !== id),
                })),
            clearCompleted: () =>
                set((state) => ({
                    todos: state.todos.filter((t) => !t.completed),
                })),
        }),
        { name: "focus-valley-todos" }
    )
);
