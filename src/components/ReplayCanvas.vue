<template>
  <svg
    height="300"
    width="300"
    fill="none"
    stroke="black"
    stroke-width="15px"
    stroke-linecap="round"
    stroke-linejoin="round"
    id="svgCanvas"
    ref="svgCanvas"
    @mousemove="handleMouseMove"
    @mousedown="handleDraw"
    @mouseup="handleDrawStop"
    @mouseout="handleDrawStop"
  >
    <path class="path" v-bind:d="generatePath(tempStroke)" />
  </svg>
</template>

<script>
import { ref } from "vue";
import io from "socket.io-client";

const socket = io("http://localhost:3000");

export default {
  name: "ReplayCanvas",
  setup() {
    const svgCanvas = ref(null);

    let generatePath = points => {
      let pathD = "";
      for (let i in points) {
        if (i === "0") {
          pathD += `M ${points[i].x} ${points[i].y}`;
        } else {
          pathD += ` L ${points[i].x} ${points[i].y}`;
        }
      }
      return pathD;
    };

    let mouseX = 0;
    let mouseY = 0;

    const handleMouseMove = e => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const getRelativeMousePosition = (x, y, svgCanvas) => {
      let boundingRectangle = svgCanvas.getBoundingClientRect();
      return {
        x: x - boundingRectangle.left,
        y: y - boundingRectangle.top
      };
    };

    const tempStroke = ref([]);

    const drawInterval = ref(null);
    const drawIntervalTime = ref(0);
    let captureInterval = 15;

    const handleDraw = () => {
      drawInterval.value = setInterval(() => {
        if (drawIntervalTime.value === captureInterval * 10) {
          paginateStroke();
          drawIntervalTime.value = captureInterval;
          handleDraw();
        }
        let relativeMousePosition = getRelativeMousePosition(
          mouseX,
          mouseY,
          svgCanvas.value
        );
        relativeMousePosition.time = drawIntervalTime.value;
        tempStroke.value.push(relativeMousePosition);
        drawIntervalTime.value += captureInterval;
      }, captureInterval);
    };

    const paginateStroke = () => {
      clearInterval(drawInterval.value);
      socket.emit("draw", tempStroke.value);
      let previousEndPoint = tempStroke.value[tempStroke.value.length - 1];
      previousEndPoint.time = 0;
      tempStroke.value = [previousEndPoint];
    };

    const handleDrawStop = () => {
      clearInterval(drawInterval.value);
      drawIntervalTime.value = 0;
      if (tempStroke.value.length > 1) {
        console.log(tempStroke.value);
        socket.emit("draw", tempStroke.value);
      }
      tempStroke.value = [];
    };

    return {
      svgCanvas,
      tempStroke,
      generatePath,
      handleMouseMove,
      handleDraw,
      handleDrawStop
    };
  }
};
</script>

<style scoped>
#svgCanvas {
  width: 300px;
  height: 300px;
}

.path {
  pointer-events: none;
}
</style>
