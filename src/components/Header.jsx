"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRouter, usePathname } from "next/navigation";
import axios from "axios";
import { apiLogin } from "../../api/apiController";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import photo1 from "../../public/123.png";

export default function Header() {
  const [username, setUsername] = useState("");
  const [userStatus, setUserStatus] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [lockMessage, setLockMessage] = useState(null);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  const router = useRouter();
  const pathname = usePathname();

  const handleNotMemberClick = () => {
    router.push("/Register");
  };

  const isHomePage = pathname === "/";

  //客戶端渲染
  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    const storedUserStatus = localStorage.getItem("userStatus");
    if (storedUsername && storedUserStatus) {
      setUsername(storedUsername);
      setUserStatus(storedUserStatus);
    }
  }, []);

  const handleLoginSuccess = (username, userStatus) => {
    setUsername(username);
    setUserStatus(userStatus);
    localStorage.setItem("username", username);
    localStorage.setItem("userStatus", userStatus);
  };

  const formSchema = z.object({
    emailAddress: z
      .string({ required_error: "不得為空" })
      .email({ message: "請輸入有效格式" }),
    password: z.string().min(1, { message: "請輸入密碼" }),
    verificationCode: z.string().length(6, { message: "請輸入六位數驗證碼" }),
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      emailAddress: "",
      password: "",
      verificationCode: "",
    },
  });

  const handleSubmit = async (formData) => {
    try {
      if (
        formData.verificationCode.toLowerCase() !==
        verificationCode.toLowerCase()
      ) {
        form.setError("verificationCode", { message: "驗證碼不正確" });
        return;
      }

      const response = await axios.post(apiLogin, formData);
      // console.log(response);

      //查無帳號(email)邏輯
      if (response.data.message === "NoAccount") {
        const isValidEmail = formData.emailAddress === "";
        if (!isValidEmail) {
          form.setError("emailAddress", { message: "無此使用者" });
        }
        //密碼錯誤邏輯
      } else if (response.data.message === "WrongPSW") {
        const loginCount = response.data.login_count;
        if (loginCount > 0 && loginCount < 4) {
          setLockMessage(`連續密碼錯誤3次,將鎖定10秒鐘 (錯誤${loginCount}次)`);
        }
        if (loginCount >= 3) {
          setLockMessage("帳號鎖定,禁止登入10秒");
          setIsButtonDisabled(true);

          const timeoutId = setTimeout(() => {
            setLockMessage(null);
            setIsButtonDisabled(false);
          }, 10000);

          return () => clearTimeout(timeoutId);
        }
        const isValidPassword = formData.password === "";
        if (!isValidPassword) {
          form.setError("password", { message: "密碼錯誤" });
        }
        //登入成功邏輯
      } else {
        // setUsername(response.data.username);
        // setUserStatus(response.data.userStatus);
        handleLoginSuccess(response.data.username, response.data.userStatus);
        window.location.reload();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const logout = () => {
    setUsername("");
    setUserStatus("");
    localStorage.removeItem("username");
    localStorage.removeItem("userStatus");

    window.location.reload();
  };

  const generateVerificationCode = () => {
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let code = "";
    for (let i = 0; i < 6; i++) {
      const index = Math.floor(Math.random() * characters.length);
      code += characters[index];
    }
    return code;
  };

  const updateCode = () => {
    setTimeout(() => {
      setVerificationCode(generateVerificationCode());
    }, 500);
  };

  const formReset = () => {
    form.reset();
    setVerificationCode(generateVerificationCode());
  };

  return (
    <div className="bg-gray-600 text-white p-4 flex justify-between items-center">
      <a href="/">
        <h1>{username ? `${username}，您好` : "訪客，您好"}</h1>
      </a>
      {isHomePage && (
        <>
          {userStatus === "1" ? (
            <button onClick={logout}>登出</button>
          ) : (
            <Dialog>
              <DialogTrigger onClick={formReset}>登入</DialogTrigger>
              <DialogContent className="py-10">
                <DialogTitle> 會員登入</DialogTitle>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(handleSubmit)}
                    className="max-w-lg w-full flex flex-col gap-4"
                  >
                    <FormField
                      control={form.control}
                      name="emailAddress"
                      render={({ field }) => {
                        return (
                          <FormItem>
                            <FormLabel>電子信箱</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="輸入帳號"
                                type="email"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        );
                      }}
                    />
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => {
                        return (
                          <FormItem>
                            <FormLabel className="flex justify-between">
                              密碼
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="需英文大小寫、數字、特殊符號,不能包含您的帳號名稱,共12碼"
                                type="password"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        );
                      }}
                    />
                    <FormField
                      control={form.control}
                      name="verificationCode"
                      render={({ field }) => {
                        return (
                          <div className="flex flex-col w-52 gap-4 justify-end">
                            <FormItem className="">
                              <FormLabel className="flex justify-between">
                                驗證碼
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="輸入驗證碼"
                                  type="text"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                            <div className="w-full flex items-start">
                              <div className="w-full h-12 flex ">
                                <Image
                                  src={photo1}
                                  className="object-fill"
                                  width={200}
                                  priority
                                  alt="驗證背景圖"
                                />
                              </div>
                              <div className=" flex justify-center items-center p-2 absolute">
                                <p className="text-3xl text-rose-700 relative top-0 left-5 font-bold opacity-70 select-none">
                                  {verificationCode}
                                </p>
                              </div>
                              <button
                                type="button"
                                className="pl-1 z-10"
                                onClick={updateCode}
                              >
                                re
                              </button>
                            </div>
                          </div>
                        );
                      }}
                    />
                    <div>
                      <p className="text-red-500">{lockMessage}</p>
                    </div>
                    <div className="flex gap-4 justify-end">
                      <Button
                        type="submit"
                        className="max-w-48 select-none"
                        disabled={isButtonDisabled}
                      >
                        登入
                      </Button>

                      <DialogClose asChild>
                        <Button
                          className="max-w-48 select-none"
                          type="button"
                          onClick={formReset}
                        >
                          取消
                        </Button>
                      </DialogClose>
                    </div>
                  </form>
                </Form>
                <DialogFooter>
                  <div className="flex gap-4 w-full justify-end text-xs select-none">
                    <p>忘記密碼</p>
                    <DialogClose>
                      <p
                        className="hover:text-purple-500 select-none"
                        onClick={handleNotMemberClick}
                      >
                        加入會員
                      </p>
                    </DialogClose>
                  </div>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </>
      )}
    </div>
  );
}
