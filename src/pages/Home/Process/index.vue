<template>
  <div class="warp">
    <div class="process-container">
      <TabCard :tab-list="tabList"></TabCard>
    </div>
    <div class="echart-box">
      <div class="echart-item echart-item1">
        <BmCellBox title="荣昌区生猪进厂来源分布图" img="images/Process/pig-in-bg.png">
          <template #content>
            <div class="echart-content">
              <EchartBox :option="options.outEchart" />
            </div>
          </template>
        </BmCellBox>
      </div>
      <div class="echart-item echart-item1">
        <BmCellBox title="荣昌区生猪进厂去向分布图" img="images/Process/pig-out-bg.png">
          <template #content>
            <div class="echart-content">
              <EchartBox :option="options.comeinEchart" />
            </div>
          </template>
        </BmCellBox>
      </div>
      <div class="echart-item echart-item2">
        <BmCellBox title="荣昌区进厂出厂日/月趋势" img="images/Process/pig-in-bg.png">
          <template #content>
            <div class="echart-content">
              <div class="top">
                <span class="type" :class="{ active: currentType === 'day' }" @click="changeCurrentType('day')"
                  >日趋势 /</span
                >
                <span class="type" :class="{ active: currentType === 'month' }" @click="changeCurrentType('month')"
                  >&nbsp;月趋势</span
                >
              </div>
              <div class="bottom">
                <EchartBox :option="options.trendEchart" />
              </div>
            </div>
          </template>
        </BmCellBox>
      </div>
    </div>
    <LegendToolbar :toolbar-list="toolbarList" :position="position"></LegendToolbar>
  </div>
</template>
<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue';
import TabCard from '@/components/TabCard/index.vue';
import LegendToolbar from '@/components/LegendToolbar/index.vue';
import BmCellBox from '@/components/BmCellBox/index.vue';
import EchartBox from '@/components/EchartBox/index.vue';
import { useMapToolsStore, useMapRegionStore } from '@/store';
import { TabList, LegendToolbarList, DetailInfoItem } from '@/types/mainScreenTypes';
import { getJson } from '@/utils/mapCommon';
import * as mapWork from './map';
import { useLifecycle } from 'bitmap3d';
import { GETMAPINSTANCE } from '@/types/const';
import { addResourcePoint, removePointGraphic, loadLegendPoint, removeLegendPoint } from '@/plugins/commonMap';
import { genOutChartOption, genTrendChartOption } from './process';

useLifecycle(mapWork, GETMAPINSTANCE);

useMapToolsStore().changeToolsPositon({
  right: 395,
  top: 80,
});

//#region 定义变量
const processDataUrl = `${import.meta.env.BASE_URL}config/processData.json`;
const useMapRegion = useMapRegionStore();

const position = ref({
  width: 140,
  height: 90,
  bottom: 25,
  right: 400,
});
/** 菜单 */
const tabList = ref<TabList[]>([
  {
    name: '屠宰场',
    unit: '家',
    value: 6826,
    img: 'images/Process/tzc-bg.png',
  },
]);
/** 图例 */
const toolbarList = ref<LegendToolbarList[]>([
  {
    name: '屠宰场',
    img: 'images/Process/tzc-icon.png',
  },
]);
const detailInfo = ref<DetailInfoItem[]>([]);
/** 日月趋势 */
const currentType = ref('day');
const trendData = ref();
/** charts */
const options: any = reactive({
  outEchart: undefined, // 去向chart
  comeinEchart: undefined, // 来源chart
  trendEchart: undefined, // 趋势chart
});
//#endregion

//#region 生命周期
onMounted(() => {
  mapWork.initMap();
  getData();
});

onUnmounted(() => {
  mapWork.clearLayer();
  removeLegendPoint();
});
//#endregion

//#region ui交互
/**
 * 切换日月趋势
 */
const changeCurrentType = (type: string) => {
  currentType.value = type;
  options.trendEchart = genTrendChartOption(trendData.value[currentType.value], currentType.value);
};
//#endregion

//#region 数据获取
/**
 * 获取数据
 */
const getData = () => {
  // 获取配置json文件
  getJson({ url: processDataUrl }).then(
    (data: {
      tabList: TabList[];
      detailInfo: DetailInfoItem[];
      outData: TabList[];
      comeinData: TabList[];
      trendData: any;
    }) => {
      console.log(data);
      // tab数据处理
      const tempList: TabList[] = [];
      data.tabList.forEach((item: TabList, index: number) => {
        tempList.push({
          img: tabList.value[index].img ? tabList.value[index].img : tabList.value[0].img,
          ...item,
        });
      });
      tabList.value = tempList;

      // 地图数据处理
      detailInfo.value = data.detailInfo;
      detailInfo.value.forEach((item: any) => {
        item?.data.forEach((element: any) => {
          element.bigType = 'Process';
          element.parent = item;
          if (!element.img) {
            element.img = `images/Process/${element.type ? element.type : 'tzc'}-mark.png`;
          }
        });
      });
      // loadLegendPoint({ detailInfo: detailInfo.value });
      processMapData();

      // 右侧echarts数据处理
      trendData.value = data.trendData;
      options.outEchart = genOutChartOption(data.outData);
      options.comeinEchart = genOutChartOption(data.comeinData);
      options.trendEchart = genTrendChartOption(data.trendData[currentType.value], currentType.value);
    },
  );
};
//#endregion

//#region 数据订阅
useMapRegion.$subscribe(
  mutation => {
    processMapData();
  },
  { detached: false },
);

/**
 * 处理地图点数据
 */
const processMapData = () => {
  removePointGraphic(mapWork.pointGraphicLayer);
  removeLegendPoint();
  if (useMapRegion.getRegionArea.code === '500') {
    loadLegendPoint({ detailInfo: detailInfo.value });
  } else {
    for (let i = 0; i < detailInfo.value.length; i++) {
      if (detailInfo.value[i].name === (useMapRegion.getRegionArea.name as string)) {
        if (detailInfo.value[i].data) {
          addResourcePoint({ data: detailInfo.value[i].data, pointGraphicLayer: mapWork.pointGraphicLayer });
          return;
        }
      }
    }
  }
};
//#endregion
</script>
<script lang="ts">
export default {
  name: 'Process',
};
</script>
<style scoped lang="scss">
$baseColor: #55c2f5;
$topHeight: 260px;
.warp {
  color: $baseColor;
  pointer-events: all;
  .process-container {
    left: 230px;
    top: 80px;
    width: 50%;
    height: 60px;
    @apply absolute flex flex-col justify-center items-center p-0;
  }

  .echart-box {
    width: 388px;
    top: 80px;
    right: 0;
    height: calc(100% - 80px);
    background: rgba(0, 22, 43, 0.65);
    @apply absolute;

    .echart-item {
      width: 100%;
      .echart-content {
        @apply flex flex-col justify-center items-center p-0 w-full h-full;
      }
    }

    .echart-item1 {
      height: $topHeight;
      .echart-content {
        background-size: 66% 70%;
        background-repeat: no-repeat;
        background-position: center;
        background-image: url('@/assets/images/Process/echart-bottom-bg.png');
      }
    }
    .echart-item2 {
      height: calc(100% - $topHeight * 2);

      .echart-content {
        @apply flex flex-col justify-center items-center p-0 w-full h-full;

        .top {
          height: 30px;
          font-size: 14px;
          @apply flex justify-end items-center px-5 pt-3 w-full text-white;
          .type {
            cursor: pointer;
            line-height: 30px;
          }
          .active {
            color: #43a5d4;
            font-size: 16px;
            font-weight: 600;
          }
        }
        .bottom {
          height: calc(100% - 30px);
          max-height: 270px;
          width: 100%;
          @apply w-full;
        }
      }
    }
  }
}
</style>
<style lang="scss">
.breedConservation-container {
  .warp {
    .tabcard-box {
      .item {
        width: 194px !important;
        .cotent {
          width: 60%;
        }
      }
    }
  }
}
</style>
