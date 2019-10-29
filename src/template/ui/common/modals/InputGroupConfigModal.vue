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
        <config-modal-conditions :input-group="inputGroup" :form-tree="formTree" @updateConditionable="updateConditionable"></config-modal-conditions>
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
  import axios from "axios";
  import { API_CONSTANTS } from "sethFormBuilder/config/constants";

  import ConfigModalConditions from "../conditions/ConfigModalConditions";

  const INPUT_GROUP_ID = "#inputGroupConfigModal";

  export default {
    name: "InputGroupConfigModal",
    props: ["updateInputGroupInfo", "maxOrder", "formTree"],
    components: { ConfigModalConditions },
    data: () => ({
      index: null,
      inputGroup: {
        name: null
      },
      conditionable: {},
      oldInputGroupOrder: null,
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
      saveConditionable() {
        let requestMethod = 'post';
        let requestUrl = API_CONSTANTS.url + "/conditionables"
        if(this.conditionable.id) {
          requestMethod = 'put';
          requestUrl += '/' + this.conditionable.id;
        }
        axios({
          method: requestMethod,
          url:  requestUrl,
          data: this.conditionable
        })
          .then(response => {
            // Populate availableValidations JSON if the validations for the given input does not exist
            //console.log(response);
          })
          .catch(error => {
            console.log(error);
          });
      },
      updateConditionable(conditionable) {
        this.conditionable = conditionable;
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
        }
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
