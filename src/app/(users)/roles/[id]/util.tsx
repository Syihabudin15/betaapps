"use client";

import { UpsertRole } from "@/components/Pages";
import { useEffect, useState } from "react";

export default function UpdateRole({ id }: { id: string }) {
  const [role, setRole] = useState();

  useEffect(() => {
    (async () => {
      await fetch("/api/roles?id=" + id, { method: "PATCH" })
        .then((res) => res.json())
        .then((res) => {
          setRole(res.data);
          console.log(res);
        });
    })();
  }, [id]);
  return <div>{role && <UpsertRole role={role} />}</div>;
}
