<template>
  <div class="warp">
    <div class="circulation-container">
      <TabCard :tab-list="tabList"></TabCard>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import TabCard from '@/components/TabCard/index.vue';
import { getJson } from '@/utils/mapCommon';
import { CirculationCityItem } from './map';
import { TabList } from '@/types/mainScreenTypes';
import { useMapRegionStore, useMapToolsStore } from '@/store';
import * as mapWork from './map';
import { useLifecycle } from 'bitmap3d';
import { GETMAPINSTANCE } from '@/types/const';

useLifecycle(mapWork, GETMAPINSTANCE);

useMapToolsStore().changeToolsPositon({
  right: 20,
  top: 80,
});

//#region 定义变量
const circulationUrl = `${import.meta.env.BASE_URL}config/circulationData.json`;
/** 菜单 */
const tabList = ref<TabList[]>([
  {
    name: '车辆GPS数量',
    unit: '辆',
    value: 46826,
    img: 'images/Circulation/GPS-bg.png',
  },
  {
    name: '运输总重量',
    unit: '辆',
    value: 26833,
    img: 'images/Circulation/transport-bg.png',
  },
]);
//#endregion

//#region 生命周期
onMounted(() => {
  useMapRegionStore().changeRegionArea({
    name: '重庆市',
    code: '500',
  });
  mapWork.initMap();
  getData();
});

onUnmounted(() => {
  useMapRegionStore().changeRegionArea({
    name: '重庆市',
    code: '500',
  });
  mapWork.clearLayer();
});
//#endregion

//#region 数据获取
/**
 * 获取数据
 */
const getData = () => {
  // 获取配置json文件
  getJson({ url: circulationUrl }).then((data: { tabList: TabList[]; detailInfo: CirculationCityItem[] }) => {
    console.log(data);
    const tempList: TabList[] = [];
    data.tabList.forEach((item: TabList, index: number) => {
      tempList.push({
        img: tabList.value[index].img ? tabList.value[index].img : tabList.value[0].img,
        ...item,
      });
    });
    tabList.value = tempList;
    mapWork.initEcharts(data.detailInfo);
  });
};
//#endregion
</script>
<script lang="ts">
export default {
  name: 'Circulation',
};
</script>
<style scoped lang="scss">
$baseColor: #55c2f5;
.warp {
  color: $baseColor;
  pointer-events: all;
  .circulation-container {
    left: 230px;
    top: 80px;
    width: 50%;
    height: 60px;
    @apply absolute flex flex-col justify-center items-center p-0;
  }
}
</style>
<style lang="scss">
.circulation-container {
  .warp {
    .tabcard-box {
      .item {
        width: 194px !important;
        .cotent {
          width: 64%;
        }
      }
    }
  }
}
</style>
