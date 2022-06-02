import * as echarts from 'echarts/core';
import { TabList } from '@/types/mainScreenTypes';

//#region获取encharts
/**
 * 生成扇形的曲面参数方程，用于 series-surface.parametricEquation
 */
function getParametricEquation(
  startRatio: number,
  endRatio: number,
  isSelected: boolean,
  isHovered: boolean,
  k: number,
  h: number,
) {
  // 计算
  const midRatio = (startRatio + endRatio) / 2;

  const startRadian = startRatio * Math.PI * 2;
  const endRadian = endRatio * Math.PI * 2;
  const midRadian = midRatio * Math.PI * 2;

  // 如果只有一个扇形，则不实现选中效果。
  if (startRatio === 0 && endRatio === 1) {
    isSelected = false;
  }

  // 通过扇形内径/外径的值，换算出辅助参数 k（默认值 1/3）
  k = typeof k !== 'undefined' ? k : 1 / 3;

  // 计算选中效果分别在 x 轴、y 轴方向上的位移（未选中，则位移均为 0）
  const offsetX = isSelected ? Math.cos(midRadian) * 0.1 : 0;
  const offsetY = isSelected ? Math.sin(midRadian) * 0.1 : 0;

  // 计算高亮效果的放大比例（未高亮，则比例为 1）
  const hoverRate = isHovered ? 1.05 : 1;

  // 返回曲面参数方程
  return {
    u: {
      min: -Math.PI,
      max: Math.PI * 3,
      step: Math.PI / 32,
    },

    v: {
      min: 0,
      max: Math.PI * 2,
      step: Math.PI / 20,
    },

    x: function (u: number, v: number) {
      if (u < startRadian) {
        return offsetX + Math.cos(startRadian) * (1 + Math.cos(v) * k) * hoverRate;
      }
      if (u > endRadian) {
        return offsetX + Math.cos(endRadian) * (1 + Math.cos(v) * k) * hoverRate;
      }
      return offsetX + Math.cos(u) * (1 + Math.cos(v) * k) * hoverRate;
    },

    y: function (u: number, v: number) {
      if (u < startRadian) {
        return offsetY + Math.sin(startRadian) * (1 + Math.cos(v) * k) * hoverRate;
      }
      if (u > endRadian) {
        return offsetY + Math.sin(endRadian) * (1 + Math.cos(v) * k) * hoverRate;
      }
      return offsetY + Math.sin(u) * (1 + Math.cos(v) * k) * hoverRate;
    },

    z: function (u: number, v: number) {
      if (u < -Math.PI * 0.5) {
        return Math.sin(u);
      }
      if (u > Math.PI * 2.5) {
        return Math.sin(u) * h * 0.1;
      }
      return Math.sin(v) > 0 ? 1 * h * 0.1 : -1;
    },
  };
}

/**
 * 获取来源和去向的echarts配置
 */
export function genOutChartOption(list: TabList[]): any {
  // console.log(list);
  // const temp = [
  //   {
  //     name: '砌石坝',
  //     value: 30,
  //     number: 620,
  //     itemStyle: {
  //       // 透明度
  //       opacity: 0.45,
  //       // 扇形颜色
  //       color: 'rgba(106,123,119,0.37)',
  //     },
  //     startRatio: 0,
  //     endRatio: 0,
  //   },
  //   {
  //     name: '土石坝',
  //     value: 40,
  //     number: 765,
  //     itemStyle: {
  //       opacity: 0.45,
  //       // color: 'rgba(62, 161, 143, 0.2)',
  //       color: 'rgba(18, 128, 182, 0.75)',
  //     },
  //     startRatio: 0,
  //     endRatio: 0,
  //   },
  //   {
  //     name: '混凝土坝',
  //     value: 20,
  //     number: 1270,
  //     itemStyle: {
  //       opacity: 0.45,
  //       color: 'rgba(255,204,38,0.45)',
  //     },
  //     startRatio: 0,
  //     endRatio: 0,
  //   },
  // ];
  const color = [
    'rgba(106,123,119,0.37)',
    'rgba(18, 128, 182, 0.75)',
    'rgba(255,204,38,0.45)',
    'rgba(62, 161, 143, 0.2)',
  ];
  const values = [30, 40, 20, 20];
  const temp: any = []; // list.slice(0, 3)
  list.forEach((item, index) => {
    temp.push({
      name: item.name,
      value: values[index] ? values[index] : 20,
      number: item.value,
      itemStyle: {
        // 透明度
        opacity: 0.45,
        // 扇形颜色
        color: color[index] ? color[index] : '',
      },
      startRatio: 0,
      endRatio: 0,
      unit: item.unit,
    });
  });
  const pieData = temp;
  const internalDiameterRatio = 0.6;
  const series = [];
  let sumValue = 0;
  let startValue = 0;
  let endValue = 0;
  const legendData = [];
  const k =
    typeof internalDiameterRatio !== 'undefined' ? (1 - internalDiameterRatio) / (1 + internalDiameterRatio) : 1 / 3;

  // 为每一个饼图数据，生成一个 series-surface 配置
  for (let i = 0; i < pieData.length; i++) {
    sumValue += pieData[i].value;

    const seriesItem = {
      name: typeof pieData[i].name === 'undefined' ? `series${i}` : pieData[i].name,
      value: typeof pieData[i].value === 'undefined' ? `series${i}` : pieData[i].value,
      type: 'surface',
      parametric: true,
      wireframe: {
        show: false,
      },
      pieData: pieData[i],
      pieStatus: {
        selected: false,
        hovered: false,
        k: k,
      },
      itemStyle: {},
      label: {},
      parametricEquation: {},
      // label: {
      //   show: true,
      //   position: "outside",
      //   formatter: "{b} \n{c} {d}%",
      // },
      // label: {
      //   show: true,
      //   opacity: 1,
      //   fontSize: 13,
      //   lineHeight: 20,
      // },
      // labelLine: {
      //   length: 30,
      //   length2: 30,
      // },
    };

    if (typeof pieData[i].itemStyle != 'undefined') {
      const itemStyle = {
        color: '',
        opacity: 1,
      };

      typeof pieData[i].itemStyle.color != 'undefined' ? (itemStyle.color = pieData[i].itemStyle.color) : null;
      typeof pieData[i].itemStyle.opacity != 'undefined' ? (itemStyle.opacity = pieData[i].itemStyle.opacity) : null;

      seriesItem.itemStyle = itemStyle;
    }

    seriesItem.label = {
      // formatter: "{a|{a}}{abg|}\n{hr|}\n  {b|{b}：}{c}  {per|{d}%}  ",
      backgroundColor: '#eee',
      borderColor: '#aaa',
      borderWidth: 1,
      borderRadius: 4,
      // shadowBlur:3,
      // shadowOffsetX: 2,
      // shadowOffsetY: 2,
      // shadowColor: '#999',
      // padding: [0, 7],
      rich: {
        a: {
          color: '#999',
          lineHeight: 22,
          align: 'center',
        },
        // abg: {
        //     backgroundColor: '#333',
        //     width: '100%',
        //     align: 'right',
        //     height: 22,
        //     borderRadius: [4, 4, 0, 0]
        // },
        hr: {
          borderColor: '#aaa',
          width: '100%',
          borderWidth: 0.5,
          height: 0,
        },
        b: {
          fontSize: 16,
          lineHeight: 33,
        },
        per: {
          color: '#eee',
          backgroundColor: '#334455',
          padding: [2, 4],
          borderRadius: 2,
        },
      },
    };
    series.push(seriesItem);
  }
  // 使用上一次遍历时，计算出的数据和 sumValue，调用 getParametricEquation 函数，
  // 向每个 series-surface 传入不同的参数方程 series-surface.parametricEquation，也就是实现每一个扇形。
  for (let i = 0; i < series.length; i++) {
    endValue = startValue + series[i].pieData.value;

    series[i].pieData.startRatio = startValue / sumValue;
    series[i].pieData.endRatio = endValue / sumValue;
    series[i].parametricEquation = getParametricEquation(
      series[i].pieData.startRatio as number,
      series[i].pieData.endRatio as number,
      false,
      false,
      k,
      series[i].pieData.value,
    );

    startValue = endValue;
    legendData.push(series[i].name);
  }

  // 补充一个透明的圆环，用于支撑高亮功能的近似实现。
  // series.push({
  //   name: "mouseoutSeries",
  //   type: "surface",
  //   // radius: ["50%", "70%"],
  //   parametric: true,
  //   wireframe: {
  //     show: false,
  //   },
  //   itemStyle: {
  //     opacity: 0,
  //   },
  //   parametricEquation: {
  //     u: {
  //       min: 0,
  //       max: Math.PI * 2,
  //       step: Math.PI / 20,
  //     },
  //     v: {
  //       min: 0,
  //       max: Math.PI,
  //       step: Math.PI / 20,
  //     },
  //     x: function (u: number, v: number) {
  //       return Math.sin(v) * Math.sin(u) + Math.sin(u);
  //     },
  //     y: function (u: number, v: number) {
  //       return Math.sin(v) * Math.cos(u) + Math.cos(u);
  //     },
  //     z: function (u: any, v: number) {
  //       return Math.cos(v) > 0 ? 0.1 : -0.1;
  //     },
  //   },
  //   pieData: {
  //     number: 0,
  //   },
  // });
  series.push({
    name: 'mouseoutSeries',
    type: 'pie',
    top: -25,
    labelLine: {
      length: 30,
      lineStyle: {
        color: '#ffffff',
        opacity: 0.3,
      },
      maxSurfaceAngle: 0,
    },
    tooltip: {
      show: false,
    },
    label: {
      show: true,
      position: 'outside',
      color: '#3A98C2',
      fontFamily: 'Microsoft YaHei',
      fontSize: 14,
      opacity: 1,
      formatter: (params: any) => {
        return params.data.name + '\n' + params.data.number + params.data.unit;
        // return `<span style="width:10px;height:10px;">${params.data.name}</span><br/><span style="width:10px;height:10px;">${params.data.name}</span>`;
      },
      // formatter: "{b}\n {c}",
    },
    radius: ['50%', '50%'],
    center: ['50%', '50%'],
    parametric: true,
    wireframe: {
      show: false,
    },
    itemStyle: {
      opacity: 0,
    },
    data: pieData,
    parametricEquation: {
      u: {
        min: 0,
        max: Math.PI * 2,
        step: Math.PI / 20,
      },
      v: {
        min: 0,
        max: Math.PI,
        step: Math.PI / 20,
      },
      x: function (u: number, v: number) {
        return Math.sin(v) * Math.sin(u) + Math.sin(u);
      },
      y: function (u: number, v: number) {
        return Math.sin(v) * Math.cos(u) + Math.cos(u);
      },
      z: function (u: any, v: number) {
        return Math.cos(v) > 0 ? 0.1 : -0.1;
      },
    },
  });

  // 准备待返回的配置项，把准备好的 legendData、series 传入。
  const option = {
    // legend: {
    //   icon: "circle",
    //   // left: -8,
    //   // right: -8,
    //   bottom: 0,
    //   data: legendData,
    //   textStyle: {
    //     color: "#18CCB1",
    //     fontSize: 10,
    //   },
    //   itemStyle: {
    //     opacity: 1,
    //   },
    // },
    tooltip: {
      show: false,
      backgroundColor: 'rgba(24, 204, 177, 0.3)', // 提示框浮层的背景颜色
      borderColor: 'rgba(50,241,184,.3)', // 提示框浮层的边框颜色
      borderWidth: 1, // 提示框浮层的边框宽
      textStyle: {
        color: '#fff',
        fontFamily: 'sans-serif',
        fontSize: 14,
      },
      formatter: (params: { seriesName: string; color: any; seriesIndex: any }) => {
        if (params.seriesName !== 'mouseoutSeries') {
          return `${
            params.seriesName
          }<br/><span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:${
            params.color
          };"></span>${(option.series[params.seriesIndex] as any).pieData.number}`;
        }
      },
    },
    xAxis3D: {
      min: -1,
      max: 1,
    },
    yAxis3D: {
      min: -1,
      max: 1,
    },
    zAxis3D: {
      min: -1,
      max: 1,
    },
    grid3D: {
      top: -18,
      show: false,
      boxHeight: 20,
      viewControl: {
        //3d效果可以放大、旋转等，请自己去查看官方配置
        alpha: 36,
        // beta: 40,
        distance: 200,
        rotateSensitivity: 0,
        zoomSensitivity: 0,
        panSensitivity: 0,
        autoRotate: false,
      },
      //后处理特效可以为画面添加高光、景深、环境光遮蔽（SSAO）、调色等效果。可以让整个画面更富有质感。
      postEffect: {
        //配置这项会出现锯齿，请自己去查看官方配置有办法解决
        enable: true,
        bloom: {
          enable: true,
          bloomIntensity: 0,
        },
        SSAO: {
          enable: false,
          quality: 'medium',
          radius: 2,
        },
      },
    },
    series: series,
  };
  return option;
}

/**
 * 获取日月趋势的echarts配置
 * @param params
 * @param type
 * @returns
 */
export function genTrendChartOption(params: any, type: string): object {
  console.log(type);
  const legend = ['进厂数量', '出产数量'];
  // const days = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
  // const comeCounts = [100, 500, 850, 200, 500, 600, 300, 400, 600, 550, 750, 555];
  // const outCounts = [100, 300, 550, 200, 400, 300, 200, 300, 500, 400, 650, 455];
  const days: string[] = [];
  const comeCounts: number[] = [];
  const outCounts: number[] = [];
  params.data.forEach((item: any) => {
    days.push(item.dname);
    comeCounts.push(Number(item['jc_num']));
    outCounts.push(Number(item['cc_num']));
  });

  const option = {
    tooltip: {
      trigger: 'axis',
      padding: [2, 10],
      textStyle: {
        fontSize: 10,
      },
    },
    grid: {
      top: '20%',
      bottom: '5%',
      left: '5%',
      right: '5%',
      containLabel: true,
    },
    legend: {
      top: '5%',
      right: '25%',
      data: legend,
      textStyle: {
        color: '#b4b4b4',
      },
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      axisLine: {
        lineStyle: {
          color: '#00626F',
        },
      },
      axisTick: {
        show: false,
      },
      axisLabel: {
        // interval: type === 'day' ? 8 : 3,
        textStyle: {
          fontSize: 13,
          color: '#42A8D5',
        },
      },
      data: days,
    },
    yAxis: [
      {
        type: 'value',
        name: '进厂数量(头)',
        nameTextStyle: {
          color: '#17bcff',
        },
        splitLine: {
          show: false,
          lineStyle: {
            type: 'dashed',
            color: 'rgba(233,187,72,0.2)',
          },
        },
        axisLabel: {
          textStyle: {
            fontSize: 14,
            color: '#17bcff',
          },
        },
        axisLine: {
          lineStyle: {
            color: '#b4b4b4',
          },
        },
        axisTick: {
          // show: false,
        },
      },
      {
        type: 'value',
        name: '出厂数量(吨)',
        nameTextStyle: {
          color: '#17bcff',
        },
        splitLine: {
          show: false,
          lineStyle: {
            type: 'dashed',
            color: 'rgba(233,187,72,0.2)',
          },
        },
        axisLabel: {
          textStyle: {
            fontSize: 14,
            color: '#17bcff',
          },
        },
        axisLine: {
          lineStyle: {
            color: '#b4b4b4',
          },
        },
        axisTick: {
          // show: false,
        },
      },
    ],
    series: [
      {
        name: legend[0],
        type: 'line',
        symbol: 'circle',
        symbolSize: 0,
        smooth: true,
        itemStyle: {
          normal: {
            color: '#17bcff',
            shadowColor: 'rgba(0, 0, 0, 1)',
          },
        },
        lineStyle: {
          normal: {
            width: 2,
          },
        },
        areaStyle: {
          normal: {
            color: new echarts.graphic.LinearGradient(
              0,
              0,
              0,
              1,
              [
                {
                  offset: 0,
                  color: 'rgba(29, 172, 226, 0.5)',
                },
                {
                  offset: 0.3,
                  color: 'rgba(29, 172, 226, 0.4)',
                },
                {
                  offset: 0.5,
                  color: 'rgba(29, 172, 226, 0.3)',
                },
                {
                  offset: 0.7,
                  color: 'rgba(29, 172, 226, 0.2)',
                },
                {
                  offset: 1,
                  color: 'rgba(9, 43, 71, 0.2)',
                },
              ],
              false,
            ),
          },
        },
        data: comeCounts,
      },
      {
        name: legend[1],
        type: 'line',
        symbol: 'circle',
        symbolSize: 0,
        smooth: true,
        yAxisIndex: 1,
        itemStyle: {
          normal: {
            color: '#feca0c',
            shadowColor: 'rgba(0, 0, 0, 1)',
          },
        },
        lineStyle: {
          normal: {
            width: 2,
          },
        },
        areaStyle: {
          normal: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              {
                offset: 0,
                color: 'rgba(248,211,72,0.3)',
              },
              {
                offset: 1,
                color: 'rgba(248,211,72,0)',
              },
            ]),
            shadowColor: 'rgba(248,211,72,0.2)',
            shadowBlur: 20,
          },
        },
        data: outCounts,
      },
    ],
  };
  return option;
}
//#endregion
