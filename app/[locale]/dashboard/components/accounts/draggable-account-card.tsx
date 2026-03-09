"use client";

import React, { memo } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import { AccountCard } from "./account-card";
import { GripVertical } from "lucide-react";
import { Account } from "@/lib/data-types";
import { WidgetSize } from "../../types/dashboard";

interface DraggableAccountCardProps {
  account: Account;
  onClick: () => void;
  size: WidgetSize;
  isDragDisabled?: boolean;
}

export const DraggableAccountCard = memo(function DraggableAccountCard({
  account,
  onClick,
  size,
  isDragDisabled = false,
}: DraggableAccountCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: account.number,
    disabled: isDragDisabled,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn("shrink-0", isDragging && "z-50")}
    >
      <div className="relative group">
        <AccountCard account={account} onClick={onClick} size={size} />
        {!isDragDisabled && (
          <div
            {...attributes}
            {...listeners}
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing p-1 rounded bg-background/80 backdrop-blur-xs border"
          >
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </div>
        )}
      </div>
    </div>
  );
});

DraggableAccountCard.displayName = "DraggableAccountCard";
