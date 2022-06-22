/* eslint-disable camelcase */
import * as mars3d from 'mars3d';
import { getImage } from '@/utils/common';
import { useMapRegionStore } from '@/store';
import { getMap } from '@/plugins/baseMap';

export const regionJson: any = undefined;
export let legendGraphicLayer: mars3d.layer.GraphicLayer | undefined; // 图例点图层对象

// 对外抛出的事件信息
export const eventTarget = new mars3d.BaseClass();

/**
 * 图层初始化
 * @returns
 */
export function initMap(params: { detailInfo: any }): void {
  getMap().then((map: mars3d.Map) => {
    if (!map.getLayerById('图例点图层')) {
      legendGraphicLayer = new mars3d.layer.GraphicLayer({
        id: '图例点图层',
      });
      map.addLayer(legendGraphicLayer);
    }

    loadLegendPoint({ detailInfo: params.detailInfo });
  });
}

//#region 详情点位相关
/**
 * 添加点
 * @param data
 */
export async function addResourcePoint(params: {
  data: any[];
  pointGraphicLayer: mars3d.layer.GraphicLayer | undefined;
}) {
  await removePointGraphic(params.pointGraphicLayer);
  params.data.forEach((item: any) => {
    const graphic = new mars3d.graphic.BillboardPrimitive({
      id: item.name,
      position: [item.longitude, item.latitude, 3141530],
      style: {
        image: getImage('images/MapTools/point-mark.png'),
        scale: 1,
        horizontalOrigin: mars3d.Cesium.HorizontalOrigin.CENTER,
        verticalOrigin: mars3d.Cesium.VerticalOrigin.BOTTOM,
        clampToGround: true,
        scaleByDistance: new mars3d.Cesium.NearFarScalar(1.5e2, 1.0, 2.0e6, 0.001),
        label: {
          text: item.name,
          font_size: 18,
          color: '#ffffff',
          pixelOffsetY: -62,
          font_family: '楷体',
          background: true,
          backgroundColor: '#0C1813D6',
          distanceDisplayCondition: true,
          distanceDisplayCondition_far: 1000000,
          distanceDisplayCondition_near: 0,
        },
      },
      attr: item,
    });
    params.pointGraphicLayer?.addGraphic(graphic);
  });
}

/**
 * 移除上一次加载的点数据
 * @returns
 */
export function removePointGraphic(pointGraphicLayer: mars3d.layer.GraphicLayer | undefined) {
  pointGraphicLayer?.clear(true);
}
//#endregion

//#region 点位的弹窗配置
/**
 * 详情窗口数据结构配置
 */
export function popupConfig(item: any, pointType?: string, g?: any) {
  let data: any;
  if (pointType === 'breedConservation') {
    data = {
      id: item.name,
      title: item.name,
      list: item.list,
      // label: {
      //   cunlan: '存栏总数',
      //   muzhu: '母猪',
      //   zgongzhu: '种公猪',
      //   feizhu: '育肥猪',
      // },
      // content: {
      //   cunlan: item.list['存栏总数'],
      //   muzhu: item.list['母猪'],
      //   zgongzhu: item.list['种公猪'],
      //   feizhu: item.list['育肥猪'],
      // },
    };
    bindGraphicPopupByResource(g, data, pointType, {
      offsetX: 0,
      offsetY: -60,
    }); // poptop绑定
    g.openPopup();
  } else if (pointType === 'cultivation') {
    data = {
      id: item.name,
      title: item.name,
      list: item.list,
      // label: {
      //   cunlan: '存栏总数',
      //   muzhu: '母猪',
      //   zgongzhu: '种公猪',
      //   feizhu: '育肥猪',
      // },
      // content: {
      //   cunlan: 502,
      //   muzhu: 100,
      //   zgongzhu: 112,
      //   feizhu: 290,
      // },
    };
    bindGraphicPopupByResource(g, data, pointType, {
      offsetX: 0,
      offsetY: -60,
    }); // poptop绑定
    g.openPopup();
  }
}

/**
 * 详情窗口事件
 */
export function bindGraphicPopupByResource(
  graphics: mars3d.graphic.BaseGraphic,
  data: any,
  type?: string,
  options?: mars3d.graphic.Popup.StyleOptions,
): mars3d.graphic.BaseGraphic | null {
  if (graphics.hasPopup()) {
    console.error('当前图层已绑定Popup弹窗!', graphics);
    return null;
  }
  let graphic: any;
  if (type === 'breedConservation') {
    graphic = graphics.bindPopup('1', {
      template: popupStyleResource(data, type),
      ...options,
    });
  } else if (type === 'cultivation') {
    graphic = graphics.bindPopup('1', {
      template: popupStyleResource(data, type, graphics),
      ...options,
    });
  }
  graphic.on(mars3d.EventType.popupOpen, function () {
    const close = document.getElementById('close');
    close?.addEventListener('click', () => {
      graphic.closePopup();
    });
    const moreDetail = document.getElementById('moreDetail');
    moreDetail?.addEventListener('click', () => {
      const datas = {
        data: data,
        graphics: graphics,
      };
      eventTarget.fire('moreDetail', datas);
    });
  });
  if (graphic) {
    return graphic;
  } else {
    return null;
  }
}

/**
 * 弹窗的html和样式
 * @param data
 * @returns
 */
export function popupStyleResource(data: any, type: string, graphics?: mars3d.graphic.BaseGraphic): string {
  const style = `
  <style>
  .resource-pop-box {
    width: 217px;
    height: 95px;
    background-color: rgba(27, 39, 38, 0.65);
    overflow: hidden;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    justify-content: flex-center;
    align-items: flex-center;
  }
  .resource-pop-close {
    color: #fff;
    cursor: pointer;
    top: 7px;
    right: 8px;
    position: absolute;
    font-size: 16px;
  }
  .container-resource {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding: 0px 2px 0 4px;
    color: #fff;
  }
  .title-small {
    font-size: 14px;
  }
  .resource-pop-title{
    width: 100%;
    height: 30px;
    color: #55c2f5;
    display: flex;
    justify-content: start;
    align-items: center;
  }
  .content {
    width: 100%;
    font-size: 14px;
    height: 60px;
    overflow-y: scroll;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
  }
  .content::-webkit-scrollbar {
    width: 0 !important;
  }
  .content-items {
    width: 100%;
    height: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .content-box {
    width: 50%;
    margin-top: 2px;
    display: flex;
    position: relative;
    align-items: center;
    justify-content: inherit;
  }
  .content-left {
    text-align: justify;
    text-align-last: justify;
  }
  .content-right {
    color: #c8923d;
  }
  .title-img{
    width: 16px;
    height: 16px;
    margin-right:5px;
    cursor: pointer;
    right: 4px;
    top: 0px;
  }
  .more-detail {
    color: #55c2f5;
    cursor: pointer;
    top: 7px;
    right: 12px;
    position: absolute;
    font-size: 14px;
  }
</style>`;

  const htmlBefore = `
  <div class="resource-pop-box">
    <div class="container-resource">
      <div class="resource-pop-title">
       <img src="${getImage('images/MapTools/point-icon.png')}" id="resourcePath" class="title-img"/>
        <span class="title-small">
        ${data.title}</span>
      </div>
      <div class="content">
    `;
  let htmlContent = '';
  Object.keys(data.list).forEach((key: string) => {
    htmlContent += `
      <div class="content-box">
        <span class="content-left">${key}:</span>
        <span class="content-right">${data.list[key]}</span>
        <span>头<span>
      </div>`;
  });

  let htmlAfter = ``;
  console.log(graphics, 9999);
  if (type === 'cultivation' && graphics?.attr?.modelName) {
    htmlAfter += `
      </div>
        </div>
        <span class="more-detail" id="moreDetail">详情>><span>
      </div>`;
  } else {
    htmlAfter += `</div></div></div>`;
  }

  return style + htmlBefore + htmlContent + htmlAfter;
}
//#endregion

//#region 图例点相关
/**
 * 添加图例数据
 */
export function loadLegendPoint(params: { detailInfo: any }) {
  // 点击点位事件
  if (!legendGraphicLayer) {
    initMap({ detailInfo: params.detailInfo });
  } else {
    removePointGraphic(legendGraphicLayer);
    legendGraphicLayer?.on(mars3d.EventType.click, function (event: any) {
      console.log(event.graphic, 999);
      setCurrentRegion(event.graphic);
    });

    params.detailInfo.forEach((element: any) => {
      if (element.data) {
        for (let i = 0, len = element.data.length; i < len; i++) {
          const item = element.data[i];
          const position = mars3d.Cesium.Cartesian3.fromDegrees(item.longitude * 1, item.latitude * 1, item.z || 0);

          const primitive = new mars3d.graphic.BillboardPrimitive({
            position: position,
            name: item.name,
            style: {
              image: getImage(item.img),
              // image: getImage('images/BreedConservation/xkyjd-mark.png'),
              scale: 1.3,
              horizontalOrigin: mars3d.Cesium.HorizontalOrigin.CENTER,
              verticalOrigin: mars3d.Cesium.VerticalOrigin.BOTTOM,
              scaleByDistance: new mars3d.Cesium.NearFarScalar(1.5e2, 1.0, 2.0e6, 0.2),
              label: {
                text: item.name,
                font_size: 16,
                color: '#fff',
                pixelOffsetY: -45,
                font_family: '楷体',
                background: true,
                backgroundColor: 'rgba(8, 49, 73, 0.7)',
                distanceDisplayCondition: true,
                distanceDisplayCondition_far: 1000000,
                distanceDisplayCondition_near: 0,
              },
            },
            attr: item,
          });
          legendGraphicLayer?.addGraphic(primitive);
        }
      }
    });
  }
}

/**
 * 移除上一次加载的图例数据
 */
export function removeLegendPoint() {
  legendGraphicLayer?.clear(true);
}

/**
 * 图例数据点击事件
 */
export function setCurrentRegion(graphic: mars3d.layer.GraphicLayer | undefined) {
  const regionAreaList = useMapRegionStore().getRegionAreaList.children;
  const name = graphic?.options.attr.parent.name;
  if (regionAreaList) {
    for (let i = 0; i < regionAreaList.length; i++) {
      if (regionAreaList[i].name === name) {
        const temp = {
          name,
          code: regionAreaList[i]?.code?.toString(),
        };
        useMapRegionStore().changeRegionArea(temp);
        break;
      }
    }
  }
}
//#endregion
