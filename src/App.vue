<template>
  <n-config-provider
    :theme="null"
    :theme-overrides="themeOverrides"
    :locale="zhCN"
    :date-locale="dateZhCN"
    class="h-full"
  >
    <router-view></router-view>
    <n-global-style />
  </n-config-provider>
</template>

<script setup lang="ts">
import { NConfigProvider, zhCN, dateZhCN } from 'naive-ui';
import themeOverrides from '@/styles/theme';
</script>

<style lang="scss" scoped>
.h-screen {
  @apply w-full h-full;
}
</style>
