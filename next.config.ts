import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  serverExternalPackages: ["@react-pdf/renderer"],
  async redirects() {
    return [
      {
        source: "/editor",
        has: [{ type: "query", key: "id", value: "(?<id>.*)" }],
        destination: "/resumes/:id",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
