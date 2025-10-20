"use client";

import { Button, DatePicker, Modal, Table, Tag, Typography } from "antd";
import { IFormInput, TableTitle } from "@/components/Utils";
import {
  DeleteFilled,
  EditFilled,
  ExportOutlined,
  FormOutlined,
  PlusCircleFilled,
  SaveFilled,
} from "@ant-design/icons";
import { GenerateColumns } from "@/components/Utils/Utils";
import { useEffect, useState } from "react";
import { PermitAbsenceStatus, PermitStatus, Users } from "@prisma/client";
import { IActionProps, IPageProps } from "@/components/Utils/IInterfaces";
import { GenerateQueries } from "@/components/lib";
import moment from "moment-timezone";
import useApp from "antd/es/app/useApp";
import { HookAPI } from "antd/es/modal/useModal";
import { IDRFormat, IDRToNumber } from "../Utils/Services";
import { IPermitAbsence } from "./IInterfaces";
import { useAccess } from "../Utils/Auth";
import { usePathname } from "next/navigation";
const { Paragraph } = Typography;
const { RangePicker } = DatePicker;

export default function PagePermitAbsence() {
  const [pageProps, setPageProps] = useState<IPageProps<IPermitAbsence>>({
    page: 1,
    pageSize: 50,
    total: 0,
    data: [],
    filters: [],
    loading: false,
  });
  const [selected, setSelected] = useState<IActionProps<IPermitAbsence>>({
    data: undefined,
    openUpsert: false,
    openDelete: false,
    openProses: false,
  });
  const pathname = usePathname();
  const { user, hasAccess } = useAccess(pathname);
  const { modal } = useApp();

  const getData = async () => {
    setPageProps((prev) => ({ ...prev, loading: true }));
    await fetch(
      `/api/permit-absence?${GenerateQueries(
        pageProps.page,
        pageProps.pageSize,
        pageProps.filters
      )}${hasAccess("proses") ? "" : "&usersId=" + user?.id}`
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
  }, [pageProps.page, pageProps.pageSize, pageProps.filters, user]);

  const columns = GenerateColumns<IPermitAbsence>([
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
      title: "PERMOHONAN",
      key: "absenceStatus",
      dataIndex: "absenceStatus",
      width: 150,
    },
    {
      title: "KETERANGAN",
      key: "description",
      dataIndex: "description",
      width: 200,
      render(value, record, index) {
        return (
          <Paragraph
            ellipsis={{
              rows: 1,
              expandable: "collapsible",
            }}
            style={{ fontSize: 11 }}
          >
            {value}
          </Paragraph>
        );
      },
    },
    {
      title: "PEMOHON",
      key: "pemohon",
      dataIndex: ["Requester", "name"],
      width: 150,
    },
    {
      title: "INSENTIF",
      key: "nominal",
      dataIndex: "nominal",
      width: 150,
      className: "text-right",
      render(value, record, index) {
        return <>{IDRFormat(value)}</>;
      },
    },
    {
      title: "STATUS",
      key: "status",
      dataIndex: "status",
      width: 100,
      render(value, record, index) {
        return (
          <div className="flex justify-center">
            <Tag
              color={
                record.status === "APPROVED"
                  ? "green"
                  : record.status === "REJECTED"
                  ? "red"
                  : "orange"
              }
            >
              {value}
            </Tag>
          </div>
        );
      },
    },
    {
      title: "PEMROSES",
      key: "pemohon",
      dataIndex: ["Approver", "name"],
      width: 150,
    },
    {
      title: "CREATED AT",
      key: "createdAt",
      dataIndex: "createdAt",
      width: 150,
      className: "text-center",
      render(value, record, index) {
        return <>{moment(value).format("DD/MM/YYYY HH:mm")}</>;
      },
    },
    {
      title: "UPDATED AT",
      key: "updatedAt",
      dataIndex: "updatedAt",
      width: 150,
      className: "text-center",
      render(value, record, index) {
        return <>{moment(value).format("DD/MM/YYYY HH:mm")}</>;
      },
    },
    {
      title: "AKSI",
      key: "aksi",
      dataIndex: "aksi",
      width: 120,
      render(value, record, index) {
        return (
          <div className="flex justify-center gap-2 flex-wrap">
            {hasAccess("update") && (
              <Button
                icon={<EditFilled />}
                type="primary"
                size="small"
                disabled={record.status !== "PENDING"}
                onClick={() =>
                  setSelected((prev) => ({
                    ...prev,
                    openUpsert: true,
                    data: record,
                  }))
                }
              ></Button>
            )}
            {hasAccess("proses") && (
              <Button
                icon={<FormOutlined />}
                type="primary"
                size="small"
                disabled={record.status === "APPROVED"}
                onClick={() =>
                  setSelected((prev) => ({
                    ...prev,
                    openProses: true,
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
                disabled={record.status !== "PENDING"}
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
            title="Izin & Permohonan"
            functionsLeft={[
              <div key={"add"}>
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
                  >
                    New
                  </Button>
                )}
              </div>,
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
              <RangePicker
                key={"backdate"}
                size="small"
                onChange={(date, dateStr) => {
                  const filters = pageProps.filters.filter(
                    (q) => q.key !== "backdate"
                  );
                  if (date) {
                    filters.push({ key: "backdate", value: dateStr });
                  }
                  setPageProps((prev) => ({ ...prev, filters }));
                }}
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
        <>
          <DeletePermit
            open={selected.openDelete}
            setOpen={(value: boolean) =>
              setSelected((prev) => ({ ...prev, openDelete: value }))
            }
            getData={getData}
            data={selected.data}
            modal={modal}
          />
          <ProsesPermitAbsence
            open={selected.openProses || false}
            setOpen={(value: boolean) =>
              setSelected((prev) => ({ ...prev, openProses: value }))
            }
            getData={getData}
            data={{
              ...selected.data,
              Approver: user as Users,
              approverId: user?.id || "",
            }}
            modal={modal}
          />
        </>
      )}
      <UpsertPermit
        open={selected.openUpsert}
        setOpen={(value: boolean) =>
          setSelected((prev) => ({ ...prev, openUpsert: value }))
        }
        getData={getData}
        record={selected.data}
        key={selected.data ? selected.data.id : "create"}
        modal={modal}
        users={user as Users}
      />
    </div>
  );
}

const DeletePermit = ({
  open,
  setOpen,
  data,
  getData,
  modal,
}: {
  open: boolean;
  setOpen: Function;
  data: IPermitAbsence;
  getData: Function;
  modal: HookAPI;
}) => {
  const [loading, setLoading] = useState(false);

  const handleOK = async () => {
    setLoading(true);
    await fetch("/api/permit-absence?id=" + data.id, { method: "DELETE" })
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
        title={"KONFIRMASI HAPUS DATA PERMOHONAN " + data.absenceStatus}
        open={open}
        onCancel={() => setOpen(false)}
        loading={loading}
        onOk={() => handleOK()}
      >
        <div className="m-4">
          <p>Lanjutkan untuk menghapus data Permohonan {data.absenceStatus}</p>
        </div>
      </Modal>
    </div>
  );
};

const UpsertPermit = ({
  open,
  setOpen,
  getData,
  record,
  modal,
  users,
}: {
  open: boolean;
  setOpen: Function;
  getData: Function;
  record?: IPermitAbsence;
  modal: HookAPI;
  users: Users;
}) => {
  const [data, setData] = useState<IPermitAbsence>(
    record || { ...defaultPosition, requesterId: users.id }
  );
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    await fetch("/api/permit-absence", {
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
        title={
          record
            ? "UPDATE DATA PERMOHONAN " + record.absenceStatus
            : "TAMBAH DATA PERMOHONAN"
        }
        loading={loading}
        width={window && window.innerWidth > 600 ? "50vw" : "98vw"}
        style={{ top: 40 }}
        onOk={() => handleSubmit()}
        okButtonProps={{
          disabled: !data.absenceStatus || !data.requesterId,
          onClick: () => handleSubmit(),
          icon: <SaveFilled />,
        }}
        okText="Simpan"
      >
        <div className="flex flex-col gap-2">
          <IFormInput
            label="Permohonan"
            classname="flex-1"
            value={data.absenceStatus}
            onChange={(e: any) => setData({ ...data, absenceStatus: e })}
            type="options"
            option={[
              {
                label: PermitAbsenceStatus.TERLAMBAT,
                value: PermitAbsenceStatus.TERLAMBAT,
              },
              {
                label: PermitAbsenceStatus.PULANGCEPAT,
                value: PermitAbsenceStatus.PULANGCEPAT,
              },
              {
                label: PermitAbsenceStatus.CUTI,
                value: PermitAbsenceStatus.CUTI,
              },
              {
                label: PermitAbsenceStatus.SAKIT,
                value: PermitAbsenceStatus.SAKIT,
              },
              {
                label: PermitAbsenceStatus.PERDIN,
                value: PermitAbsenceStatus.PERDIN,
              },
              {
                label: PermitAbsenceStatus.LEMBUR,
                value: PermitAbsenceStatus.LEMBUR,
              },
            ]}
          />
          <IFormInput
            label="KETERANGAN"
            classname="flex-1"
            value={data.description}
            onChange={(e: any) => setData({ ...data, description: e })}
            type="area"
          />
          {data.absenceStatus &&
            !["PULANGCEPAT", "TELAMBAT"].includes(data.absenceStatus) && (
              <IFormInput
                label="Tanggal Mulai"
                type="date"
                value={moment(data.startDate).format("YYYY-MM-DD")}
                onChange={(e: any) =>
                  setData({ ...data, startDate: new Date(e) })
                }
              />
            )}
          {data.absenceStatus &&
            !["PULANGCEPAT", "TELAMBAT"].includes(data.absenceStatus) && (
              <IFormInput
                label="Tanggal Berakhir"
                type="date"
                value={moment(data.endDate).format("YYYY-MM-DD")}
                onChange={(e: any) =>
                  setData({ ...data, endDate: new Date(e) })
                }
              />
            )}
          {data.absenceStatus &&
            ["PERDIN", "LEMBUR"].includes(data.absenceStatus) && (
              <IFormInput
                label="Insentif"
                value={IDRFormat(data.nominal)}
                onChange={(e: any) =>
                  setData({
                    ...data,
                    nominal:
                      !isNaN(IDRToNumber(e)) && IDRToNumber(e) >= 0
                        ? IDRToNumber(e)
                        : 0,
                  })
                }
              />
            )}
        </div>
      </Modal>
    </div>
  );
};

const ProsesPermitAbsence = ({
  open,
  setOpen,
  data,
  getData,
  modal,
}: {
  open: boolean;
  setOpen: Function;
  data: IPermitAbsence;
  getData: Function;
  modal: HookAPI;
}) => {
  const [currData, setCurrData] = useState<IPermitAbsence>(data);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    await fetch("/api/permit-absence", {
      method: "PUT",
      body: JSON.stringify(currData),
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
        title={"PROSES IZIN/PERMOHONAN"}
        onCancel={() => setOpen(false)}
        onOk={() => handleSubmit()}
        loading={loading}
        style={{ top: 30 }}
        width={window && window.innerWidth > 600 ? "80vw" : "98vw"}
      >
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1">
            <div className="my-4 flex flex-col gap-2">
              <IFormInput
                label={"Tanggal"}
                value={moment(data.createdAt).format("DD/MM/YYYY HH:mm")}
                disable
              />
              <IFormInput
                label={"Pemohon"}
                value={currData.Requester.name}
                disable
              />
              <IFormInput
                label={"Permohonan"}
                value={currData.absenceStatus}
                disable
              />
              <IFormInput
                label={"Keterangan"}
                value={currData.description}
                type="area"
                disable
              />
              {data.startDate && (
                <IFormInput
                  label={"Tanggal Mulai"}
                  value={moment(data.startDate).format("DD/MM/YYYY")}
                  disable
                />
              )}
              {data.endDate && (
                <IFormInput
                  label={"Tanggal Berakhir"}
                  value={moment(data.endDate).format("DD/MM/YYYY")}
                  disable
                />
              )}
            </div>
          </div>
          <div className="flex-1 border border-gray-200 rounded p-2">
            <p className="font-bold">PROSES PERMOHONAN</p>
            <div className="my-2 flex flex-col gap-2">
              <IFormInput
                label={"Status Permohonan"}
                value={currData.status}
                type="options"
                option={[
                  {
                    label: PermitStatus.APPROVED,
                    value: PermitStatus.APPROVED,
                  },
                  {
                    label: PermitStatus.REJECTED,
                    value: PermitStatus.REJECTED,
                  },
                ]}
                onChange={(e: any) => setCurrData({ ...currData, status: e })}
              />
              <IFormInput
                label={"Insentif"}
                value={IDRFormat(currData.nominal)}
                onChange={(e: any) =>
                  setCurrData({
                    ...currData,
                    nominal: !isNaN(IDRToNumber(e)) ? IDRToNumber(e) : 0,
                  })
                }
              />
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

const defaultPosition: IPermitAbsence = {
  id: "",
  absenceStatus: null,
  description: null,
  files: null,
  status: "PENDING",
  nominal: 0,
  startDate: null,
  endDate: null,

  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  approverId: null,
  Approver: null,
  Requester: {} as Users,
  requesterId: "",
  insentifId: null,
};
