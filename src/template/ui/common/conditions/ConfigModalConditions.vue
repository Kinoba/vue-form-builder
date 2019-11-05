<template>
  <div>
    <div class="field has-text-left" v-if="formTree.children && formTree.children.length > 0">
      <label class="label">Conditions</label>
      <div class="control">
        <treeselect
          placeholder="Select any element to create conditions"
          noChildrenText="No input in this group"
          :multiple="true"
          :clearable="false"
          :options="formTree.children"
          :always-open="true"
          :default-expand-level="1"
          v-model="value"
          :normalizer="normalizer"
          @beforeClearAll="clearAll($event)"
          @select="onConditionableSelect($event)"
          @deselect="onConditionDeselect($event)"
        ></treeselect>
      </div>
    </div>
    <div v-if="selectedTreeItems.length > 0">
      <div
        class="field has-text-left"
        v-for="(selectedItem, index) in selectedTreeItems"
        :key="'validation_' + index"
      >
        <label class="label">
          Validation
          <span class="is-italic">for {{ selectedItem.label }}</span>
        </label>
        <div class="control columns">
          <div class="column is-4">
            <div class="select">
              <select
                v-if="currentConditionable.conditionable_attributes.logic_attributes && currentConditionable.conditionable_attributes.logic_attributes.conditions_attributes[index]"
                v-model="currentConditionable.conditionable_attributes.logic_attributes.conditions_attributes[index].operator"
                @change="updateFormData"
              >
                <option selected :key="'default_' + index">Selectionner</option>
                <option
                  v-for="option in availableValidations[selectedItem.input_type]"
                  :key="option.key + '_' + index"
                >{{ option.key }}</option>
              </select>
            </div>
          </div>
          <div class="column is-8" v-if="currentConditionable.conditionable_attributes.logic_attributes && currentConditionable.conditionable_attributes.logic_attributes.conditions_attributes[index]">
            <!-- If the input is a text or number -->
            <input
              v-if="selectedItem.input_type !== 'select' && selectedItem.input_type !== 'checkbox' && selectedItem.input_type !== 'time' && selectedItem.input_type !== 'date'"
              class="input"
              :type="selectedItem.input_type"
              v-model="currentConditionable.conditionable_attributes.logic_attributes.conditions_attributes[index].value"
              placeholder="Enter validation value"
            />
            <!-- If the input is a select or checkbox -->
            <input
              v-if="selectedItem.input_type === 'select' || selectedItem.input_type === 'checkbox'"
              class="input"
              type="text"
              v-model="currentConditionable.conditionable_attributes.logic_attributes.conditions_attributes[index].value"
              placeholder="Enter validation value"
            />
            <!-- If the input is a date or time -->
            <input
              v-if="selectedItem.input_type === 'time' || selectedItem.input_type === 'date'"
              class="input"
              type="text"
              v-model="currentConditionable.conditionable_attributes.logic_attributes.conditions_attributes[index].value"
              placeholder="Enter validation value"
            />
          </div>
        </div>
        <div class="has-text-right columns" v-if="index === (selectedTreeItems.length - 1)">
          <div class="column is-12">
            <button
              class="button is-secondary"
              @click="addValidation(selectedItem)"
            >Add validation</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import Treeselect from "@riophae/vue-treeselect";
  import axios from "axios";
  import { API_CONSTANTS } from "sethFormBuilder/config/constants";
  import "@riophae/vue-treeselect/dist/vue-treeselect.css";

  export default {
    name: "ConfigModalConditions",
    props: ["updateForm", "form", "formTree", "inputGroupIndex", "rowIndex", "inputIndex"],
    components: { Treeselect },
    data: () => ({
      normalizer(node) {
        return {
          id: node.uuid,
          label: node.label,
          children: node.children,
          isDisabled: node.is_disabled
        }
      },
      index: null,
      conditionableAttributes: {
        conditionable_id: null,
        conditionable_type: null,
        logic_attributes: {}
      },
      logicAttributes: {
        conditionable_id: null,
        action: "jump",
        conditions_attributes: []
      },
      conditionAttributes: {
        conditionable_id: null,
        operator: null,
        value: null
      },
      currentConditionable: {},
      currentForm: {},
      selectedTreeItems: [],
      availableValidations: {},
      value: [], // Treeview v-model, should be a list of ids ["FormEngine::Input_1"]
    }),
    computed: {
      conditionableAttributesTemplate() {
        if (Object.keys(this.conditionableAttributes['logic_attributes']).length === 0) {
          // this.logicAttributes['conditions_attributes'].push(this.conditionAttributes);
          this.conditionableAttributes['logic_attributes'] = this.logicAttributes;
        }

        this.conditionableAttributes.conditionable_id = this.currentConditionable.id;
        if (this.isInputModal()) {
          this.conditionableAttributes.conditionable_type = 'FormEngine::Input';
        } else if (this.isInputGroupModal()) {
          this.conditionableAttributes.conditionable_type = 'FormEngine::InputGroup';
        } else {
          console.warn('I do not know if it is an Input or an InputGroup');
        }

        return this.conditionableAttributes;
      }
    },
    methods: {
      // User clicks on a treeview item (either an InputGroup or an Input)
      onConditionableSelect(item) {
        if (item.children) {
          item.children.forEach((childItem) => {
            this.selectItemInTree(childItem);
          });
        } else {
          //The user has selected an input
          this.selectItemInTree(item);
        }
      },
      selectItemInTree(item, addConditionToLogic=true) {
        // Checks if the conditionable isn't already added to the existing conditions
        if (!this.selectedTreeItems.some(e => e.uuid === item.uuid)) {
          this.selectedTreeItems.push(item);
        }

        this.getAvailableValidationsFromServer(item.input_type);
        this.addConditionToConditionable(item);
      },
      deselectItemInTree(item) {
        let deleteIndex = -1;

        this.selectedTreeItems.forEach((treeItem, index) => {
          if(treeItem.id === item.id) { deleteIndex = index; }
        });

        if (this.availableValidations[item.input_type]) {
          delete this.availableValidations[item.input_type];
        }

        if(deleteIndex > -1) {
          this.selectedTreeItems.splice(deleteIndex, 1);
          this.deleteConditionable(deleteIndex);
        }
      },
      getAvailableValidationsFromServer(input_type) {
        if (!this.availableValidations.hasOwnProperty(input_type)) {
          let validationUrl = API_CONSTANTS.url;
          validationUrl += "/inputs/" + input_type + "/validations";

          axios({
            method: "get",
            url: validationUrl,
            data: {}
          })
            .then(response => {
              // Populate availableValidations JSON if the validations for the given input does not exist
              this.availableValidations[input_type] = response.data;
              this.$forceUpdate();
            })
            .catch(error => {
              this.$toasted.show( error.response.data.errors, { type: 'error' }).goAway(5000);
              console.log(error);
            });
        }
      },
      getConditionableFromServer() {
        axios({
          method: "get",
          url: API_CONSTANTS.url + "/conditionables/" + this.currentConditionable.id,
          data: {}
        })
          .then(response => {
            // Populate availableValidations JSON if the validations for the given input does not exist
            this.currentConditionable = response.data;
            this.initialiseConditionable();
          })
          .catch(error => {
            console.log(error);
          });
      },
      onConditionDeselect(item) {
        if(item.children) {
          item.children.forEach((childItem) => {
            this.deselectItemInTree(childItem);
          });
        } else {
          //The user has selected an input
          this.deselectItemInTree(item);
        }
      },
      initialiseConditionable() {
        if (!this.currentConditionable.conditionable_attributes) {
          this.currentConditionable.conditionable_attributes = this.conditionableAttributesTemplate;
        }

        if (!this.currentConditionable.conditionable_attributes.logic_attributes) {
          this.currentConditionable.conditionable_attributes.logic_attributes = this.conditionableAttributesTemplate.logic_attributes;
        }

        if (!this.currentConditionable.conditionable_attributes.logic_attributes.conditions_attributes) {
          this.currentConditionable.conditionable_attributes.logic_attributes.conditions_attributes = this.conditionableAttributesTemplate.logic_attributes.conditions_attributes;
        }

        this.updateFormData();
      },

      // Based on a treeItem, adds a new condition to the parent conditionable JSON
      addConditionToConditionable(selectedTreeItem, addConditionToLogic=true) {
        this.initialiseConditionable();

        // If the conditionable is not present in the intermediate conditionable table, we create it
        if (selectedTreeItem.conditionable_id === null) {
          this.createConditionable(selectedTreeItem, addConditionToLogic);
        } else {
          // We need to create a copy of the selectedTreeItem to make sure we don't modify it later
          let conditionToAddToConditionable = JSON.parse(JSON.stringify(selectedTreeItem));

          let conditionPresent = false;
          this.currentConditionable.conditionable_attributes.logic_attributes.conditions_attributes.forEach((condition) => {
            if (conditionToAddToConditionable.conditionable_id === condition.conditionable_id && conditionToAddToConditionable.conditionable_type === condition.conditionable_type) {
              conditionPresent = true;
            }
          })

          if (!conditionPresent && addConditionToLogic) {
            // conditionToAddToConditionable.id = conditionToAddToConditionable.backend_id
            delete conditionToAddToConditionable.id;
            delete conditionToAddToConditionable.backend_id;
            delete conditionToAddToConditionable.input_type;
            delete conditionToAddToConditionable.label;
            delete conditionToAddToConditionable.uuid;

            this.currentConditionable.conditionable_attributes.logic_attributes.conditions_attributes.push(conditionToAddToConditionable);

            this.updateFormData();
          }
        }
      },
      deleteConditionable(index) {
        this.currentConditionable.conditionable_attributes.logic_attributes.conditions_attributes.splice(index,1);
        this.updateFormData();
      },
      // Adds another validation to an already added conditionable (InputGroup or Input)
      addValidation(item) {
        // if (!this.selectItemInTree.includes(item)) {
        //   this.selectedTreeItems.push(item);
        // }
        this.addConditionToConditionable(item, false);
      },
      isInputGroupModal() {
        return typeof this.inputGroupIndex !== 'undefined' && this.inputGroupIndex !== null;
      },
      isInputModal() {
        return typeof this.inputGroupIndex !== 'undefined' && this.inputGroupIndex !== null && typeof this.rowIndex !== 'undefined' && this.rowIndex !== null && typeof this.inputIndex !== 'undefined' && this.inputIndex !== null;
      },
      // initialiseConditionableFromServer() {
      //   // if (Object.keys(this.currentConditionable).length === 0 && typeof this.currentConditionable.id !== 'undefined') {
      //   //   this.getConditionableFromServer();
      //   // }

      //   // Add the selected value to the tree view v-model
      //   if (this.currentConditionable && this.currentConditionable.logic_attributes) {
      //     this.currentConditionable.logic_attributes.conditions_attributes.forEach(condition => {

      //       let treeItem = {
      //         id: condition.uuid,
      //         // conditionable_id: condition.conditionable_id,
      //         // conditionable_type: condition.conditionable_type,
      //         input_type: condition.input_type,
      //         label: condition.label
      //       };

      //       this.value.push(condition.conditionable_uuid);
      //       this.selectItemInTree(treeItem)
      //     });
      //   }
      // },
      selectTreeViewItemsBasedOnFormData() {
        if (this.currentConditionable
            && this.currentConditionable.conditionable_attributes.logic_attributes
            && this.currentConditionable.conditionable_attributes.logic_attributes.conditions_attributes) {
          this.currentConditionable.conditionable_attributes.logic_attributes.conditions_attributes.forEach(condition => {

            if (typeof condition.conditionable_conditionable_uuid !== 'undefined') {
              let treeItem = {
                id: condition.id,
                conditionable_id: condition.conditionable_id,
                conditionable_conditionable_id: condition.conditionable_conditionable_id,
                conditionable_conditionable_type: condition.conditionable_conditionable_type,
                input_type: condition.input_type,
                label: condition.label,
                uuid: condition.conditionable_conditionable_uuid,
              };

              if (!this.value.includes(condition.conditionable_conditionable_uuid)) {
                this.value.push(condition.conditionable_conditionable_uuid);
              }

              this.selectItemInTree(treeItem, false);
            }
          });
        }
      },
      updateConditionableFromFormData() {
        if (this.isInputModal()) {
          this.updateInputConditionableFromFormData();
        } else if (this.isInputGroupModal()) {
          this.updateInputGroupConditionableFromFormData();
        } else {
          console.warn('This modal has no inputGroupIndex, rowIndex and inputIndex');
        }

        this.initialiseConditionable();
      },
      updateInputGroupConditionableFromFormData () {
        console.info('I\'m an InputGroup modal');

        this.currentConditionable = this.currentForm.input_groups_attributes[this.inputGroupIndex];
      },
      updateInputConditionableFromFormData () {
        console.info('I\'m an Input modal');

        this.currentConditionable = this.currentForm.input_groups_attributes[this.inputGroupIndex].rows_attributes[this.rowIndex].inputs_attributes[this.inputIndex];
      },
      updateFormData() {
        if (this.isInputModal()) {
          this.currentForm.input_groups_attributes[this.inputGroupIndex].rows_attributes[this.rowIndex].inputs_attributes[this.inputIndex] = this.currentConditionable;
        } else if (this.isInputGroupModal()) {
          this.currentForm.input_groups_attributes[this.inputGroupIndex] = this.currentConditionable;
        } else {
          console.warn('Don\'t know how to save formData');
        }

        this.propagateNewFormToBaseParent();
      },
      createConditionable(treeItem, addConditionToLogic) {
        axios({
            method: 'post',
            url: `${API_CONSTANTS.url}/conditionables`,
            data: {
              conditionable: {
                conditionable_id: treeItem.id,
                conditionable_type: treeItem.conditionable_type
              }
            }
          })
            .then(response => {
              treeItem.conditionable_id = response.data.conditionable_id;
              this.reloadTreeViewData();
              this.addConditionToConditionable(treeItem, addConditionToLogic);
            })
            .catch(error => {
              console.log(error);
            });
      },
      reloadTreeViewData() {
        this.$emit('reloadTreeView');
        let vm = this.$parent

        while(vm) {
            vm.$emit('reloadTreeView')
            vm = vm.$parent
        }
      },
      propagateNewFormToBaseParent() {
        this.$emit('updateForm', this.currentForm);
        let vm = this.$parent

        while(vm) {
            vm.$emit('updateForm', this.currentForm)
            vm = vm.$parent
        }
      }
    },
    mounted() {
      this.currentForm = this.form;
    },
    watch: {
      form: {
        handler: function(newVal) {
          if (typeof newVal !== 'undefined') {
            this.currentForm = newVal;
            this.updateConditionableFromFormData();

            this.initialiseConditionable();
            this.selectTreeViewItemsBasedOnFormData();
          }
        },
        deep: true,
        immediate: true
      },
      inputGroupIndex(val) {
        console.info('InputGroupIndex: ' + val);

        // this.inputGroupIndex = val;
        this.updateConditionableFromFormData();
        this.selectTreeViewItemsBasedOnFormData();
      },
      rowIndex(val) {
        console.info('RowIndex: ' + val);

        // this.rowIndex = val;
        this.updateConditionableFromFormData();
        this.selectTreeViewItemsBasedOnFormData();
      },
      inputIndex: {
        handler(val) {
          if (typeof val !== 'undefined' && Object.keys(this.currentForm).length > 0) {
            console.info('InputIndex: ' + val, this.currentForm);

            // this.inputIndex = val;
            this.updateConditionableFromFormData();
            this.selectTreeViewItemsBasedOnFormData();
          }
        },
        immediate: true
      },
      formTree: {
        handler(val) {
          this.formTree = val;
        },
        deep: true
      }
    }
  };
</script>

<style scoped>
  .vue-treeselect {
    overflow-y: scroll;
  }

  .vue-treeselect /deep/ .vue-treeselect__menu-container {
    position: relative;
    display: inline-block;
    height: 150px;
  }
</style>
