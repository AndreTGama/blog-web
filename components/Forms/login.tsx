"use client";

import Input from "../ui/input";

export default function Login() {
  return (
    <>
      <h1 className="text-2xl text-center font-semibold mb-4">Login</h1>
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
          className="bg-red-500 hover:bg-blue-600 text-white font-semibold rounded-md py-2 px-4 w-full"
        >
          Login
        </button>
      </form>
    </>
  );
}
