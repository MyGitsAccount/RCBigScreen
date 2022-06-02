<template>
  <div class="warp">
    <div class="arrow-box">
      <img src="@/assets/images/Components/Sidebar/arrow-top.png" alt="" />
    </div>
    <div class="sidebar-box">
      <router-link
        v-for="(item, index) in tabs"
        :key="index"
        class="item"
        :class="{ active: currentTab === index }"
        :to="item.router"
        active-class="active"
        @click="changeTab(index)"
      >
        <img :src="currentTab === index ? item.activeImg : item.img" alt="" />
        <span class="name">{{ item.name }}</span>
      </router-link>
    </div>
    <div class="arrow-box">
      <img src="@/assets/images/Components/Sidebar/arrow-bottom.png" alt="" />
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getImage } from '@/utils/common';

//#region 定义变量
const router = useRouter();
/** 菜单 */
const tabs = ref([
  {
    id: 0,
    name: '保种',
    router: '/dashboard/BreedConservation',
    img: getImage('images/Components/Sidebar/baozhong-bg.png'),
    activeImg: getImage('images/Components/Sidebar/baozhong-bg1.png'),
  },
  {
    id: 1,
    name: '养殖',
    router: '/dashboard/Cultivation',
    img: getImage('images/Components/Sidebar/yangzhi-bg.png'),
    activeImg: getImage('images/Components/Sidebar/yangzhi-bg1.png'),
  },
  {
    id: 2,
    name: '流通',
    router: '/dashboard/Circulation',
    img: getImage('images/Components/Sidebar/liutong-bg.png'),
    activeImg: getImage('images/Components/Sidebar/liutong-bg1.png'),
  },
  {
    id: 3,
    name: '加工',
    router: '/dashboard/Process',
    img: getImage('images/Components/Sidebar/jiagong-bg.png'),
    activeImg: getImage('images/Components/Sidebar/jiagong-bg1.png'),
  },
  {
    id: 4,
    name: '品牌',
    router: '/dashboard/Brand',
    img: getImage('images/Components/Sidebar/pinpai-bg.png'),
    activeImg: getImage('images/Components/Sidebar/pinpai-bg1.png'),
  },
  {
    id: 5,
    name: '监管',
    router: '/dashboard/Supervision',
    img: getImage('images/Components/Sidebar/jianguan-bg.png'),
    activeImg: getImage('images/Components/Sidebar/jianguan-bg1.png'),
  },
]);
/** 当前选择的菜单 */
const currentTab = ref(0);

//#endregion

//#region 生命周期
onMounted(() => {
  tabs.value.forEach((item: any) => {
    if (router.currentRoute.value.fullPath === item.router) {
      currentTab.value = item.id;
    }
  });
});
//#endregion

//#region UI交互
/**
 * 切换菜单
 */
const changeTab = (index: number) => {
  currentTab.value = index;
};

//#endregion
</script>
<script lang="ts">
export default {
  name: 'Sidebar',
};
</script>
<style lang="scss" scoped>
@import '@/styles/mixin.scss';

$baseColor: #55c2f5;
$activeColor: #c8923d;
.warp {
  width: 170px;
  height: 84%;
  left: 40px;
  top: 60%;
  -webkit-transform: translate(0%, -60%);
  transform: translate(0%, -60%);
  pointer-events: all;
  @apply absolute flex flex-col justify-center items-center p-0 text-white;

  .sidebar-box {
    // height: calc(100% - 120px);
    @apply flex flex-col justify-around items-center w-full h-full;
    .item {
      padding: 10px 0;
      color: $baseColor;
      @apply relative flex items-center h-1/6 w-full;
      img {
        height: 100%;
        width: 100%;
        cursor: pointer;
      }
      .name {
        writing-mode: vertical-lr;
        letter-spacing: 15px;
        height: 70%;
        @apply absolute block left-3 text-right;
      }
    }
    .active {
      color: $activeColor;
    }
  }

  .arrow-box {
    height: 60px;
    @apply flex justify-center items-center w-full;
  }
}
</style>
