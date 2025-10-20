import { Absence } from "@prisma/client";
import moment from "moment-timezone";
import { NextResponse } from "next/server";
import { IPermitAbsence, IReport } from "./Pages/IInterfaces";

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

export async function GetLiburNasional(year: string, month: string) {
  let liburNasional: ILiburNasional[] = [];

  try {
    const res = await fetch(
      `https://api-harilibur.vercel.app/api?month=${month}&year=${year}`
    );
    const data: ILiburNasional[] = await res.json();
    liburNasional = data.filter((d) => d.is_national_holiday === true);
  } catch (err: any) {
    console.error("❌ Gagal fetch data libur nasional:", err.message);
  }

  return liburNasional;
}

export function GetLiburWeekend(datestr: string) {
  // const monthStr = month.toString().padStart(2, "0");
  const daysInMonth = moment(datestr).daysInMonth();
  const weekends: ILiburNasional[] = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const date = moment(`${datestr}-${day}`, "YYYY-MM-DD");
    const dow = date.day(); // 0 = Minggu, 6 = Sabtu
    if (dow === 0 || dow === 6) {
      weekends.push({
        holiday_date: date.format("YYYY-MM-DD"),
        holiday_name: "Weekend",
        is_national_holiday: true,
      });
    }
  }

  return weekends;
}

// utils/getDistance.ts

export function GetDistanceInMeters(
  homeLat: number,
  homeLon: number,
  userLat: number,
  userLon: number
): number {
  const R = 6371000; // radius bumi dalam meter
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(userLat - homeLat);
  const dLon = toRad(userLon - homeLon);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(homeLat)) *
      Math.cos(toRad(userLat)) *
      Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

export interface ILiburNasional {
  holiday_date: string;
  holiday_name: string;
  is_national_holiday: boolean;
}

export const PTKP: any = {
  TK: 54000000,
  "TK/0": 54000000,
  "K/0": 58500000,
  "K/1": 63000000,
  "K/2": 67500000,
  "K/3": 72000000,
};

export function GetPTKP(status: string) {
  return PTKP[status] || 54000000;
}

export function HitungPPh21(pkptahunan: number) {
  let pajak = 0;
  if (pkptahunan <= 60000000) pajak = pkptahunan * 0.05;
  else if (pkptahunan <= 250000000)
    pajak = 60000000 * 0.05 + (pkptahunan - 60000000) * 0.15;
  else if (pkptahunan <= 500000000)
    pajak =
      60000000 * 0.05 + 190000000 * 0.15 + (pkptahunan - 250000000) * 0.25;
  else if (pkptahunan <= 5000000000)
    pajak =
      60000000 * 0.05 +
      190000000 * 0.15 +
      250000000 * 0.25 +
      (pkptahunan - 500000000) * 0.3;
  else
    pajak =
      60000000 * 0.05 +
      190000000 * 0.15 +
      250000000 * 0.25 +
      4500000000 * 0.3 +
      (pkptahunan - 5000000000) * 0.35;
  return pajak;
}

export interface IDailyActivity {
  date: string;
  isRedDate: boolean;
  Absence: Absence | null;
  RequesterAbsence: IPermitAbsence[];
  RequesterInsentif: IPermitAbsence[];
}
export function GetDailyActivities(
  month: string,
  data: IReport,
  holidaysParams: ILiburNasional[]
) {
  const start = moment(month).startOf("month"); // bulan dimulai dari 0
  const end = moment(start).endOf("month");
  const holidays = [...holidaysParams];
  const dates: IDailyActivity[] = [];

  for (let m = moment(start); m.isSameOrBefore(end); m.add(1, "day")) {
    const filterAbsence = data.Absence.find((f) =>
      moment(f.createdAt).isSame(m, "day")
    );
    const filterRAbsence = data.Requester.filter(
      (f) => f.insentifId === null && moment(f.createdAt).isSame(m, "day")
    );
    const filterRInsentif = data.Requester.filter(
      (f) => f.insentifId !== null && moment(f.createdAt).isSame(m, "day")
    );
    dates.push({
      date: m.format("DD/MM/YYYY"),
      isRedDate: holidays.some((d) => m.isSame(moment(d.holiday_date), "day")),
      Absence: filterAbsence || null,
      RequesterAbsence: filterRAbsence,
      RequesterInsentif: filterRInsentif,
    });
  }

  return dates;
}
