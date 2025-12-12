"use client";
import { useEffect, useState } from "react";
import { IActionProps, IPageProps } from "../Utils/IInterfaces";
import {
  GenerateQueries,
  GetDailyActivities,
  GetLiburNasional,
  GetLiburWeekend,
  ILiburNasional,
} from "../lib";
import { IReport } from "./IInterfaces";
import { GenerateColumns } from "../Utils/Utils";
import { Button, DatePicker, Modal, Table } from "antd";
import moment from "moment-timezone";
import { TableTitle } from "../Utils";
import { ExportOutlined, FolderFilled } from "@ant-design/icons";
import { useAccess } from "../Utils/Auth";
import { usePathname } from "next/navigation";
import { MonthlyReport } from "../Pdfs";
import { AppsConfig } from "@prisma/client";

export default function PageFullReport() {
  const [pageProps, setPageProps] = useState<IPageProps<IReport>>({
    page: 1,
    pageSize: 50,
    total: 0,
    data: [],
    filters: [],
    loading: false,
  });
  const [selected, setSelected] = useState<IActionProps<IReport>>({
    data: undefined,
    openUpsert: false,
    openDelete: false,
  });
  const [holidays, setHolidays] = useState<ILiburNasional[]>([]);
  const [appsConfig, setAppsConfig] = useState<AppsConfig>();
  const pathname = usePathname();
  const { user, hasAccess } = useAccess(pathname);

  const getData = async () => {
    setPageProps((prev) => ({ ...prev, loading: true }));
    await fetch(
      `/api/fullreport?${GenerateQueries(
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

  useEffect(() => {
    (async () => {
      const find = pageProps.filters.find((f) => f.key === "month");
      const tempDate = moment(find?.value);
      const weekends = GetLiburWeekend(tempDate.format("YYYY-MM"));
      const hol = await GetLiburNasional(
        tempDate.format("YYYY"),
        tempDate.format("MM")
      );
      setHolidays([...weekends, ...hol]);
      await fetch("/api/apps")
        .then((res) => res.json())
        .then((res) => setAppsConfig(res.data));
    })();
  }, [pageProps.filters]);

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
      title: "NAMA LENGKAP",
      dataIndex: "name",
      key: "name",
      width: 150,
      render(value, record, index) {
        return (
          <div>
            <p>{value}</p>
            <p className="italic opacity-70">{record.nip}</p>
          </div>
        );
      },
    },
    {
      title: "HADIR",
      dataIndex: "hadir",
      key: "hadir",
      width: 100,
      render(value, record, index) {
        const find = pageProps.filters.find((f) => f.key === "month");
        const tempDate = moment(find?.value);
        const count = GetDailyActivities(
          tempDate.format("YYYY-MM"),
          record,
          holidays
        );
        const hariKerja = count.filter((d) => !d.isRedDate).length;
        return (
          <div>
            <p>{count.filter((d) => d.Absence).length} Hadir</p>
            <p className="italic opacity-70">dari {hariKerja} hari</p>
          </div>
        );
      },
    },
    {
      title: "SAKIT",
      dataIndex: "sakit",
      key: "sakit",
      width: 100,
      className: "text-center",
      render(value, record, index) {
        const count = record.Absence.filter((f) => f.absenceStatus === "SAKIT");
        return <>{count.length}</>;
      },
    },
    {
      title: "CUTI",
      dataIndex: "cuti",
      key: "cuti",
      width: 100,
      className: "text-center",
      render(value, record, index) {
        const count = record.Absence.filter((f) => f.absenceStatus === "CUTI");
        return <>{count.length}</>;
      },
    },
    {
      title: "PERDIN",
      dataIndex: "perdin",
      key: "perdin",
      width: 100,
      className: "text-center",
      render(value, record, index) {
        const count = record.Absence.filter(
          (f) => f.absenceStatus === "PERDIN"
        );
        return <>{count.length}</>;
      },
    },
    {
      title: "LEMBUR",
      dataIndex: "lembur",
      key: "lembur",
      width: 100,
      className: "text-center",
      render(value, record, index) {
        const count = record.Absence.filter(
          (f) => f.absenceStatus === "LEMBUR"
        );
        return <>{count.length}</>;
      },
    },
    {
      title: "ALPHA",
      dataIndex: "alpha",
      key: "alpha",
      width: 100,
      className: "text-center",
      render(value, record, index) {
        const find = pageProps.filters.find((f) => f.key === "month");
        const tempDate = moment(find?.value);
        const count = GetDailyActivities(
          tempDate.format("YYYY-MM"),
          record,
          holidays
        );
        return <>{count.filter((d) => !d.Absence && !d.isRedDate).length}</>;
      },
    },
    {
      title: "DETAIL",
      dataIndex: "detail",
      key: "detail",
      width: 100,
      render(value, record, index) {
        return (
          <div className="flex justify-center">
            <Button
              icon={<FolderFilled />}
              size="small"
              type="primary"
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
        title={() => (
          <TableTitle
            title="Monthly Report"
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
            functionsRight={[
              <DatePicker
                picker="month"
                size="small"
                onChange={(date, datestr) => {
                  const filters = pageProps.filters.filter(
                    (q) => q.key !== "month"
                  );
                  if (date) {
                    filters.push({ key: "month", value: datestr });
                  }
                  setPageProps((prev) => ({ ...prev, filters }));
                }}
                allowClear
                key={"backdate"}
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
      />
      {selected.data && (
        <Modal
          open={selected.openDelete}
          onCancel={() =>
            setSelected({ ...selected, openDelete: false, data: undefined })
          }
          title={`MONTHLY REPORT ` + selected.data.name}
          style={{ top: 20 }}
          width={window && window.innerWidth > 600 ? "80vw" : "95vw"}
          footer={[]}
          key={selected.data.id}
        >
          <MonthlyReport
            data={selected.data}
            month={(() => {
              const find = pageProps.filters.find((f) => f.key === "month");
              return moment(find?.value).format("YYYY-MM");
            })()}
            holidays={holidays}
            appsConfig={appsConfig as AppsConfig}
          />
        </Modal>
      )}
    </div>
  );
}
