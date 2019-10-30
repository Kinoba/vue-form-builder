<template>
  <div>
    <div class="field has-text-left" v-if="formTree.children && formTree.children.length > 0">
      <label class="label">Conditions</label>
      <div class="control">
        <treeselect
          placeholder="Sélectionnez les elements pour créer vos conditions"
          :multiple="true"
          :clearable="false"
          :options="formTree.children"
          :always-open="true"
          :default-expand-level="1"
          v-model="value"
          @beforeClearAll="clearAll($event)"
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
                v-if="conditionable.logic_attributes && conditionable.logic_attributes.conditions_attributes[index]"
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
          <div class="column is-8" v-if="conditionable.logic_attributes && conditionable.logic_attributes.conditions_attributes[index]">
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
    props: ["updateConditionable", "conditionable", "formTree"],
    components: { Treeselect },
    data: () => ({
      index: null,
      currentConditionable: {
        name: null
      },
      selectedTreeItems: [],
      availableValidations: {},
      value: [] // Treeview v-model, should be a list of ids ["FormEngine::Input_1"]
    }),
    methods: {
      save() {
        if (Object.keys(this.currentConditionable).length > 0) {
          this.saveConditionable();
        }
      },
      onConditionSelect(item) {
        if(item.children) {
          item.children.forEach((childItem) => {
            this.selectItemInTree(childItem);
          });
        } else {
          //The user has selected an input
          this.selectItemInTree(item);
        }
      },
      selectItemInTree(item) {
        console.log("item", item);

        this.selectedTreeItems.push(item);
        this.getAvailableValidationsFromServer(item.input_type);
        this.addConditionable(item);
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
        console.log(this.currentConditionable);
        axios({
          method: "get",
          url: API_CONSTANTS.url + "/conditionables/" + this.currentConditionable.id,
          data: {}
        })
          .then(response => {
            // Populate availableValidations JSON if the validations for the given input does not exist
            this.currentConditionable = response.data;
            this.initialiseConditionable();
            console.log(this.currentConditionable);
          })
          .catch(error => {
            console.log(error);
          });
      },
      onConditionDeselect(item) {
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
          console.log(this.currentConditionable);

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

        this.$emit("updateConditionable",this.currentConditionable);
      },
      addConditionable(selectedTreeItem) {
        this.initialiseConditionable();

        let conditionableItem = {
          conditionable_id: selectedTreeItem.conditionable_id,
          conditionable_type: selectedTreeItem.conditionable_type,
          operator: "",
          value: ""
        };

        if(selectedTreeItem.operator) { conditionableItem.operator = selectedTreeItem.operator; }
        if(selectedTreeItem.value) { conditionableItem.value = selectedTreeItem.value; }

        this.currentConditionable.logic_attributes.conditions_attributes.push(conditionableItem);
        console.log('current conditionable', this.currentConditionable.logic_attributes);
        this.$emit("updateConditionable",this.currentConditionable); //update parent conditionable
      },
      deleteConditionable(index) {
        this.currentConditionable.logic_attributes.conditions_attributes.splice(index,1);
        this.$emit("updateConditionable",this.currentConditionable); //update parent conditionable
      },
      addValidation(item) {
        this.selectedTreeItems.push(item);
        this.addConditionable(item);
      },
      buildUniqueFormTreeIds() {
        //Set unique IDs in form tree
        this.formTree.children.forEach(inputGroup => {
          inputGroup["id"] = inputGroup.conditionable_type + "_" + inputGroup.id;

          inputGroup.children.forEach(input => {
            input["id"] = input.conditionable_type + "_" + input.id;
          });
        });
      },
      initialiseConditionableFromServer() {
        console.log(Object.keys(this.currentConditionable).length);
        console.log(this.currentConditionable.id);

        if (Object.keys(this.currentConditionable).length === 0 && typeof this.currentConditionable.id !== 'undefined') {
          this.getConditionableFromServer();
        }

        // Add the selected value to the tree view v-model
        if (this.currentConditionable && this.currentConditionable.logic_attributes) {
          this.currentConditionable.logic_attributes.conditions_attributes.forEach(condition => {
            console.log(condition.conditionable_id);

            let treeItem = {
              id: condition.conditionable_type + "_" + condition.id,
              conditionable_id: condition.conditionable_id,
              conditionable_type: condition.conditionable_type,
              input_type: condition.input_type,
              label: condition.label,
              operator: condition.operator,
              value: condition.value
            };

            console.log(treeItem['conditionable_id']);

            this.value.push(treeItem.id);
            this.getAvailableValidationsFromServer(condition.input_type);
            this.addValidation(treeItem);
          });
        }
      }
    },
    mounted() {
      if (this.formTree.children) {
        this.buildUniqueFormTreeIds();
      }

      this.initialiseConditionable();
    },
    watch: {
      conditionable(val) {
        if (val) {
          this.currentConditionable = val;
          this.initialiseConditionableFromServer();
        }
      },
      formTree(val) {
        this.formTree = val;
        this.buildUniqueFormTreeIds();
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
