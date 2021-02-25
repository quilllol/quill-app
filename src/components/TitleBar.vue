<template>
  <div class="title-bar">
    <img id="logo" src="@/assets/logo.svg" alt="logo" />
    <div id="drag-bar"></div>
    <div id="controls">
      <div v-on:click="minimize">
        <img
          class="controls-icon"
          id="minimize"
          src="@/assets/minimize.svg"
          alt="minimize"
        />
      </div>
      <div v-on:click="closeWindow">
        <img
          class="controls-icon"
          id="close"
          src="@/assets/close.svg"
          alt="close"
        />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "TitleBar",
  setup() {
    const minimize = () => {
      window.api.minimize();
    };

    const closeWindow = () => {
      window.api.close();
    };

    return { minimize, closeWindow };
  },
};
</script>

<style scoped>
.title-bar {
  user-select: none;
  position: fixed;
  top: 0;
  width: 100%;
  background-color: #000000;
  height: 25px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}

#drag-bar {
  -webkit-app-region: drag;
  height: 100%;
  flex-grow: 1;
}

#logo {
  -webkit-app-region: drag;
  padding: calc((25px - 15px) / 2);
  width: 15px;
  height: 15px;
}

#controls {
  height: 100%;
  display: flex;
  flex-direction: row;
}

.controls-icon {
  -webkit-app-region: no-drag;
  cursor: pointer;
  width: 10px;
  height: 10px;
  padding: calc((25px - 10px) / 2);
}
</style>
