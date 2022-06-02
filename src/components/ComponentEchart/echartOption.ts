import * as echarts from 'echarts';

export const option1 = {
  title: {
    text: '',
    subtext: '',
    top: 10,
    right: 20,
    textStyle: {
      color: '#41a4ce',
    },
  },
  tooltip: {
    trigger: 'axis',
    padding: [2, 10],
    textStyle: {
      fontSize: 10,
    },
  },
  grid: {
    top: '20%',
    bottom: '2%',
    left: '5%',
    right: '5%',
    containLabel: true,
  },
  legend: {
    top: '5%',
    right: '25%',
    // data: legend,
    textStyle: {
      color: '#b4b4b4',
    },
  },
  xAxis: {
    type: 'category',
    axisLine: {
      lineStyle: {
        color: '#00626F',
      },
    },
    axisLabel: {
      show: true,
      textStyle: {
        color: '#41a4ce', //更改坐标轴文字颜色
      },
    },
    data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  },
  yAxis: [
    {
      type: 'value',
      name: '指数',
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
      data: [820, 932, 901, 934, 1290, 1330, 1320],
      type: 'line',
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
    },
  ],
};

export const option2 = {
  title: {
    text: '荣昌猪价：13.37元/kg',
    subtext: '',
    top: 10,
    right: 20,
    textStyle: {
      color: '#41a4ce',
    },
  },
  legend: {
    left: '5%',
    icon: 'roundRect',
    itemHeight: 9, //修改icon图形大小
    // icon: "path://M512 881.777778 512 881.777778C716.222629 881.777778 881.777778 716.222629 881.777778 512 881.777778 307.777371 716.222629 142.222222 512 142.222222 307.777373 142.222222 142.222222 307.777371 142.222222 512 142.222222 716.222629 307.777373 881.777778 512 881.777778L512 881.777778ZM512 1024 512 1024C229.230208 1024 0 794.769789 0 512 0 229.230211 229.230208 0 512 0 794.769789 0 1024 229.230211 1024 512 1024 794.769789 794.769789 1024 512 1024L512 1024Z",
    textStyle: {
      color: 'white', // 文字的颜色。
    },
  },
  backgroundColor: 'rgb(0, 22, 43, 0.75)',
  /**区域位置*/
  grid: { left: '3%', right: '4%', bottom: '2%', containLabel: true },
  tooltip: {
    trigger: 'axis',
  },
  xAxis: {
    type: 'category',
    data: ['哈尔滨', '黑河', '牡丹江', '佳木斯', '大庆', '鸡西', '鹤岗'],
    axisLine: {
      show: true,
      lineStyle: {
        color: '#41a4ce',
        width: 0,
        type: 'solid',
      },
    },
    axisTick: {
      show: false,
    },
  },
  yAxis: {
    splitNumber: 4,
    name: '单位：头',
    min: 0,
    max: 1200,
    nameTextStyle: {
      color: '#41a4ce',
      padding: [0, 0, 0, 0],
    },
    axisLine: {
      show: true,
      lineStyle: {
        color: 'rgba(202, 255, 253,0.2)',
        width: 1,
        type: 'solid',
      },
    },
    splitLine: {
      lineStyle: {
        color: 'rgba(202, 255, 253,0.2)',
        type: 'dashed',
      },
    },
    axisLabel: {
      show: true,
      textStyle: {
        color: '#41a4ce', //更改坐标轴文字颜色
      },
    },
    axisTick: {
      show: false,
    },
  },
  series: [
    {
      name: '',
      type: 'pictorialBar',
      barCategoryGap: '40%',
      // symbol: 'triangle',
      barWidth: '100%',
      symbol: 'path://M0,10 L10,10 C5.5,10 5.5,5 5,0 C4.5,5 4.5,10 0,10 z',
      itemStyle: {
        normal: {
          opacity: 0.8,
          // color:'RGBA(133, 255, 105, 1)',
          color: new echarts.graphic.LinearGradient(
            0,
            1,
            0,
            0,
            [
              {
                offset: 0,
                color: 'RGBA(2, 27, 47, 1)', // 0% 处的颜色
              },
              {
                offset: 0.6,
                color: 'RGBA(26, 92, 108, 1)', // 60% 处的颜色
              },
              {
                offset: 1,
                color: 'RGBA(44, 137, 170, 1)', // 100% 处的颜色
              },
            ],
            false,
          ),
        },
        emphasis: {
          opacity: 1,
        },
      },
      data: [123, 100, 125, 128, 122, 122, 100],
      z: 10,
    },
  ],
};

export const option3 = {
  title: {
    text: '荣昌猪价：13.37元/kg',
    subtext: '',
    top: 10,
    right: 20,
    textStyle: {
      color: '#41a4ce',
    },
  },
  legend: {
    left: '5%',
    icon: 'roundRect',
    itemHeight: 9, //修改icon图形大小
    // icon: "path://M512 881.777778 512 881.777778C716.222629 881.777778 881.777778 716.222629 881.777778 512 881.777778 307.777371 716.222629 142.222222 512 142.222222 307.777373 142.222222 142.222222 307.777371 142.222222 512 142.222222 716.222629 307.777373 881.777778 512 881.777778L512 881.777778ZM512 1024 512 1024C229.230208 1024 0 794.769789 0 512 0 229.230211 229.230208 0 512 0 794.769789 0 1024 229.230211 1024 512 1024 794.769789 794.769789 1024 512 1024L512 1024Z",
    textStyle: {
      color: 'white', // 文字的颜色。
    },
  },
  backgroundColor: 'rgb(0, 22, 43, 0.75)',
  /**区域位置*/
  grid: { left: '3%', right: '4%', bottom: '2%', containLabel: true },
  tooltip: {
    trigger: 'axis',
  },
  xAxis: {
    type: 'category',
    data: ['哈尔滨', '黑河', '牡丹江', '佳木斯', '大庆', '鸡西', '鹤岗'],
    axisLine: {
      show: true,
      lineStyle: {
        color: '#41a4ce',
        width: 0,
        type: 'solid',
      },
    },
    axisTick: {
      show: false,
    },
  },
  yAxis: {
    splitNumber: 4,
    name: '单位：斤',
    min: 0,
    max: 1200,
    nameTextStyle: {
      color: '#41a4ce',
      padding: [0, 0, 0, 0],
    },
    axisLine: {
      show: true,
      lineStyle: {
        color: 'rgba(202, 255, 253,0.2)',
        width: 1,
        type: 'solid',
      },
    },
    splitLine: {
      lineStyle: {
        color: 'rgba(202, 255, 253,0.2)',
        type: 'dashed',
      },
    },
    axisLabel: {
      show: true,
      textStyle: {
        color: '#41a4ce', //更改坐标轴文字颜色
      },
    },
    axisTick: {
      show: false,
    },
  },
  series: [
    {
      name: '',
      type: 'pictorialBar',
      barCategoryGap: '40%',
      // symbol: 'triangle',
      barWidth: '100%',
      symbol: 'path://M0,10 L10,10 C5.5,10 5.5,5 5,0 C4.5,5 4.5,10 0,10 z',
      itemStyle: {
        normal: {
          opacity: 0.8,
          // color:'RGBA(133, 255, 105, 1)',
          color: new echarts.graphic.LinearGradient(
            0,
            1,
            0,
            0,
            [
              {
                offset: 0,
                color: 'RGBA(2, 27, 47, 1)', // 0% 处的颜色
              },
              {
                offset: 0.6,
                color: 'RGBA(26, 92, 108, 1)', // 60% 处的颜色
              },
              {
                offset: 1,
                color: 'RGBA(44, 137, 170, 1)', // 100% 处的颜色
              },
            ],
            false,
          ),
        },
        emphasis: {
          opacity: 1,
        },
      },
      data: [123, 100, 125, 128, 122, 122, 100],
      z: 10,
    },
  ],
};
