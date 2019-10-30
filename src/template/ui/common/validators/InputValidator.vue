<template>
    <div>
      <pre>{{currentConditionable}}</pre>
      <label class="label">
        Validation
      </label>
      <div class="control columns">
        <div class="column is-4">
          <div class="select">
            <!-- <select
              v-if="currentConditionable.logic_attributes && conditionable.logic_attributes.conditions_attributes[index]"
              v-model="currentConditionable.logic_attributes.conditions_attributes[index].operator"
            >
              <option selected :key="'default_' + index">Selectionner</option>
              <option
                v-for="option in availableValidations[selectedItem.input_type]"
                :key="option.key + '_' + index"
              >{{ option.key }}</option>
            </select> -->
          </div>
        </div>
        <div class="column is-8" v-if="currentConditionable.logic_attributes && currentConditionable.logic_attributes.conditions_attributes[index]">
          <!-- If the input is a text or number -->
          <input
            class="input"
            :type="conditionable.logic_attributes.conditions_attributes[index].input_type"
            v-model="conditionable.logic_attributes.conditions_attributes[index].value"
            placeholder="Enter validation value"
          />
          <!-- If the input is a select or checkbox -->
          <!-- <input
            v-if="selectedItem.input_type === 'select' || selectedItem.input_type === 'checkbox'"
            class="input"
            type="text"
            v-model="conditionable.logic_attributes.conditions_attributes[index].value"
            placeholder="Enter validation value"
          />
          <input
            v-if="selectedItem.input_type === 'time' || selectedItem.input_type === 'date'"
            class="input"
            type="text"
            v-model="conditionable.logic_attributes.conditions_attributes[index].value"
            placeholder="Enter validation value"
          /> -->
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
        props: ["conditionable"],
        data: () => ({
            currentConditionable: {}
        }),
        methods: {

        },
        mounted() {
          this.currentConditionable = this.conditionable
        }
    }
</script>

<style scoped>

</style>
