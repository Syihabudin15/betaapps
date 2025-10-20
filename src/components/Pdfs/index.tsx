"use client";

import { LoadingOutlined } from "@ant-design/icons";
import dynamic from "next/dynamic";

export const MonthlyReport = dynamic(
  () => import("@/components/Pdfs/MontlyReport"),
  {
    ssr: false,
    loading: () => <LoadingOutlined />,
  }
);
