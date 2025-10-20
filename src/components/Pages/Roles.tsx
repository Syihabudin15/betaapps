"use client";

import { Button, Checkbox, Modal, Spin, Table, Typography } from "antd";
import { IFormInput, TableTitle } from "@/components/Utils";
import {
  DeleteFilled,
  EditFilled,
  ExportOutlined,
  PlusCircleFilled,
  SaveFilled,
} from "@ant-design/icons";
import { GenerateColumns, MenuItems } from "@/components/Utils/Utils";
import { useEffect, useState } from "react";
import { Roles } from "@prisma/client";
import { IActionProps, IPageProps } from "@/components/Utils/IInterfaces";
import { IPermission } from "@/components/Pages/IInterfaces";
import Link from "next/link";
import { GenerateQueries } from "@/components/lib";
import useApp from "antd/es/app/useApp";
import { usePathname } from "next/navigation";
import { useAccess } from "../Utils/Auth";
const { Paragraph } = Typography;

export default function PageRole() {
  const [pageProps, setPageProps] = useState<IPageProps<Roles>>({
    page: 1,
    pageSize: 50,
    total: 0,
    data: [],
    filters: [],
    loading: false,
  });
  const [selected, setSelected] = useState<IActionProps<Roles>>({
    data: undefined,
    openUpsert: false,
    openDelete: false,
  });
  const pathname = usePathname();
  const { hasAccess } = useAccess(pathname);

  const getData = async () => {
    setPageProps((prev) => ({ ...prev, loading: true }));
    await fetch(
      `/api/roles?${GenerateQueries(
        pageProps.page,
        pageProps.pageSize,
        pageProps.filters
      )}`
    )
      .then((res) => res.json())
      .then((res) => {
        setPageProps((prev) => ({ ...prev, data: res.data, total: res.total }));
      });
    setPageProps((prev) => ({ ...prev, loading: false }));
  };

  useEffect(() => {
    const timeout = setTimeout(async () => {
      await getData();
    }, 100);
    return () => clearTimeout(timeout);
  }, [pageProps.page, pageProps.pageSize, pageProps.filters]);

  const columns = GenerateColumns<Roles>([
    {
      title: "NO",
      key: "no",
      dataIndex: "no",
      width: 50,
      className: "text-center",
      render(value, record, index) {
        return <>{(pageProps.page - 1) * pageProps.pageSize + (index + 1)}</>;
      },
    },
    {
      title: "NAMA ROLE",
      key: "name",
      dataIndex: "name",
      width: 150,
    },
    {
      title: "KETERANGAN",
      key: "description",
      dataIndex: "description",
      width: 200,
    },
    {
      title: "PERMISSIONS",
      key: "permissions",
      dataIndex: "permissions",
      width: 300,
      render(value, record, index) {
        const displayText = JSON.parse(record.permissions) as IPermission[];
        return (
          <>
            <Paragraph
              ellipsis={{
                rows: 1,
                expandable: "collapsible",
              }}
              style={{ fontSize: 11 }}
            >
              {displayText.map((p) => (
                <>
                  {p.name}: [{p.access.join(",")}];
                  <br />
                </>
              ))}
            </Paragraph>
          </>
        );
      },
    },
    {
      title: "AKSI",
      key: "aksi",
      dataIndex: "aksi",
      width: 100,
      render(value, record, index) {
        return (
          <div className="flex justify-center gap-2 flex-wrap">
            {hasAccess("update") && (
              <Link href={`/roles/${record.id}`}>
                <Button
                  icon={<EditFilled />}
                  type="primary"
                  size="small"
                ></Button>
              </Link>
            )}
            {hasAccess("delete") && (
              <Button
                icon={<DeleteFilled />}
                type="primary"
                danger
                size="small"
                onClick={() =>
                  setSelected({ ...selected, data: record, openDelete: true })
                }
              ></Button>
            )}
          </div>
        );
      },
    },
  ]);

  return (
    <div>
      <Table
        title={() => (
          <TableTitle
            title="ROLES MANAGEMENT"
            functionsLeft={[
              <Link key={"add"} href={"/roles/create"}>
                {hasAccess("write") && (
                  <Button
                    icon={<PlusCircleFilled />}
                    size="small"
                    type="primary"
                    key={"create"}
                  >
                    New
                  </Button>
                )}
              </Link>,

              <Button
                icon={<ExportOutlined />}
                size="small"
                type="primary"
                key={"export"}
              >
                Export
              </Button>,
            ]}
            onSearch={(value: any) => {
              const filters = pageProps.filters.filter(
                (q) => q.key !== "search"
              );
              filters.push({ key: "search", value });
              setPageProps((prev) => ({ ...prev, filters }));
            }}
          />
        )}
        bordered
        rowKey={"id"}
        columns={columns}
        dataSource={pageProps.data}
        scroll={{ y: 400 }}
        size="small"
        loading={pageProps.loading}
        pagination={{
          pageSize: pageProps.pageSize,
          pageSizeOptions: [100, 200, 500, 1000, 2000],
          onChange(page, pageSize) {
            setPageProps({ ...pageProps, page, pageSize });
          },
          showTotal(total, range) {
            return (
              <div className="text-xs italic flex gap-2 items-center mt-1">
                <span>show</span>
                <span>
                  {range[0]}-{range[1]}
                </span>
                <span>dari</span>
                <span>{total}</span>
              </div>
            );
          },
        }}
      />
      {selected.data && (
        <DeleteRole
          open={selected.openDelete}
          setOpen={(value: boolean) =>
            setSelected((prev) => ({ ...prev, openDelete: value }))
          }
          getData={getData}
          data={selected.data}
        />
      )}
    </div>
  );
}

const DeleteRole = ({
  open,
  setOpen,
  data,
  getData,
}: {
  open: boolean;
  setOpen: Function;
  data: Roles;
  getData: Function;
}) => {
  const [loading, setLoading] = useState(false);

  const handleOK = async () => {
    setLoading(true);
    await fetch("/api/roles?id=" + data.id, { method: "DELETE" })
      .then((res) => res.json())
      .then(async (res) => {
        if (res.status === 200) {
          Modal.success({ title: "BERHASIL", content: res.msg });
          setOpen(false);
          await getData();
        } else {
          Modal.error({ title: "ERROR !!!", content: res.msg });
        }
      })
      .catch((err) => {
        console.log(err);
        Modal.error({ title: "ERROR !!!", content: "Server Error" });
      });
    await getData();
    setLoading(false);
  };

  return (
    <div>
      <Modal
        title={"KONFIRMASI HAPUS ROLE " + data.name}
        open={open}
        onCancel={() => setOpen(false)}
        loading={loading}
        onOk={() => handleOK()}
      >
        <div className="m-4">
          <p>Lanjutkan untuk menghapus data role {data.name}</p>
        </div>
      </Modal>
    </div>
  );
};

export const UpsertRole = ({ role }: { role?: Roles }) => {
  const [data, setData] = useState<Roles>(role || defaultRole);
  const [menus, setMenus] = useState<IPermission[]>(
    role ? MergeMenu(defaultMenu, JSON.parse(role.permissions)) : defaultMenu
  );
  const [loading, setLoading] = useState(false);
  const { modal } = useApp();

  useEffect(() => {
    const newMenu = menus
      .filter((m) => m.access.length !== 0)
      .map((m) => ({ name: m.name, path: m.path, access: m.access }));
    setData((prev: Roles) => ({
      ...prev,
      permissions: JSON.stringify(newMenu),
    }));
  }, [menus]);

  const handleSubmit = async () => {
    setLoading(true);
    await fetch("/api/roles", {
      method: role ? "PUT" : "POST",
      body: JSON.stringify(data),
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.status === 200) {
          modal.success({ title: "BERHASIL", content: res.msg });
          setTimeout(() => {
            window && window.location.replace("/roles");
          }, 1000);
        } else {
          modal.error({ title: "ERROR!!!", content: res.msg });
        }
      })
      .catch((err) => {
        console.log(err);
        modal.error({ title: "ERROR!!!", content: "Server Error!" });
      });
    setLoading(false);
  };

  const columns = GenerateColumns<IPermission>([
    { title: "MENU", dataIndex: "name", width: 200 },
    { title: "PATH", dataIndex: "path", width: 200 },
    {
      title: "AKSES",
      dataIndex: "access",
      render(value, record, index) {
        return (
          <div>
            <Checkbox.Group
              options={["read", "write", "update", "delete", "proses"]}
              value={record.access}
              onChange={(e) => {
                setMenus((prev: any[]) => {
                  const filter = prev.map((p) => {
                    if (p.path === record.path) {
                      p.access = e;
                    }
                    return p;
                  });
                  return filter;
                });
              }}
            />
          </div>
        );
      },
    },
  ]);

  return (
    <Spin spinning={loading}>
      <div className="p-2 my-2 min-w-[70vw]">
        <div className="border-b-2 border-green-500">
          <p className="font-bold text-2xl">
            {role
              ? "UPDATE DATA ROLE " + role.name.toUpperCase()
              : "BUAT ROLE BARU"}
          </p>
        </div>
        <div className="my-4 flex flex-col sm:flex-row gap-2">
          <IFormInput
            label="Nama Role"
            classname="flex-1"
            value={data.name}
            onChange={(e: any) => setData({ ...data, name: e })}
          />
          <IFormInput
            label="Keterangan"
            classname="flex-1"
            value={data.description}
            onChange={(e: any) => setData({ ...data, description: e })}
            type="area"
          />
        </div>
        <div>
          <Table
            title={() => <p>Permissions</p>}
            columns={columns}
            bordered
            rowKey={"path"}
            dataSource={menus}
            pagination={false}
          />
        </div>
        <div className="flex justify-end gap-4 my-3">
          <Link href={"/roles"}>
            <Button danger>Kembali</Button>
          </Link>
          <Button
            type="primary"
            icon={<SaveFilled />}
            disabled={!data.name || !data.permissions}
            onClick={() => handleSubmit()}
          >
            SAVE
          </Button>
        </div>
      </div>
    </Spin>
  );
};

const defaultMenu: IPermission[] = MenuItems.map((m) => ({
  name: m.label,
  path: m.key,
  access: [],
}));

const defaultRole: Roles = {
  id: "",
  name: "",
  description: "",
  permissions: "",
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

function MergeMenu(menuItems: any[], data: IPermission[]) {
  const mergedMenu = menuItems.map((item) => {
    const found = data.find((r) => r.path === item.path);
    return {
      ...item,
      access: found ? found.access : [],
    };
  });
  return mergedMenu;
}
