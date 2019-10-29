<template>
  <div>
    <div class="field has-text-left" v-if="formTree.children && formTree.children.length > 0">
      <label class="label">Conditions</label>
      <div class="control">
        <treeselect
          placeholder="Sélectionnez les elements pour créer vos conditions"
          :multiple="true"
          :options="formTree.children"
          :always-open="true"
          :default-expand-level="1"
          v-model="value"
          @select="onConditionSelect($event)"
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
                v-if="conditionable.logic_attributes.conditions_attributes[index]"
                v-model="conditionable.logic_attributes.conditions_attributes[index].operator"
              >
                <option selected :key="'default_' + index">Selectionner</option>
                <option
                  v-for="option in availableValidations[selectedItem.input_type]"
                  :key="option.key + '_' + index"
                >{{ option.key }}</option>
              </select>
            </div>
          </div>
          <div class="column is-8" v-if="conditionable.logic_attributes.conditions_attributes[index]">
            <!-- If the input is a text or number -->
            <input
              v-if="selectedItem.input_type !== 'select' && selectedItem.input_type !== 'checkbox' && selectedItem.input_type !== 'time' && selectedItem.input_type !== 'date'"
              class="input"
              :type="selectedItem.input_type"
              v-model="conditionable.logic_attributes.conditions_attributes[index].value"
              placeholder="Enter validation value"
            />
            <!-- If the input is a select or checkbox -->
            <input
              v-if="selectedItem.input_type === 'select' || selectedItem.input_type === 'checkbox'"
              class="input"
              type="text"
              v-model="conditionable.logic_attributes.conditions_attributes[index].value"
              placeholder="Enter validation value"
            />
            <!-- If the input is a date or time -->
            <input
              v-if="selectedItem.input_type === 'time' || selectedItem.input_type === 'date'"
              class="input"
              type="text"
              v-model="conditionable.logic_attributes.conditions_attributes[index].value"
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
    props: ["updateConditionable", "inputGroup", "formTree"],
    components: { Treeselect },
    data: () => ({
      index: null,
      currentInputGroup: {
        name: null
      },
      selectedTreeItems: [],
      availableValidations: {},
      conditionable: {},
      value: [] // Treeview v-model, should be a list of ids ["FormEngine::Input_1"]
    }),
    methods: {
      save() {
        if (Object.keys(this.conditionable).length > 0) {
          this.saveConditionable();
        }
      },
      onConditionSelect(item) {
        this.selectedTreeItems.push(item);
        this.getAvailableValidations(item.input_type);
        this.addConditionable(item);
      },
      getAvailableValidations(input_type) {
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
      onConditionDeselect(item) {
        let index = this.selectedTreeItems.indexOf(item);

        if (index > -1) {
          this.selectedTreeItems.splice(index, 1); // remove item from selectedTreeItems array
        }

        if (this.availableValidations[item.input_type]) {
          delete this.availableValidations[item.input_type];
        }

        this.deleteConditionable(index);
      },
      initialiseConditionable() {
        if (Object.keys(this.conditionable).length === 0) {
          //Initialise conditionable
          this.conditionable = {
            id: this.currentInputGroup.id,
            conditionable_type: this.currentInputGroup.input_type,
            logic_attributes: {
              action: "jump",
              conditions_attributes: []
            }
          };
        } else {
          if (!this.conditionable.logic_attributes) {
            this.conditionable.logic_attributes = {
              action: "jump",
              conditions_attributes: []
            };
          }

          if (!this.conditionable.logic_attributes.conditions_attributes) {
            this.conditionable.logic_attributes.conditions_attributes = [];
          }
        }

        this.$emit("updateConditionable",this.conditionable);
      },
      getConditionableFromServer() {
        axios({
          method: "get",
          url: API_CONSTANTS.url + "/conditionables/" + this.currentInputGroup.id,
          data: {}
        })
          .then(response => {
            // Populate availableValidations JSON if the validations for the given input does not exist
            this.conditionable = response.data;
          })
          .catch(error => {
            console.log(error);
          });
      },
      addConditionable(selectedTreeItem) {
        this.initialiseConditionable();

        let conditionableItem = {
          id: selectedTreeItem.input_id,
          conditionable_type: selectedTreeItem.conditionable_type,
          operator: "",
          value: ""
        };

        if(selectedTreeItem.operator) { conditionableItem.operator = selectedTreeItem.operator; }
        if(selectedTreeItem.value) { conditionableItem.value = selectedTreeItem.value; }

        this.conditionable.logic_attributes.conditions_attributes.push(
          conditionableItem
        );

        this.$emit("updateConditionable",this.conditionable);
      },
      deleteConditionable(index) {
        this.conditionable.logic_attributes.conditions_attributes.splice(
          index,
          1
        );

        this.$emit("updateConditionable",this.conditionable);
      },
      addValidation(item) {
        this.selectedTreeItems.push(item);
        this.addConditionable(item);
      }
    },
    mounted() {

    },
    watch: {
      // When the user clicks on the Configuration button for an InputGroup
      inputGroup(val) {
        if (val) {
          this.currentInputGroup = val;
          this.getConditionableFromServer();

          // Add the selected value to the tree view v-model
          this.currentInputGroup.conditionables.forEach(conditionable => {
            if (conditionable.logic_attributes) {

              conditionable.logic_attributes.conditions_attributes.forEach(condition => {
                this.value.push(condition.conditionable_type + "_" + condition.id);
                this.getAvailableValidations(condition.input_type);
                this.addValidation(condition);
              });
            }
          });
        }
      },
      formTree(val) {
        this.formTree = val;

        //Set unique IDs in form tree
        this.formTree.children.forEach(inputGroup => {
          if (!inputGroup["input_id"]) {
            inputGroup["input_id"] = inputGroup.id;
            inputGroup["id"] = inputGroup.conditionable_type + "_" + inputGroup.id;

            inputGroup.children.forEach(input => {
              if (!input["input_id"]) {
                input["input_id"] = input.id;
                input["id"] = input.conditionable_type + "_" + input.id;
              }
            });
          }
        });
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
