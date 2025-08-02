import React from "react";
import Card from "../../../shared/components/Card";
import { cn } from "../../../shared/styles";
import type RhythmBlock from "../domain/entities/RhythmBlock";
import {
  PriorityIcon,
  CategoryIcon,
  IntensityIcon,
  EnergyImpactIcon,
} from "./RhythmBlockCardIcons";
import { getEffect } from "./RhythmBlockStyles";
import "./RhythmBlockStyles.css";
import RhythmBlockCardOverlay from "./RhythmBlockCardOverlay";

interface RhythmBlockProps {
  block: RhythmBlock;
  className?: string;
  styles?: RhythmBlockCardStyles;
  onBlockClicked?: (block: RhythmBlock) => void;
}

export interface RhythmBlockCardStyles {
  background?: string;
  text?: string;
  priority?: string;
  category?: string;
  intensity?: string;
  constraint?: string;
}

// Simple time formatter for HH:MM
const formatTime = (date: Date): string => {
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
};

const RhythmBlockCard = ({
  block,
  className,
  styles,
  onBlockClicked,
}: RhythmBlockProps) => {
  const overlayRef = React.useRef<{ expand: () => void }>(null);

  return (
    <div className="relative">
      <Card className={cn("group cursor-pointer", className)}>
        {/* Background */}
        <div
          className={cn(
            "absolute inset-0 opacity-60 dark:opacity-100",
            styles?.background || getEffect(block.category),
            className,
          )}
        />

        {/* Content */}
        <div
          className="relative text-center w-full"
          onClick={() => {
            overlayRef.current?.expand();
            onBlockClicked && onBlockClicked(block);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              overlayRef.current?.expand();
              onBlockClicked && onBlockClicked(block);
            }
          }}
        >
          {/* Default view - always visible */}
          <div className="flex items-center justify-center gap-2 mb-2">
            <CategoryIcon category={block.category} />
            <PriorityIcon priority={block.priority} />
            <IntensityIcon intensity={block.intensity} />
            <EnergyImpactIcon energyImpact={block.energyImpact} />
          </div>

          <p
            className={cn(
              styles?.text,
              "font-bold",
              "text-gray-900",
              "dark:text-white",
              "mb-1 opacity-80",
              "text-lg leading-tight",
              "sm:text-lg",
              "xs:text-sm",
              "truncate",
            )}
          >
            {block.label}
          </p>

          <p
            className={cn(
              styles?.text,
              "font-medium",
              "text-gray-900",
              "dark:text-white",
              "opacity-80",
              "text-sm leading-tight",
              "sm:text-sm",
              "xs:text-xs",
              "truncate",
            )}
          >
            {block.timeRange && (
              <>
                {formatTime(block.timeRange.start)} -{" "}
                {formatTime(block.timeRange.end)}
              </>
            )}
          </p>

          {/* Duration - always visible */}
          <p
            className={cn(
              styles?.text,
              "text-gray-800 dark:text-gray-200",
              "opacity-90 text-xs mt-1 font-medium",
            )}
          >
            {block.timeRange && block.durationInMinutes}min
          </p>

          {/* Hover hint */}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 mt-1">
            <p
              className={cn(
                "text-xs",
                "text-gray-600 dark:text-gray-200",
                styles?.text,
              )}
            >
              Click for details
            </p>
          </div>
        </div>
      </Card>

      {/* Overlay Expansion */}
      <RhythmBlockCardOverlay
        ref={overlayRef}
        block={block}
        onCloseClicked={() => {
          // Overlay handles its own state
        }}
        styles={styles}
      />
    </div>
  );
};

export default RhythmBlockCard;
