import prisma from "@/components/IPrisma";
import { Response } from "@/components/lib";
import { DeductionList } from "@prisma/client";
import { NextRequest } from "next/server";

export const GET = async (req: NextRequest) => {
  const params = req.nextUrl.searchParams;
  const page = Number(params.get("page"));
  const pageSize = Number(params.get("pageSize"));
  const search = params.get("search");
  const skip = (page - 1) * pageSize;

  const data = await prisma.deductionList.findMany({
    where: {
      isActive: true,
      ...(search && { name: { contains: search } }),
    },
    skip: skip,
    take: pageSize,
  });
  const total = await prisma.deductionList.count({
    where: {
      isActive: true,
      ...(search && { name: { contains: search } }),
    },
  });

  return Response(200, "OK", data, total);
};

export const POST = async (req: NextRequest) => {
  const data: DeductionList = await req.json();
  const { id, ...savedData } = data;
  try {
    await prisma.deductionList.create({ data: savedData });
    return Response(200, `Data Potongan ${data.name} berhasil ditambahkan`);
  } catch (err) {
    console.log(err);
    return Response(500, "Internal server Error!!");
  }
};

export const PUT = async (req: NextRequest) => {
  const data: DeductionList = await req.json();
  const { id, ...savedData } = data;
  try {
    await prisma.deductionList.update({
      where: { id },
      data: { ...savedData, updatedAt: new Date() },
    });
    return Response(200, `Data Potongan ${data.name} berhasil diupdate`);
  } catch (err) {
    console.log(err);
    return Response(500, "Internal server Error!!");
  }
};

export const DELETE = async (req: NextRequest) => {
  const id = req.nextUrl.searchParams.get("id");
  try {
    const find = await prisma.deductionList.findFirst({
      where: { id: id as string },
    });
    if (!find) {
      return Response(404, `Data Potongan tidak ditemukan`);
    }
    await prisma.deductionList.update({
      where: { id: find.id },
      data: { isActive: false, updatedAt: new Date() },
    });
    return Response(200, `Data Potongan ${find.name} berhasil dihapus`);
  } catch (err) {
    console.log(err);
    return Response(500, "Internal Server Error!!");
  }
};
