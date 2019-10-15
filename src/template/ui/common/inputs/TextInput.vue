<template>
    <div class="inputItemWrapper" :class="input.className" :data-input-name="input.name">
        <div class="inputItem row" :id="input.name" v-if="labelPosition === 'left'">
            <div class="col-md-4">
                <label :class="{'bold': input.labelBold, 'italic': input.labelItalic, 'underline': input.labelUnderline}">
                    {{input.label}}
                </label>
            </div>
            <div class="col-md-8 input-group">
                <input type="text" class="form-control"
                       :readonly="input.readonly"
                       :name="input.fieldName"
                       :value="demo_value">
            </div>
        </div>
        <div class="inputItem row" :id="input.name" v-else>
            <div class="form-group col-md-12">
                <label :class="{'bold': input.labelBold, 'italic': input.labelItalic, 'underline': input.labelUnderline}">
                    {{input.label}}
                </label>
                <div class="input-group">
                    <input type="text" class="form-control"
                           :readonly="input.readonly"
                           :name="input.fieldName"
                           :value="demo_value">
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        name: "TextInput",
        props: ['input', 'labelPosition'],
        computed: {
            demo_value() {
                if (!_.isEmpty(this.input.defaultValue)) {
                    return this.input.defaultValue;
                }

                return "";
            }
        }
    }
</script>

<style scoped>

</style>
