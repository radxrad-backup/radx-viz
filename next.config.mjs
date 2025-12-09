/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    images: {
      unoptimized: true,
    },
    // If your repo is github.com/username/repo-name and the site will be at username.github.io/repo-name/
    basePath: '', // Remove this line if deploying to username.github.io
};

export default nextConfig;
