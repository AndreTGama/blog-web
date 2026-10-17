"use client";

import Input from "../ui/input";
import ThemeToggle from "../ui/theme-toggle";

export default function Login() {
  return (
    <>
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
          Login
        </h1>
        <ThemeToggle />
      </div>
      <form action="#" method="POST">
        <div className="mb-6">
          <Input
            type="text"
            id="username"
            label="Username"
            name="username"
            placeholder="Enter your username"
          />
        </div>
        <div className="mb-6">
          <Input
            type="password"
            id="password"
            label="Password"
            name="password"
            placeholder="Enter your password"
          />
        </div>
        <button
          type="submit"
          className="w-full rounded-md bg-red-500 px-4 py-2 font-semibold text-white hover:bg-blue-600"
        >
          Login
        </button>
      </form>
    </>
  );
}
