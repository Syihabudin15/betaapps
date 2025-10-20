import prisma from "@/components/IPrisma";
import { Response } from "@/components/lib";
import { IPermitAbsence } from "@/components/Pages/IInterfaces";
import {
  AbsenceStatus,
  PermitAbsenceStatus,
  PermitStatus,
} from "@prisma/client";
import moment from "moment-timezone";
import { NextRequest } from "next/server";

export const GET = async (req: NextRequest) => {
  const params = req.nextUrl.searchParams;
  const page = Number(params.get("page"));
  const pageSize = Number(params.get("pageSize"));
  const search = params.get("search");
  const status = params.get("status");
  const absenceStatus = params.get("absenceStatus");
  const usersId = params.get("usersId");
  const backdate = params.get("backdate");
  const skip = (page - 1) * pageSize;

  const data = await prisma.permitApps.findMany({
    where: {
      isActive: true,
      absenceStatus: { not: null },
      ...(backdate && {
        createdAt: {
          gte: moment(backdate.split(",")[0]).set("hour", 0).toDate(),
          lte: moment(backdate.split(",")[1]).set("hour", 24).toDate(),
        },
      }),
      ...(status && { status: status as PermitStatus }),
      ...(usersId && { requesterId: usersId }),
      ...(absenceStatus && {
        absenceStatus: absenceStatus as PermitAbsenceStatus,
      }),
      ...(search && {
        OR: [
          {
            Approver: {
              OR: [
                { name: { contains: search } },
                { nip: { contains: search } },
                { email: { contains: search } },
                { username: { contains: search } },
              ],
            },
          },
          {
            Requester: {
              OR: [
                { name: { contains: search } },
                { nip: { contains: search } },
                { email: { contains: search } },
                { username: { contains: search } },
              ],
            },
          },
        ],
      }),
    },
    skip: skip,
    take: pageSize,
    include: {
      Approver: true,
      Requester: true,
    },
  });
  const total = await prisma.permitApps.count({
    where: {
      isActive: true,
      absenceStatus: { not: null },
      ...(backdate && {
        createdAt: {
          gte: moment(backdate.split(",")[0]).set("hour", 0).toDate(),
          lte: moment(backdate.split(",")[1]).set("hour", 24).toDate(),
        },
      }),
      ...(status && { status: status as PermitStatus }),
      ...(absenceStatus && {
        absenceStatus: absenceStatus as PermitAbsenceStatus,
      }),
      ...(search && {
        OR: [
          {
            Approver: {
              OR: [
                { name: { contains: search } },
                { nip: { contains: search } },
                { email: { contains: search } },
                { username: { contains: search } },
              ],
            },
          },
          {
            Requester: {
              OR: [
                { name: { contains: search } },
                { nip: { contains: search } },
                { email: { contains: search } },
                { username: { contains: search } },
              ],
            },
          },
        ],
      }),
    },
  });

  return Response(200, "OK", data, total);
};

export const POST = async (req: NextRequest) => {
  const data: IPermitAbsence = await req.json();
  try {
    const find = await prisma.permitApps.findFirst({
      where: {
        requesterId: data.requesterId,
        isActive: true,
        absenceStatus: data.absenceStatus,
        createdAt: {
          gte: moment().startOf("day").toDate(),
          lte: moment().endOf("day").toDate(),
        },
      },
    });
    if (find) {
      return Response(
        400,
        "Maaf kamu telah mengajukan permohonan ini sebelumnya!"
      );
    }
    const { id, Requester, Approver, Insentif, ...saved } = data;
    await prisma.permitApps.create({ data: saved });
    return Response(200, "Data Izin / Permohonan berhasil ditambahkan!");
  } catch (err) {
    console.log(err);
    return Response(500, "Internal Server Error");
  }
};

export const PUT = async (req: NextRequest) => {
  const data: IPermitAbsence = await req.json();
  try {
    const app = await prisma.appsConfig.findFirst();
    if (!app) return Response(400, "Data Configuration tidak sesuai!!");
    const absenceToday = await prisma.absence.findFirst({
      where: {
        usersId: data.requesterId,
        createdAt: {
          gte: moment(data.createdAt).startOf("day").toDate(),
          lte: moment(data.createdAt).endOf("day").toDate(),
        },
      },
    });
    const findUser = await prisma.users.findFirst({
      where: { id: data.requesterId },
    });
    if (!findUser) return Response(404, "ID Pemohon tidak ditemukan!!");
    const { id, Requester, Approver, Insentif, ...saved } = data;

    await prisma.$transaction(async (tx) => {
      if (data.status === "APPROVED") {
        if (
          data.absenceStatus &&
          ["TERLAMBAT", "PULANGCEPAT"].includes(data.absenceStatus)
        ) {
          if (absenceToday) {
            await tx.absence.update({
              where: {
                id: absenceToday.id,
              },
              data: {
                description:
                  absenceToday.description +
                  `, Permohonan ${data.absenceStatus}`,
                lateDeduction:
                  data.absenceStatus === "TERLAMBAT"
                    ? 0
                    : absenceToday.lateDeduction,
                fastLeaveDeduction:
                  data.absenceStatus === "PULANGCEPAT"
                    ? 0
                    : absenceToday.fastLeaveDeduction,
                checkOut:
                  data.absenceStatus === "PULANGCEPAT"
                    ? moment(absenceToday.createdAt).toDate()
                    : absenceToday.checkOut,
                updatedAt: new Date(),
              },
            });
          } else {
            await tx.absence.create({
              data: {
                absenceMethod: findUser.absenceMethod,
                geoIn: JSON.stringify({ lat: "0", long: "0", acc: "0" }),
                description: `Permohonan ${data.absenceStatus}`,
                checkOut:
                  data.absenceStatus === "PULANGCEPAT"
                    ? moment(data.createdAt).toDate()
                    : null,
                usersId: findUser.id,
              },
            });
          }
        } else {
          if (data.startDate && data.endDate) {
            let currDate = moment(data.startDate);
            while (currDate.isSameOrBefore(moment(data.endDate), "day")) {
              const find = await tx.absence.findFirst({
                where: {
                  usersId: findUser.id,
                  createdAt: {
                    gte: moment(currDate).startOf("day").toDate(),
                    lte: moment(currDate).endOf("day").toDate(),
                  },
                },
              });
              if (find) {
                await tx.absence.update({
                  where: {
                    id: find.id,
                  },
                  data: {
                    absenceStatus: data.absenceStatus as AbsenceStatus,
                    description:
                      find.description + `, Permohonan ${data.absenceStatus}`,
                    perdinAllowance:
                      data.absenceStatus === "PERDIN"
                        ? data.nominal
                        : find.perdinAllowance,
                    lemburAllowance:
                      data.absenceStatus === "LEMBUR"
                        ? data.nominal
                        : find.lemburAllowance,
                    updatedAt: new Date(),
                  },
                });
              } else {
                await tx.absence.create({
                  data: {
                    absenceMethod: findUser.absenceMethod,
                    absenceStatus: data.absenceStatus as AbsenceStatus,
                    geoIn: JSON.stringify({ lat: "0", long: "0", acc: "0" }),
                    description: `Permohonan ${data.absenceStatus}`,
                    usersId: findUser.id,
                    perdinAllowance:
                      data.absenceStatus === "PERDIN" ? data.nominal : 0,
                    lemburAllowance:
                      data.absenceStatus === "LEMBUR" ? data.nominal : 0,
                  },
                });
              }
              currDate = moment(currDate).add("day", 1);
            }
          } else {
            if (absenceToday) {
              await tx.absence.update({
                where: {
                  id: absenceToday.id,
                },
                data: {
                  absenceStatus: data.absenceStatus as AbsenceStatus,
                  description:
                    absenceToday.description +
                    `, Permohonan ${data.absenceStatus}`,
                  perdinAllowance:
                    data.absenceStatus === "PERDIN" ? data.nominal : 0,
                  lemburAllowance:
                    data.absenceStatus === "LEMBUR" ? data.nominal : 0,
                  updatedAt: new Date(),
                },
              });
            } else {
              await tx.absence.create({
                data: {
                  absenceMethod: findUser.absenceMethod,
                  absenceStatus: data.absenceStatus as AbsenceStatus,
                  geoIn: JSON.stringify({ lat: "0", long: "0", acc: "0" }),
                  description: `Permohonan ${data.absenceStatus}`,
                  usersId: findUser.id,
                  perdinAllowance:
                    data.absenceStatus === "PERDIN" ? data.nominal : 0,
                  lemburAllowance:
                    data.absenceStatus === "LEMBUR" ? data.nominal : 0,
                },
              });
            }
          }
        }
      }
      await tx.permitApps.update({
        where: { id: data.id },
        data: { ...saved, updatedAt: new Date() },
      });
    });
    return Response(200, "Data Izin / Permohonan berhasil diUpdate!");
  } catch (err) {
    console.log(err);
    return Response(500, "Internal Server Error");
  }
};

export const DELETE = async (req: NextRequest) => {
  const id = req.nextUrl.searchParams.get("id");
  try {
    const find = await prisma.permitApps.findFirst({
      where: { id: id as string },
    });
    if (!find) {
      return Response(404, `Data Izin / Permohonan tidak ditemukan`);
    }
    if (find.status === "APPROVED") {
      return Response(
        404,
        `Data Izin / Permohonan tidak dapat dihapus karena status sudah APPROVED`
      );
    }
    await prisma.permitApps.update({
      where: { id: find.id },
      data: { isActive: false, updatedAt: new Date() },
    });
    return Response(200, `Data Izin / Permohonan berhasil dihapus`);
  } catch (err) {
    console.log(err);
    return Response(500, "Internal Server Error!!");
  }
};
