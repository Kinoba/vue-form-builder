<template>
    <div class="rowWrapper">
        {{inputGroup.rows}}
        <row-item v-for="row in inputGroup.rows"
                  :key="row.uuid"
                  :row="row"
                  @removeRow="removeRow">
        </row-item>
    </div>
</template>

<script>
    import RowItem from "./common/RowItem";
    import {Hooks} from 'sethFormBuilder/template/components/hook_lists';

    export default {
        components: {RowItem},
        name: "row-component",
        props: {
            inputGroup: {
                type: Object
            }
        },
        methods: {
            traverseRow() {
                let self = this;

                // prepare data
                var items = $(this.$el).find('.rowItem');
                var finalItems = [];

                // sort
                _.each(items, (item, index) => {
                    var id = $(item).attr('id');
                    var rowItem = _.find(self.inputGroup.rows, {uuid: id});
                    finalItems.push(rowItem);
                });

                // reset the current sections
                this.inputGroup.rows = finalItems;
            },
            removeRow(id) {
                var rowIndex = _.findIndex(this.inputGroup.rows, {uuid: id});
                if (this.inputGroup.rows[rowIndex].controls.length > 0) {
                    SethPhatToaster.error("Can't remove this row because it's still have controls inside.");
                    return;
                }

                var rowInfo = this.inputGroup.rows[rowIndex];
                let beforeRun = Hooks.Row.beforeRemove.runSequence(rowInfo, this.section);
                if (beforeRun === false) {
                    return;
                }

                this.inputGroup.rows.splice(rowIndex, 1);

                // final hook
                Hooks.Row.afterRemove.run(rowInfo, this.inputGroup);
            }
        },
        mounted() {

            let self = this;
            $(this.$el).sortable({
                cursor: "move",
                delay: 200,
                placeholder: "ui-state-highlight",
                update: function (event, ui) {
                    self.traverseRow();
                },
                start: function(e, ui){
                    ui.placeholder.height(ui.item.height());
                    ui.placeholder.css("border", "");
                    ui.placeholder.css("background-color", "#27ae60");
                }
            }).disableSelection();
        }
    }
</script>

<style scoped>
    .ui-state-highlight { height: 1.5em; line-height: 1.2em; }
</style>
