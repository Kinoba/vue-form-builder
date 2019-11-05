<template>
    <div>
        <div id="inputGroupWrapper" class="inputGroupWrapper columns is-vcentered" v-for="(inputGroup, index) in orderedInputGroups">
            <div class="inputGroupItem" :id="'input_group_' + inputGroup.uuid" :key="inputGroup.uuid">
                <div class="column is-12 field has-text-left">
                    <label class="label">Input Group</label>
                    <div class="control">
                        <input type="text" class="input" placeholder="Enter input group label" v-model="inputGroup.label" @blur="updateInputGroupFromConditionTree(inputGroup, index)">
                    </div>
                </div>
                <div class="column is-12 input-group-button-bar has-text-left">
                    <button class="button is-secondary is-pulled-right" @click="configInputGroup(index)"><font-awesome-icon icon="cog"/> Input group configuration</button>
                    <button class="button is-secondary is-pulled-right" @click="delInputGroup(index)"><font-awesome-icon icon="times"/> Delete input group</button>
                    <button class="button is-secondary is-pulled-right" @click="addRow(index)"><font-awesome-icon icon="plus"/> Add row</button>
                </div>
                <div :id="inputGroup.uuid + '_body'" class="column is-12">
                    <label class="label has-text-left">Inputs</label>
                    <row-component :form="form" :input-group="inputGroup" @updateFormTree="updateFormTree"></row-component>
                    <hr>
                </div>
            </div>
        </div>

        <div class="columns">
            <div class="column is-12">
                <button class="button is-primary is-pulled-right" @click="addInputGroup">Add Input Group</button>
            </div>
        </div>

        <input-group-config-modal
          ref="inputGroupConfigModal"
          :form="currentForm"
          :formTree="formTree"
          :maxOrder="this.form.input_groups_attributes.length"
          @updateInputGroupInfo="updateInputGroupInfo" >
          @getFormAsTreeView="reloadTreeViewData" >
        </input-group-config-modal>
    </div>
</template>

<script>
    import * as lodash from 'lodash';
    import axios from 'axios';
    import { FORM_CONSTANTS, API_CONSTANTS } from "sethFormBuilder/config/constants";
    import RowComponent from "./RowComponent";
    import InputGroupConfigModal from "./common/modals/InputGroupConfigModal";
    import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
    import { Hooks } from 'sethFormBuilder/template/components/hook_lists';

  import uuidv4 from 'uuid/v4';

    export default {
        components: {InputGroupConfigModal, RowComponent, FontAwesomeIcon},
        name: "input-group-component",
        props: {
            form: {
                type: Object
            }
        },
        data: () => ({
            layouts: FORM_CONSTANTS.InputGroupLayout,
            formTree: {
              children: []
            },
            formTreeInitialized: false,
            currentForm: {
              uuid: Math.random(),
              title: '',
              input_groups_attributes: [],
              layout: ""
            }
        }),
        methods: {
            addInputGroupToConditionTree(info) {
                let treeChild = {
                  id: null,
                  conditionable_id: null,
                  conditionable_type: 'FormEngine::InputGroup',
                  label: info.label,
                  input_type: 'input_group',
                  uuid: uuidv4(),
                  children: []
                };

                this.formTree.children.push(treeChild);
            },
            updateInputGroupFromConditionTree(info, index) {
                if(this.formTree.children[index]) {
                    let updateChild = this.formTree.children[index];

                    updateChild.label = info.label;

                    let children = [];
                    info.rows_attributes.forEach((row) => {
                        children.concat(row.inputs_attributes);
                    });
                    updateChild.children = children;

                    this.formTree.children[index] = updateChild;
                }
            },
            deleteInputGroupFromConditionTree(secIndex) {
                this.formTree.children.splice(secIndex, 1);
            },
            addInputGroup() {
                var inputGroupInfo = _.cloneDeep(FORM_CONSTANTS.InputGroup);
                // set uniqueID
                inputGroupInfo.name = _.domUniqueID('input_group_');
                inputGroupInfo.uuid = _.domUniqueID(this.form.uuid + '-');
                inputGroupInfo.order = this.form.input_groups_attributes.length;

                // Before hook
                let b4Run = Hooks.InputGroup.beforeAdd.runSequence(inputGroupInfo);
                if (b4Run === false) {
                    return;
                }

                this.form.input_groups_attributes.push(inputGroupInfo);

                // Update condition tree with newly added info
                this.addInputGroupToConditionTree(inputGroupInfo);

                // After hook
                Hooks.InputGroup.afterAdd.run(inputGroupInfo);

                //Add a row in the newly created input group
                this.addRow(this.form.input_groups_attributes.length - 1);
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

                // Update condition tree with newly deleted input group
                this.deleteInputGroupFromConditionTree(secIndex);

                // final hook
                Hooks.InputGroup.afterRemove.run(inputGroupInfo);
            },
            configInputGroup(secIndex) {
                var inputGroupInfo = this.form.input_groups_attributes[secIndex];
                this.disableSelfInputsAsOptionInTreeview(inputGroupInfo);

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
            updateInputGroupOrder(inputGroupInfo, index, newOrder) {
                this.currentForm.input_groups_attributes.splice(index, 1); // Remove item from its current position
                this.currentForm.input_groups_attributes.splice(newOrder, 0, inputGroupInfo);// Insert item in the new position

                this.currentForm.input_groups_attributes.forEach((input_group, index) => {
                    input_group.order = index;
                });
            },
            updateInputGroupInfo(inputGroupInfo, index, reOrder, newOrder) {
                _.deepExtend(this.currentForm.input_groups_attributes[index], inputGroupInfo);

                if(reOrder) {
                    this.updateInputGroupOrder(inputGroupInfo, index, newOrder);
                }
            },
            getFormAsTreeView() {
              if (this.form.id) {
                // Get tree data to display the form tree in config modals
                axios
                  .get(`${API_CONSTANTS.url}/forms/${this.form.id}?view=tree_view`)
                  .then(response => {
                    this.formTree = response.data;
                    this.formTreeInitialized = true;
                  }).catch(error => {
                    console.log(error);
                });
              }
            },
             // User should not be able to add a condition on an InputGroup on itself
            disableSelfInputsAsOptionInTreeview(inputGroupInfo) {
              this.formTree.children.forEach((inputGroup, inputGroupIndex) => {
                inputGroup.children.forEach((input, inputIndex) => {
                  this.formTree.children[inputGroupIndex].children[inputIndex].is_disabled = inputGroup.uuid === inputGroupInfo.uuid;
                })
              })
            },
            updateFormTree(formTree) {
              this.formTree = formTree;
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
        },
        computed: {
          orderedInputGroups: function () {
            return lodash.orderBy(this.form.input_groups_attributes, 'order')
          }
        },
        watch: {
            form: {
                handler(val) {
                  if (typeof val !== 'undefined') {
                    if (this.form.id && !this.formTreeInitialized) {
                      this.getFormAsTreeView();
                    }

                    this.currentForm = val;
                  }
                },
                deep: true
            },
        }
    }
</script>

<style scoped>
    .inputGroupWrapper {
      border: 1px solid #e6e6e6;
      border-radius: .5em;
      margin-bottom: 2rem;
    }

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
