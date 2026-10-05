VitePWA({
  registerType: "autoUpdate",
  includeAssets: [
    "favicon.svg",
    "apple-touch-icon.png",
    "icon-192.png",
    "icon-512.png",
    "icon-maskable-512.png",
  ],
  manifest: {
    name: "Cobra Fácil",
    short_name: "Cobra Fácil",
    description: "Pix na hora. Sem complicação.",
    lang: "pt-BR",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#060a09",
    theme_color: "#060a09",
    icons: [
      { src: "icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "icon-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  },
  workbox: {
    globPatterns: ["**/*.{js,css,html,svg,png,ico}"],
    navigateFallback: "/index.html",
  },
})