import prisma from "@/components/IPrisma";
import { Response } from "@/components/lib";
import { getSession } from "@/components/Utils/Auth";
import { Absence } from "@prisma/client";
import moment from "moment-timezone";
import { NextRequest } from "next/server";

const jamMasuk = 8;
const toleransi = 5;

export const POST = async (req: NextRequest) => {
  const data: Absence = await req.json();
  try {
    const find = await prisma.absence.findFirst({
      where: {
        usersId: data.usersId,
        createdAt: {
          gte: moment().startOf("day").toDate(),
          lte: moment().endOf("day").toDate(),
        },
      },
    });
    if (find) {
      return Response(200, "Data Absence Berhasil Diperbaharui!", find);
    }

    if (
      Number(moment(data.createdAt).format("HHmm")) >
      Number(
        moment().set("hour", jamMasuk).set("minute", toleransi).format("HHmm")
      )
    ) {
      const late = await prisma.absenceStatus.findFirst({
        where: {
          name: { contains: "Terlambat" },
        },
      });
      if (late) {
        data.absenceStatusId = late.id;
      }
    }
    const { id, ...saveAbsece } = data;
    await prisma.absence.create({ data: saveAbsece });
    return Response(200, "Data Absence Berhasil Diperbaharui!");
  } catch (err) {
    console.log(err);
    return Response(500, "Internal Server Error");
  }
};
export const PUT = async (req: NextRequest) => {
  const data: Absence = await req.json();
  try {
    const find = await prisma.absence.findFirst({ where: { id: data.id } });
    if (!find) {
      return Response(404, "Data Absence tidak ditemukan!");
    }
    const { id, ...saveAbsece } = data;
    await prisma.absence.update({ where: { id }, data: saveAbsece });
    return Response(200, "Data Absence Berhasil Diperbaharui!");
  } catch (err) {
    console.log(err);
    return Response(500, "Internal Server Error");
  }
};

export const PATCH = async (req: NextRequest) => {
  try {
    const session = await getSession();
    const find = await prisma.absence.findFirst({
      where: {
        usersId: session?.user.id || "1",
        createdAt: {
          gte: moment().startOf("day").toDate(),
          lte: moment().endOf("day").toDate(),
        },
      },
    });
    return Response(200, "OK", find);
  } catch (err) {
    console.log(err);
    return Response(500, "Internal Server Error");
  }
};
