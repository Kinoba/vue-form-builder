<template>
    <div>
        <div id="inputGroupWrapper" class="columns is-vcentered" v-for="(inputGroup, index) in form.input_groups_attributes">
            <div class="inputGroupItem" :id="'input_group_' + inputGroup.uuid" :key="inputGroup.uuid">
                <div class="column is-12 field has-text-left">
                    <label class="label">Input Group</label>
                    <div class="control">
                        <input type="text" class="input" placeholder="Enter input group label" v-model="inputGroup.label">
                    </div>
                </div>
                <div class="column is-12 input-group-button-bar has-text-left">
                    <button class="button is-secondary is-pulled-right" @click="configInputGroup(index)"><font-awesome-icon icon="cog"/> Input group configuration</button>
                    <button class="button is-secondary is-pulled-right" @click="delInputGroup(index)"><font-awesome-icon icon="times"/> Delete input group</button>
                    <button class="button is-secondary is-pulled-right" @click="addRow(index)"><font-awesome-icon icon="plus"/> Add row</button>
                </div>
                <div :id="inputGroup.uuid + '_body'" class="column is-12">
                    <label class="label has-text-left">Inputs</label>
                    <row-component :input-group="inputGroup"></row-component>
                    <hr>
                </div>
            </div>
        </div>

        <div class="columns">
            <div class="column is-12">
                <button class="button is-primary is-pulled-right" @click="addInputGroup">Add Input Group</button>
            </div>
        </div>

        <input-group-config-modal ref="inputGroupConfigModal" :maxOrder="this.form.input_groups_attributes.length" @updateInputGroupInfo="updateInputGroupInfo"></input-group-config-modal>
    </div>
</template>

<script>
    import { FORM_CONSTANTS } from "sethFormBuilder/config/constants";
    import RowComponent from "./RowComponent";
    import InputGroupConfigModal from "./common/InputGroupConfigModal";
    import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
    import { Hooks } from 'sethFormBuilder/template/components/hook_lists';

    export default {
        components: {InputGroupConfigModal, RowComponent, FontAwesomeIcon},
        name: "input-group-component",
        props: {
            form: {
                type: Object
            }
        },
        data: () => ({
            layouts: FORM_CONSTANTS.InputGroupLayout
        }),
        methods: {
            addInputGroup() {
                var inputGroupInfo = _.cloneDeep(FORM_CONSTANTS.InputGroup);
                // set uniqueID
                inputGroupInfo.name = _.domUniqueID('input_group_');
                inputGroupInfo.uuid = _.domUniqueID(this.form.uuid + '-');

                // Before hook
                let b4Run = Hooks.InputGroup.beforeAdd.runSequence(inputGroupInfo);
                if (b4Run === false) {
                    return;
                }

                this.form.input_groups_attributes.push(inputGroupInfo);

                // After hook
                Hooks.InputGroup.afterAdd.run(inputGroupInfo);

                this.addRow(0);
            },
            delInputGroup(secIndex) {
                // make sure no dependencies
                // if (this.form.input_groups_attributes[secIndex].rows_attributes.length > 0) {
                //     SethPhatToaster.error("Can't remove this input group because it's still have row(s) inside.");
                //     return;
                // }

                var inputGroupInfo = this.form.input_groups_attributes[secIndex];
                let beforeRun = Hooks.InputGroup.beforeRemove.runSequence(inputGroupInfo);
                if (beforeRun === false) {
                    return;
                }

                // remove input group
                this.form.input_groups_attributes.splice(secIndex, 1);

                // final hook
                Hooks.InputGroup.afterRemove.run(inputGroupInfo);
            },
            configInputGroup(secIndex) {
                var inputGroupInfo = this.form.input_groups_attributes[secIndex];
                this.$refs.inputGroupConfigModal.openModal(inputGroupInfo, secIndex);
            },
            traverseInputGroup() {
                let self = this;

                // prepare data
                var items = $(this.$el).find("#inputGroupWrapper .inputGroupItem");
                var finalItems = [];

                // sort
                _.each(items, (item, index) => {
                    var id = $(item).attr('id');
                    var inputGroupItem = _.find(self.form.input_groups_attributes, {uuid: id});
                    inputGroupItem.order = index;
                    finalItems.push(inputGroupItem);
                });

                // reset the current input groups
                this.form.input_groups_attributes = finalItems;
            },
            addRow(secIndex) {
                var rowInfo = _.cloneDeep(FORM_CONSTANTS.Row);

                // general row_name (id)
                rowInfo.name = _.domUniqueID(this.form.input_groups_attributes[secIndex].uuid + '_row_');
                rowInfo.uuid = _.domUniqueID(this.form.input_groups_attributes[secIndex].uuid + '-');
                rowInfo.order = this.form.input_groups_attributes[secIndex].rows_attributes.length;

                // before hook
                let b4Run = Hooks.Row.beforeAdd.runSequence(rowInfo, this.form.input_groups_attributes[secIndex]);
                if (b4Run === false) {
                    return;
                }

                this.form.input_groups_attributes[secIndex].rows_attributes.push(rowInfo);

                // after hook
                Hooks.Row.afterAdd.run(rowInfo, this.form.input_groups_attributes[secIndex]);
            },
            preview() {
                this.$parent.preview();
            },
            updateInputGroupInfo(inputGroupInfo, index) {
                _.deepExtend(this.form.input_groups_attributes[index], inputGroupInfo);
            }
        },
        mounted() {
            $("#inputGroupWrapper").sortable({
                cursor: "move",
                delay: 200,
                placeholder: "ui-state-highlight",
                update: function (event, ui) {
                    self.traverseInputGroup();
                },
                start: function(e, ui){
                    ui.placeholder.height(ui.item.height());
                    ui.placeholder.css("border", "");
                    ui.placeholder.css("background-color", "#3498db");
                }
            }).disableSelection();
        },
        updated() {
            this.form._uniqueId = Math.random();
        }
    }
</script>

<style scoped>
    .inputGroupItem {
        width: 100%;
    }

    button.is-secondary {
        margin-left: .5rem;
    }

    button > .svg-inline--fa { margin-right: .5rem }

    .input-group-button-bar {
        display: inline-block;
    }

    .accordion .collapsed .fa-chevron-up,
    .accordion .fa-chevron-down {
        display: none;
    }

    .accordion .collapsed .fa-chevron-down,
    .accordion .fa-chevron-up {
        display: inline-block;
    }
    .ui-state-highlight {
        height: 2.5em;
        line-height: 1.2em;
        margin-top: .5em;
    }
</style>
