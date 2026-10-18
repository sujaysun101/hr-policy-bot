import Link from "next/link"
import { Logo } from "@/components/brand/logo"

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <Logo />
      <h1 className="font-heading text-4xl">That page is not in the handbook.</h1>
      <Link href="/" className="text-sm text-primary underline">
        Back to Handbookly
      </Link>
    </div>
  )
}
