import { TableCellSerializer } from "./cell";
import { TableChildSerializer } from "./child";
import { TableRowSerializer } from "./row";
import { TableSerializer } from "./table";

export const tableSerializers = [
  new TableSerializer(),
  new TableChildSerializer(),
  new TableRowSerializer(),
  new TableCellSerializer(),
] as const;

export {
  TableSerializer,
  TableChildSerializer,
  TableRowSerializer,
  TableCellSerializer,
};
