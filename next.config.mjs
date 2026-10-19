/** @type {import('next').NextConfig} */
const nextConfig = {
  // Export static HTML/CSS/JS for the Capacitor Android WebView.
  output: 'export',
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
