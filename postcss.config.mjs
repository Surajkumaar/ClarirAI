/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    tailwindcss: require.resolve('tailwindcss'),
    autoprefixer: require.resolve('autoprefixer'),
  },
};

export default config;
