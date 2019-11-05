<template>
    <div class="inputItemWrapper columns" :data-input-name="input.name">
        <div class="column is-12">
            <div :id="input.name" class="field has-text-left inputItem">
                <div v-if="!editLabel">
                    <label v-if="input.label" :class="{'label' : true, 'is-inline-block': true ,'bold': input.labelBold, 'italic': input.labelItalic, 'underline': input.labelUnderline}">
                        {{input.label}}
                    </label>
                    <label v-else :class="{'label' : true, 'is-inline-block': true, 'bold': input.labelBold, 'italic': input.labelItalic, 'underline': input.labelUnderline}">
                        Select input
                    </label>
                </div>
                <div v-else class="control">
                    <input type="text" class="input" v-model="input.label">
                </div>
              <div class="control">
                  <div v-if="input.input_type == 'select'" class="select" >
                      <select :name="input.fieldName">
                          <option disabled selected>Select options</option>
                          <option v-for="option in input.properties.options">{{ option.value }}</option>
                      </select>
                 </div>
              </div>
            </div>
        </div>
    </div>
</template>

<script>
    import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

    export default {
        name: "SelectInput",
        components: {
            FontAwesomeIcon
        },
        props: ['input', 'labelPosition', 'index', 'editLabel'],
        mounted() {
            //Parse properties string into JSON
            if(this.input.properties && typeof this.input.properties === 'string') {
                this.input.properties = JSON.parse(this.input.properties);
            }
        }
    }
</script>

<style scoped>
    .inputItemWrapper {
      width: 100%;
    }
    hr {
        margin: 1rem 0;
    }

    .control {
        margin-bottom: .5rem;
    }

    .button-bar {
        display: inline-block;
    }

    .button-bar > button {
        margin-left: .5rem;
    }

    button > .svg-inline--fa {
        margin-right: .5rem;
    }
</style>
