import prisma from "@/components/IPrisma";
import { Response } from "@/components/lib";
import moment from "moment-timezone";
import { NextRequest } from "next/server";

export const GET = async (req: NextRequest) => {
  const params = req.nextUrl.searchParams;
  const page = Number(params.get("page"));
  const pageSize = Number(params.get("pageSize"));
  const search = params.get("search");
  const usersId = params.get("usersId");
  const month = params.get("month") || moment().format("YYYY-MM");
  const skip = (page - 1) * pageSize;

  const data = await prisma.users.findMany({
    where: {
      isActive: true,
      ...(usersId && { id: usersId }),
      ...(search && {
        OR: [
          { name: { contains: search } },
          { nip: { contains: search } },
          { email: { contains: search } },
          { username: { contains: search } },
          { phone: { contains: search } },
        ],
      }),
    },
    include: {
      Absence: {
        where: {
          createdAt: {
            gte: moment(month).startOf("month").toDate(),
            lte: moment(month).endOf("month").toDate(),
          },
        },
      },
      Requester: {
        include: { Insentif: true, Approver: true },
        where: {
          createdAt: {
            gte: moment(month).startOf("month").toDate(),
            lte: moment(month).endOf("month").toDate(),
          },
        },
      },
      Positions: true,
    },
    take: pageSize,
    skip: skip,
  });

  const total = await prisma.users.count({
    where: {
      isActive: true,
      ...(usersId && { id: usersId }),
      ...(search && {
        OR: [
          { name: { contains: search } },
          { nip: { contains: search } },
          { email: { contains: search } },
          { username: { contains: search } },
          { phone: { contains: search } },
        ],
      }),
    },
  });

  return Response(200, "OK", data, total);
};
