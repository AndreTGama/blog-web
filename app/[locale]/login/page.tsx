import Image from "next/image";
import Login from "@/components/forms/login";
import Card from "@/components/cards/card";

export default function LoginPage() {
  return (
    <main>
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="relative hidden h-screen w-1/2 lg:block">
          <Image
            src="/img/login.png"
            alt=""
            className="object-cover"
            fill
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-black/45"
          />
        </div>
        <div className="lg:p-36 md:p-52 sm:20 p-8 w-full lg:w-1/2">
          <Card>
            <Login />
          </Card>
        </div>
      </div>
    </main>
  );
}
