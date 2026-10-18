import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  serverExternalPackages: ["unpdf", "mammoth", "postgres"],
};

export default nextConfig;
