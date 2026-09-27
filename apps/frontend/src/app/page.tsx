import { redirect } from "next/navigation";

// No sign-in yet, so open the first demo workspace.
export default function Home() {
  redirect("/w/northwind/chat");
}
