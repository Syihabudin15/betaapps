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
      insentifId: { not: null },
      ...(backdate && {
        createdAt: {
          gte: moment(backdate.split(",")[0]).startOf("day").toDate(),
          lte: moment(backdate.split(",")[1]).endOf("day").toDate(),
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
      Insentif: true,
    },
  });
  const total = await prisma.permitApps.count({
    where: {
      isActive: true,
      insentifId: { not: null },
      ...(usersId && { requesterId: usersId }),
      ...(backdate && {
        createdAt: {
          gte: moment(backdate.split(",")[0]).startOf("day").toDate(),
          lte: moment(backdate.split(",")[1]).endOf("day").toDate(),
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
    const { id, Requester, Approver, Insentif, ...saved } = data;
    await prisma.permitApps.create({ data: saved });
    return Response(200, "Data Permohonan Insentif berhasil ditambahkan!");
  } catch (err) {
    console.log(err);
    return Response(500, "Internal Server Error");
  }
};

export const PUT = async (req: NextRequest) => {
  const data: IPermitAbsence = await req.json();
  try {
    const findUser = await prisma.users.findFirst({
      where: { id: data.requesterId },
    });
    if (!findUser) return Response(404, "ID Pemohon tidak ditemukan!!");

    const { id, Requester, Approver, Insentif, ...saved } = data;
    await prisma.permitApps.update({
      where: { id: data.id },
      data: {
        ...saved,
        updatedAt: new Date(),
      },
    });

    return Response(200, "Data Permohonan Insentif berhasil diUpdate!");
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
      return Response(404, `Data Permohonan Insentif  tidak ditemukan`);
    }
    if (find.status === "APPROVED") {
      return Response(
        404,
        `Data Permohonan Insentif tidak dapat dihapus karena status sudah APPROVED`
      );
    }
    await prisma.permitApps.update({
      where: { id: find.id },
      data: { isActive: false, updatedAt: new Date() },
    });
    return Response(200, `Data Permohonan Insentif berhasil dihapus`);
  } catch (err) {
    console.log(err);
    return Response(500, "Internal Server Error!!");
  }
};
