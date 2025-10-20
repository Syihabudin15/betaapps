import prisma from "@/components/IPrisma";
import { Response } from "@/components/lib";
import { AppsConfig } from "@prisma/client";
import { NextRequest } from "next/server";

export const GET = async (req: NextRequest) => {
  const data = await prisma.appsConfig.findFirst();
  return Response(200, "OK", data);
};

export const PUT = async (req: NextRequest) => {
  const data: AppsConfig = await req.json();
  try {
    await prisma.appsConfig.update({
      where: { id: data.id },
      data: { ...data, updatedAt: new Date() },
    });
    return Response(200, "Konfigurasi Aplikasi berhasil diperbarui!");
  } catch (err) {
    console.log(err);
    return Response(500, "Internal Server Error");
  }
};
