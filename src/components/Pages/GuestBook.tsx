"use client";

import { Button, Input, Modal, Select, Table, Tag, Typography } from "antd";
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
import { GBookStatus, GBookType, Participant } from "@prisma/client";
import { IActionProps, IPageProps } from "@/components/Utils/IInterfaces";
import { IGuestBook } from "@/components/Pages/IInterfaces";
import { GenerateQueries } from "@/components/lib";
import moment from "moment-timezone";
import TableParticipants from "./Participants";
import useApp from "antd/es/app/useApp";
import { HookAPI } from "antd/es/modal/useModal";
import { usePathname } from "next/navigation";
import { useAccess } from "../Utils/Auth";
const { Paragraph } = Typography;

export default function PageGuestBook() {
  const [pageProps, setPageProps] = useState<IPageProps<IGuestBook>>({
    page: 1,
    pageSize: 50,
    total: 0,
    data: [],
    filters: [],
    loading: false,
  });
  const [selected, setSelected] = useState<IActionProps<IGuestBook>>({
    data: undefined,
    openUpsert: false,
    openDelete: false,
  });
  const pathname = usePathname();
  const { hasAccess } = useAccess(pathname);

  const getData = async () => {
    setPageProps((prev) => ({ ...prev, loading: true }));
    await fetch(
      `/api/guest?${GenerateQueries(
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
  const { modal } = useApp();

  useEffect(() => {
    const timeout = setTimeout(async () => {
      await getData();
    }, 100);
    return () => clearTimeout(timeout);
  }, [pageProps.page, pageProps.pageSize, pageProps.filters]);

  const columns = GenerateColumns<IGuestBook>([
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
      title: "JUDUL TAMU",
      key: "title",
      dataIndex: "title",
      width: 200,
    },
    {
      title: "KETERANGAN",
      key: "description",
      dataIndex: "description",
      width: 300,
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
      title: "TIPE TAMU",
      key: "type",
      dataIndex: "type",
      width: 150,
      className: "text-center",
    },
    {
      title: "STATUS KEDATANGAN",
      key: "status",
      dataIndex: "status",
      width: 150,
      className: "text-center",
      render(value, record, index) {
        return (
          <div>
            <Tag color={value === GBookStatus.WILLCOME ? "orange" : "green"}>
              {value}
            </Tag>
          </div>
        );
      },
    },
    {
      title: "TANGGAL DATANG",
      key: "checkIn",
      dataIndex: "checkIn",
      width: 150,
      className: "text-center",
      render(value, record, index) {
        return <>{moment(value).format("DD/MM/YYYY HH:mm")}</>;
      },
    },
    {
      title: "PENERIMA",
      key: "recipientName",
      dataIndex: "recipientName",
      width: 150,
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
            title="BUKU TAMU"
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
            onSearch={(value: any) => {
              const filters = pageProps.filters.filter(
                (q) => q.key !== "search"
              );
              if (value) {
                filters.push({ key: "search", value });
              }
              setPageProps((prev) => ({ ...prev, filters }));
            }}
            functionsRight={[
              <Select
                placeholder="Type"
                options={[
                  { label: GBookType.PERSONAL, value: GBookType.PERSONAL },
                  { label: GBookType.GROUP, value: GBookType.GROUP },
                ]}
                allowClear
                size="small"
                style={{ width: 150 }}
                onChange={(value: any) => {
                  const filters = pageProps.filters.filter(
                    (q) => q.key !== "type"
                  );
                  if (value) {
                    filters.push({ key: "type", value });
                  }
                  setPageProps((prev) => ({ ...prev, filters }));
                }}
                key={"type"}
              />,
              <Select
                placeholder="Status"
                options={[
                  {
                    label: GBookStatus.ALREADYCOME,
                    value: GBookStatus.ALREADYCOME,
                  },
                  { label: GBookStatus.WILLCOME, value: GBookStatus.WILLCOME },
                ]}
                allowClear
                size="small"
                style={{ width: 150 }}
                onChange={(value: any) => {
                  const filters = pageProps.filters.filter(
                    (q) => q.key !== "status"
                  );
                  if (value) {
                    filters.push({ key: "status", value });
                  }
                  setPageProps((prev) => ({ ...prev, filters }));
                }}
                key={"status"}
              />,
            ]}
          />
        )}
        bordered
        rowKey={"id"}
        columns={columns}
        dataSource={pageProps.data}
        scroll={{ y: 410 }}
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
        expandable={{
          expandedRowRender: (record) => (
            <TableParticipants record={record.Participant} getData={getData} />
          ),
        }}
      />
      {selected.data && (
        <DeleteGuestBook
          open={selected.openDelete}
          setOpen={(value: boolean) =>
            setSelected((prev) => ({ ...prev, openDelete: value }))
          }
          getData={getData}
          data={selected.data}
          modal={modal}
        />
      )}
      <UpsertGuestBook
        open={selected.openUpsert}
        setOpen={(value: boolean) =>
          setSelected((prev) => ({ ...prev, openUpsert: value }))
        }
        getData={getData}
        record={selected.data}
        key={selected.data ? selected.data.id : "create"}
        modal={modal}
      />
    </div>
  );
}

const DeleteGuestBook = ({
  open,
  setOpen,
  data,
  getData,
  modal,
}: {
  open: boolean;
  setOpen: Function;
  data: IGuestBook;
  getData: Function;
  modal: HookAPI;
}) => {
  const [loading, setLoading] = useState(false);

  const handleOK = async () => {
    setLoading(true);
    await fetch("/api/guest?id=" + data.id, { method: "DELETE" })
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
        title={"KONFIRMASI HAPUS DATA TAMU " + data.title}
        open={open}
        onCancel={() => setOpen(false)}
        loading={loading}
        onOk={() => handleOK()}
      >
        <div className="m-4">
          <p>Lanjutkan untuk menghapus data Tamu {data.title}</p>
        </div>
      </Modal>
    </div>
  );
};

const UpsertGuestBook = ({
  open,
  setOpen,
  getData,
  record,
  modal,
}: {
  open: boolean;
  setOpen: Function;
  getData: Function;
  record?: IGuestBook;
  modal: HookAPI;
}) => {
  const [data, setData] = useState<IGuestBook>(record || defaultGuest);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    await fetch("/api/guest", {
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
        title={record ? "UPDATE DATA TAMU " + record.title : "TAMBAH DATA TAMU"}
        loading={loading}
        width={window && window.innerWidth > 600 ? "50vw" : "98vw"}
        style={{ top: 40 }}
        onOk={() => handleSubmit()}
        okButtonProps={{
          disabled:
            !data.title ||
            !data.type ||
            !data.status ||
            data.Participant.length === 0,
          onClick: () => handleSubmit(),
          icon: <SaveFilled />,
        }}
        okText="Simpan"
      >
        <div className="flex flex-col gap-2">
          <IFormInput
            label="Judul Tamu"
            classname="flex-1"
            value={data.title}
            onChange={(e: any) => setData({ ...data, title: e })}
          />
          <IFormInput
            label="Keterangan"
            classname="flex-1"
            value={data.description}
            onChange={(e: any) => setData({ ...data, description: e })}
            type="area"
          />
          <IFormInput
            label="Tipe Tamu"
            classname="flex-1"
            value={data.type}
            onChange={(e: any) => setData({ ...data, type: e })}
            type="options"
            option={[
              { label: GBookType.PERSONAL, value: GBookType.PERSONAL },
              { label: GBookType.GROUP, value: GBookType.GROUP },
            ]}
          />
          <IFormInput
            label="Status Kedatangan"
            classname="flex-1"
            value={data.status}
            onChange={(e: any) => setData({ ...data, status: e })}
            type="options"
            option={[
              { label: GBookStatus.WILLCOME, value: GBookStatus.WILLCOME },
              {
                label: GBookStatus.ALREADYCOME,
                value: GBookStatus.ALREADYCOME,
              },
            ]}
          />
          <IFormInput
            label="Penerima"
            classname="flex-1"
            value={data.recipientName}
            onChange={(e: any) => setData({ ...data, recipientName: e })}
          />
          <IFormInput
            label="Tanggal Datang"
            classname="flex-1"
            value={moment(data.checkIn).format("YYYY-MM-DD HH:mm")}
            type="datetime-local"
            onChange={(e: any) => setData({ ...data, checkIn: new Date(e) })}
          />
          <InsertParticipant
            record={data.Participant}
            setRecord={(value: Participant[]) =>
              setData((prev) => ({ ...prev, Participant: value }))
            }
          />
        </div>
      </Modal>
    </div>
  );
};

const InsertParticipant = ({
  record,
  setRecord,
}: {
  record: Participant[];
  setRecord: Function;
}) => {
  const [currData, setCurrData] = useState<Participant>(defaultParticipant);

  return (
    <div className={`flex gap-2`}>
      <div className="text-right w-40">
        <p>Daftar Nama :</p>
      </div>
      <div className="flex-1">
        <ul className="italic text-xs list-disc ms-4">
          {record &&
            record.map((d, i) => (
              <li key={i}>
                <span className={`mr-3 ${!d.isActive ? "hidden" : ""}`}>
                  {d.name} ({d.phone})
                </span>
                <Button
                  icon={<DeleteFilled />}
                  size="small"
                  danger
                  onClick={() => setRecord(record.filter((r) => r.id !== d.id))}
                ></Button>
              </li>
            ))}
        </ul>
        <div className="flex flex-col gap-1">
          <div className="flex gap-1">
            <Input
              placeholder="Name"
              value={currData.name}
              onChange={(e) =>
                setCurrData((prev) => ({ ...prev, name: e.target.value }))
              }
              size="small"
            />
            <Input
              placeholder="No Phone"
              value={currData.phone}
              type="number"
              onChange={(e) =>
                setCurrData((prev) => ({
                  ...prev,
                  phone: String(e.target.value),
                }))
              }
              size="small"
            />
          </div>
          <Input
            placeholder="Description (Optional)"
            value={currData.description}
            onChange={(e) =>
              setCurrData((prev) => ({
                ...prev,
                description: String(e.target.value),
              }))
            }
            size="small"
          />
          <div>
            <Button
              icon={<PlusCircleFilled />}
              size="small"
              type="primary"
              onClick={() => {
                setRecord([...record, { ...currData, id: Date.now() }]);
                setCurrData(defaultParticipant);
              }}
              disabled={!currData.name || !currData.phone}
            >
              Add
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const defaultGuest: IGuestBook = {
  id: "",
  title: "",
  description: "",
  status: GBookStatus.WILLCOME,
  type: GBookType.PERSONAL,
  recipientName: "",
  checkIn: new Date(),
  Participant: [],
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const defaultParticipant: Participant = {
  id: "",
  name: "",
  phone: "",
  description: "",
  isActive: true,
  guestBookId: "",
};
