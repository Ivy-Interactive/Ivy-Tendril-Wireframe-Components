import type { Meta, StoryObj } from "@storybook/react-vite";
import { Table, TableCell, TableRow } from "@/widgets/Table";

const meta = {
  title: "Widgets/Table",
  component: Table,
  subcomponents: { TableRow, TableCell },
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Mirrors `Ivy.Table`, built from `TableRow` and `TableCell`. Hand-composed, unlike `DataTable`, which takes its rows and columns as data.",
      },
    },
  },
  args: { width: "26rem" },
} satisfies Meta<typeof Table>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Table {...args}>
      <thead>
        <TableRow isHeader>
          <TableCell isHeader>Item</TableCell>
          <TableCell isHeader alignContent="Right">
            Qty
          </TableCell>
          <TableCell isHeader alignContent="Right">
            Price
          </TableCell>
        </TableRow>
      </thead>
      <tbody>
        <TableRow>
          <TableCell>Pencils</TableCell>
          <TableCell alignContent="Right">12</TableCell>
          <TableCell alignContent="Right">£4.20</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Erasers</TableCell>
          <TableCell alignContent="Right">4</TableCell>
          <TableCell alignContent="Right">£1.80</TableCell>
        </TableRow>
      </tbody>
      <tfoot>
        <TableRow isFooter>
          <TableCell isFooter>Total</TableCell>
          <TableCell isFooter alignContent="Right">
            16
          </TableCell>
          <TableCell isFooter alignContent="Right">
            £6.00
          </TableCell>
        </TableRow>
      </tfoot>
    </Table>
  ),
};
