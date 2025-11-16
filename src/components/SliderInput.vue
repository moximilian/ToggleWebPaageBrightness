<template>
  <div class="slider-container">
    <input
      type="range"
      min="0"
      max="100"
      :value="modelValue"
      class="slider"
      @input="onInput"
      autofocus
      autocomplete="on"
    />
  </div>
</template>

<script>
import debounce from '@/core/functions'
export default {
  props: {
    modelValue: { type: Number, default: () => 100 },
  },
  name: 'SliderInput',
  emits: ['onChange'],
  data() {
    return {
      width: 162,
    }
  },
  methods: {
    emitEmmediate(val) {
      this.$emit('onChange', val)
    },
    onInput(event) {
      const val = event.target.value      
      this.emit(val)
    },
  },
  created() {
    this.emit = debounce(this.emitEmmediate, 400)
  },
}
</script>
