import type { Meta, StoryObj } from "@storybook/react-vite";
import RhythmBlockCard from "../contexts/rhythm/ui/components/RhythmBlockCard";
import RhythmBlock from "../contexts/rhythm/domain/entities/RhythmBlock";
import RhythmBlockId from "../contexts/rhythm/domain/values/RhythmBlockId";

const mockTimeRange = {
  start: new Date("2024-08-04T09:00:00"),
  end: new Date("2024-08-04T10:30:00"),
};

const mockRhythmBlock = new RhythmBlock({
  id: new RhythmBlockId(),
  label: "Morning Work Session",
  timeRange: mockTimeRange,
  category: "focus",
  isPlanned: true,
  wasCompleted: false,
  notes: "Deep work on project features",
});

const meta: Meta<typeof RhythmBlockCard> = {
  title: "Rhythm/RhythmBlockComponent",
  component: RhythmBlockCard,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    bgStyle: {
      control: "text",
      description: "Additional CSS classes for background",
    },
    textStyle: {
      control: "text",
      description: "Additional CSS classes for text",
    },
    rhythmBlock: {
      control: "object",
      description: "Rhythm block data",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const FocusSession: Story = {
  args: {
    rhythmBlock: new RhythmBlock({
      id: new RhythmBlockId(),
      label: "Deep Work Session",
      timeRange: mockTimeRange,
      category: "focus",
      isPlanned: true,
    }),
  },
};

export const RestSession: Story = {
  args: {
    rhythmBlock: new RhythmBlock({
      id: new RhythmBlockId(),
      label: "Rest & Recovery",
      timeRange: mockTimeRange,
      category: "rest",
      isPlanned: true,
    }),
  },
};

export const ExerciseSession: Story = {
  args: {
    rhythmBlock: new RhythmBlock({
      id: new RhythmBlockId(),
      label: "Workout Session",
      timeRange: mockTimeRange,
      category: "exercise",
      isPlanned: true,
    }),
  },
};

export const MeetingSession: Story = {
  args: {
    rhythmBlock: new RhythmBlock({
      id: new RhythmBlockId(),
      label: "Team Meeting",
      timeRange: mockTimeRange,
      category: "meeting",
      isPlanned: true,
    }),
  },
};

export const HobbySession: Story = {
  args: {
    rhythmBlock: new RhythmBlock({
      id: new RhythmBlockId(),
      label: "Creative Hobby",
      timeRange: mockTimeRange,
      category: "hobby",
      isPlanned: true,
    }),
  },
};

export const ConnectSession: Story = {
  args: {
    rhythmBlock: new RhythmBlock({
      id: new RhythmBlockId(),
      label: "Social Connection",
      timeRange: mockTimeRange,
      category: "connect",
      isPlanned: true,
    }),
  },
};

export const ChoreSession: Story = {
  args: {
    rhythmBlock: new RhythmBlock({
      id: new RhythmBlockId(),
      label: "House Chore",
      timeRange: mockTimeRange,
      category: "chore",
      isPlanned: true,
    }),
  },
};

export const MealSession: Story = {
  args: {
    rhythmBlock: new RhythmBlock({
      id: new RhythmBlockId(),
      label: "Lunch Break",
      timeRange: mockTimeRange,
      category: "meal",
      isPlanned: true,
    }),
  },
};

export const BreakSession: Story = {
  args: {
    rhythmBlock: new RhythmBlock({
      id: new RhythmBlockId(),
      label: "Short Break",
      timeRange: mockTimeRange,
      category: "break",
      isPlanned: true,
    }),
  },
};

export const HoverState: Story = {
  args: {
    rhythmBlock: mockRhythmBlock,
    bgStyle: "animate-shimmer-energetic",
  },
};

export const CompletedState: Story = {
  args: {
    rhythmBlock: new RhythmBlock({
      id: new RhythmBlockId(),
      label: "Completed Task",
      timeRange: mockTimeRange,
      category: "focus",
      isPlanned: true,
      wasCompleted: true,
    }),
  },
};

export const CustomStyling: Story = {
  args: {
    rhythmBlock: mockRhythmBlock,
    bgStyle: "animate-shimmer-sunset",
    textStyle: "text-white",
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
      ].map((category) => (
        <RhythmBlockCard
          key={category}
          rhythmBlock={
            new RhythmBlock({
              id: new RhythmBlockId(),
              label: `${category.charAt(0).toUpperCase() + category.slice(1)} Session`,
              timeRange: mockTimeRange,
              category: category as any,
              isPlanned: true,
            })
          }
        />
      ))}
    </div>
  ),
};
