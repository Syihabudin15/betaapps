"use client";

import {
  DoubleLeftOutlined,
  DoubleRightOutlined,
  MenuOutlined,
} from "@ant-design/icons";
import { App, Button, ConfigProvider, Menu } from "antd";
import { IAbsence, INotif, Logout, MenuItems } from "./Utils";
import { useState } from "react";
import { useRouter } from "next/navigation";
import "@ant-design/v5-patch-for-react-19";
import Image from "next/image";
import { UserProvider, useUser } from "./Utils/UserContext";
import { getMenuItems } from "./Utils/Utils";

export default function ILayout({ children }: { children: React.ReactNode }) {
  const [collapse, setCollapse] = useState(true);
  const router = useRouter();

  return (
    <App>
      <ConfigProvider
        theme={{
          token: {
            // font default untuk komponen antd
            fontFamily: `var(--font-geist-mono), sans-serif`,
          },
        }}
      >
        <UserProvider>
          <div className="font-mono">
            <div className="bg-gradient-to-br from-green-400 to-blue-300 text-gray-50 p-3 flex justify-between gap-5 items-center">
              <div className="flex items-center gap-1 font-bold">
                <Image
                  src={"/images/beta-notext.png"}
                  alt="Beta No Text Image"
                  width={30}
                  height={30}
                />
                <p>BETA APPS</p>
              </div>
              <div className="hidden sm:flex gap-2 items-center text-xs">
                <INotif />
                <Logout />
              </div>
              <div className="block sm:hidden">
                <Button icon={<MenuOutlined />}></Button>
              </div>
            </div>
            <div className="flex gap-1">
              <div className="bg-gradient-to-br from-green-400 to-blue-300 text-gray-50 hidden sm:block h-[91vh]">
                <div
                  className={`flex ${
                    collapse ? "justify-center" : "justify-end"
                  } p-1`}
                >
                  <Button
                    icon={
                      collapse ? (
                        <DoubleRightOutlined />
                      ) : (
                        <DoubleLeftOutlined />
                      )
                    }
                    onClick={() => setCollapse(!collapse)}
                  ></Button>
                </div>
                <MyMenu collapse={collapse} />
              </div>
              <div className="min-w-96">{children}</div>
            </div>
          </div>
          <IAbsence />
        </UserProvider>
      </ConfigProvider>
    </App>
  );
}

const MyMenu = ({ collapse }: { collapse: boolean }) => {
  const router = useRouter();
  const user = useUser();
  return (
    <Menu
      mode="inline"
      style={{
        backgroundColor: "transparent",
        // minHeight: "90vh",
        // overflowX: "scroll",
      }}
      theme="dark"
      inlineCollapsed={collapse}
      onClick={(e) => router.push(e.key)}
      items={getMenuItems(user ? user.Roles.permissions : "[]")}
    />
  );
};
