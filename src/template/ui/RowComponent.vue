<template>
  <div class="rowWrapper">
    <row-item
      v-for="(row, index) in inputGroup.rows_attributes"
      :key="row.uuid"
      :row="row"
      :row-index="index"
      :form="currentForm"
      :parentInputGroup="inputGroup"
      @removeRow="removeRow"
    ></row-item>
  </div>
</template>

<script>
  import RowItem from "./common/RowItem";
  import { Hooks } from "sethFormBuilder/template/components/hook_lists";

  export default {
    components: { RowItem },
    name: "row-component",
    props: {
      inputGroup: {
        type: Object
      },
      form: {}
    },
    data: () => ({
      currentForm: {}
    }),
    methods: {
      traverseRow() {
        let self = this;

        // prepare data
        var items = $(this.$el).find(".rowItem");
        var finalItems = [];

        // sort
        _.each(items, (item, index) => {
          var id = $(item).attr("id");
          var rowItem = _.find(self.inputGroup.rows_attributes, { uuid: id });
          finalItems.push(rowItem);
        });

        // reset the current sections
        this.inputGroup.rows_attributes = finalItems;
      },
      removeRow(id) {
        var rowIndex = _.findIndex(this.inputGroup.rows_attributes, { uuid: id });
        /*if (this.inputGroup.rows_attributes[rowIndex].inputs_attributes.length > 0) {
                      SethPhatToaster.error("Can't remove this row because it's still have inputs inside.");
                      return;
                  }*/

        var rowInfo = this.inputGroup.rows_attributes[rowIndex];
        let beforeRun = Hooks.Row.beforeRemove.runSequence(rowInfo, this.section);
        if (beforeRun === false) {
          return;
        }

        if (this.inputGroup.rows_attributes.length === 1)
          this.inputGroup.rows_attributes[rowIndex].inputs_attributes = [];
        //Clear current row from inputs
        else this.inputGroup.rows_attributes.splice(rowIndex, 1); //Remove row

        // final hook
        Hooks.Row.afterRemove.run(rowInfo, this.inputGroup);
      }
    },
    mounted() {
      this.currentForm = this.form;
      let self = this;
      $(this.$el)
        .sortable({
          cursor: "move",
          delay: 200,
          placeholder: "ui-state-highlight",
          update: function(event, ui) {
            self.traverseRow();
          },
          start: function(e, ui) {
            ui.placeholder.height(ui.item.height());
            ui.placeholder.css("border", "");
            ui.placeholder.css("background-color", "#27ae60");
          }
        })
        .disableSelection();
    },
    watch: {
      form: {
        handler: function(newVal) {
          if (typeof newVal !== "undefined") {
            this.currentForm = newVal;
          }
        },
        deep: true
      }
    }
  };
</script>

<style scoped>
.ui-state-highlight {
  height: 1.5em;
  line-height: 1.2em;
}
</style>
