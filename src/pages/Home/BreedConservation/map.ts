/* eslint-disable camelcase */
import { getMap } from '@/plugins/baseMap';
import * as mars3d from 'mars3d';
import 'mars3d-echarts';
import { popupConfig } from '@/plugins/commonMap';
import { DetailInfoItem } from '@/types/mainScreenTypes';

export let echartsLayer: mars3d.layer.EchartsLayer | undefined; // 保种echarts图层
export let pointGraphicLayer: mars3d.layer.GraphicLayer | undefined; // 详情点图层对象
// export let legendGraphicLayer: mars3d.layer.GraphicLayer | undefined; // 图例点图层对象

/**
 * 图层初始化
 * @returns
 */
export function initMap(): void {
  getMap().then((map: mars3d.Map) => {
    // legendGraphicLayer = new mars3d.layer.GraphicLayer({
    //   id: '保种图例点图层',
    // });
    // map.addLayer(legendGraphicLayer);

    pointGraphicLayer = new mars3d.layer.GraphicLayer({
      id: '保种点图层',
    });
    map.addLayer(pointGraphicLayer);

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
  });
}

//#region 散点图相关
/**
 * 初始化图表
 */
export function initEcharts(dataList: DetailInfoItem[]) {
  getMap().then((map: mars3d.Map) => {
    const options = getEchartsOption(dataList);
    options.clampToGround = true; // 计算贴地高度
    echartsLayer = new mars3d.layer.EchartsLayer(options);
    map.addLayer(echartsLayer);

    // 图表自适应
    window.addEventListener('resize', function () {
      echartsLayer?.resize();
    });
  });
}

export function changeEchartsLayer(isShow: boolean) {
  getMap().then(() => {
    if (echartsLayer) {
      echartsLayer.show = isShow;
    }
  });
}

/**
 *  echart图表
 * @return {option} echart图表的数据
 */
function getEchartsOption(dataList: DetailInfoItem[]): any {
  const data: any[] = [];
  dataList.forEach((item: DetailInfoItem) => {
    data.push({
      name: item.name,
      value: item.value,
      location: [item.longitude, item.latitude],
    });
  });

  // 纬度做偏移处理,避免重叠
  if (data.length > 1) {
    data.sort(function (a, b) {
      return b.location[1] - a.location[1];
    });
    for (let i = 1; i < data.length; i++) {
      const thisItem = data[i].location;

      let ispy = false;
      for (let j = 0; j < i; j++) {
        const lastItem = data[j].location;
        const offX = Math.abs(lastItem[0] - thisItem[0]);
        const offY = Math.abs(lastItem[1] - thisItem[1]);
        if (offX < 0.025 && offY < 0.005) {
          ispy = true;
          break;
        }
      }

      if (ispy) {
        thisItem[1] -= 0.006; // 偏移纬度
      }
    }
  }

  // let sum = 0;
  const dataVals = [];
  for (let i = 0; i < data.length; i++) {
    // sum += data[i].value;

    dataVals.push({
      name: data[i].name,
      value: data[i].location.concat(data[i].value),
    });
  }

  const option = {
    animation: false,
    // backgroundColor: 'rgba(0, 0, 0, 0.4)',
    tooltip: {
      trigger: 'item',
    },
    series: [
      {
        type: 'effectScatter',
        coordinateSystem: 'mars3dMap',
        data: dataVals,
        // symbolSize: function (val: number[]) {
        //   if (sum === 0) {
        //     return 8;
        //   }

        //   const num = (val[2] / sum) * 150;
        //   return Math.max(num, 8);
        // },
        symbolSize: function (val: number[]) {
          // return 10 + (val[2] / sum) * 100;
          return 5 + val[2] / 4;
        },
        showEffectOn: 'render',
        rippleEffect: {
          brushType: 'stroke',
        },
        hoverAnimation: true,
        label: {
          formatter: '{b}',
          position: 'right',
          color: 'inherit',
          fontSize: '14',
          show: true,
        },
        tooltip: {
          formatter: function (params: any) {
            if (params.value[2] <= 0) {
              return params.name;
            } else {
              return params.name + ' ： ' + params.value[2];
            }
          },
        },
        itemStyle: {
          // color: '#ffff00',
          color: 'rgb(33, 148, 236)',
          shadowBlur: 60,
          shadowColor: '#cccccc',
        },
        zlevel: 1,
      },
    ],
  };
  return option;
}
//#endregion

/**
 * 清除图层
 */
export function clearLayer(): void {
  getMap().then((map: mars3d.Map) => {
    if (echartsLayer) {
      map.removeLayer(echartsLayer, true);
      echartsLayer = undefined;
    }
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
