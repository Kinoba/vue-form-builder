<template>
    <div class="field has-text-left">
      <label class="label">Form title</label>
      <div class="control">
        <input class="input" type="text" v-model="formTitle" @change="updateFormTitle" placeholder="Enter form title">
      </div>
      <hr>
    </div>
</template>

<script>

    export default {
        components: {},
        name: "form-title-component",
        props: {
            title: {
                type: String
            }
        },
        data: () => ({
            formTitle: ''
        }),
        methods: {
            updateFormTitle() {
                this.$emit('change', this.formTitle)
            }
        },
        mounted() {
            this.formTitle = this.title;
        }
    }
</script>

<style scoped>

</style>
