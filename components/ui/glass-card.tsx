import * as React from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "strong" | "subtle";
  hover?: boolean;
  size?: "sm" | "md" | "lg"
  clickable?: boolean
}

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant = "default", hover = false, size = "md", clickable = false, ...props }, ref) => {
    return (
      <Card
        ref={ref}
        className={cn(
          "rounded-[var(--radius)] transition-all duration-200",
          {
            "border border-border-subtle bg-secondary/20 backdrop-blur-md shadow-sm": variant === "default",
            "border border-border bg-secondary/30 backdrop-blur-xl shadow-md": variant === "strong",
            "border border-border-muted bg-secondary/10 backdrop-blur-sm shadow-none": variant === "subtle",
          },
          {
            "hover:bg-secondary/30 hover:shadow-md hover:-translate-y-0.5": hover,
            "cursor-pointer active:scale-[0.98]": clickable,
          },
          {
            "p-[var(--space-3)]": size === "sm",
            "p-[var(--space-6)]": size === "md",
            "p-[var(--space-8)]": size === "lg",
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
