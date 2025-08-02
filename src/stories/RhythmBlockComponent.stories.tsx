import type { Meta, StoryObj } from "@storybook/react-vite";
import RhythmBlockCard from "../contexts/rhythm/components/RhythmBlockCard";
import RhythmBlock, {
  type RhythmBlockCategory,
} from "../contexts/rhythm/domain/entities/RhythmBlock";
import RhythmBlockId from "../contexts/rhythm/domain/values/RhythmBlockId";

const mockTimeRange = {
  start: new Date("2024-08-04T09:00:00"),
  end: new Date("2024-08-04T10:30:00"),
};

// Helper function to create rhythm blocks with all required properties
const createRhythmBlock = (
  label: string,
  category: RhythmBlockCategory,
  userOrder: number = 1,
) => {
  return new RhythmBlock({
    id: new RhythmBlockId(),
    label,
    durationInMinutes: 90,
    timeRange: mockTimeRange,
    category,
    intensity: "medium",
    priority: "important",
    constraints: [],
    isPlanned: true,
    isCompleted: false,
    notes: "",
    userOrder,
  });
};

const mockRhythmBlock = createRhythmBlock("Morning Work Session", "focus", 1);

const meta: Meta<typeof RhythmBlockCard> = {
  title: "Rhythm/RhythmBlockComponent",
  component: RhythmBlockCard,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    styles: {
      control: "object",
      description: "Custom styles for different parts of the component",
    },
    block: {
      control: "object",
      description: "Rhythm block data",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const FocusSession: Story = {
  args: {
    block: createRhythmBlock("Deep Work Session", "focus"),
  },
};

export const RestSession: Story = {
  args: {
    block: createRhythmBlock("Rest & Recovery", "rest"),
  },
};

export const ExerciseSession: Story = {
  args: {
    block: createRhythmBlock("Workout Session", "exercise"),
  },
};

export const MeetingSession: Story = {
  args: {
    block: createRhythmBlock("Team Meeting", "meeting"),
  },
};

export const HobbySession: Story = {
  args: {
    block: createRhythmBlock("Creative Hobby", "hobby"),
  },
};

export const ConnectSession: Story = {
  args: {
    block: createRhythmBlock("Social Connection", "connect"),
  },
};

export const ChoreSession: Story = {
  args: {
    block: createRhythmBlock("House Chore", "chore"),
  },
};

export const MealSession: Story = {
  args: {
    block: createRhythmBlock("Lunch Break", "meal"),
  },
};

export const BreakSession: Story = {
  args: {
    block: createRhythmBlock("Short Break", "break"),
  },
};

export const HoverState: Story = {
  args: {
    block: mockRhythmBlock,
    styles: {
      background: "animate-shimmer-energetic",
    },
  },
};

export const CompletedState: Story = {
  args: {
    block: createRhythmBlock("Completed Task", "focus"),
  },
};

export const CustomStyling: Story = {
  args: {
    block: mockRhythmBlock,
    styles: {
      background: "animate-shimmer-sunset",
      text: "text-white",
    },
  },
  render: (args) => (
    <div className="-rotate-6 shadow-lg hover:rotate-0 transition-transform duration-500 ease-in-out">
      <RhythmBlockCard {...args} />
    </div>
  ),
};

export const AllCategories: Story = {
  render: () => (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {[
        "focus",
        "rest",
        "meal",
        "exercise",
        "break",
        "meeting",
        "hobby",
        "connect",
        "chore",
      ].map((category, index) => (
        <RhythmBlockCard
          key={category}
          block={createRhythmBlock(
            `${category.charAt(0).toUpperCase() + category.slice(1)} Session`,
            category as RhythmBlockCategory,
            index + 1,
          )}
        />
      ))}
    </div>
  ),
};
