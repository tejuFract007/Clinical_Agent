import clsx from "clsx";
import type { ButtonProps } from "./Button.types";
import { motion } from "framer-motion";

export const Button = ({
    variant = "primary",
    size = "auto",
    disabled = false,
    children,
    className = "",
    ...props
}: ButtonProps) => {
    const baseStyles = `
  inline-flex 
  items-center 
  justify-center 
  rounded-lg
  transition-all 
  duration-200 
  focus:outline-none
  px-2
  `;

    const variantStyles = {
        primary: `
    bg-blue-600
    disabled:text-neutral-400
    hover:bg-blue-700
    disabled:bg-neutral-200
    text-white
    font-semibold
    `,
        secondaryOutline: `
    font-semibold 
    text-blue-600 
    bg-transparent
    border 
    border-blue-600 
    hover:border 
    hover:border-blue-700 
    hover:text-blue-700 
    disabled:border-blue-400
    disabled:text-blue-400
    `,
        filled: `
    bg-neutral-100 
    text-blue-600 
    font-semibold 
    hover:bg-blue-50 
    hover:text-blue-700 
    disabled:bg-neutral-100 
    disabled:text-neutral-400
    `,
        transparent: `
    text-blue-600 
    hover:text-blue-700 
    font-semibold 
    disabled:text-neutral-400
    `,
    };

    const sizeStyles = {
        sm: `
    text-xs sm:text-base
    px-2 py-1
    sm:px-3 sm:py-1
    md:px-4 md:py-1
    lg:px-5 lg:py-1
`,

        md: `
    text-xs sm:text-base
    px-3 py-2
    sm:px-5 sm:py-2.5
    md:px-7 md:py-3
    lg:px-[5.53125rem] lg:py-3
  `,

        lg: `
    text-xs sm:text-base
    px-4 py-2.5
    sm:px-6 sm:py-3
    md:px-8 md:py-3
    lg:px-[9.6875rem] lg:py-3
  `,

        auto: `
      w-full
      px-2
      py-2.5
      sm:py-3
      md:py-3
      lg:py-3
  `,
    };

    return (
        <motion.button
            className={clsx(
                baseStyles,
                variantStyles[variant],
                sizeStyles[size],
                className,
                disabled ? "cursor-not-allowed" : "cursor-pointer"
            )}
            disabled={disabled}
            whileHover={disabled ? {} : { scale: 1.01 }}
            whileTap={disabled ? {} : { scale: 0.95 }}
            {...(props as any)}
        >
            {children}
        </motion.button>
    );
};
