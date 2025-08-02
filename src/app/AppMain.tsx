import { mockedBlocks } from "../contexts/rhythm/data/rhythmBlocks";
import RhythmBuilder from "../contexts/rhythm/ui/components/RhythmBuilder";

const AppMain = () => {
  return (
    <RhythmBuilder
      className="isolate max-w-[90%] mx-auto"
      buildingBlocks={mockedBlocks()} // TODO unmock
    />
  );
};

export default AppMain;
