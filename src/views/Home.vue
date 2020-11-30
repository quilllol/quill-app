<template>
  <div class="home"></div>
  <replay-canvas id="canvas" v-bind:points="points"></replay-canvas>
</template>

<script>
import { ref } from "vue";
import ReplayCanvas from "@/components/ReplayCanvas";

export default {
  name: "Home",
  setup() {
    const points = ref([]);

    return { points };
  },
  components: {
    ReplayCanvas
  }
};
</script>

<style lang="scss" scoped>
#canvas {
  width: 300px;
  height: 300px;
}
</style>
