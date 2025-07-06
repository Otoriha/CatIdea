import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // 本番ビルド時のESLintチェックを無効化（一時的）
    ignoreDuringBuilds: true,
  },
  typescript: {
    // 本番ビルド時のTypeScriptエラーを無視（一時的）
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
