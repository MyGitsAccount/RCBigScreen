<template>
  <div ref="echartBox" class="echarts"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, watchEffect, onBeforeUnmount } from 'vue';
import * as echarts from 'echarts/core';
import {
  BarChart, // 柱状图
  // 系列类型的定义后缀都为 SeriesOption
  BarSeriesOption,
  LineChart, // 折线图
  LineSeriesOption,
  PieChart, // 饼图
  PieSeriesOption,
} from 'echarts/charts';
import {
  // 组件类型的定义后缀都为 ComponentOption
  // 标题
  TitleComponent,
  TitleComponentOption,
  // 提示框
  TooltipComponent,
  TooltipComponentOption,
  // 直角坐标系
  GridComponent,
  GridComponentOption,
  // 图例
  LegendComponent,
  LegendComponentOption,
  // 数据集组件
  DatasetComponent,
  DatasetComponentOption,
  // 内置数据转换器组件 (filter, sort)
  TransformComponent,
  DataZoomComponent,
  DataZoomComponentOption,
  // 极坐标
  PolarComponent,
  PolarComponentOption,
} from 'echarts/components';
import { LabelLayout, UniversalTransition } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';
import 'echarts-gl';

// 通过 ComposeOption 来组合出一个只有必须组件和图表的 Option 类型
type ECOption = echarts.ComposeOption<
  | BarSeriesOption
  | LineSeriesOption
  | PieSeriesOption
  | TitleComponentOption
  | TooltipComponentOption
  | GridComponentOption
  | DatasetComponentOption
  | LegendComponentOption
  | DataZoomComponentOption
  | PolarComponentOption
>;

// 注册必须的组件
echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DatasetComponent,
  TransformComponent,
  LegendComponent,
  DataZoomComponent,
  PolarComponent,
  LabelLayout,
  UniversalTransition,
  CanvasRenderer,
  BarChart,
  LineChart,
  PieChart,
]);
const props = defineProps({
  option: {
    type: Object,
    default: () => {
      return null;
    },
  },
});
const emit = defineEmits(['echartsEvent']);
const echartBox = ref(null);
let chart!: echarts.ECharts;

const setChart = (option: ECOption): void => {
  if (!props.option || !echartBox.value) {
    return;
  }
  chart.resize();
  chart.setOption(option);
};

const resetChart = (): void => {
  const option = chart.getOption();
  if (!option || !echartBox.value) {
    return;
  }
  chart.resize();
  // chart.clear();
  // chart.setOption(option);
};

onMounted(() => {
  chart = echarts.init(echartBox.value as any);
  emit('echartsEvent', chart);
  setChart(props.option);
  // 界面拉伸后重设
  window.addEventListener('resize', () => {
    resetChart();
  });
});

watchEffect(() => {
  if (chart) {
    chart.clear();
  }
  setChart(props.option);
});

onBeforeUnmount(() => {
  if (chart) {
    chart.dispose();
  }
});
</script>

<style scoped lang="scss">
.echarts {
  width: 100%;
  height: 100%;
}
</style>
