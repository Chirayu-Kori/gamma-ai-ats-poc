import { redirect } from "next/navigation";

export default function Home() {
  // Automatically redirect to a test resume editor view for demonstration purposes
  redirect("/resumes/test");
}
