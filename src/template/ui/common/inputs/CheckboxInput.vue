<template>
  <div class="inputItemWrapper columns" :data-input-name="input.name">
    <div class="column is-12">
      <div :id="input.name" class="field has-text-left inputItem">
        <div v-if="!editLabel">
          <label
            v-if="input.label"
            :class="{'label' : true, 'is-inline-block': true ,'bold': input.labelBold, 'italic': input.labelItalic, 'underline': input.labelUnderline}"
          >{{input.label}}</label>
          <label
            v-else
            :class="{'label' : true, 'is-inline-block': true, 'bold': input.labelBold, 'italic': input.labelItalic, 'underline': input.labelUnderline}"
          >Checkbox input</label>
        </div>
        <div v-else class="control">
          <input type="text" class="input" v-model="input.label" />
        </div>
        <div v-if="input.properties !== null">
          <div
            class="control"
            v-if="input.properties.options"
            v-for="(checkbox, index) in input.properties.options"
            :key="'checkbox_option_' + index"
          >
            <label class="checkbox">
              <input type="checkbox" :checked="checkbox.value" />
              {{ checkbox.label }}
            </label>
          </div>
          <div
            class="control"
            v-if="!input.properties.options || input.properties.options.length === 0"
          >Initialise checkbox options in the configuration section.</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

  export default {
    name: "CheckboxInput",
    components: {
      FontAwesomeIcon
    },
    props: ["input", "labelPosition", "index", "editLabel"],
    mounted() {
      //Parse properties string into JSON
      if (
        this.input.properties !== null &&
        typeof this.input.properties === "string"
      ) {
        this.input.properties = JSON.parse(this.input.properties);
      }
    }
  };
</script>

<style scoped>
  .inputItemWrapper {
    width: 100%;
  }
  hr {
    margin: 1rem 0;
  }

  .button-bar {
    display: inline-block;
  }

  .button-bar > button {
    margin-left: 0.5rem;
  }

  button > .svg-inline--fa {
    margin-right: 0.5rem;
  }

  .control {
    margin-bottom: 0.5rem;
  }
</style>
