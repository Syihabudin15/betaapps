"use client";

import { Button, Spin, Tag, Tooltip } from "antd";
import { useEffect, useState } from "react";
import { AppsConfig } from "@prisma/client";
import useApp from "antd/es/app/useApp";
import { FormInput } from "../Utils/Utils";
import moment from "moment-timezone";
import { IDRFormat, IDRToNumber } from "../Utils/Services";
import { RobotFilled, SaveFilled } from "@ant-design/icons";
import { useAccess } from "../Utils/Auth";
import { usePathname } from "next/navigation";

export default function PageConfig() {
  const [data, setData] = useState<AppsConfig>(defaultConfig);
  const [loading, setLoading] = useState(false);
  const [disable, setDisable] = useState(true);
  const pathname = usePathname();
  const { hasAccess } = useAccess(pathname);
  const { modal } = useApp();

  const getData = async () => {
    setLoading(true);
    await fetch(`/api/apps`)
      .then((res) => res.json())
      .then((res) => {
        setData(res.data ? res.data : defaultConfig);
      });
    setLoading(false);
  };

  const handleUpdate = async () => {
    setDisable(true);
    setLoading(true);
    await fetch("/api/apps", { method: "PUT", body: JSON.stringify(data) })
      .then((res) => res.json())
      .then(async (res) => {
        if (res.status === 200) {
          modal.success({ title: "SUCCESS", content: res.msg });
        } else {
          modal.error({ title: "ERROR!", content: res.msg });
        }
        await getData();
      })
      .catch((err) => {
        console.log(err);
        modal.error({ title: "ERROR!!", content: "Server Error!" });
      });
    setLoading(false);
  };

  useEffect(() => {
    (async () => {
      await getData();
    })();
  }, []);

  const handleGenerate = () => {
    if (!navigator.geolocation) {
      alert("Browser kamu tidak mendukung geolocation.");
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setData({ ...data, lat: String(latitude), long: String(longitude) });
        setLoading(false);
      },
      (error) => {
        console.error(error);
        alert("Gagal mendapatkan lokasi. Pastikan izin lokasi aktif.");
        setLoading(false);
      }
    );
  };

  return (
    <Spin spinning={loading}>
      <div className="flex gap-4 flex-col sm:flex-row w-[100vw] sm:w-[80vw]">
        <div className="flex-1 p-2">
          <div className="flex flex-col gap-2">
            <FormInput
              label="Jam Masuk"
              value={
                disable
                  ? moment()
                      .set("hour", data.shiftStart)
                      .set("minute", 0)
                      .format("HH:mm")
                  : Number(
                      moment()
                        .set("hour", data.shiftStart)
                        .set("minute", 0)
                        .format("HH")
                    )
              }
              disable={disable}
              type={disable ? undefined : "number"}
              onChange={(e: any) => setData({ ...data, shiftStart: Number(e) })}
              widthLeft={50}
            />
            <FormInput
              label="Toleransi (Menit)"
              value={data.tolerance}
              disable={disable}
              type="number"
              onChange={(e: any) => setData({ ...data, tolerance: Number(e) })}
              widthLeft={50}
            />
            <FormInput
              label="Jam Pulang"
              value={
                disable
                  ? moment()
                      .set("hour", data.shiftEnd)
                      .set("minute", 0)
                      .format("HH:mm")
                  : Number(
                      moment()
                        .set("hour", data.shiftEnd)
                        .set("minute", 0)
                        .format("HH")
                    )
              }
              disable={disable}
              type={disable ? undefined : "number"}
              onChange={(e: any) => setData({ ...data, shiftEnd: Number(e) })}
              widthLeft={50}
            />
            <FormInput
              label="Maksimal Jam Absence"
              value={
                disable
                  ? moment()
                      .set("hour", data.lastAbsence)
                      .set("minute", 0)
                      .format("HH:mm")
                  : Number(
                      moment()
                        .set("hour", data.lastAbsence)
                        .set("minute", 0)
                        .format("HH")
                    )
              }
              disable={disable}
              type={disable ? undefined : "number"}
              onChange={(e: any) =>
                setData({ ...data, lastAbsence: Number(e) })
              }
              widthLeft={50}
            />
            <FormInput
              label="Koordinat (Lat)"
              value={data.lat}
              disable={disable}
              onChange={(e: any) => setData({ ...data, lat: e })}
              suffix={
                <Button
                  type="primary"
                  onClick={() => handleGenerate()}
                  disabled={hasAccess("update") || disable}
                  size="small"
                  icon={
                    <Tooltip>
                      <RobotFilled />
                    </Tooltip>
                  }
                ></Button>
              }
              widthLeft={50}
            />
            <FormInput
              label="Koordinat (Long)"
              value={data.long}
              disable={disable}
              onChange={(e: any) => setData({ ...data, long: e })}
              widthLeft={50}
            />
            <FormInput
              label="Toleransi Jarak"
              value={data.meterTolerance}
              disable={disable}
              type={"number"}
              onChange={(e: any) =>
                setData({ ...data, meterTolerance: Number(e) })
              }
              suffix={"Meter"}
              widthLeft={50}
            />
            <FormInput
              label="Pot Terlambat"
              value={IDRFormat(data.lateDeduction)}
              disable={disable}
              onChange={(e: any) =>
                setData({
                  ...data,
                  lateDeduction: !isNaN(IDRToNumber(e)) ? IDRToNumber(e) : 0,
                })
              }
              widthLeft={50}
            />
            <FormInput
              label="Pot Pulang Cepat"
              value={IDRFormat(data.fastLeaveDeduction)}
              disable={disable}
              onChange={(e: any) =>
                setData({
                  ...data,
                  fastLeaveDeduction: !isNaN(IDRToNumber(e))
                    ? IDRToNumber(e)
                    : 0,
                })
              }
              widthLeft={50}
            />
            <FormInput
              label="Pot Alpha"
              value={IDRFormat(data.alphaDeduction)}
              disable={disable}
              onChange={(e: any) =>
                setData({
                  ...data,
                  alphaDeduction: !isNaN(IDRToNumber(e)) ? IDRToNumber(e) : 0,
                })
              }
              widthLeft={50}
            />
            <FormInput
              label="Last Update"
              value={moment(data.updatedAt).format("DD/MM/YYYY HH:mm")}
              disable={true}
              widthLeft={50}
            />
          </div>
          <div className="flex justify-end my-8">
            {hasAccess("update") && (
              <>
                {disable ? (
                  <Button
                    type="primary"
                    onClick={() => setDisable(false)}
                    loading={loading}
                  >
                    Update
                  </Button>
                ) : (
                  <Button
                    type="primary"
                    onClick={() => handleUpdate()}
                    loading={loading}
                    icon={<SaveFilled />}
                  >
                    Save
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
        <div className="flex-1 p-2">
          <p className="text-center text-xl font-bold my-3 border-b-blue-500 border-b-2 mb-10">
            INFORMATION
          </p>
          <ul className="list-disc px-5">
            <li>
              Status Absen :{" "}
              <div>
                <Tag color="green">HADIR</Tag>
                <Tag color="orange">SAKIT</Tag>
                <Tag color="purple">CUTI</Tag>
                <Tag color="red">ALPHA</Tag>
                <Tag color="blue">PERDIN</Tag>
                <Tag color="gray">LEMBUR</Tag>
              </div>
            </li>
            <li>Tidak melakukan absen = ALPHA.</li>
            <li>
              Permohonan Absen di REJECT maka dianggap ALPHA dan dikenakan
              potongan ALPHA.
            </li>
            <li>
              Jika Toleransi Jarak diisi, maka Lat dan Long juga wajib diisi
              agar fungsi berjalan normal.
            </li>
            <li>
              Jika Toleransi Jarak diisi dengan 0, maka user dapat absen dari
              lokasi mana saja. Sedangkan jika diisi lebih dari 0, maka user
              hanya dapat absen dalam radius (toleransi jarak meter).
            </li>
          </ul>
        </div>
      </div>
    </Spin>
  );
}

const defaultConfig: AppsConfig = {
  id: "",
  lateDeduction: 0,
  fastLeaveDeduction: 0,
  alphaDeduction: 0,
  shiftStart: 0,
  shiftEnd: 0,
  tolerance: 0,
  lastAbsence: 0,
  meterTolerance: null,
  lat: "0",
  long: "0",

  updatedAt: new Date(),
};
