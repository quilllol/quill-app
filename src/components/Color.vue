<template>
  <div
    id="color"
    :style="`background: #${color}`"
    @click="$emit('color-selected', color)"
  >
    <img src="@/assets/selected.svg" alt="Color Selected" v-show="selected" />
  </div>
</template>

<script>
export default {
  name: "Color",
  props: {
    color: {
      type: String,
      required: true,
    },
    selected: {
      type: Boolean,
      required: true,
    },
  },
  emits: ["color-selected"],
};
</script>

<style scoped>
#color {
  cursor: pointer;
  width: 20px;
  height: 20px;
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
}
</style>
