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
    <!--    <path-->
    <!--      class="path"-->
    <!--      v-for="({ d, time, length, delay }, i) in svgPaths"-->
    <!--      v-bind:key="i"-->
    <!--      v-bind:d="d"-->
    <!--      v-bind:style="-->
    <!--        `-->
    <!--            stroke-dasharray: ${length};-->
    <!--            stroke-dashoffset: ${length};-->
    <!--            animation-duration: ${time}ms;-->
    <!--            animation-delay: ${delay}ms;-->
    <!--            `-->
    <!--      "-->
    <!--    />-->
  </svg>
</template>

<script>
import { ref, toRef, watch } from "vue";
import io from "socket.io-client";
const socket = io("https://channels.quill.lol", {});

export default {
  name: "ReplayCanvas",
  props: {
    color: {
      type: String,
      required: true
    },
    channel: {
      type: String,
      required: true
    }
  },
  setup(props) {
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

    const channel = toRef(props, "channel");
    socket.emit("joinChannel", channel);
    watch(channel, channel => {
      socket.emit("joinChannel", channel);
    });

    socket.on("connect", () => {
      console.log(socket.connected); // true
    });

    socket.on("draw", points => {
      handleDrawEvent(points);
    });

    const timeBeforeErase = 5000;

    const handleDrawEvent = e => {
      let pathDescription = generatePath(e);
      let time = e[e.length - 1].time + captureInterval;
      let color = e[e.length - 1].color;
      let strokeInfo = {
        d: pathDescription,
        time: time,
        color: color,
        length: pathLength(pathDescription),
        delay: captureInterval * packetSize - time
      };
      let pathElement = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path"
      );
      pathElement.setAttribute("d", strokeInfo.d);
      pathElement.style.strokeDasharray = strokeInfo.length.toString();
      pathElement.style.strokeDashoffset = strokeInfo.length.toString();
      pathElement.style.transition = "stroke-dashoffset linear";
      pathElement.style.transitionDuration = strokeInfo.time + "ms";
      pathElement.style.transitionDelay = strokeInfo.delay + "ms";
      pathElement.style.stroke = "#" + strokeInfo.color;
      svgCanvas.value.append(pathElement);
      // Transition is skipped when setting the strokeDashoffset to 0 is not in a callback
      setTimeout(() => {
        pathElement.style.strokeDashoffset = "0";
      }, 15);
      setTimeout(() => {
        pathElement.style.strokeDashoffset = (-strokeInfo.length).toString();
      }, timeBeforeErase);
      setTimeout(() => {
        pathElement.remove();
      }, timeBeforeErase + strokeInfo.time + strokeInfo.delay);
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
        relativeMousePosition.color = props.color;
        tempStroke.value.push(relativeMousePosition);
        drawIntervalTime.value += captureInterval;
      }, captureInterval);
    };

    const paginateStroke = () => {
      clearInterval(drawInterval.value);
      commitDraw(tempStroke.value);
      let previousEndPoint = tempStroke.value[tempStroke.value.length - 1];
      previousEndPoint.time = 0;
      tempStroke.value = [previousEndPoint];
    };

    const handleDrawStop = () => {
      clearInterval(drawInterval.value);
      drawIntervalTime.value = 0;
      if (tempStroke.value.length > 1) {
        commitDraw(tempStroke.value);
      }
      tempStroke.value = [];
    };

    const commitDraw = stroke => {
      socket.emit("draw", stroke);
      handleDrawEvent(stroke);
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
  display: block;
  margin: 25px 0 0 0;
  width: 300px;
  height: 300px;
  z-index: 2;
}

#svgCanvas:deep(path) {
  pointer-events: none;
  transition: stroke-dashoffset linear;
}
</style>
