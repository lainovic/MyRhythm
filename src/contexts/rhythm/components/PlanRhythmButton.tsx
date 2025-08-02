import { cn } from "../../../shared/styles";

interface PlanRhythmButtonProps {
  className?: string;
  onButtonClicked: () => void;
}

const PlanRhythmButton = ({
  className,
  onButtonClicked,
}: PlanRhythmButtonProps) => (
  <button
    className={cn(
      "relative w-16 h-16 rounded-full",
      "bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500",
      "shadow-lg hover:shadow-2xl hover:shadow-purple-500/25",
      "transform hover:scale-110 active:scale-95",
      "transition-all duration-500 ease-out",
      "focus:outline-none focus:ring-4 focus:ring-purple-300/50",
      "group overflow-hidden",
      className,
    )}
    aria-label="Plan my rhythm"
    onClick={onButtonClicked}
  >
    {/* Animated background gradient */}
    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 animate-pulse"></div>

    {/* Shimmer effect */}
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-out"></div>

    {/* Pulsing rings */}
    <div className="absolute inset-0 rounded-full border-2 border-purple-400/40 animate-ping"></div>
    <div
      className="absolute inset-0 rounded-full border-2 border-pink-400/30 animate-ping"
      style={{ animationDelay: "0.3s" }}
    ></div>
    <div
      className="absolute inset-0 rounded-full border-2 border-indigo-400/20 animate-ping"
      style={{ animationDelay: "0.6s" }}
    ></div>

    {/* Text with enhanced styling */}
    <div
      className={cn(
        "relative flex items-center justify-center w-full h-full",
        "text-white opacity-60 font-black text-xs tracking-widest uppercase",
        "group-hover:text-yellow-100 transition-colors duration-500",
        "drop-shadow-lg group-hover:drop-shadow-2xl",
      )}
    >
      <span className="group-hover:scale-105 group-hover:rotate-1 transition-all duration-500 ease-out">
        Plan
      </span>
    </div>

    {/* Enhanced hover glow effect */}
    {/* <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 opacity-0 group-hover:opacity-30 transition-opacity duration-500 blur-xl"></div> */}
  </button>
);

export default PlanRhythmButton;
