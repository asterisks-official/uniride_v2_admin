/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Identity documents live on the CDN. They are rendered `unoptimized` so
    // private licence and student-ID photos are never cached on this server,
    // but the host still has to be declared.
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.uniride.app' },
      // Where the signed read URLs actually point. The bucket is private, so
      // documents are fetched through a presigned GET on the S3 virtual-host
      // name rather than from the CDN — wildcarded across buckets so dev and
      // production do not need separate entries.
      { protocol: 'https', hostname: '**.s3.ap-southeast-1.amazonaws.com' },
      // Local dev object sink — the backend hands out these URLs when S3 is
      // not configured.
      { protocol: 'http', hostname: 'localhost', port: '3000' },
    ],
  },
};

export default nextConfig;
