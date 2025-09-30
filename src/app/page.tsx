"use client";
import { LockOutlined, LoginOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Form, Input } from "antd";

export default function Home() {
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
          <Form layout="vertical">
            <Form.Item label="Username" name={"username"}>
              <Input prefix={<UserOutlined />} />
            </Form.Item>
            <Form.Item label="Password" name={"password"}>
              <Input.Password prefix={<LockOutlined />} />
            </Form.Item>
            <Button
              block
              type="primary"
              icon={<LoginOutlined />}
              className="my-5"
            >
              LOGIN
            </Button>
          </Form>
        </div>
      </div>
    </div>
  );
}
