/* eslint-disable camelcase */
export { getMap, onMounted } from '@/plugins/baseMap';
import { getMap } from '@/plugins/baseMap';
import * as mars3d from 'mars3d';
import { useMapRegionStore } from '@/store';

export let graphicLayer: mars3d.layer.GraphicLayer | undefined; // 重庆行政区划图层对象
export let chinaGraphicLayer: mars3d.layer.GraphicLayer | undefined; // 全国行政区划图层对象

/**
 * 图层初始化
 * @returns
 */
export function initMap(params: { cqGeoJsonUrl: string; chinaGeoJson: string; isChinaShow: boolean }): void {
  getMap().then((map: mars3d.Map) => {
    map.unbindContextMenu();
    addCqGeoJson({
      cqGeoJsonUrl: params.cqGeoJsonUrl,
      chinaGeoJson: params.chinaGeoJson,
      isChinaShow: params.isChinaShow,
    });
  });
}

//#region 行政区划相关
/**
 * 添加重庆geojson
 */
export function addCqGeoJson(params: { cqGeoJsonUrl: string; chinaGeoJson: string; isChinaShow: boolean }): void {
  getMap().then((map: mars3d.Map) => {
    graphicLayer = new mars3d.layer.GeoJsonLayer({
      name: '重庆行政区划图层',
      id: 'cq_geo',
      // url: '//data.mars3d.cn/file/geojson/areas/100000_full.json',
      url: params.cqGeoJsonUrl,
      symbol: {
        type: 'polygon',
        styleOptions: {
          outline: true,
          // outlineColor: '#56c1de',
          outlineColor: '#2fafe0',
          outlineWidth: 1.5,
          materialType: mars3d.MaterialType.PolyGradient, // 重要参数，指定材质
          color: '#244a61',
          opacity: 0.4,
          alphaPower: 1.3,
          // 面中心点，显示文字的配置
          label: {
            text: '{name}', // 对应的属性名称
            opacity: 1,
            font_size: 20,
            // color: '#8B8E93',
            color: 'rgb(33, 148, 236)',
            font_family: '楷体',
            outline: false,
            scaleByDistance: true,
            scaleByDistance_far: 20000000,
            scaleByDistance_farValue: 0.1,
            scaleByDistance_near: 1000,
            scaleByDistance_nearValue: 1,
          },
        },
      },
      center: {
        lng: 107.855118,
        lat: 29.89399,
        alt: 880895,
        heading: 0,
        pitch: -86,
        roll: 0,
      },
      flyTo: true,
    });
    map.addLayer(graphicLayer);
    // graphicLayer.show = !params.isChinaShow;

    // 绑定事件
    graphicLayer.on(
      mars3d.EventType.click,
      function (event: { graphic: { options: { attr: { name: any; adcode: { toString: () => any } } } } }) {
        console.log('数据点击', event);
        const temp = {
          name: event.graphic.options.attr.name,
          code: event.graphic.options.attr.adcode.toString(),
        };
        useMapRegionStore().changeRegionArea(temp);
      },
    );

    // addChinaGeoJson({
    //   chinaGeoJson: params.chinaGeoJson,
    //   isChinaShow: params.isChinaShow,
    // });
  });
}

/**
 * 添加全国geojson
 */
export function addChinaGeoJson(params: { chinaGeoJson: string; isChinaShow: boolean }): void {
  getMap().then((map: mars3d.Map) => {
    chinaGraphicLayer = new mars3d.layer.GeoJsonLayer({
      name: '全国行政区划图层',
      id: 'china_geo',
      url: params.chinaGeoJson,
      symbol: {
        type: 'polygon',
        styleOptions: {
          outline: true,
          // outlineColor: '#56c1de',
          outlineColor: '#2fafe0',
          outlineWidth: 1.5,
          materialType: mars3d.MaterialType.PolyGradient, // 重要参数，指定材质
          color: '#244a61',
          opacity: 0.4,
          alphaPower: 1.3,
          // 面中心点，显示文字的配置
          label: {
            text: '{name}', // 对应的属性名称
            opacity: 1,
            font_size: 22,
            // color: '#8B8E93',
            color: 'rgb(33, 148, 236)',
            font_family: '楷体',
            outline: false,
            scaleByDistance: true,
            scaleByDistance_far: 20000000,
            scaleByDistance_farValue: 0.1,
            scaleByDistance_near: 1000,
            scaleByDistance_nearValue: 1,
          },
        },
      },
      center: {
        lng: 107.855118,
        lat: 29.89399,
        alt: 5880895,
        pitch: -86,
      },
      flyTo: true,
    });
    map.addLayer(chinaGraphicLayer);
    chinaGraphicLayer.show = params.isChinaShow;
  });
}
//#endregion

//#region 改变重庆影像状态
/**
 * 切换重庆影像状态
 */
export function changeCqArcgisStatus(isShow = false): void {
  getMap().then((map: mars3d.Map) => {
    // console.log(map.getLayerById('cq_arcgis'), 777);
    const cqImg = map.getLayerById('cq_arcgis');
    if (cqImg) {
      cqImg.show = isShow;
    }
    const cqImgBz = map.getLayerById('arcgis_tile');
    if (cqImgBz) {
      cqImgBz.show = isShow;
    }
    // const chinaGraphicLayer = map.getLayerById('china_geo');
    // if (chinaGraphicLayer) {
    //   chinaGraphicLayer.show = !isShow;
    // }
    const cqGraphicLayer = map.getLayerById('cq_geo');
    if (cqGraphicLayer) {
      cqGraphicLayer.show = !isShow;
    }
  });
}

/**
 * 改变状态geojson
 */
export function changeGeoJson(isChinaShow: boolean): void {
  getMap().then((map: mars3d.Map) => {
    const chinaGraphicLayer = map.getLayerById('china_geo');
    if (chinaGraphicLayer) {
      chinaGraphicLayer.show = isChinaShow;
      if (isChinaShow) {
        map.flyToGraphic(chinaGraphicLayer);
      }
    }
    const cqGraphicLayer = map.getLayerById('cq_geo');
    if (cqGraphicLayer) {
      cqGraphicLayer.show = !isChinaShow;
      if (!isChinaShow) {
        map.flyToGraphic(cqGraphicLayer);
      }
    }
  });
}
//#endregion

/**
 * 清除图层
 */
export function removeLayer(): void {
  getMap().then((map: mars3d.Map) => {
    if (graphicLayer) {
      graphicLayer?.clear(true);
      map.removeLayer(graphicLayer, true);
      graphicLayer = undefined;
    }
    if (chinaGraphicLayer) {
      chinaGraphicLayer?.clear(true);
      map.removeLayer(chinaGraphicLayer, true);
      chinaGraphicLayer = undefined;
    }
  });
}
