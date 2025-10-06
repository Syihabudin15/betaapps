import { Metadata } from "next";
import UpdateRole from "./util";

export const metadata: Metadata = { title: "Update Role" };

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <div>
      <UpdateRole id={id} />
    </div>
  );
}
