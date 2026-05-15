/** @type {import('next').NextConfig} */
const isNgrok = process.env.NEXT_PUBLIC_USE_NGROK === 'true';
const ngrokBackendUrl = process.env.NEXT_PUBLIC_NGROK_API_URL ? new URL(process.env.NEXT_PUBLIC_NGROK_API_URL).hostname : '';
const ngrokFrontendUrl = process.env.NEXT_PUBLIC_NGROK_FRONTEND_URL ? new URL(process.env.NEXT_PUBLIC_NGROK_FRONTEND_URL).hostname : '';

const nextConfig = {
  ...(isNgrok && {
    allowedDevOrigins: [ngrokBackendUrl, ngrokFrontendUrl].filter(Boolean)
  })
};

export default nextConfig;
