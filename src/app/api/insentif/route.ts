import prisma from "@/components/IPrisma";
import { Response } from "@/components/lib";
import { DeductionList, Insentif } from "@prisma/client";
import { NextRequest } from "next/server";

export const GET = async (req: NextRequest) => {
  const params = req.nextUrl.searchParams;
  const page = Number(params.get("page"));
  const pageSize = Number(params.get("pageSize"));
  const search = params.get("search");
  const skip = (page - 1) * pageSize;

  const data = await prisma.insentif.findMany({
    where: {
      isActive: true,
      ...(search && { name: { contains: search } }),
    },
    skip: skip,
    take: pageSize,
  });
  const total = await prisma.insentif.count({
    where: {
      isActive: true,
      ...(search && { name: { contains: search } }),
    },
  });

  return Response(200, "OK", data, total);
};

export const POST = async (req: NextRequest) => {
  const data: Insentif = await req.json();
  const { id, ...savedData } = data;
  try {
    await prisma.insentif.create({ data: savedData });
    return Response(200, `Data Insenttif ${data.name} berhasil ditambahkan`);
  } catch (err) {
    console.log(err);
    return Response(500, "Internal server Error!!");
  }
};

export const PUT = async (req: NextRequest) => {
  const data: Insentif = await req.json();
  const { id, ...savedData } = data;
  try {
    await prisma.insentif.update({
      where: { id },
      data: { ...savedData, updatedAt: new Date() },
    });
    return Response(200, `Data Insentif ${data.name} berhasil diupdate`);
  } catch (err) {
    console.log(err);
    return Response(500, "Internal server Error!!");
  }
};

export const DELETE = async (req: NextRequest) => {
  const id = req.nextUrl.searchParams.get("id");
  try {
    const find = await prisma.insentif.findFirst({
      where: { id: id as string },
    });
    if (!find) {
      return Response(404, `Data Insentif tidak ditemukan`);
    }
    await prisma.insentif.update({
      where: { id: find.id },
      data: { isActive: false, updatedAt: new Date() },
    });
    return Response(200, `Data Insentif ${find.name} berhasil dihapus`);
  } catch (err) {
    console.log(err);
    return Response(500, "Internal Server Error!!");
  }
};
