import { createPinia } from 'pinia';
import { useUserStore } from './modules/userStore';
import piniaPluginPersist from 'pinia-plugin-persist';
import { useMapRegionStore } from './modules/mapRegionStore';
import { useMapToolsStore } from './modules/mapToolsStore';
const store = createPinia();

store.use(piniaPluginPersist);
export default store;

export { useUserStore, useMapRegionStore, useMapToolsStore };
