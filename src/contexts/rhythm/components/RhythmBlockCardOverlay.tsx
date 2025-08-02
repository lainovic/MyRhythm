import { formatTime } from "@storybook/addon-docs/blocks";
import { cn } from "../../../shared/styles";
import {
  CategoryIcon,
  PriorityIcon,
  IntensityIcon,
  EnergyImpactIcon,
} from "./RhythmBlockCardIcons";
import { getEffect } from "./RhythmBlockStyles";
import type RhythmBlock from "../domain/entities/RhythmBlock";
import type { RhythmBlockCardStyles } from "./RhythmBlockCard";
import React from "react";

interface RhythmBlockCardOverlayProps {
  block: RhythmBlock;
  className?: string;
  onCloseClicked?: () => void;
  styles?: RhythmBlockCardStyles;
}

const RhythmBlockCardOverlay = React.forwardRef<
  { expand: () => void },
  RhythmBlockCardOverlayProps
>(({ block, className, styles }, ref) => {
  const [isExpanded, setIsExpanded] = React.useState(false);

  const expand = () => {
    setIsExpanded(true);
  };

  React.useImperativeHandle(ref, () => ({
    expand,
  }));

  return (
    <div
      className={cn(
        "absolute top-0 left-0 z-[9999] smooth-transitions cursor-pointer",
        "bg-white dark:bg-gray-800 rounded-xl shadow-2xl",
        isExpanded
          ? "opacity-100 scale-100 pointer-events-auto"
          : "opacity-0 scale-95 pointer-events-none",
        className,
      )}
      style={{
        transform: isExpanded ? "translateY(0)" : "translateY(-10px)",
      }}
      onClick={(e) => {
        e.stopPropagation();
        setIsExpanded(!isExpanded);
      }}
    >
      {/* Background */}
      <div
        className={cn(
          "absolute inset-0 opacity-60 dark:opacity-100",
          styles?.background || getEffect(block.category),
          className,
        )}
      />

      <div className="isolate p-4">
        <div className="flex items-center justify-center gap-2 mb-3">
          <CategoryIcon category={block.category} />
          <PriorityIcon priority={block.priority} />
          <IntensityIcon intensity={block.intensity} />
          <EnergyImpactIcon energyImpact={block.energyImpact} />
        </div>

        <h3
          className={cn(
            "font-bold mb-2 text-lg",
            "text-gray-900 dark:text-white",
            styles?.text,
          )}
        >
          {block.label}
        </h3>

        {block.timeRange && (
          <p className="text-sm text-gray-600 dark:text-gray-400 dark:opacity-80 mb-3">
            {formatTime(block.timeRange.start)} -{" "}
            {formatTime(block.timeRange.end)} ({block.durationInMinutes}min)
          </p>
        )}

        <div className="relative">
          <div className="space-y-3 text-sm">
            {/* Priority details */}
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-200">
                Priority:
              </span>
              <span className="font-medium capitalize text-gray-900 dark:text-white">
                {block.priority}
              </span>
            </div>

            {/* Category details */}
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-200">
                Category:
              </span>
              <span className="font-medium capitalize text-gray-900 dark:text-white">
                {block.category}
              </span>
            </div>

            {/* Intensity details */}
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-200">
                Intensity:
              </span>
              <span className="font-medium capitalize text-gray-900 dark:text-white">
                {block.intensity}
              </span>
            </div>

            {/* Energy impact details */}
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-200">
                Energy Impact:
              </span>
              <span className="font-medium capitalize text-gray-900 dark:text-white">
                {block.energyImpact}
              </span>
            </div>

            {/* Constraints */}
            {block.constraints.length > 0 && (
              <div>
                <span className="text-gray-600 dark:text-gray-200 block mb-2">
                  Constraints:
                </span>
                <div className="flex flex-wrap gap-1">
                  {block.constraints.map((constraint, index) => (
                    <span
                      key={index}
                      className={cn(
                        "px-2 py-1 text-xs rounded",
                        "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
                        styles?.constraint,
                      )}
                    >
                      {constraint.type}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <p className="text-xs text-gray-600 dark:text-gray-200 mt-4 text-center opacity-80">
            Click to close
          </p>
        </div>
      </div>
    </div>
  );
});

export default RhythmBlockCardOverlay;
