import { SignUpForm } from "../../components/auth/register";
import Link from "next/link";
import { redirect } from "next/navigation";
import Image from "next/image";
import { auth } from "../../lib/auth"; // path to your Better Auth server instance
import { headers } from "next/headers";
export default async function SignUpPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) {
    return redirect("/");
  }

  return (
    <div className="pt:mt-0 mx-auto flex flex-col items-center justify-center px-6 pt-8 bg-main-900 h-[calc(100vh-120px)]">
      <Link
        prefetch={true}
        href="/"
        className="mb-8 flex items-center justify-center text-2xl font-semibold lg:mb-10"
      >
        <Image
          src="/kalsigi.webp"
          alt={process.env.site_name as string}
          width={50}
          height={50}
          className="mr-4 h-11 w-11"
        />
      </Link>
      <div className="w-full max-w-xl space-y-8 rounded-lg  p-6 shadow sm:p-8 bg-accent-300">
        <h2 className="text-2xl font-bold  ">Create a Free Account</h2>
        <SignUpForm />
      </div>
    </div>
  );
}
