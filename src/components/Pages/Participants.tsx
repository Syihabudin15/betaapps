"use client";

import { Participant } from "@prisma/client";
import { Button, Modal, Table } from "antd";
import { GenerateColumns } from "../Utils/Utils";
import { DeleteFilled, EditFilled, SaveFilled } from "@ant-design/icons";
import { useState } from "react";
import { IActionProps } from "../Utils/IInterfaces";
import { IFormInput } from "../Utils";
import useApp from "antd/es/app/useApp";
import { HookAPI } from "antd/es/modal/useModal";

export default function TableParticipants({
  record,
  getData,
}: {
  record: Participant[];
  getData: Function;
}) {
  const [selected, setSelected] = useState<IActionProps<Participant>>({
    data: undefined,
    openUpsert: false,
    openDelete: false,
  });
  const { modal } = useApp();

  const columns = GenerateColumns<Participant>([
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
        dataSource={record}
        size="small"
        bordered
        pagination={false}
      />

      {selected.data && (
        <>
          <DeleteParticipant
            open={selected.openDelete}
            setOpen={(value: boolean) =>
              setSelected((prev) => ({ ...prev, openDelete: value }))
            }
            data={selected.data}
            getData={getData}
            modal={modal}
          />
          <UpdateParticipant
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

const DeleteParticipant = ({
  open,
  setOpen,
  data,
  getData,
  modal,
}: {
  open: boolean;
  setOpen: Function;
  data: Participant;
  getData: Function;
  modal: HookAPI;
}) => {
  const [loading, setLoading] = useState(false);

  const handleOK = async () => {
    setLoading(true);
    await fetch("/api/participant?id=" + data.id, { method: "DELETE" })
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
        title={"KONFIRMASI HAPUS DATA PARTICIPANT " + data.name}
        open={open}
        onCancel={() => setOpen(false)}
        loading={loading}
        onOk={() => handleOK()}
      >
        <div className="m-4">
          <p>Lanjutkan untuk menghapus data Participant {data.name}?</p>
        </div>
      </Modal>
    </div>
  );
};

const UpdateParticipant = ({
  open,
  setOpen,
  getData,
  record,
  modal,
}: {
  open: boolean;
  setOpen: Function;
  getData: Function;
  record: Participant;
  modal: HookAPI;
}) => {
  const [data, setData] = useState<Participant>(record);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    await fetch("/api/participant", {
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
        title={"UPDATE PARTICIPANT " + data.name}
        loading={loading}
        width={window && window.innerWidth > 600 ? "50vw" : "98vw"}
        style={{ top: 40 }}
        onOk={() => handleSubmit()}
        okButtonProps={{
          disabled: !data.name || !data.phone,
          onClick: () => handleSubmit(),
          icon: <SaveFilled />,
        }}
        okText="Simpan"
      >
        <div className="flex flex-col gap-2">
          <IFormInput
            label="Nama Participant"
            classname="flex-1"
            value={data.name}
            onChange={(e: any) => setData({ ...data, name: e })}
          />
          <IFormInput
            label="No Telepon"
            classname="flex-1"
            value={data.phone}
            onChange={(e: any) => setData({ ...data, phone: e })}
          />
          <IFormInput
            label="Keterangan"
            classname="flex-1"
            value={data.description}
            onChange={(e: any) => setData({ ...data, description: e })}
            type="area"
          />
        </div>
      </Modal>
    </div>
  );
};
