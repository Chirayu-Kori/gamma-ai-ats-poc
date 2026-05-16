import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function ResumeNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-slate-50 px-6 text-center">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">
          Resume not found
        </h1>
        <p className="mt-2 text-slate-500">
          This resume does not exist or may have been removed.
        </p>
      </div>
      <Button asChild>
        <Link href="/">Back to workspace</Link>
      </Button>
    </div>
  );
}
