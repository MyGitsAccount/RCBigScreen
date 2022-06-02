<template>
  <div class="warp">
    <div class="tabcard-box">
      <div
        v-for="(item, index) in tabList"
        :key="index"
        class="item"
        :style="'background-image:url(' + getImage(item?.img as string) + ');'"
        @click="changeTab(index)"
      >
        <div class="cotent">
          <div class="name">
            {{ item.name }}
            <span v-if="item?.unit" class="unit">
              {{ '(' + item?.unit + ')' }}
            </span>
          </div>
          <div class="num">{{ item.value }}</div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import { getImage } from '@/utils/common';
import { TabList } from '@/types/mainScreenTypes';

//#region props选项
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const props = withDefaults(
  defineProps<{
    tabList: TabList[];
  }>(),
  {},
);

//#endregion

//#region 定义变量
/** 当前选择的菜单 */
const currentTab = ref(0);
//#endregion

//#region 生命周期
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
  name: 'TabCard',
};
</script>
<style lang="scss" scoped>
@import '@/styles/mixin.scss';

$baseColor: #55c2f5;
$activeColor: #c8923d;
.warp {
  pointer-events: all;
  @apply absolute p-0 w-full h-full;

  .tabcard-box {
    @apply relative flex justify-start items-center w-full h-full;
    .item {
      color: $baseColor;
      width: 160px;
      background-size: 100% 100%;
      background-repeat: no-repeat;
      @apply flex justify-end items-center h-full mr-2 text-white;
      .cotent {
        width: 54%;
        @apply flex flex-col  items-center;
        justify-content: space-around;
        .name {
          @apply flex  items-end w-full;
          .unit {
            font-size: 12px;
          }
        }
        .num {
          color: $baseColor;
          font-size: 20px;
          font-family: Digiface;
          font-weight: 500;
          @apply w-full;
        }
      }
    }
  }
}
</style>
