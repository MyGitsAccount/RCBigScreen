<template>
  <div class="warp">
    <div v-show="isShowBack" class="back-case" @click="goBackPrevious">
      <div class="back-arrow"></div>
      <span>返回</span>
    </div>
    <div class="tab-container cultivation-container">
      <TabCard :tab-list="tabList"></TabCard>
    </div>
    <LegendToolbar :toolbar-list="toolbarList" :position="position"></LegendToolbar>
    <div v-if="isShowScroll" class="dynamic-box">
      <div class="scroll-head">
        <p class="head-title head-title1">栋舍</p>
        <p class="head-title head-title2">智能设备</p>
        <p class="head-title head-title3">设备</p>
        <p class="head-title head-title4">时间</p>
      </div>
      <Vue3SeamlessScroll :list="scrollData" class="seamless-warp" :step="0.5" :hover="true">
        <div v-for="(item, index) in scrollData" :key="index" class="item">
          <div class="content-pigstyName">{{ item?.pigstyName }}</div>
          <div class="content-devName">
            {{ item?.devName }}
          </div>
          <div class="content-value">{{ item?.equipmentValue }}{{ item?.unit }}</div>
          <div class="content-dataTime" :title="item?.dataTime">
            {{ item?.dataTime }}
          </div>
        </div>
      </Vue3SeamlessScroll>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import TabCard from '@/components/TabCard/index.vue';
import { TabList, LegendToolbarList } from '@/types/mainScreenTypes';
import LegendToolbar from '@/components/LegendToolbar/index.vue';
import { getJson } from '@/utils/mapCommon';
import { useMapRegionStore, useMapToolsStore } from '@/store';
import { CultivationItem } from './map';
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
const cultivationUrl = `${import.meta.env.BASE_URL}config/cultivation.json?time=${new Date().getTime()}`;
const cqGeoJsonUrl = `${import.meta.env.BASE_URL}config/cq_geo.json?time=${new Date().getTime()}`;
const useMapRegion = useMapRegionStore();
const position = ref({
  width: 140,
  height: 90,
  bottom: 25,
  right: 24,
});
/** 菜单 */
const tabList = ref<TabList[]>([
  {
    name: '育肥猪存栏量',
    unit: '头',
    value: 35247,
    img: 'images/BreedConservation/zhuzongliang-bg.png',
  },
]);

/** 图例 */
const toolbarList = ref<LegendToolbarList[]>([
  {
    name: '养殖场',
    img: 'images/cultivation/feed_icon.png',
  },
]);

const detailInfo = ref<CultivationItem[]>([]);
let modelsPoint: any;
const cqGeoJson = ref();
const isShowBack = ref(false);
const scrollData = ref<any>([]);
const isShowScroll = ref(false);

onMounted(async () => {
  mapWork.initMap();
  getData();
});

onUnmounted(() => {
  mapWork.clearLayer();
  removeLegendPoint();
  removePointGraphic(mapWork.pointGraphicLayer);
  removeAnything();
  useMapRegionStore().changeRegionArea({
    name: '重庆市',
    code: '500',
  });
});
//#endregion

//#region 数据订阅
/**
 * 获取数据
 */
const getData = () => {
  // 获取配置json文件
  getJson({ url: cultivationUrl }).then(
    (data: { tabList: TabList[]; detailInfo: CultivationItem[]; culiivationScroll: any; modlesData: any }) => {
      const tempList: TabList[] = [];
      data.tabList.forEach((item: TabList, index: number) => {
        tempList.push({
          img: tabList.value[index].img ? tabList.value[index].img : tabList.value[0].img,
          ...item,
        });
      });
      tabList.value = tempList;

      data.culiivationScroll.forEach((item: any) => {
        scrollData.value.push(item);
      });
      isShowScroll.value = true;
      modelsPoint = data.modlesData;
      detailInfo.value = data.detailInfo;

      detailInfo.value.forEach((item: any) => {
        item?.data.forEach((element: any) => {
          element.bigType = 'cultivation';
          element.parent = item;
          if (!element.img) {
            element.img = `images/cultivation/${element.type ? element.type : 'feed'}_factory.png`;
          }
        });
      });
      loadLegendPoint({ detailInfo: detailInfo.value });
    },
  );

  getJson({ url: cqGeoJsonUrl }).then((data: any) => {
    cqGeoJson.value = data;
  });
};

// #region 数据订阅
useMapRegion.$subscribe(
  mutation => {
    mapWork.removeAllPoints(mapWork.modlesPointsGraphicLayer);
    removeLegendPoint();
    mapWork.clear3dModelLayer();
    removePointGraphic(mapWork.pointGraphicLayer);
    isShowBack.value = false;
    if (useMapRegion.getRegionArea.code === '500') {
      // isShowBack.value = false;
      loadLegendPoint({ detailInfo: detailInfo.value });
    } else {
      // isShowBack.value = true;
      for (let i = 0; i < detailInfo.value.length; i++) {
        if (detailInfo.value[i].name === useMapRegion.getRegionArea.name) {
          if (detailInfo.value[i].data) {
            detailInfo.value[i].data.forEach((item: any) => {
              item.bigType = 'cultivation';
            });
            addResourcePoint({ data: detailInfo.value[i].data, pointGraphicLayer: mapWork.pointGraphicLayer });
            return;
          }
        }
      }
    }
  },
  { detached: false },
);

eventTarget.on('moreDetail', event => {
  isShowBack.value = true;
  const deleteObj = [
    'calibGroupWall',
    'calibGroupcalib',
    'calibGroupcalibValue',
    'calibGroupCity',
    'calibGroupDynamic',
  ];
  for (let i = 0; i < deleteObj.length; i++) {
    mapWork.clearAllLayerOfGraphic(deleteObj[i]);
  }
  const modelName = event.graphics.attr.modelName;

  const modelPoint = [event.graphics._point._lng, event.graphics._point._lat];
  mapWork.removeWall(useMapRegionStore().$state.regionArea.name + '边界墙');
  removePointGraphic(mapWork.pointGraphicLayer);
  mapWork.add3DTiesModel(modelPoint, modelsPoint, modelName);
  mapWork.addPointSelectProvince(modelPoint, modelsPoint, modelName);
});

function removeAnything(): void {
  mapWork.removeAllPoints(mapWork.modlesPointsGraphicLayer);
  mapWork.clear3dModelLayer();
}

function goBackPrevious(): void {
  isShowBack.value = false;
  removeAnything();
  const name: string = useMapRegionStore().$state.regionArea.name as string;
  mapWork.addProvince(name, cqGeoJson.value);
  for (let i = 0; i < detailInfo.value.length; i++) {
    if (detailInfo.value[i].name === useMapRegionStore().$state.regionArea.name) {
      if (detailInfo.value[i].data) {
        detailInfo.value[i].data.forEach((item: any) => {
          item.bigType = 'cultivation';
        });
        addResourcePoint({ data: detailInfo.value[i].data, pointGraphicLayer: mapWork.pointGraphicLayer });
        return;
      }
    }
  }
}
//#endregion
</script>

<script lang="ts">
import { defineComponent } from 'vue';
import { Vue3SeamlessScroll } from 'vue3-seamless-scroll';
export default defineComponent({
  components: {
    Vue3SeamlessScroll,
  },
});
</script>
<style scoped lang="scss">
$baseColor: #55c2f5;
.warp {
  color: $baseColor;
  pointer-events: all;
  .tab-container {
    left: 230px;
    top: 80px;
    width: 50%;
    height: 60px;
    @apply absolute flex flex-col justify-center items-center p-0;
  }
}

.back-case {
  position: fixed;
  top: 30px;
  left: 36px;
  width: 92px;
  height: 30px;
  background: url('../../../assets/images/cultivation/backbg.png') no-repeat 100% 100%;
  display: flex;
  padding: 0 5px;
  align-items: center;
  cursor: pointer;
}

.back-arrow {
  width: 30px;
  height: 18px;
  background: url(/src/assets/images/cultivation/backarrow.png) no-repeat 100% 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 8px;
}

.dynamic-box {
  position: absolute;
  width: 350px;
  height: 222px;
  left: 240px;
  top: 150px;
  padding: 0 5px;
  background-size: 100% 100%;
  background-repeat: no-repeat;
  // background-image: url("@/assets/image/monitor/overview/dynamic-bg.png");
  display: flex;
  flex-direction: column;
  align-items: center;
  pointer-events: all;

  .seamless-warp {
    width: 100%;
    height: 200px;
    overflow: hidden;
    overflow-y: auto;
    background: #00192e;
    opacity: 0.7;
    &::-webkit-scrollbar {
      display: none;
    }
    .item {
      width: 100%;
      height: 40px;
      display: flex;
      align-items: center;
      border-bottom: 1px dashed #11445b;
      cursor: default;
      .content-pigstyName {
        width: 70px;
        text-align: center;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .content-devName {
        width: 100px;
        text-align: center;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .content-value {
        width: 80px;
        text-align: center;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .content-dataTime {
        width: 100px;
        text-align: center;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
  }
}

.scroll-head {
  width: 341px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgb(9, 47, 70);
}

.head-title {
  padding: 0 10px;
  text-align: center;
}

.head-title1 {
  width: 70px;
}

.head-title2 {
  width: 100px;
}

.head-title3 {
  width: 80px;
}

.head-title4 {
  width: 100px;
}
</style>

<style lang="scss">
.cultivation-container {
  .warp {
    .tabcard-box {
      .item {
        width: 200px !important;
        .cotent {
          width: 62% !important;
        }
      }
    }
  }
}
</style>
