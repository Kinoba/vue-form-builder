<template>
    <div id="inputValidationsModal" class="modal">
      <div class="modal-background"></div>
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title">Input validations</p>
          <button class="delete" aria-label="close" @click="closeModal"></button>
        </header>
        <section class="modal-card-body" v-if="input !== null">
            <!-- Add input validatiors -->
            <div class="has-text-right columns" v-for="(validation, index) in input.validations">
              <input-validator
                class="column"
                :validation="validation"
                :index="index"
                :input="input"
                :available-validations="availableValidations"></input-validator>
            </div>
            <div class="has-text-right columns">
              <div class="column is-12">
                <button
                  class="button is-secondary"
                  @click="addValidation()"
                >Add validation</button>
              </div>
            </div>
        </section>
        <footer class="modal-card-foot has-text-right">
          <button class="button is-success" @click="save">Save</button>
          <button class="button" @click="closeModal">Cancel</button>
        </footer>
      </div>
    </div>
</template>

<script>
    import axios from 'axios';
    import { API_CONSTANTS } from "sethFormBuilder/config/constants";;
    import '@riophae/vue-treeselect/dist/vue-treeselect.css';

    import InputValidator from "../validators/InputValidator";

    const INPUT_ID = "#inputValidationsModal";

    export default {
        name: "InputValidationsModal",
        props:['updateInputInfo', 'form', 'parentInputGroup', 'rowIndex'],
        components: { InputValidator },
        data: () => ({
          index: null,
          input: null,
          currentForm: {},
          availableValidations: []
        }),
        methods: {
          openModal(inputInfo, index) {
            this.input = _.cloneDeep(inputInfo);
            this.index = _.clone(index);

            this.getAvailableValidationsFromServer();

            if(this.input.validations === null || this.input.validations.length === 0) {
              this.addValidation();
            }

            $(INPUT_ID).modal('show');
          },
          closeModal() {
            //Clear validations if only one empty validation present
            console.log(this.input)
            if(this.input.validations.length === 1 && this.input.validations[0].key === "" && this.input.validations[0].value === "") {
              this.input.validations = [];
            }
            $(INPUT_ID).modal('hide');
          },
          save() {
              let reOrder = false;
              this.saveForm();
              this.$emit('updateInputInfo', this.input, this.index, reOrder, this.input.order);
              this.closeModal();
          },
          saveForm() {
            let requestMethod = 'post';
            let requestUrl = API_CONSTANTS.url + "/forms"
            if(this.currentForm.id) {
              requestMethod = 'put';
              requestUrl += '/' + this.currentForm.id;
            }
            axios({
              method: requestMethod,
              url:  requestUrl,
              data: this.currentForm
            })
              .then(response => {
                // Populate availableValidations JSON if the validations for the given input does not exist
                //console.log(response);
              })
              .catch(error => {
                this.$toasted.show( error.response.data.errors, { type: 'error' }).goAway(10000);
                console.log(error.response.data.errors);
              });
          },
          updateForm(form) {
            this.currentForm = form;
          },
          addValidation() {
            let newValidation = {
              key: '',
              value: ''
            };
            if(this.input.validations === null) { this.input.validations = []; }
            this.input.validations.push(newValidation);
          },
          getAvailableValidationsFromServer() {
            let validationUrl = API_CONSTANTS.url;
            validationUrl += "/inputs/" + this.input.input_type + "/validations";

            axios({
              method: "get",
              url: validationUrl,
              data: {}
            })
              .then(response => {
                // Populate availableValidations JSON if the validations for the given input does not exist
                this.availableValidations = response.data;
              })
              .catch(error => {
                if(error.response) {
                  this.$toasted.show( error.response.data.errors, { type: 'error' }).goAway(5000);
                }
                console.log(error);
              });
          }
        },
        mounted() {
            $("[data-toggle='tooltip']").tooltip();
        },
        watch: {
          input(val) {
            if(val) {
              this.input = val;
            }
          },
          form: {
            handler(val) {
              if (typeof val !== 'undefined') {
                this.currentForm = val;
              }
            },
            deep: true
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
</style>
