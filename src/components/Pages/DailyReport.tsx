"use client";
import { useEffect, useState } from "react";
import { IPageProps } from "../Utils/IInterfaces";
import { GenerateQueries } from "../lib";
import { IPermitAbsence, IReport } from "./IInterfaces";
import { GenerateColumns } from "../Utils/Utils";
import { Button, Table, Tag, Typography } from "antd";
import moment from "moment-timezone";
import { TableTitle } from "../Utils";
import { ExportOutlined } from "@ant-design/icons";
import { useAccess } from "../Utils/Auth";
import { usePathname } from "next/navigation";
import { Absence } from "@prisma/client";
const { Paragraph } = Typography;

export default function PageDailyReport() {
  const [pageProps, setPageProps] = useState<IPageProps<IReport>>({
    page: 1,
    pageSize: 50,
    total: 0,
    data: [],
    filters: [],
    loading: false,
  });
  const pathname = usePathname();
  const { user, hasAccess } = useAccess(pathname);

  const getData = async () => {
    setPageProps((prev) => ({ ...prev, loading: true }));
    await fetch(
      `/api/dailyreport?${GenerateQueries(
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

  const columnsKehadiran = GenerateColumns<IReport>([
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
      title: "NIP",
      dataIndex: "nip",
      key: "nip",
      width: 150,
    },
    {
      title: "NAMA LENGKAP",
      dataIndex: "name",
      key: "name",
      width: 150,
    },
    {
      title: "ABSENSI",
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
              `${moment(record.Absence[0].createdAt).format("HH:mm")} ${
                record.Absence[0].geoIn
              }`}
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
              `${moment(record.Absence[0].checkOut).format("HH:mm")} ${
                record.Absence[0].geoOut
              }`}
          </Paragraph>
        );
      },
    },
    {
      title: "PERMOHONAN",
      dataIndex: "permohonan",
      key: "permohonan",
      width: 100,
      className: "text-center",
      render(value, record, index) {
        return <>{record.Requester.length}</>;
      },
    },
  ]);

  const columnsPermit = GenerateColumns<IPermitAbsence>([
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
      key: "permohonan",
      dataIndex: "permohonan",
      width: 100,
      render(value, record, index) {
        return <>{record.absenceStatus || record.Insentif?.name}</>;
      },
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
  ]);

  return (
    <div>
      <Table
        title={() => (
          <TableTitle
            title="Daily Report"
            functionsLeft={[
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
        columns={columnsKehadiran}
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
        expandable={{
          expandedRowRender: (record: IReport) => (
            <Table
              rowKey={"id"}
              columns={columnsPermit}
              size="small"
              dataSource={record.Requester}
              bordered
            />
          ),
        }}
        footer={(record) => {
          const alpha = record.filter((r) => r.Absence.length === 0);
          const lembur = record.filter((r) =>
            r.Absence.some((r: Absence) => r.absenceStatus === "LEMBUR")
          );
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
            <div className="text-xs flex justify-end gap-4 items-center">
              <div>HADIR: {hadir.length}</div>
              <div>ALPHA: {alpha.length}</div>
              <div>SAKIT: {sakit.length}</div>
              <div>CUTI: {cuti.length}</div>
              <div>PERDIN: {perdin.length}</div>
              <div>LEMBUR: {lembur.length}</div>
            </div>
          );
        }}
      />
    </div>
  );
}
