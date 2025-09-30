"use client";

import dynamic from "next/dynamic";
import { MenuItems } from "@/components/Utils/Utils";

export { MenuItems };

export const INotif = dynamic(() => import("@/components/Utils/INotif"), {
  ssr: false,
});
export const IAbsence = dynamic(() => import("@/components/Utils/Absence"), {
  ssr: false,
});

export const TableTitle = dynamic(
  () => import("@/components/Utils/Utils").then((d) => d.TableTitle),
  {
    ssr: false,
  }
);

export const IFormInput = dynamic(
  () => import("@/components/Utils/Utils").then((d) => d.FormInput),
  {
    ssr: false,
  }
);
