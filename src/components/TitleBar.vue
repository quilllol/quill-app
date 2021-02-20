<template>
  <div class="title-bar">
    <div id="drag-bar" class="unmaximized-margin">
      <img id="logo" src="@/assets/logo.svg" alt="logo" />
    </div>
    <div id="controls-parent">
      <div class="controls">
        <img
          class="controls-icon"
          id="minimize"
          src="@/assets/minimize.svg"
          alt="minimize"
          v-on:click="minimize"
        />
      </div>
      <div class="controls" v-show="resizeable">
        <img
          class="controls-icon"
          id="maximize"
          src="@/assets/maximize.svg"
          alt="maximize"
          v-on:click="maximize"
        />
      </div>
      <div class="controls">
        <img
          class="controls-icon"
          id="close"
          src="@/assets/close.svg"
          alt="close"
          v-on:click="closeWindow"
        />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "TitleBar",
  props: {
    resizeable: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      maximized: false
    };
  },
  methods: {
    minimize() {
      window.api.minimize();
    },
    maximize() {
      if (this.maximized) {
        // Maximized -> Unmaximized
        window.api.unmaximize();
      } else {
        // Unmaximized -> Maximized
        window.api.maximize();
      }
    },
    closeWindow() {
      window.api.close();
    }
  }
};
</script>

<style scoped>
.title-bar {
  user-select: none;
  position: fixed;
  top: 0;
  width: 100%;
  background-color: #000000;
  height: 20px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

#drag-bar {
  flex-grow: 1;
  -webkit-app-region: drag;
}

/* Used in methods to add or remove the drag-bar margin for window resizing */
.unmaximized-margin {
  margin: 2px 0 0 2px;
  height: calc(100% - 2px);
}

#logo {
  margin-left: 2px;
  width: 10px;
  height: 10px;
}

#controls-parent {
  display: flex;
  flex-direction: row;
}

.controls {
  -webkit-app-region: no-drag;
  cursor: pointer;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 6px;
}

.controls-icon {
  width: 8px;
  height: auto;
  margin-left: 10px;
}
</style>
