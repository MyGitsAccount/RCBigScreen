export { getMap, onMounted } from '@/plugins/baseMap';
// import { getImage } from '@/utils/common';
import { getMap } from '@/plugins/baseMap';
import * as mars3d from 'mars3d';
// import { GETMAPINSTANCE } from '@/types/const';
// import { popupConfig } from '@/plugins/commonMap';

export let pointGraphicLayer: mars3d.layer.GraphicLayer | undefined; // 点图层对象
// 对外抛出的事件信息
export const eventTarget = new mars3d.BaseClass();

/**
 * 图层初始化
 * @returns
 */
export function initMap(): void {
  getMap().then((map: mars3d.Map) => {
    pointGraphicLayer = new mars3d.layer.GraphicLayer({
      id: '品牌点图层',
    });
    map.addLayer(pointGraphicLayer);

    // 点击点位事件
    pointGraphicLayer?.on(mars3d.EventType.click, function (event: any) {
      const graphic = event.graphic;
      map.flyToGraphic(graphic, { duration: 2, radius: 8000 });
    });
    return pointGraphicLayer;
  });
}

interface Super {
  [key: string]: any;
}
export interface BrandItem extends Super {
  name: string;
  value: number;
  longitude: number;
  latitude: number;
  data: any;
}

export interface PorkPriceItem extends Super {
  unit: string;
  pigPrice: string;
  whitePrice: string;
  dataTime: string;
}

export interface PortfolioItem extends Super {
  name: string;
  value: string;
  staus: string;
  time: string;
}
