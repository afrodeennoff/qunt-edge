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
          "rounded-xl transition-all duration-200",
          {
            "border-border/70 bg-white/5 backdrop-blur-md shadow-sm": variant === "default",
            "border-border bg-white/10 backdrop-blur-xl shadow-md": variant === "strong",
            "border-border/60 bg-white/3 backdrop-blur-sm shadow-none": variant === "subtle",
          },
          {
            "hover:bg-white/10 hover:shadow-md hover:-translate-y-0.5": hover,
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
