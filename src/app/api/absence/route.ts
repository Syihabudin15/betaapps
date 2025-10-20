import prisma from "@/components/IPrisma";
import { GetDistanceInMeters, Response } from "@/components/lib";
import { getSession } from "@/components/Utils/Auth";
import { IGeoAbsence } from "@/components/Utils/IInterfaces";
import { Absence } from "@prisma/client";
import moment from "moment-timezone";
import { NextRequest } from "next/server";

export const POST = async (req: NextRequest) => {
  const data: Absence = await req.json();
  try {
    const config = await prisma.appsConfig.findFirst();
    if (!config) return Response(501, "Konfigurasi sistem tidak sesuai!");
    if (
      Number(moment().format("HHmm")) <
      Number(
        moment()
          .set("hour", config.shiftStart - 1)
          .set("minute", 0)
          .format("HHmm")
      )
    ) {
      return Response(
        400,
        `Maaf, Absen dimulai 1 jam sebelum masuk, yaitu pukul ${moment()
          .set("hour", config.shiftStart - 1)
          .set("minute", 0)
          .format("HH:mm")}!`
      );
    }
    if (
      config.meterTolerance &&
      config.meterTolerance !== 0 &&
      config.lat !== "0" &&
      config.long !== "0"
    ) {
      const currGeoIn = JSON.parse(data.geoIn) as IGeoAbsence;
      const distance = GetDistanceInMeters(
        Number(config.lat),
        Number(config.long),
        Number(currGeoIn.lat),
        Number(currGeoIn.long)
      );
      if (distance > config.meterTolerance) {
        return Response(
          400,
          `Maaf, lokasi kamu terlalu jauh dari kantor!! {${distance} Meter}`
        );
      }
    }
    if (
      Number(moment().format("HHmm")) >
      Number(
        moment().set("hour", config.lastAbsence).set("minute", 0).format("HHmm")
      )
    ) {
      return Response(
        400,
        `Ahh kamu telat absen karena telah melewati jam ${moment()
          .set("hour", config.lastAbsence)
          .set("minute", 0)
          .format("HH:mm")}!`
      );
    }

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
      return Response(400, "Kamu telah absen hari ini!", find);
    }

    if (
      Number(moment().format("HHmm")) >
      Number(
        moment()
          .set("hour", config.shiftStart)
          .set("minute", config.tolerance)
          .format("HHmm")
      )
    ) {
      data.lateDeduction = config.lateDeduction;
      data.description = data.description
        ? data.description + ", Terlambat"
        : "Terlambat";
    }
    const { id, ...saved } = data;
    await prisma.absence.create({ data: { ...saved, createdAt: new Date() } });
    return Response(200, "Data Absence Berhasil Diperbaharui!");
  } catch (err) {
    console.log(err);
    return Response(500, "Internal Server Error");
  }
};
export const PUT = async (req: NextRequest) => {
  const data: Absence = await req.json();
  try {
    const config = await prisma.appsConfig.findFirst();
    if (!config) return Response(501, "Konfigurasi sistem tidak sesuai!");

    const find = await prisma.absence.findFirst({ where: { id: data.id } });
    if (!find) {
      return Response(404, "Data Absence tidak ditemukan!");
    }

    if (
      Number(moment().format("HHmm")) <
      Number(moment().set("hour", config.shiftEnd).format("HHmm"))
    ) {
      data.fastLeaveDeduction = config.fastLeaveDeduction;
      data.description = data.description
        ? data.description + ", Pulang lebih awal"
        : "Pulang lebih awal";
    }
    await prisma.absence.update({
      where: { id: data.id },
      data: { ...data, checkOut: new Date() },
    });
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
