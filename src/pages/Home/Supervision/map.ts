import { getMap } from '@/plugins/baseMap';
import * as mars3d from 'mars3d';

export let pointGraphicLayer: mars3d.layer.GraphicLayer | undefined; // 详情点图层对象

/**
 * 图层初始化
 * @returns
 */
export function initMap(): void {
  getMap().then((map: mars3d.Map) => {
    pointGraphicLayer = new mars3d.layer.GraphicLayer({
      id: '监管点图层',
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
  });
}
