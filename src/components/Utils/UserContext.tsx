"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { IUserRole } from "../Pages/IInterfaces";

const userContext = createContext<IUserRole | undefined>(undefined);
export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<IUserRole>();
  const pathname = usePathname();

  const getData = () => {
    fetch("/api/auth")
      .then((res) => res.json())
      .then((res) => {
        if (res.status === 200) {
          setUser({
            id: res.data.id,
            name: res.data.name,
            username: res.data.username,
            password: "",
            email: res.data.email,
            face: res.data.face,
            phone: res.data.phone,
            nip: res.data.nip,
            absenceMethod: res.data.absenceMethod,
            isActive: res.data.isActive,

            createdAt: res.data.createdAt,
            updatedAt: res.data.updatedAt,
            Roles: res.data.Roles,
            rolesId: res.data.rolesId,
            principalSalary: res.data.principalSalary,
            positionsId: res.data.positionId,
            statusPTKP: res.data.statusPTKP,
          });
        } else {
          if (pathname !== "/") {
            window && window.location.replace("/");
          }
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };
  useEffect(() => {
    getData();
  }, []);

  return (
    <userContext.Provider value={user as IUserRole}>
      {children}
    </userContext.Provider>
  );
};

export const useUser = () => useContext(userContext);
