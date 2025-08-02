import React from "react";
import { cn, sharedStyles } from "../../../../shared/styles";
import RhythmBlock from "../../domain/entities/RhythmBlock";
import PlanRhythmButton from "./PlanRhythmButton";
import ItemCollection from "../../../../common/ui/ItemCollection";
import RhythmBlockCard from "./RhythmBlockCard";

interface RhythmBuilderProps {
  className?: string;
  buildingBlocks: RhythmBlock[];
}

const RhythmBuilder = ({ className, buildingBlocks }: RhythmBuilderProps) => {
  const [selectedBlocks, setSelectedBlocks] = React.useState<RhythmBlock[]>([]);

  const handleAddBlock = (block: RhythmBlock) => {
    if (selectedBlocks.find((b: RhythmBlock) => b.id === block.id)) {
      return;
    }
    setSelectedBlocks([...selectedBlocks, block]);
  };

  const handleRemoveBlock = (block: RhythmBlock) => {
    setSelectedBlocks(
      selectedBlocks.filter((b: RhythmBlock) => b.id !== block.id),
    );
  };

  // const handleEditBlock = ...
  // const handleSaveBlock = ...

  return (
    <>
      <section
        className={cn("rounded-lg", "p-6", className)}
        role="region"
        aria-label="Rhythm Builder"
      >
        {/* Main content area */}
        <div
          className={cn(
            sharedStyles.layout.flex.row,
            "items-start justify-around",
          )}
          role="main"
        >
          {/* Available blocks section */}
          <section
            className="flex-1"
            role="region"
            aria-label="Available Rhythm Blocks"
          >
            <h2 className="text-lg font-semibold mb-3 text-gray-900 dark:text-zinc-300">
              All Rhythm Blocks
            </h2>
            <ItemCollection<RhythmBlock>
              items={buildingBlocks}
              className="w-fit"
              renderItem={(item: RhythmBlock, _: number) => (
                <div
                  className="relative min-w-50"
                  onClick={() => handleAddBlock(item)}
                >
                  <RhythmBlockCard block={item} />
                  <Overlay text="+" />
                </div>
              )}
            />
          </section>

          {/* Selected blocks section */}
          <section
            className="flex-1"
            role="region"
            aria-label="Selected Rhythm Blocks"
          >
            <h2 className="text-lg font-semibold mb-3 text-gray-900 dark:text-zinc-300">
              Selected Rhythm Blocks
            </h2>
            {selectedBlocks.length > 0 ? (
              <ItemCollection<RhythmBlock>
                items={selectedBlocks}
                className={cn("w-fit", "xl:grid-cols-1")}
                renderItem={(item: RhythmBlock, _: number) => (
                  <div
                    className="relative min-w-50"
                    onClick={() => {
                      handleRemoveBlock(item);
                    }}
                  >
                    <RhythmBlockCard block={item} className="max-w-50" />
                    <Overlay text="-" />
                  </div>
                )}
              />
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                No blocks selected yet.
                <br />
                Click the + buttons to add blocks.
              </p>
            )}
          </section>

          {/* My rhythm section */}
          <section className="flex-1" role="region" aria-label="My Rhythm">
            <h2 className="text-lg font-semibold mb-3 text-gray-900 dark:text-zinc-300">
              My Rhythm
            </h2>
            <div className="text-gray-500 dark:text-gray-400 text-sm">
              <p>Your daily rhythm will appear here.</p>
            </div>
          </section>
        </div>

        {/* Plan Button */}
        <div className="fixed bottom-15 left-[50%] -translate-x-1/2">
          <PlanRhythmButton
            className={`transition-all duration-500 ease-in-out transform ${
              selectedBlocks.length > 0
                ? "opacity-100 scale-100"
                : "opacity-0 scale-95"
            }`}
          />
        </div>
      </section>
    </>
  );
};

const Overlay = ({ text }: { text: string }) => {
  return (
    <div
      className={cn(
        "absolute inset-0",
        "group-hover:bg-amber-50/20 rounded-xl",
        "flex items-center justify-center",
      )}
      aria-hidden="true"
    >
      <span
        className={cn(
          "inline-block w-8 h-8 rounded-full",
          "bg-white/20 ",
          "opacity-0 group-hover:opacity-100",
        )}
      >
        <span
          className={cn(
            "absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2",
            "text-lg font-extrabold text-gray-600 opacity-40",
          )}
        >
          {text}
        </span>
      </span>
    </div>
  );
};

export default RhythmBuilder;
