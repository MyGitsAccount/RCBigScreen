<template>
  <div class="warp">
    <div class="title-box">数字化综合服务管理平台应用系统</div>
  </div>
</template>
<script lang="ts" setup></script>
<script lang="ts">
export default {
  // name: 'Header',
};
</script>

<style lang="scss" scoped>
.warp {
  height: 70px;
  width: 100%;
  background-size: 100% 100%;
  display: flex;
  pointer-events: all;
  color: aliceblue;
  .title-box {
    background-image: url('@/assets/images/Components/Header/header-bg.png');
    background-size: 100% 100%;
    line-height: 58px;
    font-size: 26px;
    font-weight: 600;
    letter-spacing: 2px;
    @apply w-full h-full text-center;
  }
}
</style>
