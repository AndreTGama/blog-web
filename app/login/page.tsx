import Image from "next/image";
import Login from "@/components/Forms/login";
import Card from "@/components/Cards/card";

export default function page() {
  return (
    <main>
      <div className="bg-sky-100 flex justify-center items-center h-screen">
        <div className="w-1/2 h-screen hidden lg:block relative">
          <Image
            src="https://img.freepik.com/fotos-premium/imagen-fondo_910766-187.jpg?w=826"
            alt="Placeholder Image"
            className="object-cover w-full h-full"
            fill
            unoptimized
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
