import * as echarts from 'echarts';
import { BreedingRate } from './map';

//#region获取encharts
/**
 * 获取智慧养殖数字化率的echarts配置
 * @param params
 * @param type
 * @returns
 */
export function genBreedingRateChartOption(params: BreedingRate[]): object {
  const years: string[] = [];
  const rates: any[] = [];
  params.forEach((item: BreedingRate, index: number) => {
    years.push(item.year);
    // rates.push(item.value);
    rates.push({
      name: item.year,
      value: item.value,
    });
    rates[index].itemStyle = {
      normal: {
        borderWidth: item.isRealize ? 0 : 3,
      },
    };
  });

  const option = {
    title: {},
    legend: {
      left: '5%',
      icon: 'roundRect',
      itemHeight: 9, //修改icon图形大小
      // icon: "path://M512 881.777778 512 881.777778C716.222629 881.777778 881.777778 716.222629 881.777778 512 881.777778 307.777371 716.222629 142.222222 512 142.222222 307.777373 142.222222 142.222222 307.777371 142.222222 512 142.222222 716.222629 307.777373 881.777778 512 881.777778L512 881.777778ZM512 1024 512 1024C229.230208 1024 0 794.769789 0 512 0 229.230211 229.230208 0 512 0 794.769789 0 1024 229.230211 1024 512 1024 794.769789 794.769789 1024 512 1024L512 1024Z",
      textStyle: {
        color: 'white', // 文字的颜色。
      },
    },
    // backgroundColor: 'rgb(0, 22, 43, 0.75)',
    /**区域位置*/
    grid: { left: '2%', right: '2%', bottom: '2%', top: '14%', containLabel: true },
    tooltip: {
      trigger: 'axis',
    },
    xAxis: {
      type: 'category',
      data: years,
      axisLine: {
        show: false,
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
      name: '',
      min: 0,
      nameTextStyle: {
        color: '#41a4ce',
        padding: [0, 0, 0, 0],
      },
      axisLine: {
        show: false,
        lineStyle: {
          color: 'rgba(202, 255, 253,0.2)',
          width: 1,
          type: 'solid',
        },
      },
      splitLine: {
        show: false,
        lineStyle: {
          color: 'rgba(202, 255, 253,0.2)',
          type: 'dashed',
        },
      },
      axisLabel: {
        show: false,
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
            borderColor: '#55c2f5',
            // borderWidth: 0,
            borderType: 'dashed',
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
        label: {
          show: true,
          position: 'top',
          textStyle: {
            color: '#ffffff',
            fontSize: 10,
          },
          formatter: (params: any) => {
            return params.data.value + '%';
          },
        },
        data: rates,
        z: 10,
      },
    ],
  };
  return option;
}
//#endregion
