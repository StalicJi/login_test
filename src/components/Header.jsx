"use client";

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

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();

  const handleNotMemberClick = () => {
    router.push("/Register");
  };

  const isHomePage = pathname === "/";

  const formSchema = z.object({
    emailAddress: z
      .string({ required_error: "不得為空" })
      .email({ message: "請輸入有效格式" }),
    password: z.string().min(1, { message: "請輸入密碼" }),
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      emailAddress: "",
      password: "",
    },
  });

  const handleSubmit = async (formData) => {
    try {
      const response = await axios.post(apiLogin, formData);
      console.log(response);

      if (response.data.message === "NoAccount") {
        // console.log("查無帳號");
        const isValidEmail = formData.emailAddress === "";
        if (!isValidEmail) {
          form.setError("emailAddress", { message: "無此使用者" });
        }
      } else if (response.data.message === "WrongPSW") {
        // console.log("密碼錯誤");
        const isValidPassword = formData.password === "";
        if (!isValidPassword) {
          form.setError("password", { message: "密碼錯誤" });
        }
      } else {
        console.log("登入成功");
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="bg-gray-600 text-white p-4 flex justify-between items-center">
      <a href="/">
        <h1>訪客，您好</h1>
      </a>
      {isHomePage && (
        <Dialog>
          <DialogTrigger onClick={() => form.reset()}>登入</DialogTrigger>
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
                <div className="flex gap-4 justify-end">
                  <Button type="submit" className="max-w-48">
                    登入
                  </Button>

                  <DialogClose asChild>
                    <Button
                      className="max-w-48"
                      type="button"
                      onClick={() => form.reset()}
                    >
                      取消
                    </Button>
                  </DialogClose>
                </div>
              </form>
            </Form>
            <DialogFooter>
              <div className="flex gap-4 w-full justify-end text-xs">
                <p>忘記密碼</p>
                <DialogClose>
                  <p
                    className="hover:text-purple-500"
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
    </div>
  );
}
