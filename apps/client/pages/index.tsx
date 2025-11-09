// pages/index.tsx
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { getProfile } from "./api/auth";
import Head from "next/head";
import { Card } from "@mantine/core";

export default function Home() {
  const router = useRouter();
  const [profile, setProfile] = useState({ empresa: "" });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login"); // redirige si no hay token
    }
    getProfile().then((profile) => {
      console.log(profile);
      setProfile(profile);
    });
  }, [router]);

  return (
    <main className="bg-[#121212] w-screen h-screen p-5 flex flex-col gap-5">
      <Head>
        <title>Finora</title>
      </Head>
      <h1 className="text-3xl font-bold text-white">
        Bienvenido {profile?.empresa || ""}
      </h1>
      <div className="grid grid-cols-3 gap-5">
        <div className="col-span-1">
          <Card shadow="sm" padding="lg" radius="lg" bg="#2F363D">
            <h2 className="text-2xl font-bold text-white">
              Ultimos movimientos
            </h2>
          </Card>
        </div>
        <div className="col-span-2"></div>
      </div>
    </main>
  );
}
