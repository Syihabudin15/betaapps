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
                  {p.path}: [{p.access.join(",")}];
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
            <Link href={`/roles/${record.id}`}>
              <Button
                icon={<EditFilled />}
                type="primary"
                size="small"
              ></Button>
            </Link>
            <Button
              icon={<DeleteFilled />}
              type="primary"
              danger
              size="small"
              onClick={() =>
                setSelected({ ...selected, data: record, openDelete: true })
              }
            ></Button>
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
                <Button icon={<PlusCircleFilled />} size="small" type="primary">
                  New
                </Button>
              </Link>,
              <Button icon={<ExportOutlined />} size="small" type="primary">
                Export
              </Button>,
            ]}
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
    </div>
  );
}

const DeleteRole = () => {
  return (
    <div>
      <Modal title={"KONFIRMASI HAPUS ROLE"}></Modal>
    </div>
  );
};

export const UpsertRole = ({ role }: { role?: Roles }) => {
  const [data, setData] = useState<Roles>(role || defaultRole);
  const [menus, setMenus] = useState<IPermission[]>(
    role ? JSON.parse(role.permissions) : defaultMenu
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const newMenu = menus
      .filter((m) => m.access.length !== 0)
      .map((m) => ({ path: m.path, access: m.access }));
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
          Modal.success({ title: "BERHASIL", content: res.msg });
        } else {
          Modal.error({ title: "ERROR!!!", content: res.msg });
        }
      })
      .catch((err) => {
        console.log(err);
        Modal.error({ title: "ERROR!!!", content: "Server Error!" });
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
              options={["read", "write", "update", "delete"]}
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
      <div className="p-2 my-2">
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
