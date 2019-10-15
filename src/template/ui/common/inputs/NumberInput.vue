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
                           :name="input.fieldName"
                           :value="demo_value">

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
        name: "NumberInput",
        props: ['input', 'labelPosition'],
        components: {FontAwesomeIcon},
        data: () => ({
            icon: INPUT_TYPES.number.icon
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

</style>
