import prisma from "@/components/IPrisma";
import { Response } from "@/components/lib";
import { Users } from "@prisma/client";
import { NextRequest } from "next/server";
import bcrypt from "bcrypt";

export const GET = async (req: NextRequest) => {
  const params = req.nextUrl.searchParams;
  const page = Number(params.get("page"));
  const pageSize = Number(params.get("pageSize"));
  const search = params.get("search");
  const rolesId = params.get("rolesId");
  const skip = (page - 1) * pageSize;

  const data = await prisma.users.findMany({
    where: {
      isActive: true,
      ...(search && {
        OR: [
          { name: { contains: search } },
          { username: { contains: search } },
          { email: { contains: search } },
          { phone: { contains: search } },
          { nip: { contains: search } },
        ],
      }),
      ...(rolesId && { rolesId }),
    },
    skip: skip,
    take: pageSize,
    include: { Roles: true },
  });
  const total = await prisma.users.count({
    where: {
      isActive: true,
      ...(search && {
        OR: [
          { name: { contains: search } },
          { username: { contains: search } },
          { email: { contains: search } },
          { phone: { contains: search } },
          { nip: { contains: search } },
        ],
      }),
      ...(rolesId && { rolesId }),
    },
  });

  return Response(200, "OK", data, total);
};

export const POST = async (req: NextRequest) => {
  const data: Users = await req.json();

  if (!data.name || !data.rolesId || !data.username || !data.password)
    return Response(
      400,
      "BAD REQUEST, Mohon lengkapi data users terlebih dahulu!"
    );

  try {
    const { id, ...saveUser } = data;
    saveUser.password = await bcrypt.hash(data.password, 10);
    await prisma.users.create({ data: saveUser });

    return Response(200, "Data Users berhasil ditambahkan!");
  } catch (err) {
    console.log(err);
    return Response(500, "Server Error!");
  }
};

export const PUT = async (req: NextRequest) => {
  const data: Users = await req.json();

  if (!data.name || !data.rolesId || !data.username)
    return Response(
      400,
      "BAD REQUEST, Mohon lengkapi data user terlebih dahulu!"
    );

  try {
    const { id, ...saveUser } = data;
    if (data.password) {
      saveUser.password = await bcrypt.hash(saveUser.password, 10);
    }
    await prisma.users.update({
      where: { id },
      data: { ...saveUser, updatedAt: new Date() },
    });

    return Response(200, `Data users ${data.name} berhasil diUpdate`);
  } catch (err) {
    console.log(err);
    return Response(500, "Server Error!");
  }
};

export const DELETE = async (req: NextRequest) => {
  const id: string = <any>req.nextUrl.searchParams.get("id");
  try {
    const find = await prisma.users.findFirst({ where: { id } });
    if (!find) return Response(404, "Maaf data User tidak ditemukan!");

    await prisma.users.update({
      where: { id },
      data: { isActive: false },
    });
    return Response(200, `Data User ${find.name} berhasil dihapus`);
  } catch (err) {
    console.log(err);
    return Response(500, "Server Error!");
  }
};
