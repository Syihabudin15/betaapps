"use client";

import { AbsenceStatus, Participant } from "@prisma/client";
import { Button, Modal, Table } from "antd";
import { GenerateColumns } from "../Utils/Utils";
import { DeleteFilled, EditFilled, SaveFilled } from "@ant-design/icons";
import { useState } from "react";
import { IActionProps, IPageProps } from "../Utils/IInterfaces";
import { IFormInput } from "../Utils";
import useApp from "antd/es/app/useApp";
import { HookAPI } from "antd/es/modal/useModal";

export default function PageAbsenceStatus() {
  const [pageProps, setPageProps] = useState<IPageProps<AbsenceStatus>>({
    page: 1,
    pageSize: 50,
    total: 0,
    data: [],
    filters: [],
    loading: false,
  });
  const [selected, setSelected] = useState<IActionProps<AbsenceStatus>>({
    data: undefined,
    openUpsert: false,
    openDelete: false,
  });
  const { modal } = useApp();

  const getData = async () => {};

  const columns = GenerateColumns<AbsenceStatus>([
    { title: "NAMA LENGKAP", key: "fullname", dataIndex: "name" },
    { title: "NO TELEPON", key: "phone", dataIndex: "phone" },
    { title: "KETERANGAN", key: "description", dataIndex: "description" },
    {
      title: "AKSI",
      key: "AKSI",
      dataIndex: "id",
      render(value, record, index) {
        return (
          <div className="flex justify-center gap-2">
            <Button
              icon={<EditFilled />}
              type="primary"
              size="small"
              onClick={() =>
                setSelected({ ...selected, openUpsert: true, data: record })
              }
            ></Button>
            <Button
              icon={<DeleteFilled />}
              type="primary"
              size="small"
              danger
              onClick={() =>
                setSelected({ ...selected, openDelete: true, data: record })
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
        rowKey={"id"}
        columns={columns}
        dataSource={pageProps.data}
        size="small"
        bordered
        pagination={false}
      />

      {selected.data && (
        <>
          <DeleteAbsenceStatus
            open={selected.openDelete}
            setOpen={(value: boolean) =>
              setSelected((prev) => ({ ...prev, openDelete: value }))
            }
            data={selected.data}
            getData={getData}
            modal={modal}
          />
          <UpsertAbsenceStatus
            open={selected.openUpsert}
            setOpen={(value: boolean) =>
              setSelected((prev) => ({ ...prev, openUpsert: value }))
            }
            record={selected.data}
            getData={getData}
            key={selected.data.id}
            modal={modal}
          />
        </>
      )}
    </div>
  );
}

const DeleteAbsenceStatus = ({
  open,
  setOpen,
  data,
  getData,
  modal,
}: {
  open: boolean;
  setOpen: Function;
  data: AbsenceStatus;
  getData: Function;
  modal: HookAPI;
}) => {
  const [loading, setLoading] = useState(false);

  const handleOK = async () => {
    setLoading(true);
    await fetch("/api/absence-status?id=" + data.id, { method: "DELETE" })
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
        title={"KONFIRMASI HAPUS DATA STATUS ABSEN " + data.name}
        open={open}
        onCancel={() => setOpen(false)}
        loading={loading}
        onOk={() => handleOK()}
      >
        <div className="m-4">
          <p>Lanjutkan untuk menghapus data Status Absen {data.name}?</p>
        </div>
      </Modal>
    </div>
  );
};

const UpsertAbsenceStatus = ({
  open,
  setOpen,
  getData,
  record,
  modal,
}: {
  open: boolean;
  setOpen: Function;
  getData: Function;
  record?: AbsenceStatus;
  modal: HookAPI;
}) => {
  const [data, setData] = useState<AbsenceStatus>(
    record || defaultAbsenceStatus
  );
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    await fetch("/api/absence-status", {
      method: "PUT",
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
        title={"UPDATE STATUS ABSEN " + data.name}
        loading={loading}
        width={window && window.innerWidth > 600 ? "50vw" : "98vw"}
        style={{ top: 40 }}
        onOk={() => handleSubmit()}
        okButtonProps={{
          disabled: !data.name || !data.deduction || !data.deductionType,
          onClick: () => handleSubmit(),
          icon: <SaveFilled />,
        }}
        okText="Simpan"
      >
        <div className="flex flex-col gap-2">
          <IFormInput
            label="Nama"
            classname="flex-1"
            value={data.name}
            onChange={(e: any) => setData({ ...data, name: e })}
          />
        </div>
      </Modal>
    </div>
  );
};

const defaultAbsenceStatus: AbsenceStatus = {
  id: "",
  name: "",
  deduction: 0,
  deductionType: "NOMINAL",
  createdAt: new Date(),
  updatedAt: new Date(),
};
