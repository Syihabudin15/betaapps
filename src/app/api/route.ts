import prisma from "@/components/IPrisma";
import { Response } from "@/components/lib";
import moment from "moment-timezone";
import { NextRequest } from "next/server";

export const GET = async (req: NextRequest) => {
  const totalUser = await prisma.users.count({ where: { isActive: true } });
  const totalTamu = await prisma.guestBook.count({ where: { isActive: true } });
  const tamuHariIni = await prisma.guestBook.findMany({
    where: {
      isActive: true,
      checkIn: {
        gte: moment().startOf("day").toDate(),
        lte: moment().endOf("day").toDate(),
      },
    },
    orderBy: {
      status: "desc",
    },
  });
  const kehadiran = await prisma.users.findMany({
    where: {
      isActive: true,
    },
    include: {
      Absence: {
        where: {
          createdAt: {
            gte: moment().startOf("day").toDate(),
            lte: moment().endOf("day").toDate(),
          },
        },
      },
    },
  });

  return Response(200, "OK", {
    totalUser,
    totalTamu,
    tamuHariIni,
    kehadiran,
  });
};
