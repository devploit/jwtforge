import Link from "next/link";
import { Logo } from "@/components/Logo";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-5 text-center">
      <Logo size={56} />
      <p className="font-mono text-sm text-accent">
        <span className="text-slate-600">$</span> 404 — segment not found
      </p>
      <h1 className="text-3xl font-bold text-slate-50">
        This route didn&apos;t decode
      </h1>
      <p className="max-w-md text-slate-400">
        The page you&apos;re after isn&apos;t here — like a JWT with the wrong
        number of segments. Head back and try one of these.
      </p>
      <div className="flex flex-wrap justify-center gap-3 pt-1">
        <Link href="/decode" className="btn btn-accent">
          Decode a token →
        </Link>
        <Link href="/attack" className="btn">
          Attack tab
        </Link>
        <Link href="/guides" className="btn">
          Guides
        </Link>
      </div>
    </div>
  );
}
