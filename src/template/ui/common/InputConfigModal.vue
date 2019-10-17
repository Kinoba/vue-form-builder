<template>
    <div id="inputConfigModal" class="modal">
      <div class="modal-background"></div>
      <div class="modal-card" v-if="input">
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
        </section>
        <footer class="modal-card-foot has-text-right">
          <button class="button is-success" :disabled="(input.order >= maxOrder) || (input.order < 0)" @click="save">Save</button>
          <button class="button" @click="closeModal">Cancel</button>
        </footer>
      </div>
    </div>
</template>

<script>
    const INPUT_ID = "#inputConfigModal";

    export default {
        name: "InputConfigModal",
        props:['updateInputInfo', 'maxOrder'],
        data: () => ({
            index: null,
            input: null,
            oldInputOrder: null,
        }),
        methods: {
            openModal(inputGroupInfo, index) {
                this.input = _.cloneDeep(inputGroupInfo);
                this.index = _.clone(index);
                $(INPUT_ID).modal('show');
            },
            closeModal() {
                $(INPUT_ID).modal('hide');
            },
            save() {
                let reOrder = false;
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
            }
        },
        mounted() {
            $("[data-toggle='tooltip']").tooltip();
            if(this.input) this.oldInputOrder = this.input.order;
        },
        watch: {
            input(val) {
                if(this.input) this.oldInputOrder = val.order;
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
