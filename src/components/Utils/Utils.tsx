import { FilterFilled, KeyOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Input, TableProps } from "antd";

export const TableTitle = ({
  title,
  functionsLeft,
  functionsRight,
  onSearch,
}: {
  title: string | React.ReactNode;
  functionsLeft?: React.ReactNode[];
  functionsRight?: React.ReactNode[];
  onSearch?: Function;
}) => {
  return (
    <div>
      <div className="border-blue-400 border-b text-2xl font-bold font-mono">
        <p>{title}</p>
      </div>
      <div className="flex gap-2 justify-between items-center mt-1">
        <div className="flex gap-2 items-center">
          {functionsLeft && functionsLeft.map((f, i) => <div key={i}>{f}</div>)}
          {functionsRight &&
            functionsRight.map((f, i) => (
              <div key={i} className="hidden sm:block">
                {f}
              </div>
            ))}
          {functionsRight && (
            <div className="block sm:hidden">
              <Button size="small" type="primary" icon={<FilterFilled />}>
                Filters
              </Button>
            </div>
          )}
        </div>
        <Input.Search
          size="small"
          style={{ width: 170 }}
          onChange={(e) => onSearch && onSearch(e.target.value)}
        />
      </div>
    </div>
  );
};

export function GenerateColumns<T>(
  columns: TableProps<T>["columns"]
): TableProps<any>["columns"] {
  const generate =
    columns &&
    columns.map((c) => ({
      ...c,
      className: `text-xs ${c.className || ""}`,
      onHeaderCell: () => {
        return {
          ["style"]: {
            textAlign: "center",
            fontSize: 12,
            fontWeight: "bold",
          },
        };
      },
    }));
  return generate as TableProps<T>["columns"];
}

export const FormInput = ({
  label,
  classname,
  value,
  onChange,
}: {
  label: string;
  classname?: string;
  value: any;
  onChange?: Function;
}) => {
  return (
    <div className={`flex gap-2 items-center ${classname ? classname : ""}`}>
      <div className="text-right w-32">
        <p>{label} :</p>
      </div>
      <div className="flex-1">
        <Input
          value={value}
          onChange={(e) => onChange && onChange(e.target.value)}
        />
      </div>
    </div>
  );
};

export const MenuItems = [
  {
    label: "Dashboard",
    key: "/dashboard",
  },
  {
    label: "Role Management",
    key: "/roles",
    icon: <KeyOutlined />,
  },
  {
    label: "User Management",
    key: "/users",
    icon: <UserOutlined />,
  },
];
