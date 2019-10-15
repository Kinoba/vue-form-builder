<template>
    <div class="inputItemWrapper" :class="input.className" :data-input-name="input.name">
        <div class="inputItem row" :id="input.name" v-if="labelPosition === 'left'">
            <div class="col-md-4">
                <label :class="{'bold': input.labelBold, 'italic': input.labelItalic, 'underline': input.labelUnderline}">
                    {{input.label}}
                </label>
            </div>
            <div class="col-md-8 input-group">
                <div class="text-center w-100">
                    <input type="checkbox" :name="input.fieldName" :checked="input.isChecked">
                </div>
            </div>
        </div>
        <div class="inputItem row" :id="input.name" v-else>
            <div class="form-group col-md-12">
                <label :class="{'bold': input.labelBold, 'italic': input.labelItalic, 'underline': input.labelUnderline}">
                    {{input.label}}
                </label>
                <div class="input-group">
                    <div class="text-center w-100">
                        <input type="checkbox" :name="input.fieldName" :checked="input.isChecked">
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        name: "CheckboxInput",
        props: ['input', 'labelPosition'],
    }
</script>

<style scoped>

</style>
