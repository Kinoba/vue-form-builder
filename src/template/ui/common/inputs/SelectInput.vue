<template>
    <div class="inputItemWrapper columns" :data-input-name="input.name">
        <div class="column is-12">
            <div :id="input.name" class="field has-text-left inputItem">
                <label v-if="input.label" :class="{'label' : true, 'bold': input.labelBold, 'italic': input.labelItalic, 'underline': input.labelUnderline}">
                    {{input.label}}
                </label>
                <label v-else :class="{'label' : true, 'bold': input.labelBold, 'italic': input.labelItalic, 'underline': input.labelUnderline}">
                    Select input
                </label>
              <div class="control">
                  <div v-if="input.input_type == 'select'" class="select" >
                  <select :name="input.fieldName">
                      <option disabled selected>Select options</option>
                      <option v-for="option in input.properties.options">{{ option.value }}</option>
                  </select>
              </div>
              </div>
              <hr>
            </div>
        </div>
    </div>
</template>

<script>

    export default {
        name: "SelectInput",
        props: ['input', 'labelPosition'],
        mounted() {
            //Parse properties string into JSON
            if(this.input.properties && typeof this.input.properties === 'string') {
                this.input.properties = JSON.parse(this.input.properties);
            }
        }
    }
</script>

<style scoped>
    hr {
        margin: 1rem 0;
    }
</style>
