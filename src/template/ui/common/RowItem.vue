<template>
    <div class="col-md-12 mb-2 rowItem row" :id="row.uuid">
        <div class="tools">
            <font-awesome-icon icon="times" class="clickable" @click="removeRow(row.uuid)"></font-awesome-icon>
        </div>
        <div v-if="row.inputs.length === 0">Choose an input in the Supported Inputs section and drag it here.</div>

        <component v-for="(input, index) in row.inputs"
                   :is="INPUT_TYPES[input.input_type].source.template"
                   :key="input.uuid"
                   :control="input"
                   @dblclick.native="openConfig(input)"
                   :ref="input.uuid"
                   :label-position="labelPosition">
        </component>
    </div>
</template>

<script>
    import {FORM_CONSTANTS} from "sethFormBuilder/config/constants";
    import {INPUT_TYPES} from "sethFormBuilder/config/input_constant";
    //import ControlItem from "./ControlItem";
    import {eventBus, EventHandlerConstant} from 'sethFormBuilder/template/handler/event_handler';
    import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
    import {Hooks} from 'sethFormBuilder/template/components/hook_lists';
    import {ControlHandler} from 'sethFormBuilder/template/handler/control_handler';

    export default {
        components: {FontAwesomeIcon},
        name: "row-item",
        props: {
            row: {
                type: Object,
                default: {}
            },
            labelPosition: null
        },
        data: () => ({
            INPUT_TYPES,
            editing_control: null,
        }),
        methods: {
            addInput(inputType) {
                var inputInfo = _.cloneDeep(FORM_CONSTANTS.Control);
                inputInfo.type = inputType;
                // generate id
                inputInfo.name = _.domUniqueID(`control_${inputType}_`);
                inputInfo.label = FORM_CONSTANTS.Type[inputType].label;
                inputInfo.fieldName = inputInfo.name; // same for both

                // check if there's any more special fields?
                if(INPUT_TYPES[inputType].other_properties) {
                    _.each(INPUT_TYPES[inputType].other_properties, (value, key) => {
                        inputInfo[key] = value;
                    });
                }

                // before hook
                let b4Run = Hooks.Control.beforeAdd.runSequence(inputInfo, this.row);
                if (b4Run === false) {
                    return;
                }

                // add to row
                this.row.controls.push(inputInfo);

                // after hook
                Hooks.Control.afterAdd.run(inputInfo, this.row);
            },
            traverseInput() {
                let self = this;

                // prepare data
                var items = $(this.$el).find('.controlItem');
                var finalItems = [];

                // sort
                _.each(items, (item, index) => {
                    var id = $(item).attr('id');
                    var inputItem = _.find(self.row.controls, {name: id});
                    controlItem.order = index;
                    finalItems.push(inputItem);
                });

                // reset the current sections
                this.row.controls = finalItems;
            },
            removeRow(id) {
                this.$emit('removeRow', id);
            },

            // control
            openConfig(inputInfo) {
                ControlHandler.clearSelect();
                ControlHandler.setSelect(inputInfo.name);
                this.editing_control = inputInfo;
                eventBus.$emit(EventHandlerConstant.ACTIVATE_EDITOR_SIDEBAR, _.cloneDeep(inputInfo));
            }
        },
        created() {
            let self = this;

            // remove control bus
            eventBus.$on(EventHandlerConstant.REMOVE_CONTROL, ui => {
                // prepare data
                var id = ui.helper.attr('data-control-name');
                var inputIndex = _.findIndex(this.row.controls, {name: id});

                if (inputIndex < 0) {
                    return;
                }

                // before hook
                var inputInfo = this.row.controls[inputIndex];
                let beforeRun = Hooks.Control.beforeRemove.runSequence(inputInfo);
                if (beforeRun === false) {
                    return;
                }

                // remove control
                this.row.controls.splice(inputIndex, 1);

                // after hook
                Hooks.Control.afterRemove.run(inputInfo);
            });

            // update control bus
            eventBus.$on(EventHandlerConstant.ON_APPLY_EDITOR_SIDEBAR, control => {
                //var oldInput = _.find(this.row.controls, {name: control.name});
                let inputIndex = _.findIndex(self.row.controls, {name: control.name});
                if (inputIndex <= -1 || self.row.controls[inputIndex].name !== self.editing_control.name) {
                    return;
                }

                let oldInput = self.row.controls[inputIndex];
                // check if existed name in this section
                if (control.fieldName !== oldInput.fieldName && ControlHandler.isControlNameExisted(self.row.uuid, control.fieldName)) {
                    SethPhatToaster.error("This field Name is already existed in the current section.");
                    return;
                }

                // replace value
                var inputInfo = _.cloneDeep(control);
                _.each(inputInfo, (value, key) => {
                    self.row.controls[inputIndex][key] = value;
                });

                // update gui for specific control
                if (self.$refs[inputInfo.name]) {
                    if (_.isFunction(self.$refs[inputInfo.name].configUpdated)) {
                        self.$refs[inputInfo.name].configUpdated();
                    }
                }

                // replace
                this.$nextTick(() => {
                    ControlHandler.setSelect(oldInput.name);
                });
            });
        },
        mounted() {
            let self = this;
            $(this.$el).droppable({
                accept: ".control-wrapper",
                drop: function (event, ui){
                    self.addInput($(ui.draggable[0]).attr('data-control-type'));
                },
                over: function( event, ui ) {
                    ui.helper.css('border', '1px solid green');
                },
            });

            $(this.$el).sortable({
                cursor: "move",
                delay: 100,
                helper: 'clone',
                placeholder: "ui-state-highlight",
                update: function (event, ui) {
                    self.traverseInput();
                },
                start: function(e, ui){
                    ui.placeholder.height(ui.item.height());
                    ui.placeholder.width(ui.item.width());
                    ui.placeholder.css("border", "");
                    ui.placeholder.css("background-color", "#e74c3c");
                }
            }).disableSelection();
        }
    }
</script>

<style scoped>
    .rowItem {
        border-radius: .5rem;
        border: 1px dashed #e6e6e6;
        padding: .5rem;
        margin-bottom: .5rem;
        position: relative;
    }

    .rowItem .tools {
        position: absolute;
        top: 3px;
        right: 12px;
    }

    .clickable {
        cursor: pointer;
    }

    .ui-state-highlight { height: 1.5em; line-height: 1.2em; }
</style>
