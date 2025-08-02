import React from "react";
import RhythmService from "./RhythmService";
import RhythmPlannerV1 from "../domain/planner/RhythmPlannerV1";
import TrivialScheduler from "../../../shared/TrivialScheduler";

const RhythmServiceContext = React.createContext<RhythmService | null>(null);

export function RhythmServiceProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const planner = React.useMemo(
    () => new RhythmService(new RhythmPlannerV1(new TrivialScheduler())),
    [],
  );
  return (
    <RhythmServiceContext.Provider value={planner}>
      {children}
    </RhythmServiceContext.Provider>
  );
}

export function useRhythmService(): RhythmService {
  const ctx = React.useContext(RhythmServiceContext);
  if (!ctx) {
    throw new Error(
      "useRhythmPlanner must be used within RhythmPlannerProvider",
    );
  }
  return ctx;
}
