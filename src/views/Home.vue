<template>
  <title-bar></title-bar>
  <div id="replay-canvas-parent"></div>
  <replay-canvas
    :points="points"
    :color="selectedColor"
    :channel="channel"
  ></replay-canvas>
  <div id="color-bar">
    <color
      v-for="(color, i) in colors"
      :color="color"
      :key="i"
      :selected="color === selectedColor"
      @color-selected="handleColorSelected"
    ></color>
  </div>
  <div id="info-bar">
    <button id="create-channel">New Channel</button>
    <input id="channel-code" placeholder="Channel Code" v-model="channel" />
    <span id="version">v{{ version }}</span>
  </div>
</template>

<script>
import { ref, watch } from "vue";
import ReplayCanvas from "@/components/ReplayCanvas";
import TitleBar from "@/components/TitleBar.vue";
import Color from "@/components/Color.vue";

export default {
  name: "Home",
  setup() {
    const points = ref([]);

    const colors = [
      "EE204D",
      "FF5349",
      "FF7538",
      "FFAA1D",
      "FCE883",
      "C5E384",
      "1CAC78",
      "1DACD6",
      "1F75FE",
      "766EC8",
      "C154C1",
      "F653A6",
    ];

    const selectedColor = ref("EE204D");

    const handleColorSelected = (color) => {
      selectedColor.value = color;
    };

    const channel = ref("");

    watch(channel, (newChannel) => {
      window.api.setChannel(newChannel);
    });

    const version = ref("");
    window.api.getVersion().then((r) => {
      version.value = r;
    });

    return {
      points,
      colors,
      selectedColor,
      handleColorSelected,
      channel,
      version,
    };
  },
  components: {
    ReplayCanvas,
    TitleBar,
    Color,
  },
};
</script>

<style lang="scss" scoped>
#replay-canvas-parent {
  margin: 25px 0 0 0;
}

#color-bar {
  background: #000000;
  width: calc(300px - 8px * 2);
  padding: 0 8px;
  height: 40px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}

#info-bar {
  background: #000000;
  width: calc(300px - 8px * 2);
  padding: 0 8px 10px 8px;
  height: calc(40px - 10px);
  display: flex;
  flex-direction: row;
}

#create-channel {
  width: 92px;
  height: 30px;
  background: #424242;
  color: #ffffff;
  border-radius: 3px;
  margin: 0 4px 0 0;
  border: none;
  cursor: pointer;
  font-family: Cabin, sans-serif;
  font-style: normal;
  font-weight: normal;
  font-size: 12px;
}

#create-channel:active {
  color: #000000;
  background: #b3b3b3;
}

#channel-code {
  width: calc(140px - 6px * 2);
  height: 30px;
  background: #424242;
  color: #ffffff;
  border-radius: 3px;
  padding: 0 6px;
  border: none;
  font-family: Cabin, sans-serif;
  font-style: normal;
  font-weight: normal;
  font-size: 12px;
  text-transform: uppercase;
}

#version {
  font-family: Cabin, sans-serif;
  font-style: normal;
  font-weight: normal;
  font-size: 14px;
  color: #b3b3b3;
  margin: 0;
  text-align: right;
  vertical-align: middle;
  flex-grow: 1;
  line-height: 30px;
}
</style>
