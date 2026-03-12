import { useEffect, type RefObject } from "react";

type UseDialogA11yOptions = {
    isOpen: boolean;
    onClose: () => void;
    containerRef: RefObject<HTMLElement | null>;
    initialFocusRef?: RefObject<HTMLElement | null>;
};

const FOCUSABLE_SELECTOR = [
    "a[href]",
    "button:not([disabled])",
    "input:not([disabled])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    "[tabindex]:not([tabindex='-1'])",
].join(", ");

function getFocusableElements(container: HTMLElement | null) {
    if (!container) return [];

    return [...container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)].filter((element) => {
        if (element.hasAttribute("disabled")) return false;
        if (element.getAttribute("aria-hidden") === "true") return false;
        return element.tabIndex >= 0;
    });
}

export function useDialogA11y({
    isOpen,
    onClose,
    containerRef,
    initialFocusRef,
}: UseDialogA11yOptions) {
    useEffect(() => {
        if (!isOpen) return;

        const previousActiveElement = document.activeElement instanceof HTMLElement
            ? document.activeElement
            : null;
        const previousOverflow = document.body.style.overflow;

        document.body.style.overflow = "hidden";

        const focusTarget = initialFocusRef?.current
            ?? getFocusableElements(containerRef.current)[0]
            ?? containerRef.current;
        focusTarget?.focus();

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                event.preventDefault();
                onClose();
                return;
            }

            if (event.key !== "Tab") return;

            const focusable = getFocusableElements(containerRef.current);
            if (focusable.length === 0) {
                event.preventDefault();
                containerRef.current?.focus();
                return;
            }

            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            const active = document.activeElement;

            if (event.shiftKey && active === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && active === last) {
                event.preventDefault();
                first.focus();
            }
        };

        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = previousOverflow;
            previousActiveElement?.focus();
        };
    }, [containerRef, initialFocusRef, isOpen, onClose]);
}
