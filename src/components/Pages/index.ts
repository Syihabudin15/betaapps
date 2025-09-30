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
