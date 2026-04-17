import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { createI18n } from 'vue-i18n';
import App from './App.vue';
import { messages, defaultLocale } from './locales';

const app = createApp(App);
const pinia = createPinia();

const i18n = createI18n({
  legacy: false,
  locale: defaultLocale,
  fallbackLocale: 'en-US',
  messages
});

app.use(pinia);
app.use(i18n);

app.mount('#app');