<template>
    <div class="inputItemWrapper columns" :data-input-name="input.name">
        <div class="column is-12">
            <div :id="input.name" class="field has-text-left inputItem">
                <div v-if="!editLabel">
                    <label v-if="input.label" :class="{'label' : true, 'is-inline-block': true ,'bold': input.labelBold, 'italic': input.labelItalic, 'underline': input.labelUnderline}">
                        {{input.label}}
                    </label>
                    <label v-else :class="{'label' : true, 'is-inline-block': true, 'bold': input.labelBold, 'italic': input.labelItalic, 'underline': input.labelUnderline}">
                        Time Picker input
                    </label>
                </div>
                <div v-else class="control">
                    <input type="text" class="input" v-model="input.label">
                </div>
                <div class="control has-icons-left">
                  <input type="text" class="input" :readonly="input.readonly" :name="input.fieldName" placeholder="Representation of what the user will see">
                  <span class="icon is-small is-left">
                    <font-awesome-icon :icon="icon"></font-awesome-icon>
                  </span>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import { INPUT_TYPES } from "sethFormBuilder/config/input_constant";
    import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

    export default {
        name: "TimePickerInput",
        props: ['input', 'labelPosition', 'index', 'editLabel'],
        components: {FontAwesomeIcon},
        data: () => ({
            $input: null,
            icon: INPUT_TYPES.time.icon
        }),
        watch: {
            "input.defaultValue": function(val) {
                if (!this.$input) {
                    return;
                }

                this.$input.val(val);
            }
        },
        methods: {
            configUpdated() {
                this.$input.data('TimePicker').options.timeFormat = this.input.timeFormat;
            }
        },
        mounted() {
            let self = this;
            this.$input = $(this.$el).find("input");

            this.$input.timepicker({
                timeFormat: this.input.timeFormat
            });
        },
        beforeDestroy() {
            this.$input.timepicker('destroy');
        }
    }
</script>

<style scoped>
.inputItemWrapper {
  width: 100%;
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
