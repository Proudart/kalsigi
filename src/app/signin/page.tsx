import { SignInForm } from "../../components/auth/login";
import Link from "next/link";
import { redirect } from "next/navigation";
import Image from "next/image";
import { auth } from "../../lib/auth"; // path to your Better Auth server instance
import { headers } from "next/headers";
export default async function SignUpPage() {

  const session = await auth.api.getSession({
    headers: await headers()
})

  if (session) {
    return redirect("/");
  }

  return (

    <div className="pt:mt-0 mx-auto flex flex-col items-center justify-center px-6 pt-8 h-[calc(100vh-120px)] ">
      <Link
        href="/"
        className="mb-8 flex items-center justify-center text-2xl font-semibold lg:mb-10 "
        prefetch={true}
      >
        <Image
          src="/manhwacall.webp"
          alt={process.env.site_name as string}
          width={50}
          height={50}
          className="mr-4 h-11 w-11"
        />
      </Link>
      <div className="w-full max-w-xl space-y-8 rounded-lg p-6 shadow-sm sm:p-8  bg-accent-300">
        <h2 className="text-2xl font-bold ">Sign in to your account</h2>
        <SignInForm />
      </div>
    </div>
    
  );
}
