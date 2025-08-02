import {
  Battery,
  BatteryCharging,
  BatteryLow,
  CheckCircle,
  Activity,
  Target,
  Bed,
  Dumbbell,
  Utensils,
  Coffee,
  Users,
  Palette,
  MessageCircle,
  Sparkles,
  FileText,
  BatteryMedium,
} from "lucide-react";
import type {
  RhythmBlockCategory,
  RhythmEnergyImpact,
  RhythmIntensity,
  RhythmPriority,
} from "../domain/entities/RhythmBlock";

export const PriorityIcon = ({
  priority,
  iconSize = 16,
}: {
  priority: RhythmPriority;
  iconSize?: number;
}) => {
  const getPriorityIcon = () => {
    switch (priority) {
      case "important":
        return <CheckCircle size={iconSize} className="text-red-500" />;
      case "essential":
        return <CheckCircle size={iconSize} className="text-amber-700" />;
      case "optional":
        return <CheckCircle size={iconSize} className="text-gray-700" />;
      default:
        return <CheckCircle size={iconSize} />;
    }
  };

  return (
    <span className="text-sm" title={`Priority: ${priority}`}>
      {getPriorityIcon()}
    </span>
  );
};

export const IntensityIcon = ({
  intensity,
  iconSize = 16,
}: {
  intensity: RhythmIntensity;
  iconSize?: number;
}) => {
  const getIntensityIcon = () => {
    switch (intensity) {
      case "high":
        return <Activity size={iconSize} className="text-orange-500" />;
      case "medium":
        return <Activity size={iconSize} className="text-blue-500" />;
      case "low":
        return <Activity size={iconSize} className="text-green-900" />;
      default:
        return <Activity size={iconSize} />;
    }
  };

  return (
    <span className="text-sm" title={`Intensity: ${intensity}`}>
      {getIntensityIcon()}
    </span>
  );
};

export const EnergyImpactIcon = ({
  energyImpact,
  iconSize = 16,
}: {
  energyImpact: RhythmEnergyImpact;
  iconSize?: number;
}) => {
  const getEnergyImpactIcon = () => {
    switch (energyImpact) {
      case "draining":
        return <BatteryLow size={iconSize} />;
      case "neutral":
        return <BatteryMedium size={iconSize} />;
      case "recharging":
        return <BatteryCharging size={iconSize} />;
      default:
        return <Battery size={iconSize} />;
    }
  };

  return (
    <span className="text-sm" title={`Energy Impact: ${energyImpact}`}>
      {getEnergyImpactIcon()}
    </span>
  );
};

export const CategoryIcon = ({
  category,
  iconSize = 16,
}: {
  category: RhythmBlockCategory;
  iconSize?: number;
}) => {
  const getCategoryIcon = () => {
    switch (category) {
      case "focus":
        return <Target size={iconSize} />;
      case "rest":
        return <Bed size={iconSize} />;
      case "exercise":
        return <Dumbbell size={iconSize} />;
      case "meal":
        return <Utensils size={iconSize} />;
      case "break":
        return <Coffee size={iconSize} />;
      case "meeting":
        return <Users size={iconSize} />;
      case "hobby":
        return <Palette size={iconSize} />;
      case "connect":
        return <MessageCircle size={iconSize} />;
      case "chore":
        return <Sparkles size={iconSize} />;
      default:
        return <FileText size={iconSize} />;
    }
  };

  return (
    <span className="text-sm" title={`Category: ${category}`}>
      {getCategoryIcon()}
    </span>
  );
};
