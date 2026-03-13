<template>
  <div ref="el" class="echart" :style="{ height }" />
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from "vue";
import * as echarts from "echarts";

const props = defineProps({
  option: { type: Object, required: true },
  height: { type: String, default: "320px" },
  theme: { type: [String, Object], default: null },
});

const el = ref(null);
let chart = null;
let ro = null;

const safeSetOption = () => {
  if (!chart || !props.option) return;
  chart.setOption(props.option, { notMerge: true, lazyUpdate: true });
};

onMounted(() => {
  chart = echarts.init(el.value, props.theme ?? undefined, { renderer: "canvas" });
  safeSetOption();

  ro = new ResizeObserver(() => chart?.resize());
  ro.observe(el.value);
});

watch(
  () => props.option,
  () => safeSetOption(),
  { deep: true },
);

onBeforeUnmount(() => {
  try {
    ro?.disconnect();
  } catch {
    // ignore
  }
  chart?.dispose();
  chart = null;
});
</script>

<style scoped>
.echart {
  width: 100%;
}
</style>

