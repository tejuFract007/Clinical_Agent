import type { ReactNode } from "react";

export type DrawerPosition = "left" | "right" | "top" | "bottom";

export interface DrawerProps {
    open: boolean;
    onClose: () => void;
    children: ReactNode;
    position?: DrawerPosition;
    width?: string;
    height?: string;
}
