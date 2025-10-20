"use client";
import { Document, Page, PDFViewer, Text, View } from "@react-pdf/renderer";
import { createTw } from "react-pdf-tailwind";
import { IReport } from "../Pages/IInterfaces";
import { IDRFormat } from "../Utils/Services";
import moment from "moment-timezone";
import { AllowanceList, AppsConfig, DeductionList } from "@prisma/client";
import {
  GetDailyActivities,
  GetPTKP,
  HitungPPh21,
  IDailyActivity,
  ILiburNasional,
  PTKP,
} from "../lib";
import { useEffect, useState } from "react";

const tw = createTw({
  colors: {
    custom: "#bada55",
  },
});

export default function MonthlyReport({
  data,
  month,
  holidays,
  appsConfig,
}: {
  data: IReport;
  month: string;
  holidays: ILiburNasional[];
  appsConfig: AppsConfig;
}) {
  const [dailyActivities, setDailyActivities] = useState<IDailyActivity[]>([]);
  const [allowances, setAllowances] = useState<AllowanceList[]>([]);
  const [deductions, setDeductions] = useState<DeductionList[]>([]);

  const positionAllowance =
    data.Positions.allowanceType === "NOMINAL"
      ? data.Positions.allowance
      : data.principalSalary * (data.Positions.allowance / 100);
  const totalPerdin = data.Absence.reduce(
    (sum, item) => sum + item.perdinAllowance,
    0
  );
  const tunjangan = allowances.reduce((sum, item) => {
    const temp =
      item.allowanceType === "NOMINAL"
        ? item.allowance
        : data.principalSalary * (item.allowance / 100);
    return sum + temp;
  }, 0);
  const totallembur = data.Absence.reduce(
    (sum, item) => sum + item.lemburAllowance,
    0
  );
  const potTelat = data.Absence.reduce(
    (sum, item) => sum + item.lateDeduction,
    0
  );
  const potPulangCepat = data.Absence.reduce(
    (sum, item) => sum + item.fastLeaveDeduction,
    0
  );
  const potongan = deductions.reduce((sum, item) => {
    const temp =
      item.deductionType === "NOMINAL"
        ? item.deduction
        : data.principalSalary * (item.deduction / 100);
    return sum + temp;
  }, 0);
  const potAlpha =
    dailyActivities.filter((d) => !d.isRedDate && !d.Absence).length *
    appsConfig.alphaDeduction;
  const insentif = data.Requester.filter((d) => d.insentifId !== null).reduce(
    (sum, item) => sum + item.nominal,
    0
  );

  const bruto = data.principalSalary + positionAllowance + tunjangan;
  const biayaJabatan = bruto * (5 / 100) > 500000 ? 500000 : bruto * (5 / 100);
  const bpjsketenagakerjaan = bruto * (2 / 100);
  const bpjskesehatan = bruto * (1 / 100);
  const netto = bruto - (biayaJabatan + bpjskesehatan + bpjsketenagakerjaan);
  const ptkp = GetPTKP(data.statusPTKP);
  const pajak =
    netto * 12 > ptkp ? Math.round(HitungPPh21(netto * 12 - ptkp) / 12) : 0;

  useEffect(() => {
    (async () => {
      const dailies = GetDailyActivities(month, data, holidays);
      setDailyActivities(dailies);
      await fetch("/api/allowance?page=1&pageSize=100")
        .then((res) => res.json())
        .then((res) => setAllowances(res.data));
      await fetch("/api/deduction?page=1&pageSize=100")
        .then((res) => res.json())
        .then((res) => setDeductions(res.data));
    })();
  }, []);

  return (
    <PDFViewer className="w-full h-[80vh]">
      <Document style={{ ...tw("text-xs"), lineHeight: 1 }}>
        <Page size={"A4"} style={tw("p-8")}>
          <View style={tw("text-center my-8 font-bold")}>
            <Text style={tw("text-xl")}>
              MONTHLY REPORT {data.name.toUpperCase()}
            </Text>
            <Text>
              PERIODE {moment(month).format("MMMM").toUpperCase()}{" "}
              {moment(month).format("YYYY")}
            </Text>
          </View>
          <View style={tw("my-10 flex flex-col gap-5")}>
            <View style={tw("flex flex-row gap-2")}>
              <Text style={tw("w-36")}>NIP</Text>
              <Text style={tw("w-4")}>:</Text>
              <Text>{data.nip}</Text>
            </View>
            <View style={tw("flex flex-row gap-2")}>
              <Text style={tw("w-36")}>Nama Lengkap</Text>
              <Text style={tw("w-4")}>:</Text>
              <Text>{data.name}</Text>
            </View>
            <View style={tw("flex flex-row gap-2")}>
              <Text style={tw("w-36")}>Jabatan</Text>
              <Text style={tw("w-4")}>:</Text>
              <Text>{data.Positions.name}</Text>
            </View>
            <View style={tw("flex flex-row gap-2")}>
              <Text style={tw("w-36")}>No Telepon</Text>
              <Text style={tw("w-4")}>:</Text>
              <Text>{data.phone}</Text>
            </View>
            <View style={tw("flex flex-row gap-2 font-bold")}>
              <Text style={tw("w-36")}>Total Gaji</Text>
              <Text style={tw("w-4")}>:</Text>
              <Text>
                Rp.{" "}
                {IDRFormat(
                  data.principalSalary +
                    positionAllowance +
                    totalPerdin +
                    totallembur +
                    insentif +
                    tunjangan -
                    (potTelat + potPulangCepat + potongan + pajak + potAlpha)
                )}
              </Text>
            </View>
          </View>
          <View style={tw("flex flex-row gap-4 my-4 border-t pt-4")}>
            <View style={tw("flex-1 flex gap-5")}>
              <Text style={tw("font-bold")}>PENGHASILAN (A)</Text>
              <View style={tw("flex flex-row gap-2")}>
                <Text style={tw("w-36")}>Gaji Pokok</Text>
                <Text style={tw("w-4")}>:</Text>
                <Text>Rp. {IDRFormat(data.principalSalary)}</Text>
              </View>
              <View style={tw("flex flex-row gap-2")}>
                <Text style={tw("w-36")}>Tunjangan Jabatan</Text>
                <Text style={tw("w-4")}>:</Text>
                <Text>Rp. {IDRFormat(positionAllowance)}</Text>
              </View>
              {allowances &&
                allowances.map((a) => (
                  <View style={tw("flex flex-row gap-2")} key={a.id}>
                    <Text style={tw("w-36")}>{a.name}</Text>
                    <Text style={tw("w-4")}>:</Text>
                    <Text>
                      Rp.{" "}
                      {IDRFormat(
                        a.allowanceType === "NOMINAL"
                          ? a.allowance
                          : data.principalSalary * (a.allowance / 100)
                      )}
                    </Text>
                  </View>
                ))}
              <View style={tw("flex flex-row gap-2")}>
                <Text style={tw("w-36")}>Insentif Perdin</Text>
                <Text style={tw("w-4")}>:</Text>
                <Text>Rp. {IDRFormat(totalPerdin)}</Text>
              </View>
              <View style={tw("flex flex-row gap-2")}>
                <Text style={tw("w-36")}>Insentif Lembur</Text>
                <Text style={tw("w-4")}>:</Text>
                <Text>Rp. {IDRFormat(totallembur)}</Text>
              </View>
              {data.Requester &&
                data.Requester.filter((d) => d.insentifId !== null).map((a) => (
                  <View style={tw("flex flex-row gap-2")} key={a.id}>
                    <Text style={tw("w-36")}>{a.Insentif?.name}</Text>
                    <Text style={tw("w-4")}>:</Text>
                    <Text>Rp. {IDRFormat(a.nominal)}</Text>
                  </View>
                ))}
            </View>
            <View style={tw("flex-1 flex gap-5")}>
              <Text style={tw("font-bold")}>POTONGAN (B)</Text>
              <View style={tw("flex flex-row gap-2")}>
                <Text style={tw("w-36")}>Pot. Telat</Text>
                <Text style={tw("w-4")}>:</Text>
                <Text>Rp. {IDRFormat(potTelat)}</Text>
              </View>
              <View style={tw("flex flex-row gap-2")}>
                <Text style={tw("w-36")}>Pot. Pulang Lebih Awal</Text>
                <Text style={tw("w-4")}>:</Text>
                <Text>Rp. {IDRFormat(potPulangCepat)}</Text>
              </View>
              {deductions &&
                deductions.map((a) => (
                  <View style={tw("flex flex-row gap-2")} key={a.id}>
                    <Text style={tw("w-36")}>{a.name}</Text>
                    <Text style={tw("w-4")}>:</Text>
                    <Text>
                      Rp.{" "}
                      {IDRFormat(
                        a.deductionType === "NOMINAL"
                          ? a.deduction
                          : data.principalSalary * (a.deduction / 100)
                      )}
                    </Text>
                  </View>
                ))}
              <View style={tw("flex flex-row gap-2")}>
                <Text style={tw("w-36")}>Pot Alpha</Text>
                <Text style={tw("w-4")}>:</Text>
                <Text>Rp. {IDRFormat(potAlpha)}</Text>
              </View>
              <View style={tw("flex flex-row gap-2")}>
                <Text style={tw("w-36")}>PPh21</Text>
                <Text style={tw("w-4")}>:</Text>
                <Text>Rp. {IDRFormat(pajak)}</Text>
              </View>
            </View>
          </View>
          <View style={tw("flex flex-row gap-4 my-4")}>
            <View style={tw("flex-1 flex gap-4")}>
              <View style={tw("flex flex-row gap-2 font-bold")}>
                <Text style={tw("w-36")}>TOTAL (A)</Text>
                <Text style={tw("w-4")}>:</Text>
                <Text>
                  Rp.{" "}
                  {IDRFormat(
                    data.principalSalary +
                      positionAllowance +
                      totalPerdin +
                      totallembur +
                      tunjangan +
                      insentif
                  )}
                </Text>
              </View>
            </View>
            <View style={tw("flex-1 flex gap-4")}>
              <View style={tw("flex flex-row gap-2 font-bold")}>
                <Text style={tw("w-36")}>TOTAL (B)</Text>
                <Text style={tw("w-4")}>:</Text>
                <Text>
                  Rp.{" "}
                  {IDRFormat(
                    potTelat + potPulangCepat + potongan + pajak + potAlpha
                  )}
                </Text>
              </View>
            </View>
          </View>
          <View style={tw("flex flex-row justify-end p-10 mt-5")}>
            <View style={{ ...tw("w-40 flex flex-col gap-30"), lineHeight: 5 }}>
              <Text>...................,.............................</Text>
              <Text style={tw("border-b")}></Text>
            </View>
          </View>
          <View
            style={{
              ...tw("flex flex-row gap-4"),
              fontSize: 7,
              color: "#bbb",
              marginTop: 40,
            }}
          >
            <View
              style={{
                lineHeight: 0.5,
                flex: 1,
              }}
            >
              <Text style={tw("font-bold")}>Analisa Perhitungan PPh21</Text>
              <View style={tw("flex flex-row gap-2")}>
                <Text style={tw("w-36")}>Status PTKP</Text>
                <Text style={tw("w-5")}>:</Text>
                <Text>{data.statusPTKP}</Text>
              </View>
              <View style={tw("flex flex-row gap-2")}>
                <Text style={tw("w-36")}>Bruto</Text>
                <Text style={tw("w-5")}>:</Text>
                <Text>Rp. {IDRFormat(bruto)}</Text>
              </View>
              <View style={tw("flex flex-row gap-2")}>
                <Text style={tw("w-36")}>Biaya Jabatan</Text>
                <Text style={tw("w-5")}>:</Text>
                <Text>- Rp. {IDRFormat(biayaJabatan)}</Text>
              </View>
              <View style={tw("flex flex-row gap-2")}>
                <Text style={tw("w-36")}>Biaya BPJS Ketenagakerjaan</Text>
                <Text style={tw("w-5")}>:</Text>
                <Text>- Rp. {IDRFormat(bpjsketenagakerjaan)}</Text>
              </View>
              <View style={tw("flex flex-row gap-2")}>
                <Text style={tw("w-36")}>Biaya BPJS Kesehatan</Text>
                <Text style={tw("w-5")}>:</Text>
                <Text>- Rp. {IDRFormat(bpjskesehatan)}</Text>
              </View>
              <View style={tw("flex flex-row gap-2")}>
                <Text style={tw("w-36")}>Netto</Text>
                <Text style={tw("w-5")}>:</Text>
                <Text>Rp. {IDRFormat(netto)}</Text>
              </View>
              <View style={tw("flex flex-row gap-2")}>
                <Text style={tw("w-36")}>PPh21</Text>
                <Text style={tw("w-5")}>:</Text>
                <Text>Rp. {IDRFormat(pajak)}</Text>
              </View>
            </View>
            <View style={{ ...tw("flex-1"), lineHeight: 0.5 }}>
              <Text style={tw("font-bold")}>Detail</Text>
              <Text>
                PKP : Netto Tahunan ({IDRFormat(netto * 12)}) - PTKP{" "}
                {data.statusPTKP} ({IDRFormat(ptkp)}) = Rp.{" "}
                {IDRFormat(netto * 12 - ptkp)}
              </Text>
              <Text>
                Jika PKP kurang dari 0 maka tidak dikenakan pajak. dan jika
                sebaliknya, maka akan dikenakan pajak sesuai dengan status PTKP
                user.
              </Text>
              {Object.entries(PTKP).map((value) => (
                <View key={value[0]} style={tw("flex flex-row gap-2")}>
                  <Text style={tw("w-10")}>{value[0]}</Text>
                  <Text>:</Text>
                  <Text> {IDRFormat(value[1] as number)}</Text>
                </View>
              ))}
            </View>
          </View>
        </Page>
        {/* PAGE 2 LAMPIRAN */}
        <Page size={"A4"} orientation="landscape" style={tw("p-4")}>
          <View style={tw("font-bold text-center  my-4")}>
            <Text style={tw("text-xl")}>
              DAILY ACTIVITY {data.name.toUpperCase()}
            </Text>
            <Text>PERIODE {moment(month).format("MMMM").toUpperCase()}</Text>
          </View>
          <View style={tw("flex flex-row gap-2 flex-wrap my-4")}>
            {dailyActivities &&
              dailyActivities.map((d) => (
                <View
                  key={d.date}
                  style={{
                    ...tw("flex flex-col w-44 m-2 justify-center"),
                    lineHeight: 0.2,
                  }}
                >
                  <Text
                    style={tw(
                      `text-center font-bold text-sm underline ${
                        d.isRedDate ? "text-red-500" : ""
                      }`
                    )}
                  >
                    {d.date}
                  </Text>
                  <Text style={tw("text-center font-bold")}>
                    {d.Absence ? d.Absence.absenceStatus : "ALPHA"}
                  </Text>
                  <View style={tw("flex flex-row gap-2 my-1")}>
                    <Text style={tw("w-28")}>Pot Terlambat</Text>
                    <Text>:</Text>
                    <Text>
                      {IDRFormat(d.Absence ? d.Absence.lateDeduction : 0)}
                    </Text>
                  </View>
                  <View style={tw("flex flex-row gap-2 my-1")}>
                    <Text style={tw("w-28")}>Pot Pulang Cepat</Text>
                    <Text>:</Text>
                    <Text>
                      {IDRFormat(d.Absence ? d.Absence.fastLeaveDeduction : 0)}
                    </Text>
                  </View>
                  <View style={tw("flex flex-row gap-2 my-1")}>
                    <Text style={tw("w-28")}>Insentif Lembur</Text>
                    <Text>:</Text>
                    <Text>
                      {IDRFormat(d.Absence ? d.Absence.lemburAllowance : 0)}
                    </Text>
                  </View>
                  <View style={tw("flex flex-row gap-2 my-1")}>
                    <Text style={tw("w-28")}>Insentif Perdin</Text>
                    <Text>:</Text>
                    <Text>
                      {IDRFormat(d.Absence ? d.Absence.perdinAllowance : 0)}
                    </Text>
                  </View>
                </View>
              ))}
          </View>
        </Page>
      </Document>
    </PDFViewer>
  );
}
