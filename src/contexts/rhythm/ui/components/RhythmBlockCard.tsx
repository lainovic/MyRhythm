import Card from "../../../../shared/components/Card";
import { cn, sharedStyles } from "../../../../shared/styles";
import type RhythmBlock from "../../domain/entities/RhythmBlock";
import { getEffect } from "./RhythmBlockStyles";
import "./RhythmBlockStyles.css";

interface RhythmBlockProps {
  block: RhythmBlock;
  className?: string;
  bgStyle?: string;
  textStyle?: string;
  categoryStyle?: string;
  onBlockClicked?: (block: RhythmBlock) => void;
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
  bgStyle,
  textStyle,
  categoryStyle,
  onBlockClicked,
}: RhythmBlockProps) => {
  return (
    <Card className={className}>
      {/* Background */}
      <div
        className={`absolute inset-0 opacity-60 dark:opacity-100 ${
          bgStyle || getEffect(block.category)
        }`}
      />

      {/* Content */}
      <div
        className="relative text-center w-full"
        onClick={() => onBlockClicked && onBlockClicked(block)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onBlockClicked && onBlockClicked(block);
          }
        }}
      >
        <p
          className={cn(
            textStyle,
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
            textStyle,
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
        {block.category && (
          <span
            className={cn(
              categoryStyle,
              "bg-amber-800/30 text-amber-200",
              "text-gray-900",
              "dark:text-white",
              "opacity-50",
              "inline-block mt-4 px-2.5 py-1",
              "text-sm font-medium rounded-full",
              "truncate max-w-full",
            )}
          >
            {block.category}
          </span>
        )}
      </div>
    </Card>
  );
};

export default RhythmBlockCard;
