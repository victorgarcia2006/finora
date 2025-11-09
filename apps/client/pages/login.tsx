import React from "react";
import Head from "next/head";
import { Card, Input, Button } from "@mantine/core";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Link from "next/link";
import { login } from "./api/auth";
import { useRouter } from "next/router";

const schema = yup.object({
  email: yup.string().required(),
  password: yup.string().required(),
});

function LoginPage() {
  const router = useRouter();
  const { control, handleSubmit } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: any) => {
    try {
      const response = await login(data.email, data.password);
      if(response.access_token){
        router.push('/');
      }
    } catch (error) {
      alert("Error al iniciar sesión");
      console.log(error);
    }
  };
  return (
    <main className="bg-[#121212] w-screen h-screen">
      <Head>
        <title>Login</title>
      </Head>
      <div className="flex flex-col justify-center items-center h-full">
        <Card
          shadow="sm"
          padding="lg"
          radius="lg"
          bg="#2F363D"
          className="w-80 h-80 rounded-2xl shadow-2xl p-4 flex flex-col gap-7 justify-center"
        >
          <h1 className="text-2xl font-bold text-white text-center">
            Inicia sesión
          </h1>
          <form className="flex flex-col gap-7 " onSubmit={handleSubmit(onSubmit)}>
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <Input type="text" placeholder="Usuario" {...field} />
              )}
            />
            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <Input type="password" placeholder="Contraseña" {...field} />
              )}
            />
            <Button type="submit" bg="#1F4E79" className="rounded-2xl p-2">
              Iniciar sesión
            </Button>
          </form>
          <p className="text-white text-center">
            No tienes cuenta? <Link href="/register" className="text-[#1F4E79]">Registrate</Link>
          </p>
        </Card>
      </div>
    </main>
  );
}

export default LoginPage;
