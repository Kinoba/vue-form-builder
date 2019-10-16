<template>
    <div id="inputGroupConfigModal" class="modal">
      <div class="modal-background"></div>
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title">Input Group Configuration</p>
          <button class="delete" aria-label="close" @click="closeModal"></button>
        </header>
        <section class="modal-card-body" v-if="inputGroup !== null">
            <div class="field has-text-left">
              <label class="label">Input group uuid</label>
              <div class="control">
                <input class="input" type="text" v-model="inputGroup.uuid" placeholder="Enter input group uuid">
              </div>
            </div>
            <div class="field has-text-left">
              <label class="label">Input group name</label>
              <div class="control">
                <input class="input" type="text" v-model="inputGroup.name" placeholder="Enter input group name">
              </div>
            </div>
            <div class="field has-text-left" v-if="maxOrder > inputGroup.order">
              <label class="label">Input group order</label>
              <div class="control">
                <input class="input" type="number" v-model="inputGroup.order" :min="0" :max="maxOrder" placeholder="Enter input group order">
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
    const INPUT_GROUP_ID = "#inputGroupConfigModal";

    export default {
        name: "InputGroupConfigModal",
        props:['updateInputGroupInfo', 'maxOrder'],
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
                this.$emit('updateInputGroupInfo', this.inputGroup, this.index);
                this.closeModal();
            }
        },
        mounted() {
            $("[data-toggle='tooltip']").tooltip();
        }
    }
</script>

<style scoped>

</style>
