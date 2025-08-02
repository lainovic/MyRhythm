import ItemCollection from "../../../shared/components/ItemCollection";
import { cn } from "../../../shared/styles";
import type RhythmBlock from "../domain/entities/RhythmBlock";
import RhythmBlockCard from "./RhythmBlockCard";
import type React from "react";

interface RhythmBlockColumnProps {
  blocks: RhythmBlock[];
  title: string;
  placeholderText: React.ReactNode;
  actions?: RhythmBlockAction[];
  draggable?: boolean;
  className?: string;
  onDragEnd?: (result: any) => void;
  layout?: "grid" | "flex";
  gridCols?: string;
  flexDirection?: "row" | "col";
  flexWrap?: boolean;
}

interface RhythmBlockAction {
  text: React.ReactNode;
  onClick: (block: RhythmBlock) => void;
  className?: string;
}

interface ActionOverlayProps {
  block: RhythmBlock;
  actions?: RhythmBlockAction[];
  className?: string;
}

const RhythmBlockColumn = ({
  blocks,
  title,
  placeholderText,
  actions = [],
  draggable = false,
  className,
  onDragEnd,
  layout = "grid",
  gridCols = "grid-cols-1",
  flexDirection = "col",
  flexWrap = true,
}: RhythmBlockColumnProps) => (
  <section className={cn(className)} role="region" aria-label="My Rhythm">
    <h2 className="text-lg font-semibold mb-3 text-gray-900 dark:text-zinc-300">
      {title}
    </h2>
    {blocks.length > 0 ? (
      <div className="animate-fade-in">
        <ItemCollection<RhythmBlock>
          items={blocks}
          className={cn("w-fit")}
          layout={layout}
          gridCols={gridCols}
          flexDirection={flexDirection}
          flexWrap={flexWrap}
          renderItem={(block: RhythmBlock, _: number) => (
            <div className="relative">
              <RhythmBlockCard block={block} className="rounded-xl" />
              {actions.length > 0 && (
                <ActionOverlay
                  block={block}
                  actions={actions}
                  className="rounded-xl"
                />
              )}
            </div>
          )}
          draggable={draggable}
          onDragEnd={onDragEnd}
        />
      </div>
    ) : (
      <div className="text-gray-500 dark:text-gray-400 text-sm">
        {placeholderText}
      </div>
    )}
  </section>
);

const ActionOverlay = ({
  block,
  actions = [],
  className,
}: ActionOverlayProps) => {
  return (
    <div
      className={cn(
        "absolute inset-0",
        "group-hover:bg-amber-50/20 rounded-xl",
        "flex flex-row gap-1 items-center justify-center",
        "pointer-events-none",
        className,
      )}
      aria-hidden="true"
    >
      {actions.map((action, index) => (
        <span
          key={`action-${block.id}-${index}`}
          className={cn(
            "relative",
            "inline-block w-8 h-8 rounded-full",
            "bg-white/20 hover:bg-white/30",
            "opacity-0 group-hover:opacity-100",
            "pointer-events-auto cursor-pointer",
            "smooth-transitions",
          )}
          onClick={(e) => {
            e.stopPropagation();
            action.onClick(block);
          }}
        >
          <span
            className={cn(
              "absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2",
              "text-lg font-extrabold text-gray-600 opacity-40",
              "pointer-events-none",
            )}
          >
            {action.text}
          </span>
        </span>
      ))}
    </div>
  );
};

export default RhythmBlockColumn;
