/** @type {import('next').NextConfig} */
const isNgrok = process.env.NEXT_PUBLIC_USE_NGROK === 'true';
const ngrokUrl = process.env.NEXT_PUBLIC_NGROK_API_URL ? new URL(process.env.NEXT_PUBLIC_NGROK_API_URL).hostname : '';

const nextConfig = {
  ...(isNgrok && ngrokUrl && {
    allowedDevOrigins: [ngrokUrl]
  })
};

export default nextConfig;
