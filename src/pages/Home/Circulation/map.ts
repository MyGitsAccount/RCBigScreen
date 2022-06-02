/* eslint-disable camelcase */
import { getMap } from '@/plugins/baseMap';
import * as mars3d from 'mars3d';
import 'mars3d-echarts';
import { getImage } from '@/utils/common';
// import { changeGeoJson } from '@/pages/Home/map';
import * as turf from '@turf/turf';

export let echartsLayer: mars3d.layer.EchartsLayer | undefined; // 流通echarts图层
export let chinaGraphicLayer: mars3d.layer.GraphicLayer | undefined; // 全国行政区划图层对象
let graphicLayer: mars3d.layer.GraphicLayer | undefined; // 矢量图层对象
let roamGraphicLayer: mars3d.layer.GraphicLayer | undefined; // 漫游矢量图层对象

/**
 * 图层初始化
 * @returns
 */
export function initMap(): void {
  getMap().then((map: mars3d.Map) => {
    // changeGeoJson(false);
    // 创建Graphic图层
    graphicLayer = new mars3d.layer.GraphicLayer();
    map.addLayer(graphicLayer);

    // 创建漫游Graphic图层
    roamGraphicLayer = new mars3d.layer.GraphicLayer();
    map.addLayer(roamGraphicLayer);
  });
}

//#region 流通图相关
/**
 * 初始化图表
 */
export function initEcharts(dataList: CirculationCityItem[]) {
  getMap().then((map: mars3d.Map) => {
    const options = getEchartsOption(dataList);
    echartsLayer = new mars3d.layer.EchartsLayer(options);
    map.addLayer(echartsLayer);

    // 图表自适应
    window.addEventListener('resize', function () {
      echartsLayer?.resize();
    });
  });
}
/**
 *  echart图表
 *
 * @return {option} echart图表的数据
 */
function getEchartsOption(dataList: CirculationCityItem[]): any {
  const geoCoordMap: Super = {
    荣昌区: [105.618228, 29.423195],
  };
  const BJData = [
    [
      {
        name: '荣昌区',
        value: 100,
      },
      {
        name: '荣昌区',
      },
    ],
  ];

  dataList.forEach((item: CirculationCityItem) => {
    geoCoordMap[item.name] = [item.longitude, item.latitude];
    BJData.push([
      {
        name: item.name,
        value: item.value,
      },
      {
        name: item.station,
      },
    ]);
    if (item?.path) {
      addBezierLine(item);
    }
  });
  const station = dataList[0].station || '';

  const convertData = function (data: any) {
    const res = [];
    for (let i = 0; i < data.length; i++) {
      const dataItem = data[i];
      const fromCoord = geoCoordMap[dataItem[0].name];
      const toCoord = geoCoordMap[dataItem[1].name];
      if (fromCoord && toCoord) {
        res.push({
          fromName: dataItem[0].name,
          toName: dataItem[1].name,
          coords: [toCoord, fromCoord],
        });
      }
    }
    return res;
  };
  const colors = ['#f44336', '#fc9700', '#ffde00', '#00eaff', 'rgb(33, 148, 236)'];

  const series: any = [];
  [[station, BJData]].forEach(function (item) {
    series.push(
      {
        name: item[0],
        type: 'lines',
        coordinateSystem: 'mars3dMap',
        zlevel: 2,
        effect: {
          show: true,
          period: 6, // 箭头指向速度，值越小速度越快
          trailLength: 0.1, // 特效尾迹长度[0,1]值越大，尾迹越长重
          symbol: 'arrow', // 箭头图标
          // URL: 'image://data:image/gif;base64,R0lGODlhEAAQAMQAAORHHOVSKudfOulrSOp3WOyDZu6QdvCchPGolfO0o/XBs/fNwfjZ0frl3/zy7////wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAkAABAALAAAAAAQABAAAAVVICSOZGlCQAosJ6mu7fiyZeKqNKToQGDsM8hBADgUXoGAiqhSvp5QAnQKGIgUhwFUYLCVDFCrKUE1lBavAViFIDlTImbKC5Gm2hB0SlBCBMQiB0UjIQA7',
          // URL: getImage('images/Circulation/GPS-bg.png'),
          symbolSize: 5, // 图标大小
        },
        lineStyle: {
          color: (val: any) => {
            const value = Number(BJData[val.dataIndex][0].value || 0);
            if (value > 100) {
              return colors[0];
            } else if (value > 70) {
              return colors[1];
            } else if (value > 40) {
              return colors[2];
            } else if (value > 20) {
              return colors[3];
            } else {
              return colors[4];
            }
          },
          width: 1,
          opacity: 0.7,
          curveness: 0.2,
        },
        data: convertData(item[1]),
      },
      {
        type: 'effectScatter',
        coordinateSystem: 'mars3dMap',
        zlevel: 2,
        rippleEffect: {
          brushType: 'stroke',
        },
        label: {
          show: true,
          position: 'right',
          formatter: '{b}',
          color: 'inherit',
          fontSize: 14,
        },
        symbolSize: function (val: number[]) {
          return 6 + val[2] / 10;
        },
        itemStyle: {
          color: (val: any) => {
            const value = Number(BJData[val.dataIndex][0].value || 0);
            if (value > 100) {
              return colors[0];
            } else if (value > 70) {
              return colors[1];
            } else if (value > 50) {
              return colors[2];
            } else if (value > 30) {
              return colors[3];
            } else {
              return colors[4];
            }
          },
        },
        data: (item[1] as any).map(function (dataItem: any) {
          return {
            name: dataItem[0].name,
            value: geoCoordMap[dataItem[0].name].concat([dataItem[0].value]),
          };
        }),
      },
    );
  });

  const option = {
    animation: false,
    tooltip: {
      trigger: 'item',
    },
    series: series,
  };
  return option;
}
//#endregion

//#region bezier曲线
export function addBezierLine(item: CirculationCityItem) {
  getMap().then((map: mars3d.Map) => {
    // const line = turf.lineString([
    //   [105.618228, 29.423195],
    //   [105.7351, 29.644893],
    //   [105.834892, 29.808951],
    //   [105.987458, 30.040896],
    //   [106.171952, 30.296574],
    //   [106.42049, 30.578347],
    //   [106.683557, 30.832774],
    //   [107.204223, 31.239068],
    //   [107.834805, 31.625286],
    //   [108.670789, 31.95324],
    // ]);
    const line = turf.lineString(item.path);
    const curved = turf.bezierSpline(line);
    item.curved = curved;
    console.log(curved, 6666);
    // addPolyline(curved);
    addRoamLine(map, item);
  });
}

/**
 * 加载所有轨迹
 * @param params
 * @returns
 */
export function addPolyline(curved: any) {
  const allPoints: [] = curved.geometry.coordinates;

  const primitive = new mars3d.graphic.PolylinePrimitive({
    positions: allPoints,
    style: {
      width: 1,
      // color: 'rgb(33, 148, 236)',
      material: mars3d.MaterialUtil.createMaterial(mars3d.MaterialType.PolylineDash, {
        color: '#CBF5EA',
        // color: 'rgb(33, 148, 236)',
        dashLength: 20,
      }),
      clampToGround: true,
    },
  });
  graphicLayer?.addGraphic(primitive);
}
//#endregion

//#region 漫游相关逻辑
export async function addRoamLine(map: mars3d.Map, currentLineData: any): Promise<boolean> {
  return new Promise(async resolve => {
    if (!roamGraphicLayer) {
      roamGraphicLayer = new mars3d.layer.GraphicLayer();
      map.addLayer(roamGraphicLayer);
    }
    // 该数据可以从 基础项目 飞行漫游功能界面操作后单个路线的 保存JSON
    const flydata = {
      name: '巡查路线',
      speed: 50000,
      // speed: 5000000000,
      positions: currentLineData.curved.geometry.coordinates, // 所有点位信息
      model: {
        show: true,
        url: '//data.mars3d.cn/gltf/mars/car/kache3.gltf',
        scale: 2250,
        // minimumPixelSize: 50,
      },
      path: {
        color: '#ffff00',
        width: 4,
        show: false,
      },
      // camera: {
      //   type: 'gs',
      //   radius: 300,
      // },
      // clockRange: mars3d.Cesium.ClockRange.CLAMPED, // CLAMPED到达终点后停止
      // interpolation: true, // 是否setInterpolationOptions插值
      clockLoop: true, // 是否循环播放
    };

    const roamLine = new mars3d.graphic.RoamLine(flydata);
    roamGraphicLayer?.addGraphic(roamLine);

    roamLine.on(mars3d.EventType.end, async function (event: any) {
      console.log('漫游结束', event);
      resolve(true);
    });

    roamLine.on(mars3d.EventType.change, () => {
      // 漫游组件
      // eventTarget.fire('roamLineChange', []);
    });

    popupStyle(roamLine, currentLineData.carData);

    // 刷新局部DOM,不影响popup面板的其他控件操作
    roamLine.on(mars3d.EventType.postRender, function () {
      // const container = event.container; // popup对应的DOM
      // const params = roamLine?.info;
      // if (!params) {
      //   return;
      // }
      // const inspectionName = container.querySelector('#inspectionName');
      // if (inspectionName) {
      //   inspectionName.innerHTML = currentLineData.name;
      // }
    });
    // 不贴地时，直接开始
    startFly(roamLine);
    // if (!map.hasTerrain) {
    //   startFly(roamLine);
    // } else {
    //   // 贴地时，异步计算完成后开始
    //   roamLine.clampToGround(function () {
    //     //异步计算完成贴地后再启动
    //     //贴地后的路线值为flyLine.positions
    //     startFly(roamLine);
    //   });
    // }
  });
}

/**
 * 开启漫游
 */
export function startFly(roamLine: mars3d.graphic.RoamLine | undefined) {
  // 启动漫游
  roamLine?.start();
  // 显示popup
  if (!roamLine?.hasPopup()) {
    roamLine?.openPopup();
  }
}

/**
 * 弹窗样式
 */
export function popupStyle(roamLine: mars3d.graphic.RoamLine | undefined, data: any) {
  roamLine
    ?.bindPopup(
      () => {
        const style = `
        <style>
        .mars3d-popup-background {
          background-color: transparent !important;
        }
        .mars3d-popup-content-wrapper {
          box-shadow: 0px 0 0 transparent!important;
        }
        .mars3d-popup-close-button {
          padding: 23px 27px 0 0;
        }
        .resource-pop-box {
          width: 190px;
          height: 113px;
          overflow: hidden;
          background-color: rgba(21, 40, 34, 0);
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          align-items: flex-end;
          background-image: url(${getImage('images/Circulation/popup-bg.png')});
          background-size: 100% 100%;
          background-repeat: no-repeat;
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
          width: 160px;
          height: 113px;
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
          height: 40px;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .content {
          width: 100%;
          font-size: 13px;
          height: 70px;
          overflow-y: scroll;
        }
        .content::-webkit-scrollbar {
          width: 0 !important;
        }
        .content-box {
          width: 100%;
          margin-top: 4px;
          display: flex;
          position: relative;
          align-items: center;
        }
        .before-point {
          width: 5px;
          height: 5px;
          background: #24AFC3;
          border-radius: 50%;
          display: inline-block;
          margin: 0 5px 0px;
        }
        .content-left {
          width: 40%;
          color: #28D9FF;
          text-align: justify;
          text-align-last: justify;
        }
        .colon-point {
          color: #28D9FF;
        }
        .content-right {
          width: 42%;
        }
      </style>`;

        const htmlBefore = `
        <div class="resource-pop-box">
          <div class="container-resource">
            <div class="resource-pop-title">
              <span class="title-small">
              ${data.type + '(' + data.licensePlate + ')'}</span>
            </div>
            <div class="content">
              <div class="content-box">
                <span class="before-point"></span>
                <span class="content-left">冷柜温度</span>
                <span class="colon-point">：</span>
                <span class="content-right">${data.temperature}</span>
              </div>
              <div class="content-box">
                <span class="before-point"></span>
                <span class="content-left">总重量</span>
                <span class="colon-point">：</span>
                <span class="content-right">${data.totalWeight}</span>
              </div>
            </div>
          </div>
        </div>
          `;

        return style + htmlBefore;
      },
      { offsetX: 100, offsetY: 40 },
    )
    .openPopup();
}
//#endregion

/**
 * 清除图层
 */
export function clearLayer(): void {
  getMap().then((map: mars3d.Map) => {
    // changeGeoJson(false);
    if (echartsLayer) {
      map.removeLayer(echartsLayer, true);
      echartsLayer = undefined;
    }
    if (graphicLayer) {
      map.removeLayer(graphicLayer, true);
      graphicLayer = undefined;
    }
    if (roamGraphicLayer) {
      map.removeLayer(roamGraphicLayer, true);
      roamGraphicLayer = undefined;
    }
  });
}

interface Super {
  [key: string]: any;
}
export interface CirculationCityItem extends Super {
  city: string;
  value: number;
  longitude: number;
  latitude: number;
  station: string;
}
