"use client";

import { Button, Modal, Table } from "antd";
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
import { DeductionType, Insentif } from "@prisma/client";
import { IActionProps, IPageProps } from "@/components/Utils/IInterfaces";
import { GenerateQueries } from "@/components/lib";
import moment from "moment-timezone";
import useApp from "antd/es/app/useApp";
import { HookAPI } from "antd/es/modal/useModal";
import { IDRFormat, IDRToNumber } from "../Utils/Services";
import { usePathname } from "next/navigation";
import { useAccess } from "../Utils/Auth";

export default function PageInsentif() {
  const [pageProps, setPageProps] = useState<IPageProps<Insentif>>({
    page: 1,
    pageSize: 50,
    total: 0,
    data: [],
    filters: [],
    loading: false,
  });
  const [selected, setSelected] = useState<IActionProps<Insentif>>({
    data: undefined,
    openUpsert: false,
    openDelete: false,
  });
  const pathname = usePathname();
  const { hasAccess } = useAccess(pathname);
  const { modal } = useApp();

  const getData = async () => {
    setPageProps((prev) => ({ ...prev, loading: true }));
    await fetch(
      `/api/insentif?${GenerateQueries(
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

  const columns = GenerateColumns<Insentif>([
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
      title: "NAMA INSENTIF",
      key: "name",
      dataIndex: "name",
      width: 200,
    },
    {
      title: "TIPE INSENTIF",
      key: "insentifType",
      dataIndex: "insentifType",
      className: "text-center",
      width: 150,
    },
    {
      title: "INSENTIF",
      key: "insentif",
      dataIndex: "insentif",
      width: 150,
      className: "text-right",
      render(value, record, index) {
        return <>{IDRFormat(value)}</>;
      },
    },
    {
      title: "UPDATED AT",
      key: "updatedAt",
      dataIndex: "updatedAt",
      width: 100,
      className: "text-center",
      render(value, record, index) {
        return <>{moment(value).format("DD/MM/YYYY")}</>;
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
            title="Manajemen Insentif"
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
                    key={"create"}
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
        <DeleteInsentif
          open={selected.openDelete}
          setOpen={(value: boolean) =>
            setSelected((prev) => ({ ...prev, openDelete: value }))
          }
          getData={getData}
          data={selected.data}
          modal={modal}
        />
      )}
      <UpsertInsentif
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

const DeleteInsentif = ({
  open,
  setOpen,
  data,
  getData,
  modal,
}: {
  open: boolean;
  setOpen: Function;
  data: Insentif;
  getData: Function;
  modal: HookAPI;
}) => {
  const [loading, setLoading] = useState(false);

  const handleOK = async () => {
    setLoading(true);
    await fetch("/api/insentif?id=" + data.id, { method: "DELETE" })
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
        title={"KONFIRMASI HAPUS DATA INSENTIF " + data.name}
        open={open}
        onCancel={() => setOpen(false)}
        loading={loading}
        onOk={() => handleOK()}
      >
        <div className="m-4">
          <p>Lanjutkan untuk menghapus data insentif {data.name}</p>
        </div>
      </Modal>
    </div>
  );
};

const UpsertInsentif = ({
  open,
  setOpen,
  getData,
  record,
  modal,
}: {
  open: boolean;
  setOpen: Function;
  getData: Function;
  record?: Insentif;
  modal: HookAPI;
}) => {
  const [data, setData] = useState<Insentif>(record || defaultPosition);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    await fetch("/api/insentif", {
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
            ? "UPDATE DATA INSENTIF " + record.name
            : "TAMBAH DATA INSENTIF"
        }
        loading={loading}
        width={window && window.innerWidth > 600 ? "50vw" : "98vw"}
        style={{ top: 40 }}
        onOk={() => handleSubmit()}
        okButtonProps={{
          disabled: !data.name || !data.insentifType,
          onClick: () => handleSubmit(),
          icon: <SaveFilled />,
        }}
        okText="Simpan"
      >
        <div className="flex flex-col gap-2">
          <IFormInput
            label="Nama Insentif"
            classname="flex-1"
            value={data.name}
            onChange={(e: any) => setData({ ...data, name: e })}
          />
          <IFormInput
            label="Tipe Insentif"
            classname="flex-1"
            value={data.insentifType}
            onChange={(e: any) => setData({ ...data, insentifType: e })}
            type="options"
            option={[
              { label: DeductionType.NOMINAL, value: DeductionType.NOMINAL },
              {
                label: DeductionType.PERCENTAGE,
                value: DeductionType.PERCENTAGE,
              },
            ]}
          />
          <IFormInput
            label="Insentif"
            classname="flex-1"
            value={IDRFormat(data.insentif)}
            onChange={(e: any) =>
              setData({
                ...data,
                insentif:
                  !isNaN(IDRToNumber(e)) && IDRToNumber(e) >= 0
                    ? IDRToNumber(e)
                    : 0,
              })
            }
          />
        </div>
      </Modal>
    </div>
  );
};

const defaultPosition: Insentif = {
  id: "",
  name: "",
  insentif: 0,
  insentifType: "NOMINAL",

  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};
