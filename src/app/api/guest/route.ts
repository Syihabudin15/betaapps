import prisma from "@/components/IPrisma";
import { Response } from "@/components/lib";
import { IGuestBook } from "@/components/Pages/IInterfaces";
import { GBookStatus, GBookType } from "@prisma/client";
import { NextRequest } from "next/server";

export const GET = async (req: NextRequest) => {
  const params = req.nextUrl.searchParams;
  const page = Number(params.get("page"));
  const pageSize = Number(params.get("pageSize"));
  const search = params.get("search");
  const status: GBookStatus | null = <any>params.get("status");
  const type: GBookType | null = <any>params.get("type");
  const skip = (page - 1) * pageSize;

  const data = await prisma.guestBook.findMany({
    where: {
      isActive: true,
      ...(status && { status }),
      ...(type && { type }),
      ...(search && {
        OR: [
          { title: { contains: search } },
          { recipientName: { contains: search } },
          { description: { contains: search } },
          { Participant: { some: { name: { contains: search } } } },
        ],
      }),
    },
    skip: skip,
    take: pageSize,
    include: { Participant: true },
    orderBy: { updatedAt: "desc" },
  });
  const total = await prisma.guestBook.count({
    where: {
      isActive: true,
      ...(status && { status }),
      ...(type && { type }),
      ...(search && {
        OR: [
          { title: { contains: search } },
          { recipientName: { contains: search } },
          { description: { contains: search } },
          { Participant: { some: { name: { contains: search } } } },
        ],
      }),
    },
  });
  return Response(200, "OK", data, total);
};

export const POST = async (req: NextRequest) => {
  const data: IGuestBook = await req.json();
  const { id, Participant, ...saveGuestBook } = data;
  try {
    await prisma.$transaction(async (tx) => {
      const gbook = await tx.guestBook.create({ data: saveGuestBook });
      await tx.participant.createMany({
        data: Participant.map((p) => ({
          name: p.name,
          phone: p.phone,
          description: p.description,

          isActive: p.isActive,
          guestBookId: gbook.id,
        })),
      });
      return data;
    });

    return Response(200, "Data Tamu berhasil ditambahkan");
  } catch (err) {
    console.log(err);
    return Response(500, "Internal Server Error");
  }
};
export const PUT = async (req: NextRequest) => {
  const data: IGuestBook = await req.json();
  const { id, Participant, ...saveGuestBook } = data;
  try {
    await prisma.$transaction(async (tx) => {
      const gbook = await tx.guestBook.update({
        where: { id },
        data: { ...saveGuestBook, updatedAt: new Date() },
      });
      await tx.participant.deleteMany({ where: { guestBookId: id } });
      await tx.participant.createMany({
        data: Participant.map((p) => ({
          name: p.name,
          phone: p.phone,
          description: p.description,

          isActive: p.isActive,
          guestBookId: gbook.id,
        })),
      });
      return data;
    });

    return Response(200, "Data Tamu berhasil ditambahkan");
  } catch (err) {
    console.log(err);
    return Response(500, "Internal Server Error");
  }
};

export const DELETE = async (req: NextRequest) => {
  const id: string = <any>req.nextUrl.searchParams.get("id");
  try {
    const find = await prisma.guestBook.findFirst({ where: { id } });
    if (!find) return Response(404, "Maaf data Tamu tidak ditemukan!");

    await prisma.$transaction([
      prisma.guestBook.update({
        where: { id },
        data: { isActive: false, updatedAt: new Date() },
      }),
      prisma.participant.updateMany({
        where: { guestBookId: id },
        data: { isActive: false },
      }),
    ]);
    return Response(200, `Data Tamu ${find.title} berhasil dihapus`);
  } catch (err) {
    console.log(err);
    return Response(500, "Server Error!");
  }
};
