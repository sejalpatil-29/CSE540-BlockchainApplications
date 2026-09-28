"use client";

import { useRouter } from "next/navigation";
import Hero from "./components/global/Hero"
import { useEffect } from "react";


export default function Home() {
  const router = useRouter();
  useEffect( () => {
    router.replace("/login");
  }, []);

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-san">
      <Hero />
      <button onClick={() => router.push("/login")}>
        Go to Login Page<br/>
      </button>
    </div>
  );
}
