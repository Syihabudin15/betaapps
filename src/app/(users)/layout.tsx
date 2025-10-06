"use client";

import dynamic from "next/dynamic";
import React from "react";

const ILayout = dynamic(() => import("@/components/ILayout"), { ssr: false });

export default function Layout({ children }: { children: React.ReactNode }) {
  return <ILayout>{children}</ILayout>;
}
