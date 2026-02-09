"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useI18n } from "@/locales/client";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import { PlatformConfig } from "../config/platforms";
import { motion } from "framer-motion";

interface PlatformCardProps {
    platform: PlatformConfig;
    isSelected: boolean;
    onSelect: (type: string) => void;
    onHover: (category: string) => void;
    onLeave: () => void;
    isWeekend: boolean;
}

export function PlatformCard({
    platform,
    isSelected,
    onSelect,
    onHover,
    onLeave,
    isWeekend,
}: PlatformCardProps) {
    const t = useI18n();

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            whileHover={{ y: -2 }}
            transition={{ duration: 0.2 }}
            className={cn(
                "group relative flex flex-col items-start gap-4 rounded-xl border p-4 text-left transition-all duration-300",
                isSelected
                    ? "border-primary bg-primary/5 shadow-md shadow-primary/10"
                    : "border-border bg-card hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5",
                (platform.isDisabled || platform.isComingSoon) &&
                "cursor-not-allowed opacity-60 grayscale-[0.5]"
            )}
            onClick={() =>
                !platform.isDisabled && !platform.isComingSoon && onSelect(platform.type)
            }
            onMouseEnter={() => onHover(platform.category)}
            onMouseLeave={onLeave}
        >
            {/* Selection Indicator */}
            <div
                className={cn(
                    "absolute right-3 top-3 h-5 w-5 rounded-full border border-primary/30 text-primary opacity-0 transition-all",
                    isSelected && "opacity-100",
                    "group-hover:border-primary group-hover:opacity-100"
                )}
            >
                {isSelected ? (
                    <CheckCircle2 className="h-full w-full fill-primary/10" />
                ) : (
                    <div className="h-full w-full rounded-full border-2 border-transparent group-hover:border-primary/30" />
                )}
            </div>

            <div className="flex w-full items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-border/50 bg-background/80 p-2 shadow-sm transition-transform group-hover:scale-110">
                    {platform.logo.path && (
                        <div className="relative h-full w-full">
                            <Image
                                src={platform.logo.path}
                                alt={platform.logo.alt || ""}
                                fill
                                className="object-contain"
                            />
                        </div>
                    )}
                    {platform.logo.component && <platform.logo.component />}
                </div>
            </div>

            <div className="space-y-1 w-full">
                <div className="flex items-center gap-2">
                    <h3 className="font-semibold leading-none tracking-tight">
                        {t(platform.name as any, { count: 1 })}
                    </h3>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2 min-h-[2.5em]">
                    {t(platform.description as any, { count: 1 })}
                </p>
            </div>

            <div className="flex flex-wrap gap-2 w-full mt-auto pt-2">
                {platform.isDisabled && (
                    <Badge
                        variant="secondary"
                        className="bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20"
                    >
                        {t("import.type.badge.maintenance")}
                    </Badge>
                )}
                {platform.isComingSoon && !platform.isDisabled && (
                    <Badge
                        variant="secondary"
                        className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20"
                    >
                        {t("import.type.badge.comingSoon")}
                    </Badge>
                )}
                {!platform.isDisabled && platform.isRithmic && isWeekend && (
                    <Badge
                        variant="outline"
                        className="border-yellow-500/30 bg-yellow-500/5 text-yellow-600"
                    >
                        <AlertTriangle className="mr-1 h-3 w-3" />
                        Weekend
                    </Badge>
                )}
            </div>
        </motion.div>
    );
}
