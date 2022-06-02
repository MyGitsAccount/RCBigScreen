/* eslint-disable camelcase */
export { getMap, onMounted } from '@/plugins/baseMap';
import { getImage } from '@/utils/common';
import { getMap } from '@/plugins/baseMap';
import * as mars3d from 'mars3d';
import * as turf from '@turf/turf';
import { GETMAPINSTANCE } from '@/types/const';
import { popupConfig } from '@/plugins/commonMap';

export let graphicLayer: any = new mars3d.layer.GraphicLayer() || undefined;
export let graphicLayer1: any = new mars3d.layer.GraphicLayer() || undefined;
export let graphicLayer2: any = new mars3d.layer.GraphicLayer() || undefined;
// export let graphicLayer: mars3d.layer.GraphicLayer | undefined; // 点图层对象
// export let graphicLayer1: mars3d.layer.GraphicLayer | undefined; // 点图层对象
// export let graphicLayer2: mars3d.layer.GraphicLayer | undefined; // 点图层对象
export let wallCalibCityGraphicLayer: mars3d.layer.GraphicLayer | undefined; // 墙体刻度城市图层对象
export let modlesPointsGraphicLayer: mars3d.layer.GraphicLayer | undefined; // 模型点位图层对象
export let feedPointsGraphicLayer: mars3d.layer.GraphicLayer | undefined; // 养殖场点位图层对象
export let pointGraphicLayer: mars3d.layer.GraphicLayer | undefined; // 点图层对象
export let dynamicCircleGraphicLayer: mars3d.layer.GraphicLayer | undefined; // 点图层对象
let centerPoint: any = [];
// 对外抛出的事件信息
export const eventTarget = new mars3d.BaseClass();
let img2016Layer: mars3d.layer.ArcGisTileLayer;
let tiles3dLayer: mars3d.layer.TilesetLayer | undefined;
const img2016Url = 'http://119.84.149.29:9999/ArcGIS/getImage/2016/';
const layerAray: any = [];
let selectWallId = ''; // 当前边界墙id

/**
 * 图层初始化
 * @returns
 */
export function initMap(): void {
  getMap().then((map: mars3d.Map) => {
    pointGraphicLayer = new mars3d.layer.GraphicLayer({
      id: '养殖点图层',
    });
    map.addLayer(pointGraphicLayer);
    if (!modlesPointsGraphicLayer) {
      modlesPointsGraphicLayer = new mars3d.layer.GraphicLayer({
        id: '模型点位图层',
      });
      map.addLayer(modlesPointsGraphicLayer);
    }

    if (!feedPointsGraphicLayer) {
      feedPointsGraphicLayer = new mars3d.layer.GraphicLayer({
        id: '养殖场点位图层对象',
      });
      map.addLayer(feedPointsGraphicLayer);
    }

    // 点击点位事件
    pointGraphicLayer?.on(mars3d.EventType.click, function (event: any) {
      const graphic = event.graphic;
      map.flyToGraphic(graphic, { duration: 2, radius: 8000 });
      if (!event.graphic.hasPopup()) {
        popupConfig(
          { name: graphic.options.id, id: graphic.options.id, ...graphic.options.attr },
          graphic.options.attr.bigType,
          event.graphic,
        );
      }
    });
    return pointGraphicLayer;
  });
}

export function addProvince(selectName: string, cqGeoJson: any) {
  if (layerAray.indexOf(selectName + '边界墙') < 0) {
    layerAray.push(selectName + '边界墙');
  }

  let selectProvince: any = '';
  let goToCenter: any = undefined;

  cqGeoJson.features.forEach((item: any, index: number) => {
    if (item.properties.name === selectName) {
      selectProvince = cqGeoJson.features[index];
      goToCenter = item.properties.centroid;
    }
  });

  const rectangleObj = caculate(selectProvince.geometry.coordinates[0][0]);
  const circleObjMax = caculateSquared(rectangleObj, 6, 45);
  const circleObjMin = caculateSquared(rectangleObj, 15, 225);
  const circleObjMax1 = caculateSquared(rectangleObj, 6, 225);
  const circleObjMin1 = caculateSquared(rectangleObj, 15, 45);
  const calibValue = [circleObjMax1.destination, circleObjMax.destination];
  const calib = [circleObjMin.destination, circleObjMin1.destination];
  removeWall(selectName + '边界墙');
  selectWallId = selectName + '边界墙';
  // clearAllLayer();
  const provinceWall = new mars3d.layer.GeoJsonLayer({
    name: selectName + '边界墙',
    id: selectName + '边界墙',
    // url: '//data.mars3d.cn/file/geojson/areas/340000.json',
    data: {
      type: 'FeatureCollection',
      features: [selectProvince],
    },
    symbol: {
      type: 'wallP',
      styleOptions: {
        addHeight: -3000,
        diffHeight: 3000, // 墙高
        materialType: mars3d.MaterialType.Image2,
        image: getImage(`images/cultivation/gradient_wall.png`),
      },
    },
    center: {
      lng: goToCenter[0],
      lat: goToCenter[1] - 0.48,
      alt: 50000,
      heading: 0,
      pitch: -45,
      roll: 0,
    },
    flyTo: true,
  });

  getMap().then((map: mars3d.Map) => {
    // graphicLayer = new mars3d.layer.GraphicLayer({
    //   id: '刻度图层',
    // });
    if (!wallCalibCityGraphicLayer) {
      wallCalibCityGraphicLayer = new mars3d.layer.GraphicLayer({
        id: '墙体刻度城市图层',
      });
    }
    graphicLayer1 = new mars3d.layer.GraphicLayer({
      id: '模型图层',
    });
    graphicLayer2 = new mars3d.layer.GraphicLayer({
      id: '点位图层',
    });
    layerAray.forEach((item: any) => {
      map.removeLayer(map.getLayerById(item));
    });
    // const provinceWall = new mars3d.layer.GeoJsonLayer({
    //   name: '安徽省边界墙',
    //   // url: '//data.mars3d.cn/file/geojson/areas/340000.json',
    //   data: {
    //     type: 'FeatureCollection',
    //     features: [selectProvince],
    //   },
    //   // 自定义解析数据
    //   onCreateGraphic: function (options) {
    //     const points = options.positions; // 坐标
    //     const attr = options.attr; // 属性信息
    //     console.log('边界墙原始坐标', points);
    //     mars3d.PolyUtil.computeSurfaceLine({
    //       map: map,
    //       positions: points,
    //       has3dtiles: false,
    //       splitNum: 300,
    //     }).then(result => {
    //       console.log('边界墙插值计算完成坐标', result.positions);

    //       const primitive = new mars3d.graphic.WallPrimitive({
    //         positions: result.positions,
    //         style: {
    //           addHeight: -3000,
    //           diffHeight: 3000, // 墙高
    //           materialType: mars3d.MaterialType.Image2,
    //           image: getImage(`images/cultivation/gradient_wall.png`),
    //           color: 'rgba(0,255,255,0.6)',
    //           // renderState: Cesium.RenderState.fromCache({
    //           //   blending: Cesium.BlendingState.ALPHA_BLEND,
    //           //   depthTest: {
    //           //     enabled: true,
    //           //     func: Cesium.DepthFunction.LESS
    //           //   },
    //           //   cull: {
    //           //     enabled: true,
    //           //     face: Cesium.CullFace.BACK
    //           //   },
    //           //   depthMask: true
    //           // })
    //         },
    //         attr: attr,
    //       });
    //       provinceWall.addGraphic(primitive);
    //     });
    //   },
    //   center: {
    //   lng: goToCenter[0],
    //   lat: goToCenter[1] - 0.7,
    //   alt: 30000,
    //   heading: 0,
    //   pitch: -25,
    //   roll: 0,
    // },
    //   flyTo: true,
    // });
    provinceWall.getGraphicById(selectName + '边界墙');
    // provinceWall.getGraphics.foEach((item))
    // map.flyTo();
    const geoEntity: any = new mars3d.graphic.PolygonEntity(selectProvince.geometry.coordinates[0][0]);
    provinceWall.addGraphic(geoEntity);
    geoEntity.show = true;
    map.addLayer(provinceWall);
    map.flyTo(geoEntity.entity, { duration: 2 });
    addOutCircle(wallCalibCityGraphicLayer, calibValue, calib);
    addCenterCity(selectName, goToCenter);
    clearAllLayerOfGraphic('calibGroupWall');
    map.addLayer(wallCalibCityGraphicLayer);

    return wallCalibCityGraphicLayer;
  });
}

// 计算边界框
function caculate(coordinatesArray: any): any {
  const line1 = turf.lineString(coordinatesArray);
  const bbox1 = turf.bbox(line1);
  const bboxPolygon1: any = turf.bboxPolygon(bbox1);
  const squared1 = turf.square(bboxPolygon1.bbox);

  const rectangle1: any = [];
  const rectangle2: any = [];
  const squaredRectangle1: any = [];
  const squaredRectangle2: any = [];
  rectangle1[0] = bboxPolygon1.bbox[0];
  rectangle1[1] = bboxPolygon1.bbox[1];
  rectangle2[0] = bboxPolygon1.bbox[2];
  rectangle2[1] = bboxPolygon1.bbox[3];
  squaredRectangle1[0] = squared1[0];
  squaredRectangle1[1] = squared1[1];
  squaredRectangle2[0] = squared1[2];
  squaredRectangle2[1] = squared1[3];
  const rectangle: any = [];
  const squaredRectangle: any = [];
  rectangle[0] = rectangle1;
  rectangle[1] = rectangle2;
  squaredRectangle[0] = squaredRectangle1;
  squaredRectangle[1] = squaredRectangle2;
  const rectangleObj = {
    rectangle: rectangle,
    bboxPolygon: bboxPolygon1.bbox,
    squaredRectangle: squaredRectangle,
    squaredPolygon: squared1,
  };

  return rectangleObj;
}

// 构造缓squared
function caculateSquared(rectangleObj: any, bufferLength: any, angle: any): any {
  const line = turf.lineString([rectangleObj.squaredRectangle[0], rectangleObj.squaredRectangle[1]]);
  const length = turf.length(line, { units: 'miles' });
  const centerPoint = [
    (rectangleObj.squaredPolygon[0] + rectangleObj.squaredPolygon[2]) / 2,
    (rectangleObj.squaredPolygon[1] + rectangleObj.squaredPolygon[3]) / 2,
  ];
  const point = turf.point(centerPoint);
  const distance = (length * 1 + bufferLength) / 2;
  const bearing = angle;
  const options: any = { units: 'miles' };

  const destination = turf.destination(point, distance, bearing, options);
  const pointsArray: any = [];
  pointsArray[0] = centerPoint;
  pointsArray[1] = destination.geometry.coordinates;
  const circleObj = {
    centerPoint: centerPoint,
    pointsArray: pointsArray,
    destination: destination.geometry.coordinates,
  };
  return circleObj;
}

// 添加周边的圆圈刻度尺等对象
function addOutCircle(graphicLayer: any, calibValue: any, calib: any) {
  const arrImg = [
    {
      // 刻度
      image: getImage(`images/cultivation/calib.png`),
      positions: calib,
    },
    {
      // 刻度尺
      image: getImage(`images/cultivation/calib-value.png`),
      positions: calibValue,
    },
  ];

  getMap().then((map: mars3d.Map) => {
    if (!wallCalibCityGraphicLayer) {
      wallCalibCityGraphicLayer = new mars3d.layer.GraphicLayer({
        id: '墙体刻度城市图层',
      });
    }
    // clearAllLayer();
    // if (wallCalibCityGraphicLayer) {
    //   removeSelectPrimitive('calibGroup');
    // }
    clearAllLayerOfGraphic('calibGroupcalib');
    clearAllLayerOfGraphic('calibGroupcalibValue');
    for (let i = 0; i < arrImg.length; i++) {
      const item = arrImg[i];
      const primitive = new mars3d.graphic.RectanglePrimitive({
        name: 'calibGroup',
        id: i == 0 ? 'calibGroupcalib' : 'calibGroupcalibValue',
        positions: item.positions,
        style: {
          materialType: mars3d.MaterialType.Image2,
          image: item.image,
          opacity: 0.4,
        },
        attr: 'calibGroup',
      });
      wallCalibCityGraphicLayer.addGraphic(primitive);
      map.addLayer(wallCalibCityGraphicLayer);
    }
    return wallCalibCityGraphicLayer;
  });
}

// 添加示范城市的相关对象
export function addCenterCity(name: any, goToCenter: any) {
  const point1 = goToCenter;
  if (layerAray.indexOf(name) < 0) {
    layerAray.push(name);
  }

  getMap().then((map: mars3d.Map) => {
    layerAray.forEach((item: any) => {
      if (item !== name) {
        // removeSelectPrimitive(item);
      }
    });
    // map.removeLayer(map.getLayerById('墙体刻度城市图层'));
    if (!wallCalibCityGraphicLayer) {
      wallCalibCityGraphicLayer = new mars3d.layer.GraphicLayer({
        id: '墙体刻度城市图层',
      });
    }
    // map.addLayer(wallCalibCityGraphicLayer);
    // if (!map.getLayerById('墙体刻度城市图层')) {
    //   map.removeLayer(wallCalibCityGraphicLayer);
    // }
    const point = point1;

    // divgraphic标注

    // wallCalibCityGraphicLayer.removeGraphic(wallCalibCityGraphicLayer.getGraphicById('calibGroupCity'));
    // clearAllLayer();
    const divgraphic = new mars3d.graphic.DivGraphic({
      name: 'calibGroup',
      id: 'calibGroupCity',
      position: point,
      style: {
        html: `<div class="marsBlackPanel">
                  <div class="marsBlackPanel-text">${name}</div>
              </div>`,
        horizontalOrigin: mars3d.Cesium.HorizontalOrigin.LEFT, // 横向定位
        verticalOrigin: mars3d.Cesium.VerticalOrigin.CENTER, // 垂直定位
      },
    });
    // wallCalibCityGraphicLayer.clear();
    clearAllLayerOfGraphic('calibGroupCity');
    wallCalibCityGraphicLayer.addGraphic(divgraphic);

    // 圆形动态扩散图
    const cicle = new mars3d.graphic.CirclePrimitive({
      id: 'calibGroupDynamic',
      name: 'calibGroup',
      position: point,
      style: {
        radius: 4000,
        material: mars3d.MaterialUtil.createMaterial(mars3d.MaterialType.CircleWave, {
          color: 'rgba(0,255,255,0.6)',
          count: 2,
          speed: 10,
        }),
      },
    });
    clearAllLayerOfGraphic('calibGroupDynamic');
    wallCalibCityGraphicLayer.addGraphic(cicle);
    map.addLayer(wallCalibCityGraphicLayer);
    return wallCalibCityGraphicLayer;
  });
}

// 养殖场点位
export function addPointFeed(pointsArray: any): void {
  getMap().then((map: mars3d.Map) => {
    removeAllPoints(feedPointsGraphicLayer);
    if (!feedPointsGraphicLayer) {
      feedPointsGraphicLayer = new mars3d.layer.GraphicLayer({
        id: '养殖场点位图层对象',
      });
      map.addLayer(feedPointsGraphicLayer);
    }
    map.addLayer(feedPointsGraphicLayer);
    for (let i = 0, len = pointsArray.length; i < len; i++) {
      let item: any = undefined;
      item = pointsArray[i];
      const position = mars3d.Cesium.Cartesian3.fromDegrees(
        pointsArray[i].lnglat[0] * 1,
        pointsArray[i].lnglat[1] * 1,
        0,
      );
      const primitive = new mars3d.graphic.BillboardPrimitive({
        position: position,
        name: 'yjl22lJgdw-' + '养殖场',
        style: {
          image: item.img !== '' ? getImage(item.img) : '',
          scale: 0.7,
          horizontalOrigin: mars3d.Cesium.HorizontalOrigin.CENTER,
          verticalOrigin: mars3d.Cesium.VerticalOrigin.BOTTOM,
          scaleByDistance: new mars3d.Cesium.NearFarScalar(1.5e2, 1.0, 2.0e6, 0.2),
          label: {
            text: item.name !== '' ? ' ' : '',
            // font_size: 18,
            color: mars3d.Cesium.Color.RED,
            // outline: true,
            outlineColor: mars3d.Cesium.Color.BLACK,
            outlineWidth: 2,
            horizontalOrigin: mars3d.Cesium.HorizontalOrigin.LEFT,
            verticalOrigin: mars3d.Cesium.VerticalOrigin.TOP,
            pixelOffset: new mars3d.Cesium.Cartesian2(25, 15), // 偏移量
            distanceDisplayCondition: new mars3d.Cesium.DistanceDisplayCondition(0.0, 70000),
          },
        },
        attr: item,
        show: true,
      });
      if (feedPointsGraphicLayer) {
        feedPointsGraphicLayer.addGraphic(primitive);
      }
    }
    map.addLayer(feedPointsGraphicLayer);
    return feedPointsGraphicLayer;
  });
}

export function isShowPoint(isShow: boolean): void {
  getMap().then(() => {
    graphicLayer2.show = isShow;
  });
}

// 养殖场模型点位
export function addPointSelectProvince(centerPoints: any, modelsUrls: any): void {
  centerPoint = centerPoints;
  const pointsArray: any = [];
  pointsArray[0] = [(centerPoint[0] * 1 - 0.001521).toFixed(6), (centerPoint[1] * 1 - 0.000093).toFixed(6)];
  pointsArray[1] = [(centerPoint[0] * 1 - 0.001595).toFixed(6), (centerPoint[1] * 1 - 0.000555).toFixed(6)];
  pointsArray[2] = [(centerPoint[0] * 1 - 0.001259).toFixed(6), (centerPoint[1] * 1 + 0.000655).toFixed(6)];
  pointsArray[3] = [(centerPoint[0] * 1 - 0.00135).toFixed(6), (centerPoint[1] * 1 + 0.001264).toFixed(6)];
  pointsArray[4] = [(centerPoint[0] * 1 - 0.000534).toFixed(6), (centerPoint[1] * 1 + 0.000943).toFixed(6)];
  pointsArray[5] = [(centerPoint[0] * 1 - 0.000599).toFixed(6), (centerPoint[1] * 1 + 0.000521).toFixed(6)];
  pointsArray[6] = [(centerPoint[0] * 1 - 0.000613).toFixed(6), (centerPoint[1] * 1 + 0.000019).toFixed(6)];
  pointsArray[7] = [(centerPoint[0] * 1 + 0.000477).toFixed(6), (centerPoint[1] * 1 + 0.000974).toFixed(6)];
  pointsArray[8] = [(centerPoint[0] * 1 + 0.000542).toFixed(6), (centerPoint[1] * 1 + 0.0002).toFixed(6)];
  pointsArray[9] = [(centerPoint[0] * 1 + 0.000246).toFixed(6), (centerPoint[1] * 1 - 0.00032).toFixed(6)];
  pointsArray[10] = [(centerPoint[0] * 1 + 0.001141).toFixed(6), (centerPoint[1] * 1 - 0.00101).toFixed(6)];
  pointsArray[11] = [(centerPoint[0] * 1 + 0.000511).toFixed(6), (centerPoint[1] * 1 - 0.001155).toFixed(6)];
  pointsArray[12] = [(centerPoint[0] * 1 - 0.000467).toFixed(6), (centerPoint[1] * 1 - 0.00082).toFixed(6)];
  pointsArray[13] = [(centerPoint[0] * 1 - 0.000424).toFixed(6), (centerPoint[1] * 1 - 0.001342).toFixed(6)];
  pointsArray[14] = [(centerPoint[0] * 1 - 0.001023).toFixed(6), (centerPoint[1] * 1 - 0.000934).toFixed(6)];
  pointsArray[15] = [centerPoint[0], centerPoint[1]];

  removeAllPoints(modlesPointsGraphicLayer);
  getMap().then((map: mars3d.Map) => {
    if (!modlesPointsGraphicLayer) {
      modlesPointsGraphicLayer = new mars3d.layer.GraphicLayer({
        id: '模型点位图层',
      });
    }
    // 点击点位事件
    modlesPointsGraphicLayer.on(mars3d.EventType.click, function (event: any) {
      const graphic = event.graphic;
      const position = graphic.position;
      map.flyToGraphic(graphic, { duration: 0.6 });
      if (map.camera.positionCartographic.height > 90000) {
        map.flyToPoint(position, {
          radius: 5000, // 距离目标点的距离
          duration: 1,
          complete: function (): void {
            // 飞行完成回调方法
            console.log(event.graphic, '执行事件');
          },
        });
      }
      if (!event.graphic.hasPopup()) {
        popupConfigCopy(
          {
            name: graphic.options.name,
            id: graphic.options.attr.id,
            deviceName: graphic.options.attr.name,
            personName: graphic.options.attr.name,
          },
          graphic.options.name.split('-')[0],
          event.graphic,
        );
      }
    });
    // map.addLayer(graphicLayer);
    for (let i = 0, len = pointsArray.length; i < len; i++) {
      let item: any = i;
      item = modelsUrls['模型设施'][i];

      const position = mars3d.Cesium.Cartesian3.fromDegrees(pointsArray[i][0] * 1, pointsArray[i][1] * 1, 15);
      const primitive = new mars3d.graphic.BillboardPrimitive({
        position: position,
        name: item.type + '-' + '养殖场',
        style: {
          image: item.img !== '' ? getImage(item.img) : getImage('images/cultivation/solot.png'),
          // image: getImage('images/cultivation/pigs.png'),
          scale: 0.7,
          horizontalOrigin: mars3d.Cesium.HorizontalOrigin.CENTER,
          verticalOrigin: mars3d.Cesium.VerticalOrigin.BOTTOM,
          scaleByDistance: new mars3d.Cesium.NearFarScalar(1.5e2, 1.0, 2.0e6, 0.2),
          label: {
            text: item.name,
            font_size: 18,
            color: '#ffffff',
            pixelOffsetY: -50,
            font_family: '楷体',
            background: true,
            backgroundColor: '#0C1813D6',
            distanceDisplayCondition: true,
            distanceDisplayCondition_far: 100000,
            distanceDisplayCondition_near: 0,
          },
        },
        attr: item,
      });
      modlesPointsGraphicLayer.addGraphic(primitive);
      map.addLayer(modlesPointsGraphicLayer);
    }

    return modlesPointsGraphicLayer;
  });
}

/**
 * 移除所有点位
 */
export function removeAllPoints(graphicLayers: any, deleteNmae?: string): void {
  graphicLayers?.graphics.forEach((item: any) => {
    if (deleteNmae) {
      if (item.name === deleteNmae) {
        item.remove();
      }
    } else {
      item.remove();
    }
  });
}

/**
 * 移除所有周边要素
 */
export function removeSelectPrimitive(deleteNmae: string): void {
  if (graphicLayer) {
    graphicLayer?.graphics.forEach((item: any) => {
      if (item.name === deleteNmae) {
        item.remove();
      }
    });
  }

  if (wallCalibCityGraphicLayer) {
    wallCalibCityGraphicLayer?.graphics.forEach((item: any) => {
      if (item.name === deleteNmae) {
        item.remove();
      }
    });
  }
}

// 移除墙体
export function removeWall(selectName: string): void {
  getMap().then((map: mars3d.Map) => {
    map.removeLayer(map.getLayerById(selectName));
  });
}

export function removeAll(): void {
  getMap().then(() => {
    removeWall(selectWallId);
    removeWall('calibGroup');
    removeSelectPrimitive('calibGroup');
  });
}

export function clearAllLayer(): void {
  if (wallCalibCityGraphicLayer) {
    wallCalibCityGraphicLayer.clear();
  }
}

export function clearAllLayerOfGraphic(id: string): void {
  if (wallCalibCityGraphicLayer) {
    wallCalibCityGraphicLayer.removeGraphic(wallCalibCityGraphicLayer.getGraphicById(id));
  }
}

export function initLayer() {
  img2016Layer = new mars3d.layer.ArcGisTileLayer({
    url: img2016Url,
    crs: mars3d.CRS.EPSG4490,
    enablePickFeatures: false,
  });
}

/**
 * 叠加和移除图层
 * @param layerName 图层名称
 * @param type add添加、del删除
 */
export function manageLayer(layerName: string, type: string) {
  getMap(GETMAPINSTANCE).then((map: mars3d.Map) => {
    type == 'add' ? map.addLayer(img2016Layer) : map.removeLayer(img2016Layer);
  });
}

export function add3DTiesModel(goToCenter: any, modelsUrls: any): void {
  clear3dModelLayer();
  getMap().then((map: mars3d.Map) => {
    // if (tiles3dLayer) {
    //   map.removeLayer(tiles3dLayer);
    // }
    const url = `${import.meta.env.BASE_URL}${modelsUrls['所有模型']['当前加载的模型']}`;
    tiles3dLayer = new mars3d.layer.TilesetLayer({
      id: '养殖场模型',
      url: url,
      position: { lng: goToCenter[0], lat: goToCenter[1], alt: 0 },
      maximumScreenSpaceError: 1,
      maximumMemoryUsage: 1024,
      show: true,
      clampToGround: true,
    });
    map.addLayer(tiles3dLayer);

    map.setCameraView({
      // lat: goToCenter[1] - 0.058,
      lat: goToCenter[1] - 0.008,
      lng: goToCenter[0],
      alt: 500,
      heading: 0,
      pitch: -30,
      roll: 0,
    });
    // addPointSelectProvince(goToCenter, modelsUrls);
    return tiles3dLayer;
  });
}

/**
 * 清除模型图层
 */
export function clear3dModelLayer(): void {
  getMap().then((map: mars3d.Map) => {
    if (tiles3dLayer) {
      map.removeLayer(tiles3dLayer);
    }
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
    if (graphicLayer) {
      graphicLayer?.clear(true);
      map.removeLayer(graphicLayer);
      graphicLayer = undefined;
    }
    if (graphicLayer1) {
      graphicLayer1?.clear(true);
      map.removeLayer(graphicLayer1);
      graphicLayer1 = undefined;
    }
    if (graphicLayer2) {
      graphicLayer2?.clear(true);
      map.removeLayer(graphicLayer2);
      graphicLayer2 = undefined;
    }
    if (dynamicCircleGraphicLayer) {
      dynamicCircleGraphicLayer?.clear(true);
      map.removeLayer(dynamicCircleGraphicLayer);
      dynamicCircleGraphicLayer = undefined;
    }
  });
}

/**
 * 详情窗口数据结构配置
 */
export function popupConfigCopy(item: any, pointType?: string, g?: any) {
  let data: PopupRiskConfig;
  if (pointType === 'camera') {
    data = {
      id: item.name,
      title: ['某某养猪场'],
      viewImg: 'images/cultivation/pigs.png',
      // style: {
      //   background: `url('${getImage(`images/cultivation/title.png`)}') no-repeat 100% 100%`,
      // },
      content: [
        {
          title: '',
          name: '',
          phone: '',
        },
      ],
    };
    bindGraphicPopupByRisk(g, data, pointType, {
      offsetY: 250,
    }); // poptop绑定
    g.openPopup();
  }
}

/**
 * 在矢量数据上绑定Popup弹窗
 *
 * @param graphics 矢量数据
 * @param data 弹窗内部样式配置
 * @param proxy 对象代理实例 点击按钮返回的数据从这里获取
 * @param options 弹窗样式配置（具体请查看 mars3d.graphic.Popup.StyleOptions）
 * @returns graphic 实体graphics | null
 */
export function bindGraphicPopupByRisk(
  graphics: mars3d.graphic.BaseGraphic,
  data: PopupRiskConfig,
  type?: string,
  options?: mars3d.graphic.Popup.StyleOptions,
): mars3d.graphic.BaseGraphic | null {
  if (graphics.hasPopup()) {
    console.error('当前图层已绑定Popup弹窗!', graphics);
    return null;
  }
  let graphic: any;
  if (type === 'camera') {
    graphic = graphics.bindPopup('1', {
      template: popupStyleZhengfu(data),
      ...options,
    });
  }
  graphic.on(mars3d.EventType.popupOpen, function () {
    const close = document.getElementById('close');
    close?.addEventListener('click', () => {
      graphic.closePopup();
    });
    const more = document.getElementById('more');
    more?.addEventListener('click', () => {
      eventTarget.fire('more', data);
    });
  });
  if (graphic) {
    return graphic;
  } else {
    return null;
  }
}

/**
 * 生成静态HTML模板
 */

export function popupStyleZhengfu(data: PopupRiskConfig): string {
  const style = `
  <style>
  .box {
    display: flex;
    width: 600px;
    background: rgba(5, 28, 43, 0.5);
    ${data.style?.background ? 'background:' + data.style?.background : ''};
    box-sizing: border-box;
    overflow: hidden;
    position: relative;
    border: 1px solid #0c7989;
    padding: 10px;
  }
  .close {
    color: #28D9FF;
    position: absolute;
    cursor: pointer;
    top: 5px;
    right: 5px;
  }
  .container-rain {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding: 7px 27px;
    color: #fff;
    margin-top: 10px;
  }
  .title-small {
    font-size: 13px;
  }
  .title-middle {
    font-size: 16px;
    color: #3EC1DD;
  }
  .title{
    width: 100%;
  }
  .title-color {
    color: #3EC1DD;
  }
  .content {
    width: 100%;
    font-size: 13px;
    line-height: 1.8;
    margin-top: 10px;
    height: 0px; // 140px
    overflow-y: scroll;
  }
  .content::-webkit-scrollbar {
    width: 0 !important;
  }
  .content-box {
    width: 100%;
    margin-top:10px;
    display: flex;
  }
  .content-left {
    width: 25%;
    color:#3EC1DD;
    text-align: justify;
    text-align-last: justify;
  }
   .content-right {
    width: 65%;
  }
  .content-big {
    width: 100%;
    text-align: left;
    overflow:hidden;
    text-overflow:ellipsis;
    white-space:nowrap;
  }
  .phone{
    width: 34px;
    height: 16px;
  }
  .phone:hover{
    cursor:pointer
  }
</style>`;

  const htmlBefore = `
  <div class="camera-title" style="width: 210px; height: 50px; position: absolute; margin: 0 auto; top: -45px; margin-left: 195px;">
  <img src="${getImage('images/cultivation/cameratitle.png')}" style="margin: 0px;" />
  </div>
  <div class="box">
  <span class="close" id="close">
    ✖
  </span>
  
  <div class="container-rain">
    <div class="title">
      <div style="display: flex;justify-content: space-between;width: 100%;">
      <img src="${getImage(data.viewImg)}" style="margin: 3px;float: left;" />
    </div>
  </div>
  <div class="content">`;

  let htmlData = ``;

  for (const item of data.content) {
    htmlData += `<div class="content-box">
    <span class="content-left">${item.title}</span>
    </div>`;
  }
  const htmlAfter = `
  </div>
</div>`;
  return style + htmlBefore + htmlData + htmlAfter;
}
export interface PopupRiskConfig {
  id: string;
  title: string[]; // 按数组顺序依次显示，固定四个元素
  content: any;
  viewImg?: any;
  style?: {
    background?: string; // 背景设置
    fontColor?: string; // 主题字体颜色
    cutOffColor?: string; // 分割线颜色
  };
}
export interface LegendItemConfig {
  title: string; // 名称
  isChecked: boolean; // 选中状态
  checkedIcon: string; // 选中的icon地址
  notCheckedIcon: string; // 未选中的icon地址
  checkedColor: string; // 选中的按钮颜色
  notCheckedColor: string; // 未选中的按钮颜色
}

//#region 应急部门
export const data = {
  title: {
    name: '', // 标题名
    tel: '', // 电话
  },
  content: [
    {
      job: '', // 职称
      name: '', // 用户名
      tel: '', // 电话
    },
  ],
  img: {
    bg: '', // 背景图
    title: '', // 标题icon
    call: '', // 电话icon
  },
};

interface Super {
  [key: string]: any;
}
export interface CultivationItem extends Super {
  name: string;
  value: number;
  longitude: number;
  latitude: number;
  data: any;
}

export interface ScrollItem extends Super {
  unit: string;
  pigstyName: string;
  devName: string;
  dataTime: string;
  equipmentValue: string;
}
