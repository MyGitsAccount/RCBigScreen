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
    <!-- <div v-if="isShowScroll" class="dynamic-box">
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
    </div> -->
    <div class="right-box">
      <div class="right-item">
        <BmCellBox title="各镇街存栏量" img="images/Feces/sbtj-bg.png">
          <template #content>
            <div class="right-content">
              <div v-if="isShowScroll" class="dynamic-box">
                <div class="scroll-head">
                  <p class="head-title content-name">镇街</p>
                  <p class="head-title content-yfz">育肥猪存栏量</p>
                  <p class="head-title content-mzcl">母猪猪存栏量</p>
                  <p class="head-title content-gzcl">公猪存栏量</p>
                </div>
                <Vue3SeamlessScroll :list="streetTownData" class="seamless-warp" :step="0.5" :hover="true">
                  <div v-for="(item, index) in streetTownData" :key="index" class="item">
                    <div class="item-content content-name">{{ item?.name }}</div>
                    <div class="item-content content-yfz">
                      {{ item?.yfz }}
                    </div>
                    <div class="item-content content-mzcl">{{ item?.mzcl }}</div>
                    <div class="item-content content-gzcl">{{ item?.gzcl }}</div>
                  </div>
                </Vue3SeamlessScroll>
              </div>
            </div>
          </template>
        </BmCellBox>
      </div>
      <div class="right-item">
        <BmCellBox title="智慧养殖场存栏量" img="images/Feces/hjcz-bg.png">
          <template #content>
            <div class="right-content">
              <div v-if="isShowScroll" class="dynamic-box">
                <div class="scroll-head">
                  <p class="head-title content-name">养殖场</p>
                  <p class="head-title content-yfz">育肥猪存栏量</p>
                  <p class="head-title content-mzcl">母猪猪存栏量</p>
                  <p class="head-title content-gzcl">公猪存栏量</p>
                </div>
                <Vue3SeamlessScroll :list="farmCllData" class="seamless-warp" :step="0.5" :hover="true">
                  <div v-for="(item, index) in farmCllData" :key="index" class="item">
                    <div class="item-content content-name">{{ item?.name }}</div>
                    <div class="item-content content-yfz">
                      {{ item?.yfz }}
                    </div>
                    <div class="item-content content-mzcl">{{ item?.mzcl }}</div>
                    <div class="item-content content-gzcl">{{ item?.gzcl }}</div>
                  </div>
                </Vue3SeamlessScroll>
              </div>
            </div>
          </template>
        </BmCellBox>
      </div>
      <div class="right-item right-item1">
        <BmCellBox title="智慧养殖场数字化率" img="images/Feces/rate-bg.png">
          <template #content>
            <div class="right-content">
              <EchartBox :option="options.breedingRateEchart" />
            </div>
          </template>
        </BmCellBox>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue';
import TabCard from '@/components/TabCard/index.vue';
import { TabList, LegendToolbarList } from '@/types/mainScreenTypes';
import LegendToolbar from '@/components/LegendToolbar/index.vue';
import BmCellBox from '@/components/BmCellBox/index.vue';
import EchartBox from '@/components/EchartBox/index.vue';
import { getJson } from '@/utils/mapCommon';
import { useMapRegionStore, useMapToolsStore } from '@/store';
import { CultivationItem, BreedingRate, FarmCllItem } from './map';
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
import { genBreedingRateChartOption } from './cultivation';

useLifecycle(mapWork, GETMAPINSTANCE);
useMapToolsStore().changeToolsPositon({
  right: 395,
  top: 80,
});

//#region 定义变量
const cultivationUrl = `${import.meta.env.BASE_URL}config/cultivation.json?time=${new Date().getTime()}`;
const cqGeoJsonUrl = `${import.meta.env.BASE_URL}config/static/cq_geo.json?time=${new Date().getTime()}`;
const useMapRegion = useMapRegionStore();
/** 图例位置 */
const position = ref({
  width: 140,
  height: 90,
  bottom: 25,
  right: 400,
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
/** 各街镇存栏量 */
const streetTownData = ref<any[]>([]);
/** 养殖场存栏量 */
const farmCllData = ref<any[]>([]);
/** charts */
const options: any = reactive({
  breedingRateEchart: undefined, // 智慧养殖数字化率chart
});
//#endregion

//#region 生命周期
onMounted(async () => {
  mapWork.initMap();
  getData();
});

onUnmounted(() => {
  if (isShowBack.value) {
    goBackPrevious();
  }
  mapWork.clearLayer();
  removeLegendPoint();
  removePointGraphic(mapWork.pointGraphicLayer);
  removeAnything();
});
//#endregion

//#region 数据获取
/**
 * 获取数据
 */
const getData = () => {
  // 获取配置json文件
  getJson({ url: cultivationUrl }).then(
    (data: {
      tabList: TabList[];
      detailInfo: CultivationItem[];
      culiivationScroll: any;
      modlesData: any;
      streetTownData: FarmCllItem[];
      farmCllData: FarmCllItem[];
      breedingRate: BreedingRate[];
    }) => {
      const tempList: TabList[] = [];
      data.tabList.forEach((item: TabList, index: number) => {
        tempList.push({
          img: tabList.value[index].img ? tabList.value[index].img : tabList.value[0].img,
          ...item,
        });
      });
      tabList.value = tempList;
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
      // loadLegendPoint({ detailInfo: detailInfo.value });
      processMapData();

      // 右侧数据
      options.breedingRateEchart = genBreedingRateChartOption(data.breedingRate);
      scrollData.value = data.culiivationScroll;
      streetTownData.value = data.streetTownData;
      farmCllData.value = data.farmCllData;
      isShowScroll.value = true;
    },
  );

  getJson({ url: cqGeoJsonUrl }).then((data: any) => {
    cqGeoJson.value = data;
  });
};
//#endregion

// #region 数据订阅
useMapRegion.$subscribe(
  mutation => {
    mapWork.removeAllPoints(mapWork.modlesPointsGraphicLayer);
    removeLegendPoint();
    mapWork.clear3dModelLayer();
    removePointGraphic(mapWork.pointGraphicLayer);
    isShowBack.value = false;
    processMapData();
  },
  { detached: false },
);

/**
 * 处理地图点数据
 */
const processMapData = () => {
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
};

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
$fontColor: #b8d2e6;
$topHeight: 280px;
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
  .right-box {
    width: 388px;
    top: 80px;
    right: 0;
    height: calc(100% - 80px);
    background: rgba(0, 22, 43, 0.65);
    @apply absolute;

    .right-item {
      height: calc((100% - $topHeight) / 2);

      .right-content {
        @apply flex flex-col justify-start items-center p-2 w-full h-full;

        .dynamic-box {
          pointer-events: all;
          @apply flex flex-col justify-start items-center w-full h-full;

          .seamless-warp {
            width: 100%;
            height: 100%;
            overflow: hidden;
            overflow-y: auto;
            background: #00192e;
            opacity: 0.7;
            &::-webkit-scrollbar {
              display: none;
            }
            .item {
              height: 36px;
              border-bottom: 1px dashed #11445b;
              cursor: default;
              color: $fontColor;
              font-size: 15px;
              @apply flex items-center w-full;
              .item-content {
                text-align: center;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
              }
            }
          }
        }

        .scroll-head {
          height: 40px;
          font-size: 15px;
          background: rgb(9, 47, 70);
          @apply flex justify-center items-center w-full;
        }

        .head-title {
          padding: 0 5px;
          text-align: center;
        }
        .content-name {
          width: 17%;
        }
        .content-yfz {
          width: 29%;
        }
        .content-mzcl {
          width: 29%;
        }
        .content-gzcl {
          width: 26%;
        }
      }
    }

    .right-item1 {
      height: $topHeight;
    }
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

  .back-arrow {
    width: 30px;
    height: 18px;
    background: url(/src/assets/images/cultivation/backarrow.png) no-repeat 100% 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 8px;
  }
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
