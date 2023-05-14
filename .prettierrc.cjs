// VSCodeかつpnpmを利用している際に、prettierが.astroを認識できるようにする
module.exports = {
  plugins: [require.resolve("prettier-plugin-astro")],
  overrides: [
    {
      files: "*.astro",
      options: {
        parser: "astro",
      },
    },
  ],
};
