import type { Meta, StoryObj } from "@storybook/react-vite";
import { Chat, ChatLoading, ChatMessage, ChatStatus } from "@/widgets/Chat";

const meta = {
  title: "Widgets/Chat",
  component: Chat,
  subcomponents: { ChatMessage, ChatStatus, ChatLoading },
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Mirrors `Ivy.Chat`, holding `ChatMessage`, `ChatStatus` and `ChatLoading` children — the transcript, a note about what the assistant is doing, and the waiting state.",
      },
    },
  },
  args: { width: "28rem", height: "22rem" },
} satisfies Meta<typeof Chat>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Chat {...args}>
      <ChatMessage sender="User">How do I make it look hand-drawn?</ChatMessage>
      <ChatMessage sender="Assistant">
        Every border is a rough.js path drawn over a measured box.
      </ChatMessage>
      <ChatStatus text="Searching the sketchbook…" />
      <ChatLoading />
    </Chat>
  ),
};

export const Transcript: Story = {
  render: (args) => (
    <Chat {...args}>
      <ChatMessage sender="User">Can I use my own colours?</ChatMessage>
      <ChatMessage sender="Assistant">
        Yes — every widget takes an Ivy colour name or a raw CSS colour.
      </ChatMessage>
      <ChatMessage sender="User">And the font?</ChatMessage>
      <ChatMessage sender="Assistant">Override `--font-sketch` in your own theme.</ChatMessage>
    </Chat>
  ),
};
