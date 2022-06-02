import { ToolsProps } from 'bitmap3d/dist/types/map';
import { defineStore } from 'pinia';

export const useMapToolsStore = defineStore('mapTools', {
  state: () => {
    const toolsPositon: ToolsProps = { right: 20, top: 80, visible: true };
    return {
      toolsPositon,
    };
  },

  getters: {
    getToolsPositon: state => state.toolsPositon,
  },
  actions: {
    changeToolsPositon(positon: ToolsProps) {
      Object.assign(this.toolsPositon, positon);
    },
  },
});
