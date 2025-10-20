"use client";

import { ReadOutlined, UserOutlined } from "@ant-design/icons";
import { Absence, GBookStatus, GuestBook, Users } from "@prisma/client";
import { Table, Tag, Spin, Typography } from "antd";
import { useEffect, useState } from "react";
import { GenerateColumns } from "../Utils/Utils";
import moment from "moment-timezone";
const { Paragraph } = Typography;

interface UserAbnsence extends Users {
  Absence: Absence[];
}

interface IDashboard {
  totalUser: number;
  totalTamu: number;
  tamuHariIni: GuestBook[];
  kehadiran: UserAbnsence[];
}

export default function PageDashboard() {
  const [data, setData] = useState<IDashboard>({
    totalUser: 0,
    totalTamu: 0,
    tamuHariIni: [],
    kehadiran: [],
  });
  const [loading, setLoaing] = useState(false);

  const getData = async () => {
    setLoaing(true);
    await fetch("/api")
      .then((res) => res.json())
      .then((res) => {
        setData({ ...res.data });
      });
    setLoaing(false);
  };

  useEffect(() => {
    (async () => {
      await getData();
    })();
    setInterval(async () => {
      await getData();
    }, 20000);
  }, []);

  return (
    <Spin spinning={loading}>
      <div className="p-1 h-[90vh] overflow-y-auto">
        <div className="flex flex-wrap flex-col sm:flex-row items-center sm:items-start my-3 gap-2">
          <div className="flex-1 flex justify-evenly gap-3 flex-wrap">
            <div className="font-bold bg-gradient-to-br from-green-400 to-blue-400 p-4 rounded w-50 text-center">
              <p className="opacity-80">
                <UserOutlined /> TOTAL USER
              </p>
              <p className="text-center text-xl">{data.totalUser}</p>
            </div>
            <div className="font-bold bg-gradient-to-br from-green-400 to-blue-400 p-4 rounded w-50 text-center">
              <p className="opacity-80">
                <ReadOutlined /> TOTAL TAMU
              </p>
              <p className="text-center text-xl">{data.totalTamu}</p>
            </div>
          </div>
          <div className="flex-1 border border-gray-200 rounded">CHART</div>
        </div>
        <Table
          title={() => (
            <div>
              <p className="font-bold text-center">TAMU HARI INI</p>
            </div>
          )}
          className="my-3"
          size="small"
          rowKey={"id"}
          bordered
          pagination={false}
          columns={columnsTamu}
          dataSource={data.tamuHariIni}
          scroll={{ y: 410 }}
        />
        <Table
          className="my-3"
          title={() => (
            <div>
              <p className="font-bold text-center">DATA KEHADIRAN HARI INI</p>
            </div>
          )}
          size="small"
          rowKey={"id"}
          bordered
          pagination={false}
          columns={columnsKehadiran}
          dataSource={data.kehadiran}
          scroll={{ y: 410 }}
          footer={(record) => {
            const alpha = record.filter((r) => r.Absence.length === 0);

            const hadir = record.filter((r) =>
              r.Absence.some((r: Absence) => r.absenceStatus === "HADIR")
            );
            const cuti = record.filter((r) =>
              r.Absence.some((r: Absence) => r.absenceStatus === "CUTI")
            );
            const perdin = record.filter((r) =>
              r.Absence.some((r: Absence) => r.absenceStatus === "PERDIN")
            );
            const sakit = record.filter((r) =>
              r.Absence.some((r: Absence) => r.absenceStatus === "SAKIT")
            );
            return (
              <div
                className="text-xs flex justify-end gap-4 items-center"
                onClick={() => console.log({ record })}
              >
                <div>HADIR: {hadir.length}</div>
                <div>ALPHA: {alpha.length}</div>
                <div>SAKIT: {sakit.length}</div>
                <div>CUTI: {cuti.length}</div>
                <div>PERDIN: {perdin.length}</div>
              </div>
            );
          }}
        />
      </div>
    </Spin>
  );
}

const columnsTamu = GenerateColumns<GuestBook>([
  {
    title: "NO",
    dataIndex: "no",
    key: "no",
    width: 50,
    className: "text-center",
    render(value, record, index) {
      return <>{index + 1}</>;
    },
  },
  {
    title: "JUDUL TAMU",
    dataIndex: "title",
    key: "title",
    width: 150,
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
]);
const columnsKehadiran = GenerateColumns<UserAbnsence>([
  {
    title: "NO",
    dataIndex: "no",
    key: "no",
    width: 50,
    className: "text-center",
    render(value, record, index) {
      return <>{index + 1}</>;
    },
  },
  {
    title: "NAMA LENGKAP",
    dataIndex: "name",
    key: "name",
    width: 150,
  },
  {
    title: "STATUS KEHADIRAN",
    key: "absenceStatus",
    dataIndex: "absence",
    width: 100,
    className: "text-center",
    render(value, record, index) {
      return (
        <div className="flex justify-center text-center">
          {record.Absence.length === 0 && <Tag color="red">ALPHA</Tag>}
          {record.Absence.length !== 0 && (
            <Tag
              color={
                record.Absence[0].absenceStatus === "HADIR"
                  ? "green"
                  : record.Absence[0].absenceStatus === "SAKIT"
                  ? "orange"
                  : record.Absence[0].absenceStatus === "CUTI"
                  ? "purple"
                  : record.Absence[0].absenceStatus === "PERDIN"
                  ? "blue"
                  : "gray"
              }
            >
              {record.Absence[0].absenceStatus}
            </Tag>
          )}
        </div>
      );
    },
  },
  {
    title: "KETERANGAN",
    dataIndex: "desc",
    key: "desc",
    width: 150,
    render(value, record, index) {
      return (
        <Paragraph
          ellipsis={{
            rows: 1,
            expandable: "collapsible",
          }}
          style={{ fontSize: 11 }}
        >
          {record.Absence.length !== 0 && record.Absence[0].description}
        </Paragraph>
      );
    },
  },
  {
    title: "JAM MASUK",
    key: "in",
    dataIndex: "in",
    width: 150,
    render(value, record, index) {
      return (
        <Paragraph
          ellipsis={{
            rows: 1,
            expandable: "collapsible",
          }}
          style={{ fontSize: 11 }}
        >
          {record.Absence.length !== 0 &&
            `${moment(record.Absence[0].createdAt).format("HH:mm")} (${
              record.Absence[0].geoIn
            })`}
        </Paragraph>
      );
    },
  },
  {
    title: "JAM KELUAR",
    key: "out",
    dataIndex: "out",
    width: 150,
    render(value, record, index) {
      return (
        <Paragraph
          ellipsis={{
            rows: 1,
            expandable: "collapsible",
          }}
          style={{ fontSize: 11 }}
        >
          {record.Absence.length !== 0 &&
            record.Absence[0].checkOut &&
            `${moment(record.Absence[0].checkOut).format("HH:mm")} (${
              record.Absence[0].geoOut
            })`}
        </Paragraph>
      );
    },
  },
]);
