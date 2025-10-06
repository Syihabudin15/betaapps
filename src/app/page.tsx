"use client";
import { LockOutlined, LoginOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Form, Input } from "antd";
import "@ant-design/v5-patch-for-react-19";
import { useState } from "react";

export default function Home() {
  const [msg, setMsg] = useState<string>();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: { username: string; password: string }) => {
    if (!e.username || !e.password)
      console.log({ username: e.username, password: e.password });
    setLoading(true);
    await fetch("/api/auth", {
      method: "POST",
      body: JSON.stringify({ username: e.username, password: e.password }),
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.status === 200) {
          window && window.location.replace("/dashboard");
        } else {
          setMsg(res.msg);
        }
      })
      .catch((err) => {
        console.log(err);
        setMsg("Internal Server Error");
      });
    setLoading(false);
  };
  return (
    <div className="flex justify-around gap-5 items-center bg-gradient-to-br from-gray-50 to-blue-200">
      <div className="flex-2 hidden sm:flex items-center justify-center">
        <img src={"/images/beta-text.png"} alt="App Login Image" />
      </div>
      <div className="font-mono flex-1 m-5 p-5 bg-gray-50 rounded">
        <div>
          <div className="flex sm:hidden justify-center items-center">
            <img
              src={"/images/beta-notext.png"}
              alt="App Login Image"
              width={150}
            />
          </div>
          <p className="text-center font-bold text-xl  mb-8 mt-0.5 sm:mt-5">
            LOGIN TO BETA APPS
          </p>
          <Form
            layout="vertical"
            onChange={() => setMsg(undefined)}
            onFinish={handleSubmit}
          >
            <Form.Item
              label="Username"
              name={"username"}
              rules={[{ required: true, message: "Mohon lengkapi username!" }]}
            >
              <Input prefix={<UserOutlined />} />
            </Form.Item>
            <Form.Item
              label="Password"
              name={"password"}
              rules={[{ required: true, message: "Mohon lengkapi password!" }]}
            >
              <Input.Password prefix={<LockOutlined />} />
            </Form.Item>
            <div className="italic text-red-500 mt-4 text-xs">
              <p>{msg}</p>
            </div>
            <Button
              block
              type="primary"
              icon={<LoginOutlined />}
              className="my-5"
              htmlType="submit"
              loading={loading}
            >
              LOGIN
            </Button>
          </Form>
        </div>
      </div>
    </div>
  );
}
