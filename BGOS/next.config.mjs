/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "iceconnect.in" }],
        destination: "https://bgos.online/:path*",
        permanent: false,
      },
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.iceconnect.in" }],
        destination: "https://bgos.online/:path*",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
