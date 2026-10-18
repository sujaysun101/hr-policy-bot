import type { NextConfig } from "next";

if (!process.env.CLERK_ENCRYPTION_KEY) {
  process.env.CLERK_ENCRYPTION_KEY = "handbookly-local-clerk-encryption-key";
}

const nextConfig: NextConfig = {
  reactCompiler: true,
  serverExternalPackages: ["unpdf", "mammoth", "postgres"],
};

export default nextConfig;
