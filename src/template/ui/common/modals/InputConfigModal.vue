<template>
    <div id="inputConfigModal" class="modal">
      <div class="modal-background"></div>
      <div class="modal-card" v-if="input">
        <header class="modal-card-head">
          <p class="modal-card-title">Input Configuration</p>
          <button class="delete" aria-label="close" @click="closeModal"></button>
        </header>
        <section class="modal-card-body" v-if="input !== null">
            <div class="field has-text-left">
              <label class="label">Input uuid</label>
              <div class="control">
                <input class="input" type="text" v-model="input.uuid" placeholder="Enter input uuid">
              </div>
            </div>
            <div class="field has-text-left">
              <label class="label">Input name</label>
              <div class="control">
                <input class="input" type="text" v-model="input.name" placeholder="Enter input name">
              </div>
            </div>
            <div class="field has-text-left" v-if="maxOrder > (oldInputOrder + 1)">
              <label class="label">Input order</label>
              <div class="control">
                <input class="input" :class="{'is-danger': (input.order >= maxOrder) || (input.order < 0)}" type="number" v-model="input.order" :min="0" :max="maxOrder" placeholder="Enter input order">
              </div>
              <p v-if="input && ((input.order >= maxOrder) || (input.order < 0))" class="help is-danger">You are trying to reorder the input to an unknow position.</p>
            </div>
            <div class="field checkbox-choices has-text-left" v-if="input.input_type === 'checkbox'">
              <label class="label">Checkbox choices</label>
              <div class="control" v-if="input.properties.options" v-for="option in input.properties.options">
                <input class="input" type="text" v-model="option.label" placeholder="Enter checkbox choice">
              </div>
              <button class="button link is-pulled-right" @click="addChoice()">Add choice</button>
            </div>
            <div class="field select-choices has-text-left" v-if="input.input_type === 'select'">
              <label class="label">Select choices</label>
              <div class="control" v-if="input.properties.options" v-for="option in input.properties.options">
                <input class="input" type="text" v-model="option.value" placeholder="Enter select choice">
              </div>
              <button class="button link is-pulled-right" @click="addChoice()">Add choice</button>
            </div>
            <div class="field has-text-left" v-if="formTree.children && formTree.children.length > 0">
              <label class="label">Conditions</label>
              <div class="control">
                  <treeselect
                    placeholder="Sélectionnez les elements pour créer vos conditions"
                    :multiple="true"
                    :options="formTree.children"
                    :always-open="true"
                    :default-expand-level="1"
                    :valueFormat="'uuid'"
                    @select="onConditionSelect($event)"
                    @deselect="onConditionDeselect($event)"></treeselect>
                </div>
            </div>
            <div class="field has-text-left" v-if="selectedTreeItems.length > 0" v-for="(selectedItem, index) in selectedTreeItems" :key="'validation_' + selectedItem.id">
              <label class="label">Validation <span class="is-italic">for {{ selectedItem.label }}</span></label>
              <div class="control columns">
                  <div class="column is-4">
                      <div class="select">
                          <select v-model="conditionable.logic_attributes.conditions_attributes[index].operator">
                            <option selected :key="'default_' + selectedItem.id">Selectionner</option>
                            <option v-for="option in availableValidations[selectedItem.input_type]" :key="option.key + '_' + selectedItem.id">{{ option.key }}</option>
                          </select>
                      </div>
                  </div>
                  <div class="column is-8">
                      <input class="input" :type="selectedItem.input_type" v-model="conditionable.logic_attributes.conditions_attributes[index].value" placeholder="Enter validation value">
                  </div>
              </div>
              <div class="has-text-right columns" v-if="index === (selectedTreeItems.length - 1)">
                  <div class="column is-12">
                      <button class="button is-secondary" @click="addValidation(selectedItem)">Add validation</button>
                  </div>
              </div>
            </div>
        </section>
        <footer class="modal-card-foot has-text-right">
          <button class="button is-success" :disabled="(input.order >= maxOrder) || (input.order < 0)" @click="save">Save</button>
          <button class="button" @click="closeModal">Cancel</button>
        </footer>
      </div>
    </div>
</template>

<script>
    import Treeselect from '@riophae/vue-treeselect';
    import axios from 'axios';
    import { API_CONSTANTS } from "sethFormBuilder/config/constants";;
    import '@riophae/vue-treeselect/dist/vue-treeselect.css';

    const INPUT_ID = "#inputConfigModal";

    export default {
        name: "InputConfigModal",
        props:['updateInputInfo', 'maxOrder', 'formTree', 'parentInputGroup'],
        components: { Treeselect },
        data: () => ({
            index: null,
            input: null,
            selectedTreeItems: [],
            availableValidations: {},
            conditionable: {},
            oldInputOrder: null
        }),
        methods: {
            openModal(inputInfo, index) {
                this.input = _.cloneDeep(inputInfo);
                this.index = _.clone(index);
                $(INPUT_ID).modal('show');
            },
            closeModal() {
                $(INPUT_ID).modal('hide');
            },
            save() {
                let reOrder = false;
                if(Object.keys(this.conditionable).length > 0) { this.saveConditionable(); }
                if(this.oldInputOrder !== this.input.order) reOrder = true;
                this.$emit('updateInputInfo', this.input, this.index, reOrder, this.input.order);
                this.closeModal();
            },
            addChoice() {
                let newChoice= {};
                if(this.input.input_type === 'checkbox') {
                    newChoice = {"label": "", value: "false"};
                } else if (this.input.input_type === 'select') {
                    newChoice = {"key": "key_" + this.input.properties.options.length + 1, value: ""};
                }
                this.input.properties.options.push(newChoice);
            },
            onConditionSelect(item) {
                this.selectedTreeItems.push(item);

                console.log(this.selectedTreeItems)

                if(!this.availableValidations.hasOwnProperty(item.item_type)) {
                    let validationUrl = API_CONSTANTS.url;
                    // if(item.id) validationUrl += '/inputs/' + item.id + '/validations';
                    // else validationUrl += '/inputs/' + item.input_type + '/validations';

                    validationUrl += '/inputs/' + item.input_type + '/validations'

                    axios({
                      method: 'get',
                      url: validationUrl,
                      data: {}
                    }).then(response => {
                        // Populate availableValidations JSON if the validations for the given input does not exist
                        this.availableValidations[item.input_type] = response.data;
                        this.$forceUpdate();
                    }).catch(error => {
                      console.log(error);
                    });
                }

                this.addConditionable(item);
            },
            onConditionDeselect(item) {
                let index = this.selectedTreeItems.indexOf(item);

                if(index > -1) {
                    this.selectedTreeItems.splice(index, 1); // remove item from selectedTreeItems array
                }

                if(this.availableValidations[item.input_type]) {
                    delete this.availableValidations[item.input_type];
                }

                this.deleteConditionable(index);
            },
            initialiseConditionable() {
                if(Object.keys(this.conditionable).length === 0) {
                    //Initialise conditionable
                    this.conditionable = {
                        conditionable_id: this.parentInputGroup.uuid,
                        conditionable_type: this.parentInputGroup.engine_type,
                        logic_attributes: {
                            action: 'jump',
                            conditions_attributes: []
                        }
                    };
                }
            },
            addConditionable(selectedTreeItem) {
                this.initialiseConditionable();

                let conditionableItem = {
                    conditionable_id: selectedTreeItem.uuid,
                    conditionable_type: selectedTreeItem.engine_type,
                    operator: '',
                    value: ''
                };

                this.conditionable.logic_attributes.conditions_attributes.push(conditionableItem);
            },
            deleteConditionable(index) {
                this.conditionable.logic_attributes.conditions_attributes.splice(index, 1);
            },
            addValidation(item) {
                this.selectedTreeItems.push(item);
                this.addConditionable(item);
            },
            saveConditionable() {
                axios({
                  method: 'post',
                  url: API_CONSTANTS.url + '/conditionables',
                  data: this.conditionable
                }).then(response => {
                    // Populate availableValidations JSON if the validations for the given input does not exist
                    console.log(response);
                }).catch(error => {
                  console.log(error);
                });
            }
        },
        mounted() {
            $("[data-toggle='tooltip']").tooltip();
            if(this.input) this.oldInputOrder = this.input.order;

            console.log(this.formTree);
        },
        watch: {
            input(val) {
                if(this.input) this.oldInputOrder = val.order;
            },
            formTree(val) {
              console.log(val);
              this.formTree = val;

              //Set unique IDs in form tree
              this.formTree.children.forEach((inputGroup) => {
                  if(!inputGroup['uuid']) {
                      inputGroup['uuid'] = inputGroup.id;
                      inputGroup['id'] = inputGroup.engine_type + '_' + inputGroup.id;

                      inputGroup.children.forEach((input) => {
                          if(!input['uuid']) {
                              input['uuid'] = input.id;
                              input['id'] = input.engine_type + '_' + input.id;
                          }
                      });
                  }
              });
            }
        },
    }
</script>

<style scoped>
    .checkbox-choices > .control,
    .select-choices > .control,
    .checkbox-choices > button,
    .select-choices > button {
        margin-top: 10px;
    }

    .vue-treeselect {
        overflow-y: scroll;
    }

    .vue-treeselect /deep/ .vue-treeselect__menu-container {
        position: relative;
        display: inline-block;
        height: 150px;
    }
</style>
