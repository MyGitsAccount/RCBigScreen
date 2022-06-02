<template>
  <div class="warp">
    <div class="tab-container brand-container">
      <TabCard :tab-list="tabList"></TabCard>
    </div>
    <LegendToolbar :toolbar-list="toolbarList"></LegendToolbar>
    <div v-if="isShowScroll" class="dynamic-box">
      <div class="scroll-head">
        <p class="head-title head-title1">序号</p>
        <p class="head-title head-title2">时间</p>
        <p class="head-title head-title3">猪价</p>
        <p class="head-title head-title4">白条价</p>
      </div>
      <Vue3SeamlessScroll :list="scrollData" class="seamless-warp" :step="0.5" :hover="true">
        <div v-for="(item, index) in scrollData" :key="index" class="item">
          <div class="content-number">{{ index + 1 }}</div>
          <div class="content-dataTime">
            {{ item?.dataTime }}
          </div>
          <div class="content-value">{{ item?.pigPrice }}{{ item?.unit }}</div>
          <div class="content-whiteprice">{{ item?.whitePrice }}{{ item?.unit }}</div>
        </div>
      </Vue3SeamlessScroll>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useMapRegionStore, useMapToolsStore } from '@/store';
import TabCard from '@/components/TabCard/index.vue';
import LegendToolbar from '@/components/LegendToolbar/index.vue';
import { TabList, LegendToolbarList } from '@/types/mainScreenTypes';
import { getJson } from '@/utils/mapCommon';
import { BrandItem, ScrollItem } from './map';
import { loadLegendPoint, removeLegendPoint, removePointGraphic, addResourcePoint } from '@/plugins/commonMap';
import * as mapWork from './map';
import { useLifecycle } from 'bitmap3d';
import { GETMAPINSTANCE } from '@/types/const';

useLifecycle(mapWork, GETMAPINSTANCE);
const useMapRegion = useMapRegionStore();
const brandUrl = `${import.meta.env.BASE_URL}config/brand.json?time=${new Date().getTime()}`;

const detailInfo = ref<BrandItem[]>([]);
const isShowScroll = ref(false);
const scrollData = ref<ScrollItem[]>([]);
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

useMapToolsStore().changeToolsPositon({
  right: 20,
  top: 80,
});

// #region 数据订阅
useMapRegion.$subscribe(
  mutation => {
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
  },
  { detached: false },
);

/**
 * 获取数据
 */
const getData = () => {
  // 获取配置json文件
  getJson({ url: brandUrl }).then((data: { tabList: TabList[]; detailInfo: BrandItem[]; brandScroll: any }) => {
    const tempList: TabList[] = [];
    data.tabList.forEach((item: TabList, index: number) => {
      tempList.push({
        img: tabList.value[index].img ? tabList.value[index].img : tabList.value[0].img,
        ...item,
      });
    });

    data.brandScroll.forEach((item: any) => {
      scrollData.value.push(item);
    });
    isShowScroll.value = true;
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
    loadLegendPoint({ detailInfo: detailInfo.value });
  });
};

onMounted(async () => {
  mapWork.initMap();
  getData();
});

onUnmounted(() => {
  useMapRegionStore().changeRegionArea({
    name: '重庆市',
    code: '500',
  });
  removeLegendPoint();
  removePointGraphic(mapWork.pointGraphicLayer);
});
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
      .content-number {
        width: 70px;
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
      .content-value {
        width: 80px;
        text-align: center;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .content-whiteprice {
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
