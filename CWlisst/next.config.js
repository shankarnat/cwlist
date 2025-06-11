/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'ALLOWALL'
          },
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'self' *.salesforce.com *.force.com *.my.salesforce.com *.lightning.force.com;"
          }
        ]
      }
    ]
  }
}

module.exports = nextConfig