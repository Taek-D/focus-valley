import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, type PanInfo } from "framer-motion";
import { X, Trash2, Check, Pin } from "lucide-react";
import { cn } from "../lib/utils";
import { useTodos } from "../hooks/useTodos";

type TodoPanelProps = {
    isOpen: boolean;
    onClose: () => void;
};

export const TodoPanel: React.FC<TodoPanelProps> = ({ isOpen, onClose }) => {
    const { todos, activeTodoId, addTodo, toggleTodo, removeTodo, clearCompleted, setActiveTodo } = useTodos();
    const [input, setInput] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);
    const closeRef = useRef<HTMLButtonElement>(null);

    const hasCompleted = todos.some((t) => t.completed);

    useEffect(() => {
        if (!isOpen) return;
        setTimeout(() => inputRef.current?.focus(), 300);
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onClose]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = input.trim();
        if (!trimmed) return;
        addTodo(trimmed);
        setInput("");
    };

    const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        if (info.offset.y > 100 || info.velocity.y > 500) onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-background/50 backdrop-blur-sm z-40"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        drag="y"
                        dragConstraints={{ top: 0 }}
                        dragElastic={0.2}
                        onDragEnd={handleDragEnd}
                        role="dialog"
                        aria-modal="true"
                        aria-label="To-do list"
                        className="fixed bottom-0 left-0 right-0 max-h-[85vh] glass-strong rounded-t-3xl shadow-cozy-lg z-50 flex flex-col"
                    >
                        {/* Drag Handle */}
                        <div className="flex justify-center pt-3 pb-1 cursor-grab active:cursor-grabbing">
                            <div className="w-8 h-0.5 rounded-full bg-foreground/10" />
                        </div>

                        {/* Header */}
                        <div className="flex items-center justify-between px-5 pb-3 pt-1">
                            <h2 className="font-body text-[10px] font-medium tracking-[0.15em] uppercase text-muted-foreground">
                                To-do
                            </h2>
                            <button
                                ref={closeRef}
                                onClick={onClose}
                                aria-label="Close to-do panel"
                                className="p-1.5 rounded-xl text-muted-foreground/40 hover:text-foreground transition-all"
                            >
                                <X size={14} />
                            </button>
                        </div>

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
                                                onClick={() => toggleTodo(todo.id)}
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
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
