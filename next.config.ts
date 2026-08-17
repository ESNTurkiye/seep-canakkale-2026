import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // See docs/adr/0003-static-export-no-server.md — the build output is plain
  // files so it serves from whatever ESN Türkiye's infrastructure turns out to be.
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
}

export default nextConfig
