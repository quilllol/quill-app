<template>
  <div id="main"></div>
  <replay-canvas v-bind:points="points"></replay-canvas>
</template>

<script>
import { ref } from "vue";
import ReplayCanvas from "@/components/ReplayCanvas";

export default {
  name: "About",
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
#main {
  border: #000000 1px solid;
  width: calc(100vw - 2px);
  height: calc(100vh - 2px);
  position: fixed;
}
</style>
