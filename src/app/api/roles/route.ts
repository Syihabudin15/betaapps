import prisma from "@/components/IPrisma";
import { Response } from "@/components/lib";
import { Roles } from "@prisma/client";
import { NextRequest } from "next/server";

export const GET = async (req: NextRequest) => {
  const params = req.nextUrl.searchParams;
  const page = Number(params.get("page"));
  const pageSize = Number(params.get("pageSize"));
  const search = params.get("search");
  const skip = (page - 1) * pageSize;

  const data = await prisma.roles.findMany({
    where: {
      isActive: true,
      ...(search && { name: { contains: search } }),
    },
    skip: skip,
    take: pageSize,
  });
  const total = await prisma.roles.count({
    where: {
      isActive: true,
      ...(search && { name: { contains: search } }),
    },
  });

  return Response(200, "OK", data, total);
};

export const POST = async (req: NextRequest) => {
  const data: Roles = await req.json();

  if (!data.name || !data.permissions)
    return Response(
      400,
      "BAD REQUEST, Mohon lengkapi data nama dan permissions!"
    );

  try {
    const { id, ...saveRoles } = data;
    await prisma.roles.create({ data: saveRoles });

    return Response(200, "Data Roles berhasil ditambahkan!");
  } catch (err) {
    console.log(err);
    return Response(500, "Server Error!");
  }
};

export const PUT = async (req: NextRequest) => {
  const data: Roles = await req.json();

  if (!data.name || !data.permissions)
    return Response(
      400,
      "BAD REQUEST, Mohon lengkapi data nama dan permissions!"
    );

  try {
    const { id, ...saveRoles } = data;
    await prisma.roles.update({
      where: { id },
      data: { ...saveRoles, updatedAt: new Date() },
    });

    return Response(200, `Data Role ${data.name} berhasil ditambahkan`);
  } catch (err) {
    console.log(err);
    return Response(500, "Server Error!");
  }
};

export const DELETE = async (req: NextRequest) => {
  const id: string = <any>req.nextUrl.searchParams.get("id");
  try {
    const find = await prisma.roles.findFirst({ where: { id } });
    if (!find) return Response(404, "Maaf data Role tidak ditemukan!");

    await prisma.roles.update({
      where: { id },
      data: { isActive: false },
    });
    return Response(200, `Data Role ${find.name} berhasil dihapus`);
  } catch (err) {
    console.log(err);
    return Response(500, "Server Error!");
  }
};

export const PATCH = async (req: NextRequest) => {
  const id: string = <any>req.nextUrl.searchParams.get("id");
  try {
    const find = await prisma.roles.findFirst({ where: { id } });
    if (!find) return Response(404, "Maaf data Role tidak ditemukan!");

    return Response(200, "OK", find);
  } catch (err) {
    console.log(err);
    return Response(500, "Server Error!");
  }
};
