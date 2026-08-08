import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // /widget/* rastgele üçüncü taraf sitelere gömülebilir kalmalı —
        // buraya X-Frame-Options veya kısıtlayıcı bir frame-ancestors EKLEME.
        source: "/widget/:path*",
        headers: [{ key: "Content-Security-Policy", value: "frame-ancestors *" }],
      },
      {
        // Geri kalan her şey (şu an sadece placeholder ana sayfa) iframe'e
        // gömülmek için tasarlanmadı — clickjacking'i önlemek için kilitle.
        source: "/((?!widget).*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Content-Security-Policy", value: "frame-ancestors 'self'" },
        ],
      },
    ];
  },
};

export default nextConfig;
