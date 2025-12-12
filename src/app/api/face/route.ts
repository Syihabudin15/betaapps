import prisma from "@/components/IPrisma";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  const { id, image } = await req.json();

  if (!id || !image) {
    return NextResponse.json(
      { msg: "ID atau image tidak terdeteksi!", status: 400 },
      { status: 400 }
    );
  }

  await prisma.users.update({
    where: { id },
    data: { face: JSON.stringify(image) },
  });

  return NextResponse.json(
    {
      msg: "Face Regcognition berhasil di daftarkan",
      status: 201,
      face: JSON.stringify(image),
    },
    { status: 201 }
  );
};

export const PUT = async (req: NextRequest) => {
  const { id, image } = await req.json();

  if (!id || !image) {
    return NextResponse.json(
      { msg: "ID atau image tidak terdeteksi!", status: 400 },
      { status: 400 }
    );
  }

  const user = await prisma.users.findFirst({ where: { id } });
  if (!user || !user.face) {
    return NextResponse.json(
      { msg: "User id tidak ditemukan!", status: 400 },
      { status: 400 }
    );
  }

  // Load gambar menggunakan canvas
  const storedDescriptor = JSON.parse(user.face);
  const distance = compareFaces(image, storedDescriptor, 0.6);
  console.log({ image: image, storedDescriptor, distance });

  if (distance) {
    return NextResponse.json(
      { msg: "User berhasil diverifikasi", status: 201 },
      { status: 201 }
    );
  } else {
    return NextResponse.json(
      { msg: "Face Regcognition gagal diverifikasi", status: 401 },
      { status: 401 }
    );
  }
};

const compareFaces = (
  d1: Float32Array,
  d2: Float32Array,
  dis: number = 0.6
): boolean => {
  const distance = Math.sqrt(
    d1.reduce((acc, val, i) => acc + (val - d2[i]) ** 2, 0)
  );
  return distance < dis ? true : false;
};
