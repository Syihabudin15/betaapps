import {
  AreaChartOutlined,
  AuditOutlined,
  BarChartOutlined,
  BranchesOutlined,
  DashboardFilled,
  DollarCircleFilled,
  DollarCircleOutlined,
  FallOutlined,
  FilterFilled,
  KeyOutlined,
  LogoutOutlined,
  ReadFilled,
  RiseOutlined,
  SettingFilled,
  UserOutlined,
} from "@ant-design/icons";
import { Button, Drawer, Input, Modal, Select, TableProps } from "antd";
import { useState } from "react";
import { IPermission } from "../Pages/IInterfaces";

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
  const [open, setOpen] = useState(false);

  return (
    <div>
      <div className="border-blue-400 border-b-2 text-xl font-bold font-mono py-1">
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
              <Button
                size="small"
                type="primary"
                icon={<FilterFilled />}
                onClick={() => setOpen(true)}
              >
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
      <Drawer
        title="DATA FILTERS"
        // placement="left"
        width={"50%"}
        open={open}
        onClose={() => setOpen(false)}
      >
        <div className="flex flex-wrap gap-2">
          {functionsRight &&
            functionsRight.map((fr, i) => <div key={i}>{fr}</div>)}
        </div>
      </Drawer>
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
            fontSize: 13,
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
  type,
  option,
  disable,
  showSearch,
  prefix,
  suffix,
  widthLeft,
}: {
  label: string;
  classname?: string;
  value: any;
  onChange?: Function;
  type?:
    | "number"
    | "date"
    | "datetime-local"
    | "area"
    | "options"
    | "password"
    | "optionGroup";
  option?: { label: any; value: any }[];
  disable?: boolean;
  showSearch?: boolean;
  prefix?: any;
  suffix?: any;
  widthLeft?: number;
}) => {
  return (
    <div className={`flex gap-2 items-center ${classname ? classname : ""}`}>
      <div className={`text-right ${widthLeft ? "w-" + widthLeft : "w-40"}`}>
        <p>{label} :</p>
      </div>
      <div className="flex-1">
        {!type && (
          <Input
            value={value}
            onChange={(e) => onChange && onChange(e.target.value)}
            disabled={disable}
            prefix={prefix}
            suffix={suffix}
          />
        )}
        {type && type === "number" && (
          <Input
            value={value}
            type="number"
            onChange={(e) => onChange && onChange(e.target.value)}
            disabled={disable}
            prefix={prefix}
            suffix={suffix}
          />
        )}
        {type && type === "date" && (
          <Input
            value={value}
            type="date"
            onChange={(e) => onChange && onChange(e.target.value)}
            disabled={disable}
            prefix={prefix}
            suffix={suffix}
          />
        )}
        {type && type === "datetime-local" && (
          <Input
            value={value}
            type="datetime-local"
            onChange={(e) => onChange && onChange(e.target.value)}
            disabled={disable}
            prefix={prefix}
            suffix={suffix}
          />
        )}
        {type && type === "area" && (
          <Input.TextArea
            value={value}
            onChange={(e) => onChange && onChange(e.target.value)}
            disabled={disable}
          />
        )}
        {type && type === "options" && (
          <Select
            value={value}
            options={option}
            onChange={(e) => onChange && onChange(e)}
            disabled={disable}
            style={{ width: "100%" }}
            showSearch={showSearch}
            filterOption={(input, option) =>
              option?.label.toLowerCase().includes(input.toLowerCase())
            }
          />
        )}
        {type && type === "optionGroup" && (
          <Select
            value={value}
            options={option}
            onChange={(e) => onChange && onChange(e)}
            disabled={disable}
            style={{ width: "100%" }}
            mode="tags"
            showSearch={showSearch}
            filterOption={(input, option) =>
              option?.label.toLowerCase().includes(input.toLowerCase())
            }
          />
        )}
        {type && type === "password" && (
          <Input.Password
            value={value}
            onChange={(e) => onChange && onChange(e.target.value)}
            disabled={disable}
            prefix={prefix}
            suffix={suffix}
          />
        )}
      </div>
    </div>
  );
};

export const LogoutButton = () => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string>();

  const handleOK = async () => {
    setLoading(true);
    await fetch("/api/auth", { method: "DELETE" })
      .then((res) => res.json())
      .then((res) => {
        if (res.status === 200) {
          window && window.location.replace("/");
        } else {
          setMsg(res.msg);
        }
      })
      .catch((err) => {
        console.log(err);
        setMsg("Internal Server Error!");
      });
    setLoading(false);
  };

  return (
    <div>
      <Button
        size="small"
        danger
        icon={<LogoutOutlined />}
        type="primary"
        onClick={() => setOpen(true)}
      >
        Logout
      </Button>
      <Modal
        open={open}
        onCancel={() => setOpen(false)}
        title="Konfirmasi Logout"
        onOk={() => handleOK()}
        loading={loading}
      >
        <div className="my-4" style={{ lineHeight: 2 }}>
          <p>Lanjutkan untuk keluar dari sistem BETA?</p>
          <p className="italic text-red-500">{msg}</p>
        </div>
      </Modal>
    </div>
  );
};

export const MenuItems = [
  {
    label: "Dashboard",
    key: "/dashboard",
    icon: <DashboardFilled />,
    style: { color: "#fefefe" },
  },
  {
    label: "Daily Report",
    key: "/daily-report",
    icon: <AreaChartOutlined />,
    style: { color: "#fefefe" },
  },
  {
    label: "Monthly Report",
    key: "/report",
    icon: <BarChartOutlined />,
    style: { color: "#fefefe" },
  },
  {
    label: "Buku Tamu",
    key: "/guestbook",
    icon: <ReadFilled />,
    style: { color: "#fefefe" },
  },
  {
    label: "Izin & Permohonan",
    key: "/permit-absence",
    icon: <AuditOutlined />,
    style: { color: "#fefefe" },
  },
  {
    label: "Permohonan Insentif",
    key: "/permit-insentif",
    icon: <DollarCircleFilled />,
    style: { color: "#fefefe" },
  },
  {
    label: "Manajemen Insentif",
    key: "/insentif",
    icon: <DollarCircleOutlined />,
    style: { color: "#fefefe" },
  },
  {
    label: "Manajemen Tunjangan",
    key: "/allowances",
    icon: <RiseOutlined />,
    style: { color: "#fefefe" },
  },
  {
    label: "Manajemen Potongan",
    key: "/deductions",
    icon: <FallOutlined />,
    style: { color: "#fefefe" },
  },
  {
    label: "Manajemen User",
    key: "/users",
    icon: <UserOutlined />,
    style: { color: "#fefefe" },
  },
  {
    label: "Manajemen Posisi",
    key: "/positions",
    icon: <BranchesOutlined />,
    style: { color: "#fefefe" },
  },
  {
    label: "Manajemen Role",
    key: "/roles",
    icon: <KeyOutlined />,
    style: { color: "#fefefe" },
  },
  {
    label: "Configuration",
    key: "/config",
    icon: <SettingFilled />,
    style: { color: "#fefefe" },
  },
];

export const getMenuItems = (permissions: string) => {
  const userMenu = JSON.parse(permissions) as IPermission[];
  const fix = MenuItems.filter((menu) =>
    userMenu.some((um) => um.path === menu.key)
  );
  return fix;
};
