import { getMap } from '@/plugins/baseMap';
import * as mars3d from 'mars3d';
import 'mars3d-echarts';

export let pointGraphicLayer: mars3d.layer.GraphicLayer | undefined; // 详情点图层对象
// export let legendGraphicLayer: mars3d.layer.GraphicLayer | undefined; // 图例点图层对象

/**
 * 图层初始化
 * @returns
 */
export function initMap(): void {
  getMap().then((map: mars3d.Map) => {
    // legendGraphicLayer = new mars3d.layer.GraphicLayer({
    //   id: '加工图例点图层',
    // });
    // map.addLayer(legendGraphicLayer);

    pointGraphicLayer = new mars3d.layer.GraphicLayer({
      id: '粪污处理点图层',
    });
    map.addLayer(pointGraphicLayer);

    // 点击点位事件
    pointGraphicLayer?.on(mars3d.EventType.click, function (event: any) {
      const graphic = event.graphic;
      map.flyToGraphic(graphic, { duration: 2, radius: 8000 });
    });
  });
}

/**
 * 清除图层
 */
export function clearLayer(): void {
  getMap().then((map: mars3d.Map) => {
    if (pointGraphicLayer) {
      pointGraphicLayer?.clear(true);
      map.removeLayer(pointGraphicLayer);
      pointGraphicLayer = undefined;
    }
    // if (legendGraphicLayer) {
    //   legendGraphicLayer?.clear(true);
    //   map.removeLayer(legendGraphicLayer);
    //   legendGraphicLayer = undefined;
    // }
  });
}

interface Super {
  [key: string]: any;
}
export interface ScrollItem extends Super {
  unit: string;
  value: number;
  name: string;
  time: string;
}
