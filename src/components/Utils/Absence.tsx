"use client";

import { ClockCircleFilled } from "@ant-design/icons";
import { Button, Modal, Spin, Tooltip } from "antd";
import { useEffect, useState } from "react";
import { useUser } from "./UserContext";
import { FormInput } from "./Utils";
import { Absence as AbsenType } from "@prisma/client";
import moment from "moment-timezone";
import { IAbsenceGeo } from "./IInterfaces";

export default function Absence() {
  const [open, setOpen] = useState(false);
  const user = useUser();
  const [absen, setAbsen] = useState<AbsenType>(defaultAbsence);

  const [coords, setCoords] = useState<{
    lat: number;
    lon: number;
    acc: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const getData = async () => {
    await fetch("/api/absence", { method: "PATCH" })
      .then((res) => res.json())
      .then((res) => {
        if (res.data) {
          setAbsen(res.data);
        }
      });
  };

  const handleAbsence = async (isFor: "MASUK" | "PULANG") => {
    if (!coords) {
      setError("Invalid Coordinat!");
      return;
    }
    setLoading(true);
    if (isFor === "MASUK") {
      absen.absenceMethod = user?.absenceMethod || "BUTTON";
      absen.usersId = user?.id || "";
      absen.geo = JSON.stringify({
        masuk: { ...coords },
        pulang: { lat: 0, lon: 0, acc: 0 },
      });
    } else {
      console.log({ absen });
      const geo = JSON.parse(absen && absen.geo) as IAbsenceGeo;
      geo.pulang = { ...coords };
      absen.geo = JSON.stringify(geo);
      absen.checkOut = new Date();
    }
    await fetch("/api/absence", {
      method: isFor === "MASUK" ? "POST" : "PUT",
      body: JSON.stringify(absen),
    })
      .then((res) => res.json())
      .then(async (res) => {
        if (res.status !== 200) {
          setError(res.msg);
        } else {
          await getData();
        }
      })
      .catch((err) => {
        console.log(err);
        setError("Internal Server Error");
      });
    setLoading(false);
  };

  useEffect(() => {
    (async () => {
      await getData();
    })();
  }, []);

  useEffect(() => {
    if (!("geolocation" in navigator)) {
      setError("Browser tidak mendukung geolocation.");
      return;
    }

    setLoading(true);
    const success = (pos: GeolocationPosition) => {
      const { latitude, longitude, accuracy } = pos.coords;
      setCoords({ lat: latitude, lon: longitude, acc: accuracy });
      setError(null);
      setLoading(false);
    };

    const fail = (err: GeolocationPositionError) => {
      if (err.code === err.PERMISSION_DENIED) {
        setError("Tidak bisa absen karena izin lokasi ditolak oleh pengguna!.");
      } else {
        setError(`Gagal mendapatkan lokasi: ${err.message}`);
      }
      setLoading(false);
    };

    const watcherId = navigator.geolocation.watchPosition(success, fail, {
      enableHighAccuracy: true,
      timeout: 20000, // waktu tunggu 20 detik (default 5 detik sering terlalu cepat)
      maximumAge: 0, // jangan gunakan cache
    });

    // bersihkan watcher saat unmount
    return () => navigator.geolocation.clearWatch(watcherId);
  }, []);

  return (
    <div>
      <div
        className="fixed left-5 bottom-5 border p-2 rounded-full shadow-2xs bg-gradient-to-br w-12 h-12 from-yellow-500 to-green-500 text-gray-50 cursor-pointer flex justify-center text-2xl"
        onClick={() => setOpen(true)}
      >
        <Tooltip title="Kamu belum absen hari ini!">
          <ClockCircleFilled />
        </Tooltip>
      </div>
      <Modal
        title="ABSENSI"
        open={open}
        onCancel={() => setOpen(false)}
        footer={[]}
      >
        <Spin spinning={loading}>
          <div className="my-4 mx-2" style={{ lineHeight: 1.5 }}>
            <div className="my-4 flex flex-col gap-1">
              <FormInput label="Nama Lengkap" value={user?.name} disable />
              <FormInput label="NIP" value={user?.nip} disable />
              <FormInput
                label="Coordinat"
                value={
                  coords
                    ? `${coords.lat} ${coords.lon} / ${coords.acc}`
                    : "Invalid Coordinat"
                }
                disable
              />
              <FormInput
                label="Jam Kerja"
                value={
                  absen.geo
                    ? `${moment(absen.createdAt).format("HH:mm")} - ${
                        absen.checkOut
                          ? moment(absen.checkOut).format("HH:mm")
                          : ""
                      }`
                    : "-"
                }
                disable
              />
              <FormInput
                label="Keterangan"
                value={absen.description}
                onChange={(e: string) => setAbsen({ ...absen, description: e })}
                type="area"
                disable={absen.geo ? true : false}
              />
            </div>

            {error ? (
              <p className="my-4 text-center text-red-500">{error}</p>
            ) : (
              <div className="flex justify-center gap-2 my-2">
                <Button
                  type="primary"
                  loading={loading}
                  disabled={absen && absen.geo ? true : false}
                  onClick={() => handleAbsence("MASUK")}
                >
                  MASUK
                </Button>
                <Button
                  danger
                  loading={loading}
                  disabled={absen && absen.checkOut ? true : false}
                  onClick={() => handleAbsence("PULANG")}
                >
                  PULANG
                </Button>
              </div>
            )}
          </div>
        </Spin>
      </Modal>
    </div>
  );
}

const defaultAbsence: AbsenType = {
  id: "",
  absenceMethod: "BUTTON",
  checkOut: null,
  description: null,
  geo: "",
  accuracy: 0,

  createdAt: new Date(),
  updatedAt: new Date(),
  usersId: "",
  absenceStatusId: null,
};
