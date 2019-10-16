<template>
    <div class="inputItemWrapper columns" :data-input-name="input.name">
        <div class="column is-12">
            <div :id="input.name" class="field has-text-left inputItem">
                <label v-if="input.label" :class="{'label' : true, 'bold': input.labelBold, 'italic': input.labelItalic, 'underline': input.labelUnderline}">
                    {{input.label}}
                </label>
                <label v-else :class="{'label' : true, 'bold': input.labelBold, 'italic': input.labelItalic, 'underline': input.labelUnderline}">
                    Text input
                </label>
              <div class="control">
                <input type="text" class="input"
                       :readonly="input.readonly"
                       :name="input.fieldName"
                       :value="demo_value">
              </div>
              <hr>
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
    hr {
        margin: 1rem 0;
    }
</style>
