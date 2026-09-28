"use client";

import RegisterForm from "../components/login/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex items-center justify-center pb-40">
        <RegisterForm />
      </div>
    </div>
  );
}
