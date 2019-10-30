<template>
    <div id="inputConfigModal" class="modal">
      <div class="modal-background"></div>
      <div class="modal-card">
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
            <config-modal-conditions :conditionable="input.conditionable" :form-tree="formTree" @updateConditionable="updateConditionable"></config-modal-conditions>
        </section>
        <footer class="modal-card-foot has-text-right" v-if="input !== null">
          <button class="button is-success" :disabled="(input.order >= maxOrder) || (input.order < 0)" @click="save">Save</button>
          <button class="button" @click="closeModal">Cancel</button>
        </footer>
      </div>
    </div>
</template>

<script>
    import axios from 'axios';
    import { API_CONSTANTS } from "sethFormBuilder/config/constants";;
    import '@riophae/vue-treeselect/dist/vue-treeselect.css';

    import ConfigModalConditions from "../conditions/ConfigModalConditions";

    const INPUT_ID = "#inputConfigModal";

    export default {
        name: "InputConfigModal",
        props:['updateInputInfo', 'maxOrder', 'formTree', 'parentInputGroup'],
        components: { ConfigModalConditions },
        data: () => ({
            index: null,
            input: null,
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
            if(this.input) this.oldInputOrder = this.input.order;
        },
        watch: {
            input(val) {
              if(val) {
                this.input = val;
                if(this.input) this.oldInputOrder = val.order;
              }
            },
            formTree(val) {
              this.formTree = val;
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
