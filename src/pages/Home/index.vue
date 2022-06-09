<template>
  <div class="contain-warp">
    <Header></Header>
    <Sidebar></Sidebar>
    <main>
      <router-view></router-view>
    </main>
  </div>
  <BmCesiumMap class="map" :url="configUrl" @onload="marsOnload"></BmCesiumMap>
  <BmCesiumMapTools
    name="BmCesiumMapTools"
    :map-instance="GETMAPINSTANCE"
    :positon="positon"
    :area-select="areaSelectUrl"
    :region-option="regionOption"
    class="map-tool"
    :is-show-spatial-query="false"
    :is-show-measuring="false"
    :is-show-base="false"
    @area-select-change="areaSelectChange"
    @clear-select-area="clearSelectArea"
  >
  </BmCesiumMapTools>
</template>
<script setup lang="ts">
import { BmCesiumMap, BmCesiumMapTools } from 'bitmap3d';
import Sidebar from '@/components/Sidebar/index.vue';
import Header from '@/components/Header/index.vue';
import { provide, ref, onMounted, toRaw, onUnmounted } from 'vue';
import * as mars3d from 'mars3d';
import { useMapRegionStore, useMapToolsStore } from '@/store';
import { useRouter } from 'vue-router';
import * as mapWork from './map';
import { useLifecycle } from 'bitmap3d';
import { GETMAPINSTANCE } from '@/types/const';
import * as mapWork1 from '@/pages/Home/Cultivation/map';
import { getJson } from '@/utils/mapCommon';

useLifecycle(mapWork, GETMAPINSTANCE);

//#region 定义变量
const configUrl = `${import.meta.env.BASE_URL}config/config.json`;
const areaSelectUrl = `${import.meta.env.BASE_URL}config/region.json`;
const cqGeoJsonUrl = `${import.meta.env.BASE_URL}config/cq_geo.json`;
const chinaGeoJson = `${import.meta.env.BASE_URL}config/china_geo.json`;
let mapInstance: mars3d.Map | undefined = undefined;
provide('getMapInstance', () => {
  return mapInstance;
});

const mapToolsStore = useMapToolsStore();
/** maptool位置 */
const positon = ref(toRaw(mapToolsStore.getToolsPositon));
/**
 * 订阅状态
 */
const unsubscribe = mapToolsStore.$onAction(() => {
  positon.value = toRaw(mapToolsStore.getToolsPositon);
});

/** 区域选择的code */
const regionOption = ref({
  regionCode: '500',
});
const useMapRegion = useMapRegionStore();
const router = useRouter();
const cqGeoJson = ref();
//#endregion

//#region 生命周期
onMounted(() => {
  mapWork.initMap({
    cqGeoJsonUrl,
    chinaGeoJson,
    isChinaShow: router.currentRoute.value.fullPath === '/dashboard/Circulation' ? true : false,
  });
  getData();
});

onUnmounted(() => {
  unsubscribe();
});
//#endregion

//#region 事件
/**
 * 地图构造完成
 */
const marsOnload = (map: mars3d.Map) => {
  console.log('map构造完成', map);
  mapInstance = map;
};
//#endregion

//#region 行政区划
/**
 * 选择某个区域 * @param params
 */
const areaSelectChange = (data: { selectArea: any }) => {
  console.log(data);
  const temp = {
    name: data.selectArea.name,
    code: data.selectArea.code,
  };
  useMapRegionStore().changeRegionArea(temp);
};

/**
 * 清除当前选择的区域
 */
const clearSelectArea = (data: { selectArea: any }) => {
  console.log(data);
  useMapRegionStore().changeRegionArea(data.selectArea);
  //   mapWork.removePoly();
};
//#endregion

//#region 数据获取
/**
 * 获取数据
 */
const getData = () => {
  // 获取配置json文件
  getJson({ url: cqGeoJsonUrl }).then((data: any) => {
    console.log(data);
    cqGeoJson.value = data;
  });

  getJson({ url: areaSelectUrl }).then((data: any) => {
    console.log(data);
    useMapRegionStore().changeRegionAreaList(data);
  });
};
//#endregion

//#region 数据订阅
useMapRegion.$subscribe(
  async mutation => {
    console.log(mutation, 1111);
    regionOption.value = {
      regionCode: useMapRegion.getRegionArea.code as string,
    };
    mapWork.removeMaskGeojsonLayer();
    if (useMapRegion.getRegionArea.code === '500') {
      mapWork.changeCqArcgisStatus(false);
      mapWork.changeGeoJson(false);
      // mapWork.changeGeoJson(router.currentRoute.value.fullPath === '/dashboard/Circulation' ? true : false);
      mapWork1.removeAll();
    } else {
      if (router.currentRoute.value.fullPath !== '/dashboard/Circulation') {
        mapWork.changeCqArcgisStatus(true);
        await mapWork1.addProvince(useMapRegion.getRegionArea.name as string, cqGeoJson.value);
        mapWork.drawMaskGeojsonLayer(useMapRegion.getRegionArea.name as string, toRaw(cqGeoJson.value));
      }
    }
  },
  { detached: false },
);
//#endregion
</script>
<style lang="scss" scope>
.contain-warp {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1001;
  main {
    height: calc(100% - 70px);
  }
}
.map {
  width: 100%;
  height: 103%;
}
</style>
<style lang="scss">
@import '@/styles/mapStyle.scss';
</style>
