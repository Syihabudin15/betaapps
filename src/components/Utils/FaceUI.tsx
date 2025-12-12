import { useRef, useState } from "react";
import { extractFaceDescriptor } from "./FaceUtil";
import { Users } from "@prisma/client";

export default function FaceScanner({ user }: { user: Users }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.style.transform = "scaleX(-1)";
      }
    } catch (err) {
      setError("Unable to access camera");
      console.error(err);
    }
  };

  const captureAndVerify = async () => {
    if (!videoRef.current) return;

    setIsScanning(true);
    setResult(null);
    setError(null);

    try {
      // Ambil frame dari video
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
        const imageData = await extractFaceDescriptor(img);
        const response = await fetch("/api/face", {
          method: "PUT",
          body: JSON.stringify({ id: user.id, image: imageData }),
        });

        const data = await response.json();
        setResult(data.msg);
      }
    } catch (err) {
      setError("Verification failed");
      console.error(err);
    } finally {
      setIsScanning(false);
    }
  };

  const registerFace = async () => {
    if (!videoRef.current) return;

    setIsScanning(true);
    setResult(null);
    setError(null);

    try {
      // Ambil frame dari video
      const canvas = document.createElement("canvas");
      canvas.width = 640;
      canvas.height = 480;
      const ctx = canvas.getContext("2d");

      if (ctx && videoRef.current) {
        ctx.drawImage(videoRef.current, 0, 0, 640, 480);

        // Konversi canvas ke base64
        const dataUrl = canvas.toDataURL("image/jpeg");

        // Buat HTMLImageElement dari data URL
        const img = new Image();
        img.src = dataUrl;

        // Tunggu sampai image load
        await new Promise<void>((resolve) => {
          img.onload = () => resolve();
        });
        const imageData = await extractFaceDescriptor(img);
        const response = await fetch("/api/face", {
          method: "PUT",
          body: JSON.stringify({ id: user.id, image: imageData }),
        });

        const data = await response.json();
        setResult(data.msg);
        setIsScanning(false);
        user.face = JSON.stringify(Array.from(imageData));
      }
    } catch (err) {
      setError("Registration failed");
      console.error(err);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="flex flex-col items-center p-8">
      <h1 className="text-2xl font-bold mb-4">Face Recognition System</h1>

      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="border border-gray-300 rounded-lg mb-4"
        width="640"
        height="480"
      />

      <div className="flex gap-4 mb-4">
        <button
          onClick={startCamera}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Start Camera
        </button>
        {user.face && (
          <button
            onClick={captureAndVerify}
            disabled={isScanning}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400"
          >
            Verify Face
          </button>
        )}
        <button
          onClick={registerFace}
          disabled={isScanning}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:bg-gray-400"
        >
          Register/Update Face
        </button>
      </div>

      {result && (
        <div className="p-4 bg-green-100 border border-green-400 rounded">
          {result}
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-100 border border-red-400 rounded">
          {error}
        </div>
      )}
    </div>
  );
}
