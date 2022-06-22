<template>
  <div class="warp">
    <div class="feces-container">
      <TabCard :tab-list="tabList"></TabCard>
    </div>
    <div class="right-box">
      <div class="right-item right-item1">
        <BmCellBox title="粪污设备统计" img="images/Feces/sbtj-bg.png">
          <template #content>
            <div class="right-content">
              <EchartBox :option="options.equipmentEchart" />
            </div>
          </template>
        </BmCellBox>
      </div>
      <div class="right-item right-item2">
        <BmCellBox title="环境粪污承载力" img="images/Feces/hjcz-bg.png">
          <template #content>
            <div class="waste-bearing-content">
              <div v-if="isShowScroll" class="dynamic-box">
                <div class="scroll-head">
                  <p class="head-title content-name">企业名称</p>
                  <p class="head-title content-value">环境粪污承载力</p>
                  <p class="head-title content-time">日期</p>
                </div>
                <Vue3SeamlessScroll :list="wasteBearingList" class="seamless-warp" :step="0.5" :hover="true">
                  <div v-for="(item, index) in wasteBearingList" :key="index" class="item">
                    <div class="item-content content-name">
                      {{ item?.name }}
                    </div>
                    <div class="item-content content-value">{{ item?.value }}{{ item?.unit }}</div>
                    <div class="item-content content-time">{{ item?.time }}</div>
                  </div>
                </Vue3SeamlessScroll>
              </div>
            </div>
          </template>
        </BmCellBox>
      </div>
      <div class="right-item">
        <BmCellBox title="粪污资源化利用率" img="images/Feces/rate-bg.png">
          <template #content>
            <div class="right-content">
              <EchartBox :option="options.rateEchart" />
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
import { genEquipmentChartOption, genUseRatioChartOption } from './feces';
import { ScrollItem } from './map';

useLifecycle(mapWork, GETMAPINSTANCE);

useMapToolsStore().changeToolsPositon({
  right: 395,
  top: 80,
});

//#region 定义变量
const fecesDataUrl = `${import.meta.env.BASE_URL}config/fecesData.json?time=${new Date().getTime()}`;
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
    name: '粪污处理企业',
    unit: '家',
    value: 1,
    img: 'images/Feces/fenwu-bg.png',
  },
]);
/** 图例 */
const toolbarList = ref<LegendToolbarList[]>([
  {
    name: '粪污处理企业',
    img: 'images/Feces/fenwu-icon.png',
  },
]);
const detailInfo = ref<DetailInfoItem[]>([]);

/** 环境废物承载力 */
const wasteBearingList = ref<ScrollItem[]>([]);
const isShowScroll = ref(false);

/** charts */
const options: any = reactive({
  equipmentEchart: undefined, // 设备统计chart
  rateEchart: undefined, // 利用率chart
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

//#region 数据获取
/**
 * 获取数据
 */
const getData = () => {
  // 获取配置json文件
  getJson({ url: fecesDataUrl }).then(
    (data: {
      tabList: TabList[];
      detailInfo: DetailInfoItem[];
      equipment: TabList[];
      wasteBearing: ScrollItem[];
      useRatio: any;
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
          element.bigType = 'Feces';
          element.parent = item;
          if (!element.img) {
            element.img = `images/Feces/${element.type ? element.type : 'fenwu'}-mark.png`;
          }
        });
      });
      // loadLegendPoint({ detailInfo: detailInfo.value });
      processMapData();

      // 右侧echarts数据处理
      options.equipmentEchart = genEquipmentChartOption(data.equipment);
      options.rateEchart = genUseRatioChartOption(data.useRatio);
      wasteBearingList.value = data.wasteBearing;
      isShowScroll.value = true;
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
$topHeight: 260px;
$bottomHeight: 270px;
.warp {
  color: $baseColor;
  pointer-events: all;
  .feces-container {
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
      width: 100%;
      height: $bottomHeight;
      .right-content {
        @apply flex flex-col justify-center items-center p-1 w-full h-full;
      }
    }

    .right-item1 {
      height: $topHeight;
      .right-content {
        background-size: 66% 70%;
        background-repeat: no-repeat;
        background-position: center;
        background-image: url('@/assets/images/Process/echart-bottom-bg.png');
      }
    }
    .right-item2 {
      height: calc(100% - $topHeight - $bottomHeight);

      .waste-bearing-content {
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
          background: rgb(9, 47, 70);
          @apply flex justify-center items-center w-full;
        }

        .head-title {
          padding: 0 10px;
          text-align: center;
        }

        .content-name {
          width: 30%;
        }
        .content-value {
          width: 40%;
        }
        .content-time {
          width: 30%;
        }
      }
    }
  }
}
</style>
<style lang="scss">
.feces-container {
  .warp {
    .tabcard-box {
      .item {
        width: 200px !important;
        .cotent {
          width: 62%;
        }
      }
    }
  }
}
</style>
