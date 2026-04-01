<template>
  <div id="n8n-chat-widget"></div>
</template>

<script setup lang="ts">
import { useHead } from '#imports'

// Embed the official n8n chat widget via CDN as per package instructions
useHead({
  link: [
    { rel: 'stylesheet', href: 'https://cdn.jsdelivr.net/npm/@n8n/chat/dist/style.css' }
  ],
  script: [
    {
      type: 'module',
      innerHTML: `
        import { createChat } from 'https://cdn.jsdelivr.net/npm/@n8n/chat/dist/chat.bundle.es.js';
        
        createChat({
          webhookUrl: 'https://primary-production-55e84.up.railway.app/webhook/d078abf0-ba5e-4eaa-a155-032f00233774/chat',
          target: '#n8n-chat-widget',
          mode: 'window'
        });
      `
    }
  ]
})
</script>

<style>
/* CSS overrides to match the exact aesthetic of The Glassperts */
:root {
  /* Teal/Cyan accents from screenshot */
  --chat--color-primary: #00bcd4;
  --chat--color-primary-shade-50: #00a4bd;
  --chat--color-primary-shade-100: #008a9f;
  
  /* Dark Navy header from screenshot */
  --chat--color-secondary: #0b1d3a;
  --chat--color-secondary-shade-50: #0a172e;
  
  /* Basics */
  --chat--white: #ffffff;
  --chat--color-font: #333333;
  --chat--color-light: #f5f7f9;
  
  /* Rounded corners like the screenshot */
  --chat--border-radius-base: 12px;
}
</style>
