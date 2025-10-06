"use client";

import dynamic from "next/dynamic";

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
