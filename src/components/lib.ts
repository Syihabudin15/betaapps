import { NextResponse } from "next/server";

export const Response = (
  status: number,
  msg: string,
  data?: any,
  total?: number
) => {
  return NextResponse.json({ status, msg, data, total }, { status });
};

export const GenerateQueries = (
  page: number,
  pageSize: number,
  filters: { key: string; value: any }[]
) => {
  return `page=${page}&pageSize=${pageSize}${filters
    .map((f) => `&${f.key}=${f.value}`)
    .join("")}`;
};
