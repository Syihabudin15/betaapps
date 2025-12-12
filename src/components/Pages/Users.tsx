"use client";

import { Button, Modal, Select, Table, Tag } from "antd";
import { IFormInput, TableTitle } from "@/components/Utils";
import {
  DeleteFilled,
  EditFilled,
  ExportOutlined,
  PlusCircleFilled,
  SaveFilled,
} from "@ant-design/icons";
import { GenerateColumns } from "@/components/Utils/Utils";
import { useEffect, useState } from "react";
import { AbsenceMethod, Positions, Roles, Users } from "@prisma/client";
import { IActionProps, IPageProps } from "@/components/Utils/IInterfaces";
import { IUserRole } from "@/components/Pages/IInterfaces";
import { GenerateQueries } from "@/components/lib";
import moment from "moment-timezone";
import useApp from "antd/es/app/useApp";
import { HookAPI } from "antd/es/modal/useModal";
import { IDRFormat, IDRToNumber } from "../Utils/Services";
import { useAccess } from "../Utils/Auth";
import { usePathname } from "next/navigation";

export default function PageUser() {
  const [pageProps, setPageProps] = useState<IPageProps<IUserRole>>({
    page: 1,
    pageSize: 50,
    total: 0,
    data: [],
    filters: [],
    loading: false,
  });
  const [selected, setSelected] = useState<IActionProps<IUserRole>>({
    data: undefined,
    openUpsert: false,
    openDelete: false,
  });
  const [roles, setRoles] = useState<Roles[]>([]);
  const [positions, setPositions] = useState<Positions[]>([]);
  const pathname = usePathname();
  const { hasAccess } = useAccess(pathname);
  const { modal } = useApp();

  const getData = async () => {
    setPageProps((prev) => ({ ...prev, loading: true }));
    await fetch(
      `/api/users?${GenerateQueries(
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
    (async () => {
      await fetch("/api/roles?page=1&pageSize=100")
        .then((res) => res.json())
        .then((res) => setRoles(res.data));
      await fetch("/api/position?page=1&pageSize=100")
        .then((res) => res.json())
        .then((res) => setPositions(res.data));
    })();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(async () => {
      await getData();
    }, 100);
    return () => clearTimeout(timeout);
  }, [pageProps.page, pageProps.pageSize, pageProps.filters]);

  const columns = GenerateColumns<IUserRole>([
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
      title: "NAMA LENGKAP",
      key: "name",
      dataIndex: "name",
      width: 200,
      render(value, record, index) {
        return (
          <div>
            <p>{value}</p>
            <p className="italic opacity-70">@{record.Roles.name}</p>
          </div>
        );
      },
    },
    {
      title: "NIP & USERNAME",
      key: "username",
      dataIndex: "username",
      width: 150,
      render(value, record, index) {
        return (
          <div>
            <p>{value}</p>
            <p className="italic opacity-70">NIP:{record.nip}</p>
          </div>
        );
      },
    },
    {
      title: "Kontak",
      key: "email",
      dataIndex: "email",
      width: 200,
      render(value, record, index) {
        return (
          <div>
            <p>{value}</p>
            <p>{record.phone}</p>
          </div>
        );
      },
    },
    {
      title: "GAJI POKOK",
      key: "principalSalary",
      dataIndex: "principalSalary",
      width: 120,
      className: "text-right",
      render(value, record, index) {
        return <>{IDRFormat(value)}</>;
      },
    },
    {
      title: "ABSEN",
      key: "updatedAt",
      dataIndex: "updatedAt",
      width: 100,
      className: "text-center",
      render(value, record, index) {
        return (
          <div className="flex justify-center">
            <Tag color={record.absenceMethod === "BUTTON" ? "blue" : "green"}>
              {record.absenceMethod}
            </Tag>
          </div>
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
              <Button
                icon={<EditFilled />}
                type="primary"
                size="small"
                onClick={() =>
                  setSelected((prev) => ({
                    ...prev,
                    openUpsert: true,
                    data: record,
                  }))
                }
              ></Button>
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
            title="USERS MANAGEMENT"
            functionsLeft={[
              <>
                {hasAccess("write") && (
                  <Button
                    icon={<PlusCircleFilled />}
                    size="small"
                    type="primary"
                    onClick={() =>
                      setSelected((prev) => ({
                        ...prev,
                        openUpsert: true,
                        data: undefined,
                      }))
                    }
                    key={"create"}
                  >
                    New
                  </Button>
                )}
              </>,
              <Button
                icon={<ExportOutlined />}
                size="small"
                type="primary"
                key={"export"}
              >
                Export
              </Button>,
            ]}
            functionsRight={[
              <Select
                key={"roleFilter"}
                options={roles.map((r) => ({ label: r.name, value: r.id }))}
                onChange={(e) => {
                  const filters = pageProps.filters.filter(
                    (q) => q.key !== "roleId"
                  );
                  if (e) {
                    filters.push({ key: "roleId", value: e });
                  }
                  setPageProps((prev) => ({ ...prev, filters }));
                }}
                style={{ width: 150 }}
                allowClear
                size="small"
                placeholder="Roles"
              />,
            ]}
            onSearch={(value: any) => {
              const filters = pageProps.filters.filter(
                (q) => q.key !== "search"
              );
              if (value) {
                filters.push({ key: "search", value });
              }
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
        <DeleteUsers
          open={selected.openDelete}
          setOpen={(value: boolean) =>
            setSelected((prev) => ({ ...prev, openDelete: value }))
          }
          getData={getData}
          data={selected.data}
          modal={modal}
        />
      )}
      <UpsertUsers
        open={selected.openUpsert}
        setOpen={(value: boolean) =>
          setSelected((prev) => ({ ...prev, openUpsert: value }))
        }
        getData={getData}
        record={selected.data}
        key={selected.data ? selected.data.id : "create"}
        modal={modal}
        roles={roles}
        positions={positions}
      />
    </div>
  );
}

const DeleteUsers = ({
  open,
  setOpen,
  data,
  getData,
  modal,
}: {
  open: boolean;
  setOpen: Function;
  data: Users;
  getData: Function;
  modal: HookAPI;
}) => {
  const [loading, setLoading] = useState(false);

  const handleOK = async () => {
    setLoading(true);
    await fetch("/api/users?id=" + data.id, { method: "DELETE" })
      .then((res) => res.json())
      .then(async (res) => {
        if (res.status === 200) {
          modal.success({ title: "BERHASIL", content: res.msg });
          setOpen(false);
          await getData();
        } else {
          modal.error({ title: "ERROR !!!", content: res.msg });
        }
      })
      .catch((err) => {
        console.log(err);
        modal.error({ title: "ERROR !!!", content: "Server Error" });
      });
    await getData();
    setLoading(false);
  };

  return (
    <div>
      <Modal
        title={"KONFIRMASI HAPUS DATA USER " + data.name}
        open={open}
        onCancel={() => setOpen(false)}
        loading={loading}
        onOk={() => handleOK()}
      >
        <div className="m-4">
          <p>Lanjutkan untuk menghapus data User {data.name}</p>
        </div>
      </Modal>
    </div>
  );
};

const UpsertUsers = ({
  open,
  setOpen,
  getData,
  record,
  modal,
  roles,
  positions,
}: {
  open: boolean;
  setOpen: Function;
  getData: Function;
  record?: Users;
  modal: HookAPI;
  roles: Roles[];
  positions: Positions[];
}) => {
  const [data, setData] = useState<Users>(
    record ? { ...record, password: "" } : defaultUser
  );
  const [loading, setLoading] = useState(false);
  if ("Roles" in data) {
    delete data.Roles;
  }

  const handleSubmit = async () => {
    setLoading(true);
    await fetch("/api/users", {
      method: record ? "PUT" : "POST",
      body: JSON.stringify(data),
    })
      .then((res) => res.json())
      .then(async (res) => {
        if (res.status === 200) {
          modal.success({ title: "BERHASIL", content: res.msg });
          setOpen(false);
          await getData();
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

  return (
    <div>
      <Modal
        open={open}
        onCancel={() => setOpen(false)}
        title={record ? "UPDATE DATA USER " + record.name : "TAMBAH DATA USER"}
        loading={loading}
        width={window && window.innerWidth > 600 ? "50vw" : "98vw"}
        style={{ top: 40 }}
        onOk={() => handleSubmit()}
        okButtonProps={{
          disabled:
            !data.name ||
            !data.username ||
            !data.email ||
            !data.phone ||
            !data.nip ||
            !data.password,
          onClick: () => handleSubmit(),
          icon: <SaveFilled />,
        }}
        okText="Simpan"
      >
        <div className="flex flex-col gap-2">
          <IFormInput
            label="Nama Lengkap"
            classname="flex-1"
            value={data.name}
            onChange={(e: any) => setData({ ...data, name: e })}
          />
          <IFormInput
            label="NIP"
            classname="flex-1"
            value={data.nip}
            onChange={(e: any) => setData({ ...data, nip: e })}
          />
          <IFormInput
            label="Email"
            classname="flex-1"
            value={data.email}
            onChange={(e: any) => setData({ ...data, email: e })}
          />
          <IFormInput
            label="No Telepon"
            classname="flex-1"
            value={data.phone}
            onChange={(e: any) => setData({ ...data, phone: String(e) })}
            type="number"
          />
          <IFormInput
            label="Username"
            classname="flex-1"
            value={data.username}
            onChange={(e: any) => setData({ ...data, username: e })}
          />
          <IFormInput
            label="Password"
            classname="flex-1"
            value={data.password}
            onChange={(e: any) => setData({ ...data, password: e })}
            type="password"
          />
          <IFormInput
            label="Jabatan"
            classname="flex-1"
            value={data.positionsId}
            onChange={(e: any) => setData({ ...data, positionsId: e })}
            type="options"
            option={positions.map((r) => ({ label: r.name, value: r.id }))}
          />
          <IFormInput
            label="Gaji Pokok"
            classname="flex-1"
            value={IDRFormat(data.principalSalary)}
            onChange={(e: any) =>
              setData({
                ...data,
                principalSalary: Number(e) < 0 ? 0 : IDRToNumber(e),
              })
            }
          />
          <IFormInput
            label="Status PTKP"
            classname="flex-1"
            value={data.statusPTKP}
            type="options"
            option={[
              { label: "TK (Tidak Kawin)", value: "TK" },
              { label: "TK/0 (Tidak Kawin)", value: "TK/0" },
              { label: "K/0 (Kawin 0 Tanggungan)", value: "K/0" },
              { label: "K/1 (Kawin 1 Tanggungan)", value: "K/1" },
              { label: "K/2 (Kawin 2 Tanggungan)", value: "K/2" },
              { label: "K/3 (Kawin 3 Tanggungan)", value: "K/3" },
            ]}
            onChange={(e: any) =>
              setData({
                ...data,
                statusPTKP: e,
              })
            }
          />
          <IFormInput
            label="Role"
            classname="flex-1"
            value={data.rolesId}
            onChange={(e: any) => setData({ ...data, rolesId: e })}
            type="options"
            option={roles.map((r) => ({ label: r.name, value: r.id }))}
          />
          <IFormInput
            label="Metode Absen"
            classname="flex-1"
            value={data.absenceMethod}
            onChange={(e: any) => setData({ ...data, absenceMethod: e })}
            type="options"
            option={[
              { label: AbsenceMethod.BUTTON, value: AbsenceMethod.BUTTON },
              { label: AbsenceMethod.FACE, value: AbsenceMethod.FACE },
            ]}
          />
        </div>
      </Modal>
    </div>
  );
};

const defaultUser: Users = {
  id: "",
  name: "",
  nip: "",
  username: "",
  email: "",
  password: "",
  phone: "",
  rolesId: "",
  absenceMethod: "BUTTON",
  face: null,
  positionsId: "",
  principalSalary: 0,
  statusPTKP: "TK",

  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};
