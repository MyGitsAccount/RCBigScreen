<template>
  <div class="warp">
    <div class="breedConservation-container">
      <TabCard :tab-list="tabList"></TabCard>
    </div>
    <LegendToolbar :toolbar-list="toolbarList"></LegendToolbar>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import TabCard from '@/components/TabCard/index.vue';
import LegendToolbar from '@/components/LegendToolbar/index.vue';
import { useMapRegionStore, useMapToolsStore } from '@/store';
import { getJson } from '@/utils/mapCommon';
import { TabList, LegendToolbarList, DetailInfoItem } from '@/types/mainScreenTypes';
import * as mapWork from './map';
import { useLifecycle } from 'bitmap3d';
import { GETMAPINSTANCE } from '@/types/const';
import {
  eventTarget,
  removePointGraphic,
  addResourcePoint,
  loadLegendPoint,
  removeLegendPoint,
} from '@/plugins/commonMap';

useLifecycle(mapWork, GETMAPINSTANCE);

useMapToolsStore().changeToolsPositon({
  right: 20,
  top: 80,
});

//#region 定义变量
const breedConservationUrl = `${import.meta.env.BASE_URL}config/breedConservationData.json`;
const useMapRegion = useMapRegionStore();
/** 菜单 */
const tabList = ref<TabList[]>([
  {
    name: '荣昌猪存栏量',
    unit: '头',
    value: 52145,
    img: 'images/BreedConservation/zhuzongliang-bg.png',
  },
  {
    name: '荣昌存栏量',
    unit: '头',
    value: 35247,
    img: 'images/BreedConservation/zhuzongliang-bg.png',
  },
  {
    name: '母猪存栏量',
    unit: '头',
    value: 10258,
    img: 'images/BreedConservation/muzhu-bg.png',
  },
  {
    name: '公猪存栏量',
    unit: '头',
    value: 1573,
    img: 'images/BreedConservation/gongzhu-bg.png',
  },
]);
/** 图例 */
const toolbarList = ref<LegendToolbarList[]>([
  {
    name: '畜科院基地',
    img: 'images/BreedConservation/xkyjd-icon.png',
  },
  {
    name: '畜科院总部',
    img: 'images/BreedConservation/xkyzb-icon.png',
  },
]);
const detailInfo = ref<DetailInfoItem[]>([]);
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

//#region 数据获取
/**
 * 获取数据
 */
const getData = () => {
  // 获取配置json文件
  getJson({ url: breedConservationUrl }).then((data: { tabList: TabList[]; detailInfo: DetailInfoItem[] }) => {
    console.log(data);
    const tempList: TabList[] = [];
    data.tabList.forEach((item: TabList, index: number) => {
      tempList.push({
        img: tabList.value[index].img ? tabList.value[index].img : tabList.value[0].img,
        ...item,
      });
    });
    tabList.value = tempList;
    // mapWork.initEcharts(data.detailInfo);
    detailInfo.value = data.detailInfo;
    detailInfo.value.forEach((item: any) => {
      item?.data.forEach((element: any) => {
        element.bigType = 'breedConservation';
        element.parent = item;
        if (!element.img) {
          element.img = `images/BreedConservation/${element.type ? element.type : 'xkyjd'}-mark.png`;
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
    // mapWork.changeEchartsLayer(true);
    loadLegendPoint({ detailInfo: detailInfo.value });
  } else {
    // mapWork.changeEchartsLayer(false);
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

eventTarget.on('moreDetail', event => {
  // console.log(9999, event);
});
//#endregion
</script>
<script lang="ts">
export default {
  name: 'BreedConservation',
};
</script>
<style scoped lang="scss">
$baseColor: #55c2f5;
.warp {
  color: $baseColor;
  pointer-events: all;
  .breedConservation-container {
    left: 230px;
    top: 80px;
    width: 50%;
    height: 60px;
    @apply absolute flex flex-col justify-center items-center p-0;
  }
}
</style>
<style lang="scss">
.breedConservation-container {
  .warp {
    .tabcard-box {
      .item {
        width: 198px !important;
        .cotent {
          width: 62% !important;
        }
      }
    }
  }
}
</style>
