"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { apiUpdateUser } from "../../../api/apiController";
import axios from "axios";

const formSchema = z
  .object({
    username: z.string({ required_error: "不得為空" }),
    emailAddress: z
      .string({ required_error: "不得為空" })
      .email({ message: "請輸入有效格式" }),
    password: z.string({ required_error: "不得為空" }).length(4, {
      message: "最少必須有12個字元",
    }),
    passwordConfirm: z.string({ required_error: "不得為空" }),
  })
  .refine(
    (data) => {
      return data.password === data.passwordConfirm;
    },
    {
      message: "密碼驗證不正確",
      path: ["passwordConfirm"],
    }
  );

export default function Register() {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      emailAddress: "",
      password: "",
      passwordConfirm: "",
      z,
    },
  });

  const handleSubmit = async (formData) => {
    try {
      const response = await axios.post(apiUpdateUser, formData);
      if (response.status === 201) {
        console.log("註冊成功");
        form.reset();
        window.location.href = "/";
      } else {
        console.error("註冊失敗");
      }
    } catch (error) {
      if (error.response && error.response.status === 400) {
        form.setError("emailAddress", {
          type: "server",
          message: "此電子信箱已經被注冊過",
        });
      } else {
        console.error("註冊失敗", error);
      }
    }
  };

  const handleCancel = (e) => {
    e.preventDefault();
    window.location.href = "/";
    form.reset();
  };

  return (
    <div className="absolute left-[50%] top-[50%] grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4  bg-background p-6 duration-200 sm:rounded-lg">
      <h1 className="font-bold text-2xl">加入會員</h1>
      <div className="border shadow-lg p-6">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="max-w-lg w-full flex flex-col gap-4"
          >
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => {
                return (
                  <FormItem>
                    <FormLabel>姓名</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="輸入使用者名稱"
                        type="text"
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
              name="emailAddress"
              render={({ field }) => {
                return (
                  <FormItem>
                    <FormLabel>電子信箱</FormLabel>
                    <FormControl>
                      <Input placeholder="輸入帳號" type="email" {...field} />
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
                    <FormLabel>密碼</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="英文大小寫、數字、特殊符號,不包含您的帳號名稱,共12碼"
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
              name="passwordConfirm"
              render={({ field }) => {
                return (
                  <FormItem>
                    <FormLabel>密碼驗證</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="再輸入一次密碼"
                        type="password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
            <div className="flex gap-4 justify-end">
              <Button type="submit" className="max-w-48">
                註冊
              </Button>

              <Button className="max-w-48" onClick={handleCancel}>
                取消
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
