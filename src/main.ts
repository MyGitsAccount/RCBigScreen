import { createApp } from 'vue';
import '@/styles/index.scss';
// 引入 vue-router
import router from './router';
// 引入 pinia
import store from './store';
import App from './App.vue';
import { BitMapPlugin } from 'bitmap3d';
import 'bitmap3d/style.css';
// import vue3SeamlessScroll from 'vue3-seamless-scroll';

const meta = document.createElement('meta');
meta.name = 'naive-ui-style';
document.head.appendChild(meta);

const app = createApp(App);
// app.use(vue3SeamlessScroll);
app.use(BitMapPlugin);
app.use(router);
app.use(store);

app.mount('#app');
