import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  appType: 'mpa',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        about: resolve(__dirname, 'about-us.html'),
        services: resolve(__dirname, 'services.html'),
        products: resolve(__dirname, 'products.html'),
        blog: resolve(__dirname, 'blog.html'),
        faq: resolve(__dirname, 'faq.html'),
        contact: resolve(__dirname, 'contact-us.html'),
        checkout: resolve(__dirname, 'checkout.html'),
        notFound: resolve(__dirname, '404.html'),
      },
    },
  },
})
