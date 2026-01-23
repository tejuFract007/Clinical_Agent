import type { ButtonHTMLAttributes, ReactNode } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondaryOutline" | "filled" | "transparent";
    size?: "sm" | "md" | "lg" | "auto";
    disabled?: boolean;
    children: ReactNode;
    className?: string;
}
