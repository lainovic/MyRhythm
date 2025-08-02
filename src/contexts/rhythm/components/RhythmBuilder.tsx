import React from "react";
import { cn, sharedStyles } from "../../../shared/styles";
import RhythmBlock from "../domain/entities/RhythmBlock";
import PlanRhythmButton from "./PlanRhythmButton";
import { useRhythmService } from "../app/RhythmServiceProvider";
import UserId from "../../users/domain/values/UserId";
import RhythmBlockColumn from "./RhythmBlockColumn";
import { SquarePen } from "lucide-react";
import { showToast } from "../../../shared/utils/toast";

interface RhythmBuilderProps {
  className?: string;
  buildingBlocks: RhythmBlock[];
}

const RhythmBuilder = ({ className, buildingBlocks }: RhythmBuilderProps) => {
  const [selectedBlocks, setSelectedBlocks] = React.useState<RhythmBlock[]>([]);
  const [plannedBlocks, setPlannedBlocks] = React.useState<RhythmBlock[]>([]);

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

  const svc = useRhythmService();

  const handleGenerateUserRhythm = () => {
    const result = svc.planRhythm(new UserId(), selectedBlocks);
    if (result.isSuccess()) {
      setPlannedBlocks([...result.value().blocks]);
    } else {
      showToast(result.error().message, "error");
    }
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;

    if (sourceIndex === destinationIndex) return;

    const newBlocks = Array.from(selectedBlocks);
    const [removed] = newBlocks.splice(sourceIndex, 1);
    newBlocks.splice(destinationIndex, 0, removed);

    setSelectedBlocks(newBlocks);
  };

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
            "items-start justify-around gap-4",
          )}
          role="main"
        >
          {/* Available blocks section */}
          <RhythmBlockColumn
            title="All Rhythm Blocks"
            blocks={buildingBlocks}
            placeholderText="All available blocks."
            actions={[{ text: "➕", onClick: handleAddBlock }]}
            className="flex-1 overflow-scroll"
            layout="grid"
            gridCols="grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3"
          />

          {/* Selected blocks section */}
          <RhythmBlockColumn
            title="Selected Rhythm Blocks"
            blocks={selectedBlocks}
            placeholderText={
              <p className="italic font-light">
                No blocks selected yet.
                <br />
                Click the ➕ button to add blocks.
                <br />
                <br />
                Drag blocks to reorder them by priority.
              </p>
            }
            actions={[
              { text: "➖", onClick: handleRemoveBlock },
              { text: <SquarePen size={16} />, onClick: handleRemoveBlock },
            ]}
            className="flex-1"
            draggable
            onDragEnd={handleDragEnd}
            layout="flex"
            flexDirection="col"
            flexWrap={false}
          />

          {/* My rhythm section */}
          <RhythmBlockColumn
            title="My Rhythm"
            blocks={plannedBlocks}
            placeholderText={
              <p className="italic font-light">
                Your daily rhythm will appear here.
              </p>
            }
            className="flex-1"
            layout="flex"
            flexDirection="col"
            flexWrap={false}
          />
        </div>

        {/* Plan Button */}
        <div className="fixed bottom-15 left-[50%] -translate-x-1/2">
          <PlanRhythmButton
            className={`transition-all duration-500 ease-in-out transform ${
              selectedBlocks.length > 0
                ? "opacity-100 scale-100"
                : "opacity-0 scale-95"
            }`}
            onButtonClicked={handleGenerateUserRhythm}
          />
        </div>
      </section>
    </>
  );
};

export default RhythmBuilder;
