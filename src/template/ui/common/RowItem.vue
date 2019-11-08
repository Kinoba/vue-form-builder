<template>
  <div class="col-md-12 mb-2 rowItem row" :id="row.uuid">
    <div class="tools">
      <font-awesome-icon icon="times" class="clickable" @click="removeRow(row.uuid)"></font-awesome-icon>
    </div>
    <div
      v-if="row.inputs_attributes.length === 0"
    >Choose an input in the Supported Inputs section and drag it here.</div>

    <div v-for="(input, index) in row.inputs_attributes" :key="`row_inputs_${index}`">
      <component
        :is="INPUT_TYPES[input.input_type].source.template"
        :key="input.uuid"
        :input="input"
        :index="index"
        :ref="input.uuid"
        :label-position="labelPosition"
        :edit-label="editLabel"
      ></component>

      <div class="columns">
        <div class="column has-text-right">
          <button v-if="input.input_type !== 'paragraph'" class="button is-secondary" @click="openValidationsModal(index)">
            <font-awesome-icon icon="check" />Validation
          </button>
          <button class="button is-secondary" @click="deleteInput(input, index)">
            <font-awesome-icon icon="times" />Delete
          </button>
          <button class="button is-secondary" @click="openInputConfig(index)">
            <font-awesome-icon icon="cog" />Configuration
          </button>
          <button class="button is-secondary" @click="editLabel = !editLabel">
            <font-awesome-icon icon="pen" />
            <span v-if="!editLabel">Edit label</span>
            <span v-else>Save label</span>
          </button>
        </div>
      </div>
    </div>

    <input-config-modal
      ref="inputConfigModal"
      :formTree="formTree"
      :form="currentForm"
      :input-group-index="inputGroupIndex"
      :row-index="rowIndex"
      :parentInputGroup="parentInputGroup"
      :maxOrder="row.inputs_attributes.length"
      @updateInputInfo="updateInputInfo"
    ></input-config-modal>

    <input-validations-modal
      ref="inputValidationsModal"
      :form="currentForm"
      :parentInputGroup="parentInputGroup"
      :row-index="rowIndex"
      @updateInputInfo="updateInputInfo"
    ></input-validations-modal>
  </div>
</template>

<script>
  import axios from "axios";
  import {
    FORM_CONSTANTS,
    API_CONSTANTS
  } from "sethFormBuilder/config/constants";
  import { INPUT_TYPES } from "sethFormBuilder/config/input_constant";
  //import ControlItem from "./ControlItem";
  import {
    eventBus,
    EventHandlerConstant
  } from "sethFormBuilder/template/handler/event_handler";
  import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
  import { Hooks } from "sethFormBuilder/template/components/hook_lists";
  import { InputHandler } from "sethFormBuilder/template/handler/input_handler";
  import InputConfigModal from "./modals/InputConfigModal";
  import InputValidationsModal from "./modals/InputValidationsModal";

  import uuidv4 from 'uuid/v4';

  export default {
    components: { FontAwesomeIcon, InputConfigModal, InputValidationsModal },
    name: "row-item",
    props: {
      row: {
        type: Object,
        default: {}
      },
      labelPosition: null,
      form: {},
      parentInputGroup: {},
      inputGroupIndex: null,
      rowIndex: null
    },
    data: () => ({
      INPUT_TYPES,
      editing_input: null,
      formTree: {
        children: []
      },
      formTreeInitialized: false,
      currentForm: {},
      editLabel: false
    }),
    methods: {
      addInput(inputType) {
        var inputInfo = _.cloneDeep(FORM_CONSTANTS.Input);
        inputInfo.input_type = inputType;
        // generate id
        inputInfo.name = _.domUniqueID(`input_${inputType}_`);
        inputInfo.label = FORM_CONSTANTS.Type[inputType].label;
        inputInfo.fieldName = inputInfo.name; // same for both

        // check if there's any more special fields?
        if (INPUT_TYPES[inputType].other_properties) {
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
        this.row.inputs_attributes.push(inputInfo);
        this.addInputToConditionTree(inputInfo);

        // after hook
        Hooks.Control.afterAdd.run(inputInfo, this.row);
      },
      addInputToConditionTree(info) {
        let treeChild = {
          id: null,
          conditionable_id: null,
          conditionable_type: 'FormEngine::Input',
          label: info.label,
          input_type: info.input_type,
          uuid: uuidv4()
        };

        this.formTree.children.forEach((inputGroup) => {
          if (inputGroup.uuid === this.parentInputGroup.uuid) {
            inputGroup.children.push(treeChild);
          }
        });
      },
      deleteInput(input, index) {
        this.row.inputs_attributes.splice(index, 1);
        this.deleteInputFromConditionTree(index)
      },
      deleteInputFromConditionTree(index) {
        this.formTree.children.forEach((inputGroup) => {
          if (inputGroup.id === this.parentInputGroup.id) {
            inputGroup.children.splice(index, 1);
          }
        });

        this.$emit("updateFormTree", this.formTree);
      },
      traverseInput() {
        let self = this;

        // prepare data
        var items = $(this.$el).find(".inputItem");
        var finalItems = [];

        // sort
        _.each(items, (item, index) => {
          var id = $(item).attr("id");
          var inputItem = _.find(self.row.inputs_attributes, { name: id });
          inputItem.order = index;
          finalItems.push(inputItem);
        });

        // reset the current sections
        this.row.inputs_attributes = finalItems;
      },
      removeRow(id) {
        this.$emit("removeRow", id);
      },

      // input
      openInputConfig(secIndex) {
        var inputInfo = this.row.inputs_attributes[secIndex];
        this.disableSelfInputAsOptionInTreeview(inputInfo);
        console.log(this.$refs.inputConfigModal)
        this.$refs.inputConfigModal.openModal(inputInfo, secIndex);
      },

      openValidationsModal(secIndex) {
        var inputInfo = this.row.inputs_attributes[secIndex];
        this.$refs.inputValidationsModal.openModal(inputInfo, secIndex);
      },

      updateInputOrder(inputInfo, index, newOrder) {
        this.row.inputs_attributes.splice(index, 1); // Remove item from its current position
        this.row.inputs_attributes.splice(newOrder, 0, inputInfo); // Insert item in the new position

        this.row.inputs_attributes.forEach((input, index) => {
          input.order = index;
        });
      },
      updateInputInfo(inputInfo, index, reOrder, newOrder) {
        _.deepExtend(this.row.inputs_attributes[index], inputInfo);

        if (reOrder) this.updateInputOrder(inputInfo, index, newOrder);

        this.propagateNewFormToBaseParent();
      },
      propagateNewFormToBaseParent() {
        this.$emit('updateForm', this.currentForm);
        let vm = this.$parent

        while(vm) {
            vm.$emit('updateForm', this.currentForm)
            vm = vm.$parent
        }
      },
      getFormAsTreeView() {
        // Get tree data to display the form tree in config modals
        axios
          .get(`${API_CONSTANTS.url}/forms/${this.currentForm.id}?view=tree_view`)
          .then(response => {
            this.formTree = response.data;
            this.formTreeInitialized = true;
          })
          .catch(error => {
            console.log(error);
          });
      },
      // User should not be able to add a condition on a field on itself
      disableSelfInputAsOptionInTreeview(inputInfo) {
        this.formTree.children.forEach((inputGroup, inputGroupIndex) => {
          if (inputGroup.uuid === this.parentInputGroup.uuid) {
            inputGroup.children.forEach((input, inputIndex) => {
              this.formTree.children[inputGroupIndex].children[inputIndex].is_disabled = input.uuid === inputInfo.uuid;
            })
          }
        })
      }
    },
    created() {
      let self = this;

      // remove input bus
      eventBus.$on(EventHandlerConstant.REMOVE_CONTROL, ui => {
        // prepare data
        var id = ui.helper.attr("data-input-name");
        var inputIndex = _.findIndex(this.row.inputs_attributes, { name: id });

        if (inputIndex < 0) {
          return;
        }

        // before hook
        var inputInfo = this.row.inputs_attributes[inputIndex];
        let beforeRun = Hooks.Control.beforeRemove.runSequence(inputInfo);
        if (beforeRun === false) {
          return;
        }

        // remove input
        this.row.inputs_attributes.splice(inputIndex, 1);

        // after hook
        Hooks.Control.afterRemove.run(inputInfo);
      });

      // update input bus
      eventBus.$on(EventHandlerConstant.ON_APPLY_EDITOR_SIDEBAR, input => {
        //var oldInput = _.find(this.row.input, {name: input.name});
        let inputIndex = _.findIndex(self.row.input, { uuid: input.uuid });
        if (
          inputIndex <= -1 ||
          self.row.input[inputIndex].uuid !== self.editing_input.uuid
        ) {
          return;
        }

        let oldInput = self.row.input[inputIndex];
        // check if existed name in this section
        if (
          input.fieldName !== oldInput.fieldName &&
          InputHandler.isControlNameExisted(self.row.uuid, input.fieldName)
        ) {
          SethPhatToaster.error(
            "This field Name is already existed in the current section."
          );
          return;
        }

        // replace value
        var inputInfo = _.cloneDeep(input);
        _.each(inputInfo, (value, key) => {
          self.row.input[inputIndex][key] = value;
        });

        // update gui for specific input
        if (self.$refs[inputInfo.name]) {
          if (_.isFunction(self.$refs[inputInfo.name].configUpdated)) {
            self.$refs[inputInfo.name].configUpdated();
          }
        }

        // replace
        this.$nextTick(() => {
          InputHandler.setSelect(oldInput.name);
        });
      });
    },
    mounted() {
      this.currentForm = this.form;

      let self = this;
      $(this.$el).droppable({
        accept: ".input-wrapper",
        drop: function(event, ui) {
          self.addInput($(ui.draggable[0]).attr("data-input-type"));
        },
        over: function(event, ui) {
          ui.helper.css("border", "1px solid green");
        }
      });

      $(this.$el)
        .sortable({
          cursor: "move",
          delay: 100,
          helper: "clone",
          placeholder: "ui-state-highlight",
          update: function(event, ui) {
            self.traverseInput();
          },
          start: function(e, ui) {
            ui.placeholder.height(ui.item.height());
            ui.placeholder.width(ui.item.width());
            ui.placeholder.css("border", "");
            ui.placeholder.css("background-color", "#e74c3c");
          }
        })
        .disableSelection();
    },
    watch: {
      form: {
        handler: function(newVal) {
          if (typeof newVal !== "undefined") {
            this.currentForm = newVal;

            if (this.currentForm.id && !this.formTreeInitialized) {
              this.getFormAsTreeView();
            }
          }
        },
        deep: true
      }
    }
  };
</script>

<style scoped>
.rowItem {
  border-radius: 0.5rem;
  border: 1px dashed #e6e6e6;
  padding: 1rem;
  margin-bottom: 0.5rem;
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

.ui-state-highlight {
  height: 1.5em;
  line-height: 1.2em;
}

button.is-secondary {
    margin-left: .5rem;
}

button > .svg-inline--fa { margin-right: .5rem }
</style>
