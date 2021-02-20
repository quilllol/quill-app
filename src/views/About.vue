<template>
  <replay-canvas v-bind:points="points" :channel="channel"></replay-canvas>
</template>

<script>
import { ref } from "vue";
import ReplayCanvas from "@/components/ReplayCanvas";

export default {
  name: "About",
  setup() {
    const points = ref([]);

    const channel = ref("");
    window.api.onSetChannel(newChannel => {
      channel.value = newChannel;
    });

    return { points, channel };
  },
  components: {
    ReplayCanvas
  }
};
</script>

<style lang="scss" scoped></style>
