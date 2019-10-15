<template>
    <div>
        <div class="columns">
            <div class="column is-12">
                <button class="button is-primary" @click="addInputGroup">Add Input Group</button>
            </div>
        </div>

        <div id="inputGroupWrapper" class="columns is-vcentered">
            <div class="column accordion inputGroupItem" v-for="(inputGroup, index) in form.input_groups" :id="inputGroup.name" :key="inputGroup.name">
                <div class="card">
                    <div class="card-content">
                        <div class="content">
                            <div class="column">
                                <input type="text" class="input" placeholder="Input Group Label" v-model="inputGroup.label">
                            </div>
                            <div class="column text-right">
                                <p style="margin-top: 5px;">
                                    <span class="pr-2 clickable" @click="addRow(index)"><font-awesome-icon icon="plus"/> Add Row</span>
                                    <span class="pr-2 clickable" @click="delInputGroup(index)"><font-awesome-icon icon="times"/> Remove Input Group</span>
                                    <span class="pr-2 clickable" @click="configInputGroup(index)"><font-awesome-icon icon="cog"/> Input Group Config</span>
                                    <span class="clickable collapsed" data-toggle="collapse" :data-target="'#' + inputGroup.name + '_body'">
                                        <i class="fa fa-fw fa-chevron-up"></i>
                                        <i class="fa fa-fw fa-chevron-down"></i>
                                    </span>
                                </p>
                            </div>
                        </div>
                    </div>
                    <div :id="inputGroup.name + '_body'" class="collapse">
                        <div class="card-body inputGroupBody">
                            <row-component :section="inputGroup"></row-component>
                        </div>
                    </div>
                </div>

            </div>
        </div>

        <input-group-config-modal ref="inputGroupConfigModal" @updateInputGroupInfo="updateInputGroupInfo"></input-group-config-modal>
    </div>
</template>

<script>
    import {FORM_CONSTANTS} from "sethFormBuilder/config/constants";
    import RowComponent from "./RowComponent";
    import InputGroupConfigModal from "./common/InputGroupConfigModal";
    import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
    import {Hooks} from 'sethFormBuilder/template/components/hook_lists';

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
                inputGroupInfo.clientKey = inputGroupInfo.name;

                // Before hook
                let b4Run = Hooks.InputGroup.beforeAdd.runSequence(inputGroupInfo);
                if (b4Run === false) {
                    return;
                }

                this.form.input_groups.push(inputGroupInfo);

                // After hook
                Hooks.InputGroup.afterAdd.run(inputGroupInfo);
            },
            delInputGroup(secIndex) {
                // make sure no dependencies
                if (this.form.input_groups[secIndex].rows.length > 0) {
                    SethPhatToaster.error("Can't remove this input group because it's still have row(s) inside.");
                    return;
                }

                var inputGroupInfo = this.form.input_groups[secIndex];
                let beforeRun = Hooks.InputGroup.beforeRemove.runSequence(inputGroupInfo);
                if (beforeRun === false) {
                    return;
                }

                // remove input group
                this.form.input_groups.splice(secIndex, 1);

                // final hook
                Hooks.InputGroup.afterRemove.run(inputGroupInfo);
            },
            configInputGroup(secIndex) {
                var inputGroupInfo = this.form.input_groups[secIndex];
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
                    var inputGroupItem = _.find(self.form.input_groups, {name: id});
                    inputGroupItem.order = index;
                    finalItems.push(inputGroupItem);
                });

                // reset the current input groups
                this.form.input_groups = finalItems;
            },
            addRow(secIndex) {
                var rowInfo = _.cloneDeep(FORM_CONSTANTS.Row);

                // general row_name (id)
                rowInfo.name = _.domUniqueID(this.form.input_groups[secIndex].name + '_row_');

                // before hook
                let b4Run = Hooks.Row.beforeAdd.runSequence(rowInfo, this.form.input_groups[secIndex]);
                if (b4Run === false) {
                    return;
                }

                this.form.input_groups[secIndex].rows.push(rowInfo);

                // after hook
                Hooks.Row.afterAdd.run(rowInfo, this.form.input_groups[secIndex]);
            },
            preview() {
                this.$parent.preview();
            },
            updateInputGroupInfo(inputGroupInfo, index) {
                _.deepExtend(this.form.input_groups[index], inputGroupInfo);
            }
        },
        mounted() {
            let self = this;

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
    .inputGroupBody {
        /*padding: 30px 0;*/
        border-bottom: 1px solid rgba(0,0,0,.125);
    }

    .clickable {
        cursor: pointer;
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
