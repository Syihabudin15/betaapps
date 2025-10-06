import prisma from "@/components/IPrisma";
import { Response } from "@/components/lib";
import { Participant } from "@prisma/client";
import { NextRequest } from "next/server";

export const PUT = async (req: NextRequest) => {
  const data: Participant = await req.json();
  const { id, ...saveParticipant } = data;
  try {
    const find = await prisma.participant.findFirst({ where: { id } });
    if (!find) Response(404, "Data Participant tidak ditemukan");

    await prisma.participant.update({ where: { id }, data: saveParticipant });
    return Response(200, "Data  Participant berhasil diupdate!");
  } catch (err) {
    console.log(err);
    return Response(500, "Internal Server Error");
  }
};

export const DELETE = async (req: NextRequest) => {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return Response(400, "Invalid ID Provided");

  try {
    const find = await prisma.participant.findFirst({ where: { id } });
    if (!find) Response(404, "Data Participant tidak ditemukan");

    await prisma.participant.delete({
      where: { id },
    });
    return Response(200, "Data  Participant berhasil dihapus!");
  } catch (err) {
    console.log(err);
    return Response(500, "Internal Server Error");
  }
};
