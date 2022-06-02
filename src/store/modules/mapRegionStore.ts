import { SelectAreaItem } from 'bitmap3d/dist/components/map/BmAreaSelect/map';
import { defineStore } from 'pinia';

export const useMapRegionStore = defineStore('mapRegion', {
  state: () => {
    const regionArea: SelectAreaItem = { name: '重庆市', code: '500' };
    const regionAreaList: SelectAreaItem = {};
    return {
      regionArea,
      regionAreaList,
    };
  },

  getters: {
    getRegionArea: state => state.regionArea,
    getRegionAreaList: state => state.regionAreaList,
  },
  actions: {
    changeRegionArea(area: SelectAreaItem) {
      Object.assign(this.regionArea, area);
    },
    changeRegionAreaList(area: SelectAreaItem) {
      Object.assign(this.regionAreaList, area);
    },
  },
});
