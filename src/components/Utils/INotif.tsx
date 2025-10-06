"use client";
import { Badge } from "antd";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function INotif() {
  const [notif, setNotif] = useState({
    tamu: 0,
    tidakHadir: 0,
  });

  const getData = async () => {
    await fetch("/api/notif")
      .then((res) => res.json())
      .then((res) => setNotif(res.data));
  };

  useEffect(() => {
    (async () => {
      await getData();
    })();
    setInterval(async () => {
      await getData();
    }, 2000);
  }, []);

  return (
    <div className="flex gap-2">
      <Badge showZero count={notif.tidakHadir} size="small">
        <div className="bg-gray-50 font-mono italic font-semibold py-1 px-3 text-xs rounded">
          <p>TIDAK HADIR</p>
        </div>
      </Badge>
      <Badge showZero count={0} size="small">
        <div className="bg-gray-50 font-mono italic font-semibold py-1 px-3 text-xs rounded">
          <p>IZIN</p>
        </div>
      </Badge>
      <Link href={"/guestbook"}>
        <Badge showZero count={notif.tamu} size="small">
          <div className="bg-gray-50 font-mono italic font-semibold py-1 px-3 text-xs rounded">
            <p>TAMU</p>
          </div>
        </Badge>
      </Link>
    </div>
  );
}
