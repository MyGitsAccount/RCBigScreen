<template>
  <BmPannel :width="position.width" :height="position.height" :bottom="position.bottom" :right="position.right">
    <div class="warp">
      <div class="title">图例</div>
      <div class="tabcard-box">
        <div v-for="(item, index) in toolbarList" :key="index" class="item">
          <img :src="getImage(item.img)" />
          <span>{{ item.name }}</span>
        </div>
      </div>
    </div>
  </BmPannel>
</template>
<script setup lang="ts">
import { getImage } from '@/utils/common';
import { LegendToolbarList, ToolsProps } from '@/types/mainScreenTypes';
import { BmPannel } from 'bitmap3d';

//#region props选项
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const props = withDefaults(
  defineProps<{
    toolbarList: LegendToolbarList[];
    position?: ToolsProps;
  }>(),
  {
    position: () => ({
      width: 140,
      height: 130,
      bottom: 25,
      right: 25,
    }),
  },
);

//#endregion

//#region 定义变量
//#endregion

//#region 生命周期
//#endregion

//#region UI交互
//#endregion
</script>
<script lang="ts">
export default {
  name: 'LegendToolbar',
};
</script>
<style lang="scss" scoped>
@import '@/styles/mixin.scss';

$baseColor: #55c2f5;
$titleHeight: 45px;
.warp {
  pointer-events: all;
  background: rgba(8, 49, 73, 0.7);
  overflow: hidden;
  @apply p-0 w-full h-full;

  .title {
    height: $titleHeight;
    line-height: $titleHeight;
    @apply text-center w-full text-white;
  }

  .tabcard-box {
    height: calc(100% - $titleHeight);
    overflow-y: auto;
    &::-webkit-scrollbar {
      display: none;
    }
    @apply relative flex flex-col justify-start items-center w-full;
    .item {
      color: $baseColor;
      @apply flex justify-center items-center w-full px-2 pb-4 text-sm;

      img {
        width: 22px;
        height: 23px;
        @apply mr-2;
      }
    }
  }
}
</style>
