import prisma from "@/components/IPrisma";
import { Response } from "@/components/lib";
import { GBookStatus } from "@prisma/client";
import moment from "moment-timezone";
import { NextRequest } from "next/server";

export const GET = async (req: NextRequest) => {
  try {
    const tamu = await prisma.guestBook.count({
      where: {
        isActive: true,
        status: GBookStatus.WILLCOME,
        createdAt: {
          gte: moment().startOf("day").toDate(),
          lte: moment().endOf("day").toDate(),
        },
      },
    });
    const permitInsentif = await prisma.permitApps.count({
      where: {
        isActive: true,
        status: "PENDING",
        insentifId: { not: null },
        createdAt: {
          gte: moment().startOf("day").toDate(),
          lte: moment().endOf("day").toDate(),
        },
      },
    });
    const permitAbsence = await prisma.permitApps.count({
      where: {
        isActive: true,
        status: "PENDING",
        absenceStatus: { not: null },
        createdAt: {
          gte: moment().startOf("day").toDate(),
          lte: moment().endOf("day").toDate(),
        },
      },
    });
    return Response(200, "OK", { tamu, permitInsentif, permitAbsence });
  } catch (err) {
    console.log(err);
    return Response(500, "Internal Server Error");
  }
};
