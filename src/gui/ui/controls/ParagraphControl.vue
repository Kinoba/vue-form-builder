<template>
  <div>
    <div class="row" v-if="labelPosition === 'left'">
      <div class="col-md-4">
        <label
          :class="{'bold': control.labelBold, 'italic': control.labelItalic, 'underline': control.labelUnderline}"
        >{{control.label}}</label>
      </div>

      <div class="col-md-8">
        <p>{{control.value}}</p>
      </div>
    </div>
    <div v-else class="form-group">
      <label
        :class="{'bold': control.labelBold, 'italic': control.labelItalic, 'underline': control.labelUnderline}"
      >{{control.label}}</label>

      <div class="col-md-8">
        <p>{{control.value}}</p>
      </div>
    </div>
  </div>
</template>

<script>
  import { Hooks } from "sethFormBuilder/gui/components/hook_lists";

  export default {
    name: "ParagraphControl",
    props: ["control", "labelPosition"],
    mounted() {
      if (!_.isEmpty(this.control.defaultValue)) {
        this.control.value = this.control.defaultValue;
      }

      // after hook
      Hooks.Control.afterInit.run(
        this.control,
        $(this.$el).find('p')
      );
    }
  };
</script>

<style scoped>
</style>
