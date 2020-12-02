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
    <path
      class="path"
      v-for="({ d, time, length, delay }, i) in svgPaths"
      v-bind:key="i"
      v-bind:d="d"
      v-bind:style="
        `
        stroke-dasharray: ${length};
        stroke-dashoffset: ${length};
        animation-duration: ${time}ms;
        animation-delay: ${delay}ms;
        `
      "
    />
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
    const svgPaths = ref([]);

    const generatePath = points => {
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

    socket.on("draw", points => {
      handleDrawEvent(points);
    });

    const handleDrawEvent = e => {
      let pathDescription = generatePath(e);
      let time = e[e.length - 1].time;
      svgPaths.value.push({
        d: pathDescription,
        time: time,
        length: pathLength(pathDescription),
        delay: captureInterval * packetSize - captureInterval - time
      });
    };

    const pathLength = path => {
      let pathElement = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path"
      );
      pathElement.setAttribute("d", path);
      return pathElement.getTotalLength();
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
    const packetSize = 10;

    const handleDraw = () => {
      drawInterval.value = setInterval(() => {
        if (drawIntervalTime.value === captureInterval * packetSize) {
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
        socket.emit("draw", tempStroke.value);
      }
      tempStroke.value = [];
    };

    return {
      svgPaths,
      svgCanvas,
      tempStroke,
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
  stroke-dashoffset: 0;
  animation: draw linear forwards;
}

@keyframes draw {
  to {
    stroke-dashoffset: 0;
  }
}
</style>
