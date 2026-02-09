import * as React from "react";
import { cn } from "@/lib/utils";

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "strong" | "subtle";
  hover?: boolean;
  size?: "sm" | "md" | "lg"
  clickable?: boolean
}

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant = "default", hover = false, size = "md", clickable = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-xl border transition-all duration-200",
          {
            "bg-glass backdrop-blur-glass shadow-glass": variant === "default",
            "bg-glass-strong backdrop-blur-glass-strong shadow-glass": variant === "strong",
            "bg-glass-subtle backdrop-blur-glass shadow-sm": variant === "subtle",
          },
          {
            "hover:bg-glass-strong hover:border-border-strong hover:shadow-lg hover:-translate-y-0.5": hover,
            "cursor-pointer active:scale-[0.98]": clickable,
          },
          {
            "p-3": size === "sm",
            "p-6": size === "md",
            "p-8": size === "lg",
          },
          className
        )}
        {...props}
      />
    );
  }
);
GlassCard.displayName = "GlassCard";

export { GlassCard };
