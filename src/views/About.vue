<template>
  <replay-canvas :channel="channel"></replay-canvas>
</template>

<script>
import { ref } from "vue";
import ReplayCanvas from "@/components/ReplayCanvas";

export default {
  name: "About",
  setup() {
    const channel = ref("");
    window.api.onSetChannel((newChannel) => {
      channel.value = newChannel;
    });

    return { channel };
  },
  components: {
    ReplayCanvas,
  },
};
</script>

<style lang="scss" scoped></style>
