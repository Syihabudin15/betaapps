"use client";

import dynamic from "next/dynamic";

export const PageDashboard = dynamic(
  () => import("@/components/Pages/Dashboard"),
  {
    ssr: false,
  }
);
export const PageRole = dynamic(() => import("@/components/Pages/Roles"), {
  ssr: false,
});
export const UpsertRole = dynamic(
  () => import("@/components/Pages/Roles").then((d) => d.UpsertRole),
  {
    ssr: false,
  }
);
export const PageUsers = dynamic(() => import("@/components/Pages/Users"), {
  ssr: false,
});
export const PageGuestBook = dynamic(
  () => import("@/components/Pages/GuestBook"),
  {
    ssr: false,
  }
);
export const TableParticipants = dynamic(
  () => import("@/components/Pages/Participants"),
  {
    ssr: false,
  }
);

export const PagePosition = dynamic(
  () => import("@/components/Pages/Positions"),
  {
    ssr: false,
  }
);
export const PageAllowances = dynamic(
  () => import("@/components/Pages/Allowance"),
  {
    ssr: false,
  }
);
export const PageDeductions = dynamic(
  () => import("@/components/Pages/Deduction"),
  {
    ssr: false,
  }
);
export const PagePermitAbsence = dynamic(
  () => import("@/components/Pages/PermitAbsence"),
  {
    ssr: false,
  }
);
export const PageInsentif = dynamic(
  () => import("@/components/Pages/Insentif"),
  {
    ssr: false,
  }
);
export const PagePermitInsentif = dynamic(
  () => import("@/components/Pages/PermitInsentif"),
  {
    ssr: false,
  }
);
export const PageConfig = dynamic(
  () => import("@/components/Pages/ConfigApp"),
  {
    ssr: false,
  }
);
export const DailyReport = dynamic(
  () => import("@/components/Pages/DailyReport"),
  {
    ssr: false,
  }
);
export const FullReport = dynamic(
  () => import("@/components/Pages/FullReport"),
  {
    ssr: false,
  }
);
