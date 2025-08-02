import { RhythmServiceProvider } from "../contexts/rhythm/app/RhythmServiceProvider";
import { mockedBlocks } from "../contexts/rhythm/data/rhythmBlocks";
import RhythmBuilder from "../contexts/rhythm/components/RhythmBuilder";

const AppMain = () => {
  return (
    <RhythmServiceProvider>
      <RhythmBuilder
        className="isolate max-w-[90%] mx-auto"
        buildingBlocks={mockedBlocks()} // TODO unmock
      />
    </RhythmServiceProvider>
  );
};

export default AppMain;
