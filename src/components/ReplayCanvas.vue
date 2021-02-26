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
  ></svg>
</template>

<script>
import { ref, toRef, watch } from "vue";
import io from "socket.io-client";

export default {
  name: "ReplayCanvas",
  props: {
    color: {
      type: String,
    },
    socketio: {
      type: Boolean,
      default: false,
    },
    channel: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    let socket;
    if (props.socketio) {
      socket = io("https://channels.quill.lol", {});

      const channel = toRef(props, "channel");
      socket.emit("joinChannel", channel.value.toUpperCase());
      watch(channel, (channel) => {
        socket.emit("joinChannel", channel.toUpperCase());
      });

      socket.on("draw", (points) => {
        handleDrawEvent(points);
      });
    } else {
      window.api.onDraw((points) => {
        console.log(points);
        handleDrawEvent(points);
      });
    }

    const svgCanvas = ref(null);
    const svgPaths = ref([]);

    const generatePath = (points) => {
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

    const timeBeforeErase = 5000;

    const handleDrawEvent = (e) => {
      let pathDescription = generatePath(e);
      let time = e[e.length - 1].time + captureInterval;
      let color = e[e.length - 1].color;
      let strokeInfo = {
        d: pathDescription,
        time: time,
        color: color,
        length: pathLength(pathDescription),
        delay: captureInterval * packetSize - time,
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

    const pathLength = (path) => {
      let pathElement = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path"
      );
      pathElement.setAttribute("d", path);
      return pathElement.getTotalLength();
    };

    let mouseX = 0;
    let mouseY = 0;

    const handleMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const getRelativeMousePosition = (x, y, svgCanvas) => {
      let boundingRectangle = svgCanvas.getBoundingClientRect();
      return {
        x: x - boundingRectangle.left,
        y: y - boundingRectangle.top,
      };
    };

    let tempStroke = [];

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
        tempStroke.push(relativeMousePosition);
        drawIntervalTime.value += captureInterval;
      }, captureInterval);
    };

    const paginateStroke = () => {
      clearInterval(drawInterval.value);
      commitDraw(tempStroke);
      let previousEndPoint = tempStroke[tempStroke.length - 1];
      previousEndPoint.time = 0;
      tempStroke = [previousEndPoint];
    };

    const handleDrawStop = () => {
      clearInterval(drawInterval.value);
      drawIntervalTime.value = 0;
      if (tempStroke.length > 1) {
        commitDraw(tempStroke);
      }
      tempStroke = [];
    };

    const commitDraw = (points) => {
      if (props.socketio) {
        socket.emit("draw", points);
      }
      window.api.draw(points);
      handleDrawEvent(points);
    };

    return {
      svgPaths,
      svgCanvas,

      handleMouseMove,
      handleDraw,
      handleDrawStop,
    };
  },
};
</script>

<style scoped>
#svgCanvas {
  display: block;
  width: 300px;
  height: 300px;
  z-index: 2;
}

#svgCanvas:deep(path) {
  pointer-events: none;
  transition: stroke-dashoffset linear;
}
</style>
