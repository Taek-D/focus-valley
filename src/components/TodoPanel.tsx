import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Check, Pin } from "lucide-react";
import { cn } from "../lib/utils";
import { useTodos } from "../hooks/useTodos";
import { ANIMATION } from "../lib/constants";
import { BottomSheet } from "./ui/BottomSheet";
import { trackTodoCreated, trackTodoCompleted } from "../lib/analytics";

type TodoPanelProps = {
    isOpen: boolean;
    onClose: () => void;
};

export const TodoPanel: React.FC<TodoPanelProps> = ({ isOpen, onClose }) => {
    const { todos, activeTodoId, addTodo, toggleTodo, removeTodo, clearCompleted, setActiveTodo } = useTodos();
    const [input, setInput] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    const hasCompleted = todos.some((t) => t.completed);

    useEffect(() => {
        if (!isOpen) return;
        const timer = setTimeout(() => inputRef.current?.focus(), ANIMATION.INPUT_FOCUS_DELAY_MS);
        return () => clearTimeout(timer);
    }, [isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = input.trim();
        if (!trimmed) return;
        addTodo(trimmed);
        trackTodoCreated();
        setInput("");
    };

    return (
        <BottomSheet isOpen={isOpen} onClose={onClose} title="To-do">
            {/* Input */}
            <form onSubmit={handleSubmit} className="px-5 pb-3">
                <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="What are you working on?"
                    className="w-full px-4 py-3 rounded-2xl bg-foreground/5 border border-foreground/8 text-foreground font-body text-xs placeholder:text-muted-foreground/30 focus:outline-none focus:border-foreground/20 transition-colors"
                />
            </form>

            {/* Todo List */}
            <div className="flex-1 overflow-y-auto px-5 pb-4 space-y-1">
                {todos.length === 0 ? (
                    <div className="text-center py-10 space-y-3">
                        <div className="text-3xl opacity-40">{"\u2705"}</div>
                        <p className="font-body text-xs font-medium text-muted-foreground/50">
                            No tasks yet
                        </p>
                        <p className="font-body text-xs text-muted-foreground/30">
                            Add a task to stay focused
                        </p>
                    </div>
                ) : (
                    <AnimatePresence initial={false}>
                        {todos.map((todo) => (
                            <motion.div
                                key={todo.id}
                                layout
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: -20, height: 0 }}
                                transition={{ duration: 0.2 }}
                                className={cn(
                                    "flex items-center gap-3 py-2.5 px-3 rounded-xl transition-colors group",
                                    activeTodoId === todo.id && !todo.completed
                                        ? "bg-foreground/5 hover:bg-foreground/8"
                                        : "hover:bg-foreground/3"
                                )}
                            >
                                <button
                                    onClick={() => { if (!todo.completed) trackTodoCompleted(); toggleTodo(todo.id); }}
                                    aria-label={todo.completed ? "Mark as incomplete" : "Mark as complete"}
                                    className={cn(
                                        "flex-shrink-0 w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all",
                                        todo.completed
                                            ? "bg-foreground/15 border-foreground/15"
                                            : "border-foreground/15 hover:border-foreground/30"
                                    )}
                                >
                                    {todo.completed && <Check size={10} className="text-foreground/50" />}
                                </button>
                                <span
                                    className={cn(
                                        "flex-1 font-body text-xs transition-all",
                                        todo.completed
                                            ? "line-through text-muted-foreground/30"
                                            : "text-foreground/70"
                                    )}
                                >
                                    {todo.text}
                                </span>
                                {!todo.completed && (
                                    <button
                                        onClick={() => setActiveTodo(activeTodoId === todo.id ? null : todo.id)}
                                        aria-label={activeTodoId === todo.id ? "Unpin task" : "Pin as focus task"}
                                        className={cn(
                                            "flex-shrink-0 p-1 rounded-lg transition-all",
                                            activeTodoId === todo.id
                                                ? "text-foreground/50"
                                                : "text-muted-foreground/20 opacity-0 group-hover:opacity-100"
                                        )}
                                    >
                                        <Pin size={12} />
                                    </button>
                                )}
                                <button
                                    onClick={() => removeTodo(todo.id)}
                                    aria-label="Remove task"
                                    className="flex-shrink-0 p-1 rounded-lg text-muted-foreground/20 hover:text-destructive opacity-0 group-hover:opacity-100 transition-all"
                                >
                                    <Trash2 size={12} />
                                </button>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}
            </div>

            {/* Clear Completed */}
            {hasCompleted && (
                <div className="px-5 pb-6 pt-2 border-t border-foreground/5">
                    <button
                        onClick={clearCompleted}
                        className="w-full py-2.5 font-body text-[10px] font-medium tracking-[0.1em] uppercase text-muted-foreground/40 hover:text-muted-foreground/60 transition-colors"
                    >
                        Clear completed
                    </button>
                </div>
            )}
        </BottomSheet>
    );
};
