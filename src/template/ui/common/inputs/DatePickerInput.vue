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
                       :name="input.fieldName">

                <div class="input-group-append">
                        <span class="input-group-text">
                            <font-awesome-icon :icon="icon"></font-awesome-icon>
                        </span>
                </div>
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
                           :name="input.fieldName">

                    <div class="input-group-append">
                        <span class="input-group-text">
                            <font-awesome-icon :icon="icon"></font-awesome-icon>
                        </span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import {INPUT_TYPES} from "sethFormBuilder/config/input_constant";
    import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

    export default {
        name: "DatePickerInput",
        props: ['input', 'labelPosition'],
        components: {FontAwesomeIcon},
        data: () => ({
            $input: null,
            icon: INPUT_TYPES.datepicker.icon
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
                this.$input.datepicker("option", "dateFormat", this.input.dateFormat);
            }
        },
        mounted() {
            let self = this;
            this.$input = $(this.$el).find("input");
            this.$input.datepicker({
                dateFormat: this.input.dateFormat,
                beforeShow:function(input) {
                    // read only can't choose
                    if (self.input.readonly) {
                        return false;
                    }
                }
            });
        },
        beforeDestroy() {
            this.$input.datepicker('destroy');
        }
    }
</script>

<style scoped>

</style>
