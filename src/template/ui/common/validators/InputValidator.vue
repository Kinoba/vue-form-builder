<template>
    <div>
      <div class="control columns">
        <div class="column is-4">
          <div class="select">
            <select v-model="currentValidation.key">
              <option selected :key="'default_' + index">Selectionner</option>
              <option
                v-for="option in availableValidations"
                :key="option.key + '_' + index"
              >{{ option.key }}</option>
            </select>
          </div>
        </div>
        <div class="column is-8">
          <!-- If the input is a text or number -->
          <input
            v-if="input.input_type !== 'select' && input.input_type !== 'checkbox' && input.input_type !== 'time' && input.input_type !== 'date'"
            class="input"
            :type="input.input_type"
            v-model="currentValidation.value"
            placeholder="Enter validation value"
          />
          <!-- If the input is a select or checkbox -->
          <input
            v-if="input.input_type === 'select' || input.input_type === 'checkbox'"
            class="input"
            type="text"
            v-model="currentValidation.value"
            placeholder="Enter validation value"
          />
          <!-- If the input is a date or time -->
          <input
            v-if="input.input_type === 'time' || input.input_type === 'date'"
            class="input"
            type="text"
            v-model="currentValidation.value"
            placeholder="Enter validation value"
          />
        </div>
      </div>
    </div>
</template>

<script>
    import axios from 'axios';
    import {FORM_CONSTANTS, API_CONSTANTS} from "sethFormBuilder/config/constants";
    import {INPUT_TYPES} from "sethFormBuilder/config/input_constant";

    export default {
        components: {},
        name: "input-validator",
        props: ["validation", "availableValidations", "input", "index"],
        data: () => ({
            currentValidation: {}
        }),
        methods: {

        },
        mounted() {
          this.currentValidation = this.validation;
        }
    }
</script>

<style scoped>

</style>
