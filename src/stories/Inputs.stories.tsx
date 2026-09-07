import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { NullableSelectValue } from "@/lib/types";
import { Field, Form } from "@/widgets/inputs/Field";
import { TextInput, ReadOnlyInput } from "@/widgets/inputs/TextInput";
import { BoolInput } from "@/widgets/inputs/BoolInput";
import { NumberInput, NumberRangeInput } from "@/widgets/inputs/NumberInput";
import { AsyncSelectInput, SelectInput } from "@/widgets/inputs/SelectInput";
import { DateRangeInput, DateTimeInput, type DateRangeValue } from "@/widgets/inputs/DateInput";
import {
  AudioInput,
  CameraInput,
  CodeInput,
  ColorInput,
  ContentInput,
  FeedbackInput,
  FileInput,
  IconInput,
  SignatureInput,
} from "@/widgets/inputs/SpecialInputs";
import { Button } from "@/widgets/Button";
import { Separator } from "@/widgets/primitives/Separator";
import { options } from "./data";

const meta: Meta = {
  title: "Inputs/Overview",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Every `Ivy` input. Ivy's `events` array becomes an `onChange` callback; `invalid`, `nullable`, `density`, `ghost` and the variant enums keep their Ivy names.",
      },
    },
  },
};

export default meta;
type Story = StoryObj;

const Row = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="mb-8">
    <Separator text={title} />
    <div className="mt-3 flex flex-wrap items-start gap-5">{children}</div>
  </div>
);

export const Text: Story = {
  render: () => {
    const [value, setValue] = React.useState("Tendril");
    return (
      <Row title="TextInput">
        <Field label="Text" required>
          <TextInput value={value} onChange={(next) => setValue(next ?? "")} nullable />
        </Field>
        <Field label="Search">
          <TextInput variant="Search" placeholder="Find anything…" nullable value="" />
        </Field>
        <Field label="Password">
          <TextInput variant="Password" value="hunter2" />
        </Field>
        <Field label="Email" description="We never share it">
          <TextInput variant="Email" placeholder="you@example.com" />
        </Field>
        <Field label="Textarea">
          <TextInput variant="Textarea" rows={3} value={"Two\nlines"} />
        </Field>
        <Field label="Invalid">
          <TextInput value="not-a-url" invalid="Must start with https://" />
        </Field>
        <Field label="Read only">
          <ReadOnlyInput value="tendril-a1b2c3" showCopyButton />
        </Field>
      </Row>
    );
  },
};

export const Booleans: Story = {
  render: () => {
    const [value, setValue] = React.useState<boolean | null>(true);
    return (
      <Row title="BoolInput">
        <BoolInput
          variant="Checkbox"
          label="Tri-state checkbox"
          description="Cycles true → null → false"
          nullable
          value={value}
          onChange={setValue}
        />
        <BoolInput variant="Switch" label="Switch" value={value === true} onChange={setValue} />
        <BoolInput variant="Toggle" label="Bold" icon="Bold" value={value === true} onChange={setValue} />
        <BoolInput variant="Checkbox" label="Disabled" value disabled />
        <BoolInput variant="Checkbox" label="Loading" value loading />
      </Row>
    );
  },
};

export const Numbers: Story = {
  render: () => {
    const [value, setValue] = React.useState<number | null>(42);
    return (
      <Row title="NumberInput">
        <Field label="Decimal">
          <NumberInput value={value} onChange={setValue} nullable />
        </Field>
        <Field label="Currency">
          <NumberInput value={1299.5} formatStyle="Currency" currency="EUR" precision={2} />
        </Field>
        <Field label="Percent">
          <NumberInput value={0.62} formatStyle="Percent" precision={0} />
        </Field>
        <Field label="Bytes">
          <NumberInput value={4823400} formatStyle="Bytes" />
        </Field>
        <Field label="Slider" width="18rem">
          <NumberInput variant="Slider" value={value} min={0} max={100} onChange={setValue} width="100%" />
        </Field>
        <Field label="Range" width="20rem">
          <NumberRangeInput lowerValue={20} upperValue={70} width="100%" />
        </Field>
      </Row>
    );
  },
};

export const Selects: Story = {
  render: () => {
    const [single, setSingle] = React.useState<NullableSelectValue>("build");
    const [many, setMany] = React.useState<NullableSelectValue>(["design", "build"]);
    return (
      <Row title="SelectInput">
        <Field label="Select">
          <SelectInput options={options} value={single} onChange={setSingle} nullable />
        </Field>
        <Field label="Multi select">
          <SelectInput options={options} value={many} selectMany showActions onChange={setMany} />
        </Field>
        <Field label="Radio">
          <SelectInput variant="Radio" options={options} value={single} onChange={setSingle} />
        </Field>
        <Field label="Toggle group">
          <SelectInput variant="Toggle" options={options} value={single} onChange={setSingle} />
        </Field>
        <Field label="List">
          <SelectInput variant="List" options={options} value={single} onChange={setSingle} width="14rem" />
        </Field>
        <Field label="Slider">
          <SelectInput variant="Slider" options={options} value={single} onChange={setSingle} width="16rem" />
        </Field>
        <Field label="Async">
          <AsyncSelectInput displayValue="Design" options={options} />
        </Field>
      </Row>
    );
  },
};

export const DatesAndColours: Story = {
  render: () => {
    const [date, setDate] = React.useState<string | null>("2026-04-20");
    const [range, setRange] = React.useState<DateRangeValue | null>({
      item1: "2026-04-05",
      item2: "2026-04-18",
    });
    const [color, setColor] = React.useState<string | null>("Teal");
    return (
      <Row title="Dates, colours, icons">
        <Field label="Date">
          <DateTimeInput value={date} onChange={setDate} nullable />
        </Field>
        <Field label="Date & time">
          <DateTimeInput variant="DateTime" value="2026-04-20T09:30" />
        </Field>
        <Field label="Time">
          <DateTimeInput variant="Time" value="09:30" />
        </Field>
        <Field label="Month">
          <DateTimeInput variant="Month" value="2026-04" />
        </Field>
        <Field label="Date range">
          <DateRangeInput value={range} onChange={setRange} />
        </Field>
        <Field label="Colour">
          <ColorInput value={color} onChange={setColor} variant="SwatchPicker" />
        </Field>
        <Field label="Icon">
          <IconInput value="Rocket" nullable />
        </Field>
      </Row>
    );
  },
};

export const Feedback: Story = {
  render: () => (
    <Row title="FeedbackInput">
      <Field label="Stars">
        <FeedbackInput value={4} />
      </Field>
      <Field label="Half stars">
        <FeedbackInput value={3.5} allowHalf />
      </Field>
      <Field label="Thumbs">
        <FeedbackInput variant="Thumbs" value />
      </Field>
      <Field label="Emojis">
        <FeedbackInput variant="Emojis" value={4} />
      </Field>
    </Row>
  ),
};

export const FilesAndCapture: Story = {
  render: () => (
    <>
      <Row title="Files">
        <FileInput placeholder="Choose a document" />
        <FileInput variant="Drop" accept=".png,.jpg" maxFileSize={5_000_000} width="18rem" />
      </Row>
      <Row title="Capture">
        <SignatureInput />
        <AudioInput recording elapsed={2} />
        <CameraInput width="16rem" />
      </Row>
      <Row title="Long-form">
        <CodeInput
          language="ts"
          width="22rem"
          height="9rem"
          value={"export function hello(name: string) {\n  return `hi ${name}`;\n}"}
        />
        <ContentInput value="Attach the wireframes and send." width="24rem" maxLength={280} shortcutKey="⌘↵" />
      </Row>
    </>
  ),
};

export const InAForm: Story = {
  render: () => (
    <Form onSubmit={() => {}} className="w-96">
      <Field label="Project" required help="Shown in the sidebar">
        <TextInput value="Tendril" width="100%" />
      </Field>
      <Field label="Stage">
        <SelectInput options={options} value="build" width="100%" />
      </Field>
      <Field label="Budget">
        <NumberInput value={25000} formatStyle="Currency" width="100%" />
      </Field>
      <Field label="Notes" description="Markdown is fine">
        <TextInput variant="Textarea" rows={3} width="100%" />
      </Field>
      <BoolInput variant="Checkbox" label="Notify the team" value />
      <div className="flex justify-end gap-2">
        <Button variant="Ghost" title="Cancel" />
        <Button title="Save project" icon="Save" />
      </div>
    </Form>
  ),
};
