<template>
  <div class="warp">
    <div class="tab-container brand-container">
      <TabCard :tab-list="tabList"></TabCard>
    </div>
    <LegendToolbar :toolbar-list="toolbarList" :position="position"></LegendToolbar>
    <div class="right-box">
      <div class="right-item">
        <BmCellBox title="猪肉价/白条价" img="images/Feces/pig-price-bg.png">
          <template #content>
            <div class="right-content">
              <div v-if="isShowScroll" class="dynamic-box">
                <div class="scroll-head">
                  <p class="head-title content-index">序号</p>
                  <p class="head-title content-time">时间</p>
                  <p class="head-title content-porkprice">猪价</p>
                  <p class="head-title content-whiteprice">白条价</p>
                </div>
                <Vue3SeamlessScroll :list="porkPriceData" class="seamless-warp" :step="0.5" :hover="true">
                  <div v-for="(item, index) in porkPriceData" :key="index" class="item">
                    <div class="item-content content-index">{{ index + 1 }}</div>
                    <div class="item-content content-time">
                      {{ item?.dataTime }}
                    </div>
                    <div class="item-content content-porkprice">{{ item?.pigPrice }}{{ item?.unit }}</div>
                    <div class="item-content content-whiteprice">{{ item?.whitePrice }}{{ item?.unit }}</div>
                  </div>
                </Vue3SeamlessScroll>
              </div>
            </div>
          </template>
        </BmCellBox>
      </div>
      <div class="right-item right-item1">
        <BmCellBox title="溯源流程状态" img="images/Feces/hjcz-bg.png">
          <template #content>
            <div class="right-content">
              <EchartBox :option="options.flowStatusEchart" />
            </div>
          </template>
        </BmCellBox>
      </div>
      <div class="right-item right-item2">
        <BmCellBox title="溯源业务量" img="images/Feces/rate-bg.png">
          <template #content>
            <div class="right-content">
              <div v-if="isShowScroll" class="dynamic-box">
                <div class="scroll-head">
                  <p class="head-title content-index">溯源编号</p>
                  <p class="head-title content-name">业务环节</p>
                  <p class="head-title content-status">上链状态</p>
                  <p class="head-title content-whiteprice">更新时间</p>
                </div>
                <Vue3SeamlessScroll :list="portfolioData" class="seamless-warp" :step="0.5" :hover="true">
                  <div v-for="(item, index) in portfolioData" :key="index" class="item">
                    <div class="item-content content-index">{{ item?.value }}</div>
                    <div class="item-content content-name">
                      {{ item?.name }}
                    </div>
                    <div class="item-content content-status" :class="{ active: item?.status === '未上链' }">
                      {{ item?.status }}
                    </div>
                    <div class="item-content content-time">{{ item?.time }}</div>
                  </div>
                </Vue3SeamlessScroll>
              </div>
            </div>
          </template>
        </BmCellBox>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue';
import { useMapRegionStore, useMapToolsStore } from '@/store';
import TabCard from '@/components/TabCard/index.vue';
import LegendToolbar from '@/components/LegendToolbar/index.vue';
import BmCellBox from '@/components/BmCellBox/index.vue';
import EchartBox from '@/components/EchartBox/index.vue';
import { TabList, LegendToolbarList } from '@/types/mainScreenTypes';
import { getJson } from '@/utils/mapCommon';
import { BrandItem, PorkPriceItem, PortfolioItem } from './map';
import { loadLegendPoint, removeLegendPoint, removePointGraphic, addResourcePoint } from '@/plugins/commonMap';
import * as mapWork from './map';
import { useLifecycle } from 'bitmap3d';
import { GETMAPINSTANCE } from '@/types/const';
import { genOutChartOption } from '@/pages/Home/Process/process';

useLifecycle(mapWork, GETMAPINSTANCE);

useMapToolsStore().changeToolsPositon({
  right: 395,
  top: 80,
});

//#region 定义变量
const useMapRegion = useMapRegionStore();
const brandUrl = `${import.meta.env.BASE_URL}config/brand.json?time=${new Date().getTime()}`;

/** 图例位置 */
const position = ref({
  width: 140,
  height: 130,
  bottom: 25,
  right: 400,
});

const detailInfo = ref<BrandItem[]>([]);
const isShowScroll = ref(false);
/** 猪肉价/白条价 */
const porkPriceData = ref<PorkPriceItem[]>([]);
/** 业务量 */
const portfolioData = ref<PortfolioItem[]>([]);
/** 菜单 */
const tabList = ref<TabList[]>([
  {
    name: '体验店',
    unit: '家',
    value: 2826,
    img: 'images/brand/experence_bg.png',
  },
  {
    name: '销售点',
    unit: '家',
    value: 2133,
    img: 'images/brand/seal_bg.png',
  },
]);

/** 图例 */
const toolbarList = ref<LegendToolbarList[]>([
  {
    name: '销售点',
    img: 'images/brand/seal_icon.png',
  },
  {
    name: '体验店',
    img: 'images/brand/experence_icon.png',
  },
]);

/** charts */
const options: any = reactive({
  flowStatusEchart: undefined, // 溯源流程chart
});
//#endregion

//#region 生命周期
onMounted(async () => {
  mapWork.initMap();
  getData();
});

onUnmounted(() => {
  removeLegendPoint();
  removePointGraphic(mapWork.pointGraphicLayer);
});
//#endregion

// #region 数据获取
/**
 * 获取数据
 */
const getData = () => {
  // 获取配置json文件
  getJson({ url: brandUrl }).then(
    (data: {
      tabList: TabList[];
      detailInfo: BrandItem[];
      porkPrice: PorkPriceItem[];
      portfolio: PortfolioItem[];
      flowStatus: TabList[];
    }) => {
      const tempList: TabList[] = [];
      data.tabList.forEach((item: TabList, index: number) => {
        tempList.push({
          img: tabList.value[index].img ? tabList.value[index].img : tabList.value[0].img,
          ...item,
        });
      });

      tabList.value = tempList;
      detailInfo.value = data.detailInfo;
      detailInfo.value.forEach((item: any) => {
        item?.data.forEach((element: any) => {
          element.bigType = 'brand';
          element.parent = item;
          if (!element.img) {
            element.img = `images/brand/${element.type ? element.type : 'seal'}.png`;
          }
        });
      });
      // loadLegendPoint({ detailInfo: detailInfo.value });
      processMapData();

      // 右侧数据
      options.flowStatusEchart = genOutChartOption(data.flowStatus);
      porkPriceData.value = data.porkPrice;
      portfolioData.value = data.portfolio;
      isShowScroll.value = true;
    },
  );
};
//#endregion

// #region 数据订阅
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
  removeLegendPoint();
  removePointGraphic(mapWork.pointGraphicLayer);
  if (useMapRegion.getRegionArea.code === '500') {
    loadLegendPoint({ detailInfo: detailInfo.value });
  } else {
    for (let i = 0; i < detailInfo.value.length; i++) {
      if (detailInfo.value[i].name === useMapRegion.getRegionArea.name) {
        if (detailInfo.value[i].data) {
          detailInfo.value[i].data.forEach((item: any) => {
            item.bigType = 'brand';
          });
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
          background: rgb(9, 47, 70);
          @apply flex justify-center items-center w-full;
        }

        .head-title {
          padding: 0 10px;
          text-align: center;
        }
        .content-index {
          width: 20%;
        }
        .content-time {
          width: 30%;
        }
        .content-porkprice {
          width: 25%;
        }
        .content-whiteprice {
          width: 25%;
        }
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
      .right-content {
        .content-index {
          width: 29%;
        }
        .content-name {
          width: 23%;
        }
        .content-status {
          width: 23%;
        }
        .content-time {
          width: 25%;
        }

        .active {
          color: #7d7f82;
        }
      }
    }
  }
}
</style>

<style lang="scss">
.brand-container {
  .warp {
    .tabcard-box {
      .item {
        width: 160px !important;
        .cotent {
          width: 64%;
          text-indent: 10px;
        }
      }
    }
  }
}
</style>
