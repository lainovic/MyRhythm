import type { Meta, StoryObj } from "@storybook/react-vite";
import RhythmBuilder from "../contexts/rhythm/components/RhythmBuilder";

const meta: Meta<typeof RhythmBuilder> = {
  title: "Rhythm/RhythmBuilder",
  component: RhythmBuilder,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    className: {
      control: "text",
      description: "Additional CSS classes for container",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const WithCustomStyling: Story = {
  args: {
    className: "shadow-2xl",
  },
};

export const DarkMode: Story = {
  args: {},
  parameters: {
    backgrounds: {
      default: "dark",
    },
  },
};
