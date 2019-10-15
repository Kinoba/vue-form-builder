<template>
    <div class="field has-text-left">
      <label class="label">Form title</label>
      <div class="control">
        <input class="input" type="text" v-model="formTitle" placeholder="Enter form title">
      </div>
      <hr>
    </div>
</template>

<script>

    export default {
        components: {},
        name: "form-title-component",
        props: {
            value: {
                type: String,
                required: true
            }
        },
        data: () => ({
            formTitle: ''
        }),
        watch: {
            value(newVal) {
                this.formTitle = newVal;
            },
            formTitle(newVal) {
                this.$emit('input', newVal);
            }
        },
        mounted() {
            this.formTitle = this.value;
        }
    }
</script>

<style scoped>

</style>
