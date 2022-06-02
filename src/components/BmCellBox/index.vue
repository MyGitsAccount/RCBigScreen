<template>
  <div class="cell-container">
    <div class="cell-title" :style="'background-image:url(' + getImage(img as string) + ');'">
      <span>{{ title }}</span>
      <slot name="header"></slot>
    </div>
    <div class="cell-content">
      <slot name="content">
        <h2>暂无数据</h2>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getImage } from '@/utils/common';

// props选项
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const props = withDefaults(
  defineProps<{
    title: string; // 显示标题
    img?: string;
  }>(),
  {
    title: '',
    img: '',
  },
);
</script>
<script lang="ts">
import { defineComponent } from 'vue';
export default defineComponent({
  name: 'BmCellBox',
});
</script>

<style scoped lang="scss">
.cell-container {
  $cellTitleHeight: 40px;
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  pointer-events: all;
  box-sizing: border-box;
  background: transparent;
  .cell-title {
    width: 100%;
    height: $cellTitleHeight;
    display: flex;
    align-items: center;
    color: white;
    user-select: none;
    // background: linear-gradient(90deg, #18CCB1 0%, rgba(24, 204, 177, 0.2) 100%);
    // opacity: 0.7;
    font-size: 18px;
    font-family: Microsoft YaHei;
    font-weight: 600;
    color: #fefeff;
    background-repeat: no-repeat;
    background-size: 100% 100%;

    span {
      // text-shadow: 0px 2px 2px rgba(7, 38, 32, 0.8);
      background: linear-gradient(0deg, #9cffe9 0%, #ffffff 65.5517578125%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-left: 65px;
    }
  }
  .cell-content {
    width: 100%;
    height: calc(100% - $cellTitleHeight - 13px);
    position: relative;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: center;

    h2 {
      color: rgba(255, 255, 255, 0.5);
    }
  }
}
</style>
