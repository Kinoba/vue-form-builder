<template>
    <div class="inputItemWrapper columns" :data-input-name="input.name">
        <div class="column is-12">
            <div :id="input.name" class="field has-text-left inputItem">
              <div v-if="!editLabel">
                  <label v-if="input.label" :class="{'label' : true, 'is-inline-block': true ,'bold': input.labelBold, 'italic': input.labelItalic, 'underline': input.labelUnderline}">
                    {{input.label}}
                  </label>
                  <label v-else :class="{'label' : true, 'is-inline-block': true, 'bold': input.labelBold, 'italic': input.labelItalic, 'underline': input.labelUnderline}">
                    Number input
                  </label>
              </div>
              <div v-else class="control">
                  <input type="text" class="input" v-model="input.label">
              </div>
              <div class="control has-icons-left">
                <input type="input" class="input" :name="input.fieldName" :value="input.value">
                <span class="icon is-small is-left">
                  <font-awesome-icon :icon="icon"></font-awesome-icon>
                </span>
              </div>
            </div>
            <div class="button-bar is-pulled-right is-inline-block">
                <button class="button is-secondary" @click="editLabel = !editLabel"><font-awesome-icon icon="pen"/>
                    <span v-if="!editLabel">Edit label</span>
                    <span v-else>Save label</span>
                </button>
                <button class="button is-secondary" @click="$emit('openConfig', index)"><font-awesome-icon icon="cog"/> Configuration</button>
            </div>
        </div>
    </div>
</template>

<script>
    import {INPUT_TYPES} from "sethFormBuilder/config/input_constant";
    import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

    export default {
        name: "NumberInput",
        props: ['input', 'labelPosition', 'index'],
        components: {FontAwesomeIcon},
        data: () => ({
            icon: INPUT_TYPES.number.icon,
            editLabel: false
        }),
        computed: {
            demo_value() {
                if (!_.isEmpty(this.input.defaultValue)) {
                    return this.input.defaultValue;
                }

                if (this.input.isInteger) {
                    return 0;
                } else {
                    let decimal = parseInt(this.input.decimalPlace);
                    let x = 0;
                    return x.toFixed(decimal);
                }
            }
        }
    }
</script>

<style scoped>
    hr {
        margin: 1rem 0;
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

    .control {
        margin-bottom: .5rem;
    }
</style>
