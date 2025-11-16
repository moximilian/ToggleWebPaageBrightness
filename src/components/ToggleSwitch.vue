<template>
    <label class="toggle-switch">
        <input type="checkbox" v-model="modelValue" @change="toggle" />
        <span class="slider"></span>
    </label>
</template>

<script>
export default {
    name: 'ToggleSwitch',
    data() {
        return {
            modelValue: true,
        }
    },
    emits: ['onChange'],
    methods: {
        toggle() {
            this.$emit('onChange', !this.modelValue)
        },
    },
}
</script>
