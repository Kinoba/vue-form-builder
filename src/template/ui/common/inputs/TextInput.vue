<template>
    <div class="inputItemWrapper columns" :data-input-name="input.name">
        <div class="column is-12">
            <div :id="input.name" class="field has-text-left inputItem">
                <div v-if="!editLabel">
                    <label v-if="input.label" :class="{'label' : true, 'is-inline-block': true ,'bold': input.labelBold, 'italic': input.labelItalic, 'underline': input.labelUnderline}">
                        {{input.label}}
                    </label>
                    <label v-else :class="{'label' : true, 'is-inline-block': true, 'bold': input.labelBold, 'italic': input.labelItalic, 'underline': input.labelUnderline}">
                        Text input
                    </label>
                </div>
                <div v-else class="control">
                    <input type="text" class="input" v-model="input.label">
                </div>
                <div class="control">
                    <input type="text" class="input"
                            placeholder="Representation of what the user will see"
                           :name="input.fieldName"
                           :value="input.value">
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
    import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

    export default {
        name: "TextInput",
        components: {
            FontAwesomeIcon
        },
        props: ['input', 'labelPosition', 'index'],
        data: () => ({
            editLabel: false
        }),
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
