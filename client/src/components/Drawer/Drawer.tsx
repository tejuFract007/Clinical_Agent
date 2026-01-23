import { useEffect } from "react";
import { cn } from "../../lib/utils";
import type { DrawerProps } from "./Drawer.types";

export const Drawer = ({
    open,
    onClose,
    children,
    position = "right",
    width = "w-72",
    height = "h-75",
}: DrawerProps) => {
    useEffect(() => {
        if (!open) return;

        const handleEsc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
        document.addEventListener("keydown", handleEsc);

        document.body.style.overflow = "hidden";
        return () => {
            document.removeEventListener("keydown", handleEsc);
            document.body.style.overflow = "auto";
        };
    }, [open, onClose]);

    const basePosition = {
        right: cn("right-0 translate-x-full"),
        left: cn("left-0 -translate-x-full"),
        top: cn("top-0 left-0 -translate-y-full w-full", height),
        bottom: cn("bottom-0 left-0 translate-y-full w-full", height),
    };

    const openPosition = {
        right: "translate-x-0",
        left: "translate-x-0",
        top: "translate-y-0",
        bottom: "translate-y-0",
    };

    return (
        <>
            {/* overlay */}
            <div
                data-testid="overlay"
                onClick={onClose}
                className={cn(
                    "fixed inset-0 bg-black/40 transition-opacity duration-300",
                    open
                        ? "opacity-100 pointer-events-auto"
                        : "opacity-0 pointer-events-none"
                )}
            />
            {/* drawer */}
            <div
                data-testid="drawer"
                className={cn(
                    "fixed z-50 bg-white shadow-xl overflow-y-auto transition-transform duration-300",
                    ["left", "right"].includes(position) && "top-0 h-full",
                    // Mobile: Always full width if position is right/left
                    // Desktop: Use provided width
                    width && ["left", "right"].includes(position) ? `w-full md:${width}` : "",
                    basePosition[position],
                    open && openPosition[position]
                )}
            >
                {children}
            </div>
        </>
    );
};

export default Drawer;
