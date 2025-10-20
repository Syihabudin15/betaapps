"use client";
import {
  AuditOutlined,
  DollarCircleOutlined,
  ReadOutlined,
} from "@ant-design/icons";
import { Badge, Tooltip } from "antd";
import Link from "next/link";
import React, { useEffect, useState } from "react";

export default function INotif() {
  const [notif, setNotif] = useState({
    tamu: 0,
    permitInsentif: 0,
    permitAbsence: 0,
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
    }, 10000);
  }, []);

  return (
    <div className="flex gap-2">
      <BadgeNotif
        url="/permit-absence"
        title="Izin & Permohonan"
        count={notif.permitAbsence}
        icon={<AuditOutlined />}
      />
      <BadgeNotif
        url="/permit-insentif"
        title="Claim Insentif"
        count={notif.permitInsentif}
        icon={<DollarCircleOutlined />}
      />
      <BadgeNotif
        url="/guestbook"
        title="Tamu hari ini"
        count={notif.tamu}
        icon={<ReadOutlined />}
      />
    </div>
  );
}

const BadgeNotif = ({
  url,
  count,
  icon,
  title,
}: {
  url: string;
  count: number;
  icon: React.ReactNode;
  title: string;
}) => {
  return (
    <Link href={url}>
      <Tooltip title={title}>
        <Badge showZero count={count} size="small">
          <div className="bg-gray-50 font-mono italic font-semibold py-1 px-3 text-xs rounded">
            {icon}
          </div>
        </Badge>
      </Tooltip>
    </Link>
  );
};
