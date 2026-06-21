"use client";

import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AuthGuard({
 children
}: {
 children: React.ReactNode;
}) {

 const router = useRouter();

 useEffect(() => {
  const token = Cookies.get("token");
  if (!token || token === "undefined") {
   Cookies.remove("token");
   router.push("/login");
  }
 }, [router]);

 return <>{children}</>;
}
