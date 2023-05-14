import { defineConfig } from "astro/config";
import solid from "@astrojs/solid-js";

// https://astro.build/config
export default defineConfig({
  site: "https://main--celadon-tanuki-db0cbb.netlify.app/",
  integrations: [solid()],
});
