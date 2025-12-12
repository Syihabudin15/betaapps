"use client";

import { ClockCircleFilled } from "@ant-design/icons";
import { Button, Modal, Spin, Tooltip } from "antd";
import { useEffect, useRef, useState } from "react";
import { useUser } from "./UserContext";
import { FormInput } from "./Utils";
import moment from "moment-timezone";
import Link from "next/link";
import { Absence, Users } from "@prisma/client";
import * as faceapi from "face-api.js";

export default function AbsenceUI() {
  const [open, setOpen] = useState(false);
  const user = useUser();
  const [absen, setAbsen] = useState<Absence>(defaultAbsence);
  const [openFace, setOpenFace] = useState(false);
  const [modelLoad, setModelLoad] = useState(false);

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
      absen.geoIn = JSON.stringify({
        lat: String(coords.lat),
        long: String(coords.lon),
        acc: String(coords.acc),
      });
    } else {
      absen.geoOut = JSON.stringify({
        lat: String(coords.lat),
        long: String(coords.lon),
        acc: String(coords.acc),
      });
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
    const MODEL_URL = "/models";
    (async () => {
      setLoading(true);
      console.log("Start loaded models");
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      ]);
      console.log("Models loaded successfully");
      setModelLoad(false);
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
            <div className="my-4 flex flex-col gap-2">
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
                value={`${
                  absen.geoIn
                    ? moment(absen.createdAt).format("DD/MM HH:mm")
                    : ""
                } - ${
                  absen.checkOut
                    ? moment(absen.checkOut).format("DD/MM HH:mm")
                    : ""
                }`}
                disable
              />
              <FormInput label="Keterangan" value={absen.description} disable />
            </div>

            {error ? (
              <p className="my-4 text-center text-red-500">{error}</p>
            ) : (
              <div className="flex justify-center gap-2 my-2">
                {user && user.absenceMethod === "BUTTON" ? (
                  <Button
                    type="primary"
                    loading={loading}
                    disabled={absen.geoIn ? true : false}
                    onClick={() => handleAbsence("MASUK")}
                  >
                    MASUK
                  </Button>
                ) : (
                  <>
                    {user && user.face ? (
                      <Button
                        type="primary"
                        loading={modelLoad || loading}
                        disabled={absen.geoIn ? true : modelLoad ? true : false}
                        onClick={() => setOpenFace(true)}
                      >
                        MASUK
                      </Button>
                    ) : (
                      <Tooltip title="Kamu belum mendaftarkan Scanface. Daftar dahulu dan absen kembali!">
                        <Button
                          type="primary"
                          onClick={() => setOpenFace(true)}
                          loading={modelLoad || loading}
                          disabled={
                            absen.geoIn ? true : modelLoad ? true : false
                          }
                        >
                          DAFTARKAN SCANFACE
                        </Button>
                      </Tooltip>
                    )}
                  </>
                )}
                <Button
                  danger
                  loading={loading}
                  disabled={absen.checkOut ? true : false}
                  onClick={() => handleAbsence("PULANG")}
                >
                  PULANG
                </Button>
                <Link href={"/permit-absence"}>
                  <Button loading={loading}>IZIN/PERMOHONAN</Button>
                </Link>
              </div>
            )}
          </div>
        </Spin>
      </Modal>
      {user && !modelLoad && (
        <Modal
          title={user?.face ? "REGISTER FACE" : "VERIFY FACE"}
          open={openFace}
          onCancel={() => setOpenFace(false)}
          footer={[]}
          style={{ top: 0 }}
        >
          <FaceScanner
            user={user}
            handleLogin={() => {
              setOpenFace(false);
              handleAbsence("MASUK");
            }}
          />
        </Modal>
      )}
    </div>
  );
}

const defaultAbsence: Absence = {
  id: "",
  absenceMethod: "BUTTON",
  checkOut: null,
  geoIn: "",
  geoOut: null,
  absenceStatus: "HADIR",
  description: null,
  lateDeduction: 0,
  fastLeaveDeduction: 0,
  perdinAllowance: 0,
  lemburAllowance: 0,

  createdAt: new Date(),
  updatedAt: new Date(),
  usersId: "",
};

const FaceScanner = ({
  user,
  handleLogin,
}: {
  user: Users;
  handleLogin: Function;
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
      });

      if (videoRef.current) {
        setStream(stream);
        setError(null);
        setResult(null);
        videoRef.current.srcObject = stream;
        videoRef.current.style.transform = "scaleX(-1)";
      }
    } catch (err) {
      setError("Unable to access camera");
      console.error(err);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const captureAndVerify = async (register: boolean) => {
    if (!videoRef.current) return;

    setIsScanning(true);
    setResult(null);
    setError(null);

    try {
      // Ambil frame dari video
      await new Promise((res) => setTimeout(res, 300));
      const canvas = document.createElement("canvas");
      canvas.width = 640;
      canvas.height = 480;
      const ctx = canvas.getContext("2d");

      if (ctx && videoRef.current) {
        ctx.drawImage(videoRef.current, 0, 0, 640, 480);

        const dataUrl = canvas.toDataURL("image/jpeg");

        // Buat HTMLImageElement dari data URL
        const img = new Image();
        img.src = dataUrl;

        // Tunggu sampai image load
        await new Promise<void>((resolve) => {
          img.onload = () => resolve();
        });

        if (!img) {
          setError("No image detected");
          stopCamera();
          return;
        }

        const imageData = await faceapi
          .detectSingleFace(
            img,
            new faceapi.TinyFaceDetectorOptions({ inputSize: 512 })
          )
          .withFaceLandmarks()
          .withFaceDescriptor();

        if (!imageData) {
          setError("No face detected");
          stopCamera();
          return;
        }

        const response = await fetch("/api/face", {
          method: register ? "POST" : "PUT",
          body: JSON.stringify({
            id: user.id,
            image: Array.from(imageData.descriptor),
          }),
        });

        const data = await response.json();
        if (response.ok) {
          setResult(data.msg);
          user.face = data.face;
          if (!register) {
            await handleLogin();
          }
        } else {
          setError(data.msg);
        }
      }
    } catch (err) {
      setError("Verification failed");
      console.error(err);
    } finally {
      setIsScanning(false);
      stopCamera();
    }
  };

  return (
    <div className="flex flex-col items-center">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="border border-gray-300 rounded-lg mb-4"
        width="640"
        height="480"
      />
      <div className="flex gap-4 mb-4">
        {!stream && (
          <Button
            onClick={() => startCamera()}
            loading={isScanning}
            disabled={stream ? true : false}
          >
            Start Camera
          </Button>
        )}
        {stream && (
          <Button
            onClick={() => captureAndVerify(user.face ? false : true)}
            disabled={isScanning}
            loading={isScanning}
            type="primary"
          >
            Verify
          </Button>
        )}
      </div>
      {result && (
        <div className="p-4 bg-green-100 border border-green-400 rounded">
          {result}
        </div>
      )}

      {error && (
        <div className="p-2 bg-red-100 border border-red-400 rounded">
          {error}
        </div>
      )}
    </div>
  );
};
