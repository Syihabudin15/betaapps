"use client";

import { ClockCircleFilled } from "@ant-design/icons";
import { Tooltip } from "antd";

export default function Absence() {
  return (
    <div>
      <div className="fixed right-5 bottom-5 border p-2 rounded-full shadow-2xs bg-gradient-to-br w-12 h-12 from-yellow-500 to-green-500 text-gray-50 cursor-pointer flex justify-center text-2xl">
        <Tooltip title="Kamu belum absen hari ini!">
          <ClockCircleFilled />
        </Tooltip>
      </div>
    </div>
  );
}
