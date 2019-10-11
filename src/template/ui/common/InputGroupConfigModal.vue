<template>
    <div>
        <div class="modal" id="inputGroupConfigModal">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">

                    <!-- Modal Header -->
                    <div class="modal-header">
                        <h4 class="modal-title">Input Group Configuration</h4>
                        <button type="button" class="close" data-dismiss="modal">&times;</button>
                    </div>

                    <!-- Modal body -->
                    <div class="modal-body" v-if="inputGroup !== null">
                        <div class="form-group">
                            <label>Input Group Client Key</label>
                            <input type="text" class="form-control" v-model="inputGroup.clientKey">
                        </div>
                        <div class="form-group">
                            <label>Label Position</label>
                            <select class="form-control" v-model="inputGroup.labelPosition">
                                <option value="left">Horizontal</option>
                                <option value="top">Vertical</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label><input type="checkbox" v-model="inputGroup.isDynamic"> Is Dynamic Form?</label>
                        </div>

                        <div class="row" v-if="inputGroup.isDynamic">
                            <div class="col-md-6">
                                <label>Min instance</label>
                                <input type="number"
                                       min="0"
                                       class="form-control"
                                       data-toggle='tooltip'
                                       title="Minimum instance for dynamic input group"
                                       v-model="inputGroup.minInstance">
                            </div>
                            <div class="col-md-6">
                                <label>Max instance</label>
                                <input type="number"
                                       min="0"
                                       class="form-control"
                                       data-toggle='tooltip'
                                       title="Maximum instance for dynamic input group. 0 for unlimited."
                                       v-model="inputGroup.maxInstance">
                            </div>
                        </div>
                    </div>

                    <!-- Modal footer -->
                    <div class="modal-footer">
                        <button type="button" class="btn btn-default" @click="save">Save</button>
                        <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
                    </div>

                </div>
            </div>
        </div>
    </div>
</template>

<script>
    const INPUT_GROUP_ID = "#inputGroupConfigModal";

    export default {
        name: "InputGroupConfigModal",
        props:['updateInputGroupInfo'],
        data: () => ({
            index: null,
            inputGroup: null
        }),
        methods: {
            openModal(inputGroupInfo, index) {
                this.inputGroup = _.cloneDeep(inputGroupInfo);
                this.index = _.clone(index);
                $(INPUT_GROUP_ID).modal('show');
            },
            closeModal() {
                $(INPUT_GROUP_ID).modal('hide');
            },
            save() {
                if (_.isEmpty(this.inputGroup.clientKey)) {
                    this.inputGroup.clientKey = this.inputGroup.name;
                }
                // format data
                this.inputGroup.minInstance = parseInt(this.inputGroup.minInstance);
                this.inputGroup.maxInstance = parseInt(this.inputGroup.maxInstance);

                this.$emit('updateInputGroupInfo', this.inputGroup, this.index);
                this.closeModal();
            },
        },
        mounted() {
            $("[data-toggle='tooltip']").tooltip();
        }
    }
</script>

<style scoped>

</style>
