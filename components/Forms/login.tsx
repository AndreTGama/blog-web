"use client";

import Input from "../ui/input";
import ThemeToggle from "../ui/theme-toggle";

export default function Login() {
  return (
    <>
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-foreground">Login</h1>
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
          className="w-full rounded-md bg-foreground px-4 py-2 font-semibold text-background transition-colors hover:opacity-80"
        >
          Login
        </button>
      </form>
    </>
  );
}
