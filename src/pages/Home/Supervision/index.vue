<template>
  <div class="warp">
    <div class="supervision-container">
      <TabCard :tab-list="tabList"></TabCard>
    </div>
    <div class="echart-box">
      <ComponentEchart v-if="isShowEchart"></ComponentEchart>
    </div>
    <LegendToolbar :toolbar-list="toolbarList" :position="position"></LegendToolbar>
  </div>
</template>
<script setup lang="ts">
import { onMounted, ref, onUnmounted } from 'vue';
import ComponentEchart from '@/components/ComponentEchart/index.vue';
import { useMapRegionStore, useMapToolsStore } from '@/store';
import TabCard from '@/components/TabCard/index.vue';
import LegendToolbar from '@/components/LegendToolbar/index.vue';
import { getJson } from '@/utils/mapCommon';
import { TabList, LegendToolbarList, DetailInfoItem } from '@/types/mainScreenTypes';
import * as mapWork from './map';
import { useLifecycle } from 'bitmap3d';
import { GETMAPINSTANCE } from '@/types/const';
import { removePointGraphic, addResourcePoint, loadLegendPoint, removeLegendPoint } from '@/plugins/commonMap';
useLifecycle(mapWork, GETMAPINSTANCE);

//#region 定义变量
const supervisionDataUrl = `${import.meta.env.BASE_URL}config/SupervisionData.json`;
const useMapRegion = useMapRegionStore();
useMapToolsStore().changeToolsPositon({
  right: 395,
  top: 80,
});

/** 右侧图表是否显示 */
const isShowEchart = ref(false);
/** 图例位置 */
const position = ref({
  width: 140,
  height: 130,
  bottom: 25,
  right: 400,
});
/** 菜单 */
const tabList = ref<TabList[]>([
  {
    name: '产地检疫',
    unit: '',
    value: 6826,
    img: 'images/Supervision/cdjy-bg.png',
  },
  {
    name: '屠宰检疫',
    unit: '',
    value: 2133,
    img: 'images/Supervision/tzjy-bg.png',
  },
]);
/** 图例 */
const toolbarList = ref<LegendToolbarList[]>([
  {
    name: '产地检疫',
    img: 'images/Supervision/cdjy-icon.png',
  },
  {
    name: '屠宰检疫',
    img: 'images/Supervision/tzjy-icon.png',
  },
]);
const detailInfo = ref<DetailInfoItem[]>([]);

//#endregion

//#region 生命周期
onMounted(() => {
  isShowEchart.value = true;
  mapWork.initMap();
  getData();
});

onUnmounted(() => {
  mapWork.clearLayer();
  removeLegendPoint();
});
//#endregion

//#region 数据获取
/**
 * 获取数据
 */
const getData = () => {
  // 获取配置json文件
  getJson({ url: supervisionDataUrl }).then((data: { tabList: TabList[]; detailInfo: DetailInfoItem[] }) => {
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
        element.bigType = 'Supervision';
        element.parent = item;
        if (!element.img) {
          element.img = `images/Supervision/${element.type ? element.type : 'cdjy'}-mark.png`;
        }
      });
    });
    // loadLegendPoint({ detailInfo: detailInfo.value });
    processMapData();
  });
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
      if (detailInfo.value[i].name === useMapRegion.getRegionArea.name) {
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
  name: 'Supervision',
};
</script>
<style scoped lang="scss">
$baseColor: #55c2f5;
$topHeight: 280px;
.warp {
  color: $baseColor;
  pointer-events: all;
  .supervision-container {
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
    background: rgba(0, 22, 43, 0.65);
    @apply absolute h-full;
  }
}
</style>
