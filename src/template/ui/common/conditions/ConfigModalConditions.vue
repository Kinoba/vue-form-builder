<template>
  <div>
    <div class="field has-text-left" v-if="formTree.children && formTree.children.length > 0">
      <label class="label">Conditions</label>
      <pre>
        {{ currentForm }}
      </pre>
      <div class="control">
        <treeselect
          placeholder="Sélectionnez les elements pour créer vos conditions"
          noChildrenText="Aucun input présent dans ce groupe"
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
                v-if="currentConditionable.logic_attributes && currentConditionable.logic_attributes.conditions_attributes[index]"
                v-model="currentConditionable.logic_attributes.conditions_attributes[index].operator"
              >
                <option selected :key="'default_' + index">Selectionner</option>
                <option
                  v-for="option in availableValidations[selectedItem.input_type]"
                  :key="option.key + '_' + index"
                >{{ option.key }}</option>
              </select>
            </div>
          </div>
          <div class="column is-8" v-if="currentConditionable.logic_attributes && currentConditionable.logic_attributes.conditions_attributes[index]">
            <!-- If the input is a text or number -->
            <input
              v-if="selectedItem.input_type !== 'select' && selectedItem.input_type !== 'checkbox' && selectedItem.input_type !== 'time' && selectedItem.input_type !== 'date'"
              class="input"
              :type="selectedItem.input_type"
              v-model="currentConditionable.logic_attributes.conditions_attributes[index].value"
              placeholder="Enter validation value"
            />
            <!-- If the input is a select or checkbox -->
            <input
              v-if="selectedItem.input_type === 'select' || selectedItem.input_type === 'checkbox'"
              class="input"
              type="text"
              v-model="currentConditionable.logic_attributes.conditions_attributes[index].value"
              placeholder="Enter validation value"
            />
            <!-- If the input is a date or time -->
            <input
              v-if="selectedItem.input_type === 'time' || selectedItem.input_type === 'date'"
              class="input"
              type="text"
              v-model="currentConditionable.logic_attributes.conditions_attributes[index].value"
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
        }
      },
      index: null,
      currentConditionable: {},
      currentForm: {},
      selectedTreeItems: [],
      availableValidations: {},
      value: [], // Treeview v-model, should be a list of ids ["FormEngine::Input_1"]
    }),
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
      selectItemInTree(item) {
        this.selectedTreeItems.push(item);
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
        if (Object.keys(this.currentConditionable).length === 0) {
          //Initialise conditionable
          this.currentConditionable = {
            id: null,
            conditionable_id: this.currentConditionable.id,
            conditionable_type: this.currentConditionable.input_type,
            logic_attributes: {
              action: "jump",
              conditions_attributes: []
            }
          };
        } else {
          if (!this.currentConditionable.logic_attributes) {
            this.currentConditionable.logic_attributes = {
              action: "jump",
              conditions_attributes: []
            };
          }

          if (!this.currentConditionable.logic_attributes.conditions_attributes) {
            this.currentConditionable.logic_attributes.conditions_attributes = [];
          }
        }

        this.updateFormData();
      },

      // Based on a treeItem, adds a new condition to the parent conditionable JSON
      addConditionToConditionable(selectedTreeItem) {
        // We need to create a copy of the selectedTreeItem to make sure we don't modify it later
        let conditionToAddToConditionable = JSON.parse(JSON.stringify(selectedTreeItem));

        if(conditionToAddToConditionable.conditionable_id === null) {
          this.initialiseConditionable();

          let conditionableItem = {
            conditionable_id: conditionToAddToConditionable.backend_id,
            conditionable_type: conditionToAddToConditionable.conditionable_type,
            operator: "",
            value: ""
          };

          if(conditionToAddToConditionable.operator) { conditionableItem.operator = conditionToAddToConditionable.operator; }
          if(conditionToAddToConditionable.value) { conditionableItem.value = conditionToAddToConditionable.value; }

          this.currentConditionable.logic_attributes.conditions_attributes.push(conditionableItem);
        } else {
          let conditionPresent = false;
          this.currentConditionable.logic_attributes.conditions_attributes.forEach((condition) => {
            if (conditionToAddToConditionable.conditionable_id === condition.conditionable_id && conditionToAddToConditionable.conditionable_type === condition.conditionable_type) {
              conditionPresent = true;
            }
          })

          if (!conditionPresent) {
            console.log(conditionToAddToConditionable);

            // conditionToAddToConditionable.id = conditionToAddToConditionable.backend_id
            delete conditionToAddToConditionable.id
            delete conditionToAddToConditionable.backend_id

            this.currentConditionable.logic_attributes.conditions_attributes.push(conditionToAddToConditionable);
          }
        }

        this.updateFormData();
      },
      deleteConditionable(index) {
        this.currentConditionable.logic_attributes.conditions_attributes.splice(index,1);
        this.updateFormData();
      },
      // Adds another validation to an already added conditionable (InputGroup or Input)
      addValidation(item) {
        this.selectedTreeItems.push(item);
        this.addConditionToConditionable(item);
      },
      initialiseConditionableFromServer() {
        // if (Object.keys(this.currentConditionable).length === 0 && typeof this.currentConditionable.id !== 'undefined') {
        //   this.getConditionableFromServer();
        // }

        // Add the selected value to the tree view v-model
        if (this.currentConditionable && this.currentConditionable.logic_attributes) {
          this.currentConditionable.logic_attributes.conditions_attributes.forEach(condition => {

            let treeItem = {
              id: condition.uuid,
              // conditionable_id: condition.conditionable_id,
              // conditionable_type: condition.conditionable_type,
              input_type: condition.input_type,
              label: condition.label
            };

            this.value.push(condition.conditionable_uuid);
            this.selectItemInTree(treeItem)
          });
        }
      },
      updateInputGroupConditionableFromFormData () {
        this.currentConditionable = this.currentForm.input_groups_attributes[inputGroupIndex]['conditionable_attributes'];
      },
      updateInputConditionableFromFormData () {
        this.currentConditionable = this.currentForm[this.inputGroupIndex].rows_attributes[this.rowIndex].inputs_attributes[this.inputIndex]['conditionable_attributes'];
      },
      updateFormData() {
         if (this.inputGroupIndex && this.rowIndex && this.inputIndex) {
          this.currentForm.input_groups_attributes[inputGroupIndex]['conditionable_attributes'] = this.currentConditionable;
        } else if (this.inputGroupIndex) {
          this.currentForm[this.inputGroupIndex].rows_attributes[this.rowIndex].inputs_attributes[this.inputIndex]['conditionable_attributes'] = this.currentConditionable;
        }
        this.$emit('updateForm', this.currentForm); //update parent conditionable

        console.log(this.currentForm);

      }
    },
    mounted() {
      this.currentForm = this.form;
      this.initialiseConditionable();
    },
    watch: {
      form: {
        handler: (newValue) => {
          if (typeof newVal !== 'undefined') {

              this.currentForm = newVal;
              console.log(newValue);

        if (this.inputGroupIndex && this.rowIndex && this.inputIndex) {
          this.updateInputConditionableFromFormData();
        } else if (this.inputGroupIndex) {
          this.updateInputGroupConditionableFromFormData();
        }

        this.initialiseConditionableFromServer();
        }

            },
            deep: true

      },
      inputGroupIndex(val) {
        console.log(val);

        this.inputGroupIndex = val;
      },
      rowIndex(val) {
        console.log(val);

        this.rowIndex = val;
      },
      inputIndex(val) {
        console.log(val);

        this.inputIndex = val;
      },
      formTree(val) {
        this.formTree = val;
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
