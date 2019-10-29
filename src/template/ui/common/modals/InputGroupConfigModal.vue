<template>
  <div id="inputGroupConfigModal" class="modal">
    <div class="modal-background"></div>
    <div class="modal-card" v-if="inputGroup">
      <header class="modal-card-head">
        <p class="modal-card-title">Input Group Configuration</p>
        <button class="delete" aria-label="close" @click="closeModal"></button>
      </header>
      <section class="modal-card-body" v-if="inputGroup !== null">
        <div class="field has-text-left">
          <label class="label">Input group uuid</label>
          <div class="control">
            <input
              class="input"
              type="text"
              v-model="inputGroup.uuid"
              placeholder="Enter input group uuid"
            />
          </div>
        </div>
        <div class="field has-text-left">
          <label class="label">Input group name</label>
          <div class="control">
            <input
              class="input"
              type="text"
              v-model="inputGroup.name"
              placeholder="Enter input group name"
            />
          </div>
        </div>
        <div class="field has-text-left" v-if="maxOrder > (oldInputGroupOrder + 1)">
          <label class="label">Input group order</label>
          <div class="control">
            <input
              class="input"
              :class="{'is-danger': (inputGroup.order >= maxOrder) || (inputGroup.order < 0)}"
              type="number"
              v-model="inputGroup.order"
              :min="0"
              :max="maxOrder"
              placeholder="Enter input group order"
            />
          </div>
          <p
            v-if="inputGroup && ((inputGroup.order >= maxOrder) || (inputGroup.order < 0))"
            class="help is-danger"
          >You are trying to reorder the input group to an unknow position.</p>
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
              <div class="column is-8">
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
      </section>
      <footer class="modal-card-foot has-text-right">
        <button
          class="button is-success"
          :disabled="(inputGroup.order >= maxOrder) || (inputGroup.order < 0)"
          @click="save"
        >Save</button>
        <button class="button" @click="closeModal">Cancel</button>
      </footer>
    </div>
  </div>
</template>

<script>
  import Treeselect from "@riophae/vue-treeselect";
  import axios from "axios";
  import { API_CONSTANTS } from "sethFormBuilder/config/constants";
  import "@riophae/vue-treeselect/dist/vue-treeselect.css";

  const INPUT_GROUP_ID = "#inputGroupConfigModal";

  export default {
    name: "InputGroupConfigModal",
    props: ["updateInputGroupInfo", "maxOrder", "formTree"],
    components: { Treeselect },
    data: () => ({
      index: null,
      inputGroup: {
        name: null
      },
      selectedTreeItems: [],
      availableValidations: {},
      conditionable: {},
      oldInputGroupOrder: null,
      value: [] // Treeview v-model, should be a list of ids ["FormEngine::Input_1"]
    }),
    methods: {
      openModal(inputGroupInfo, index) {
        this.inputGroup = _.cloneDeep(inputGroupInfo);
        this.index = _.clone(index);
        $(INPUT_GROUP_ID).modal("show");
      },
      closeModal() {
        $(INPUT_GROUP_ID).modal("hide");
      },
      save() {
        let reOrder = false;
        if (Object.keys(this.conditionable).length > 0) {
          this.saveConditionable();
        }
        if (this.oldInputGroupOrder !== this.inputGroup.order) reOrder = true;
        this.$emit(
          "updateInputGroupInfo",
          this.inputGroup,
          this.index,
          reOrder,
          this.inputGroup.order
        );
        this.closeModal();
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
            id: this.inputGroup.id,
            conditionable_type: this.inputGroup.engine_type,
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
      },
      getConditionableFromServer() {
        axios({
          method: "get",
          url: API_CONSTANTS.url + "/conditionables/" + this.inputGroup.id,
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
      },
      deleteConditionable(index) {
        this.conditionable.logic_attributes.conditions_attributes.splice(
          index,
          1
        );
      },
      addValidation(item) {
        this.selectedTreeItems.push(item);
        this.addConditionable(item);
      },
      saveConditionable() {
        axios({
          method: "put",
          url: API_CONSTANTS.url + "/conditionables/" + this.inputGroup.id,
          data: this.conditionable
        })
          .then(response => {
            // Populate availableValidations JSON if the validations for the given input does not exist
            //console.log(response);
          })
          .catch(error => {
            console.log(error);
          });
      }
    },
    mounted() {
      $("[data-toggle='tooltip']").tooltip();
      if (this.inputGroup) this.oldInputGroupOrder = this.inputGroup.order;
    },
    watch: {
      // When the user clicks on the Configuration button for an InputGroup
      inputGroup(val) {
        if (val) {
          this.oldInputGroupOrder = val.order;
          this.getConditionableFromServer();

          // Add the selected value to the tree view v-model
          this.inputGroup.conditionables.forEach(conditionable => {
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
