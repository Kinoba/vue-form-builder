<template>
    <div class="inputItemWrapper columns" :data-input-name="input.name">
        <div class="column is-12">
            <div :id="input.name" class="field has-text-left inputItem">
                <div v-if="!editLabel">
                    <label v-if="input.label" :class="{'label' : true, 'is-inline-block': true ,'bold': input.labelBold, 'italic': input.labelItalic, 'underline': input.labelUnderline}">
                        {{input.label}}
                    </label>
                    <label v-else :class="{'label' : true, 'is-inline-block': true, 'bold': input.labelBold, 'italic': input.labelItalic, 'underline': input.labelUnderline}">
                        File input
                    </label>
                </div>
                <div v-else class="control">
                    <input type="text" class="input" v-model="input.label">
                </div>
                <div class="file">
                  <label class="file-label">
                    <input class="file-input" ref="fileInput" type="file" name="resume" @change="handleFileUpload">
                    <span class="file-cta">
                      <span class="file-icon">
                        <i class="fas fa-upload"></i>
                      </span>
                      <span class="file-label">
                        Choose a file…
                      </span>
                    </span>
                  </label>
                </div>
                <span>Files :</span>
                <div v-for="file in fileList">
                    {{ file.name }}
                </div>
            </div>
            <div class="button-bar is-pulled-right is-inline-block">
                <button v-if="fileList.length > 0" class="button is-secondary" @click="clearInput"><font-awesome-icon icon="times"/> Clear</button>
                <button class="button is-secondary" @click="editLabel = !editLabel"><font-awesome-icon icon="pen"/>
                    <span v-if="!editLabel">Edit label</span>
                    <span v-else>Save label</span>
                </button>
                <button class="button is-secondary" @click="$emit('openConfig', index)"><font-awesome-icon icon="cog"/> Configuration</button>
            </div>
        </div>
    </div>
</template>

<script>
    import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

    export default {
        name: "FileInput",
        components: {
            FontAwesomeIcon
        },
        props: ['input', 'labelPosition', 'index'],
        data: () => ({
            editLabel: false,
            fileList: []
        }),
        computed: {
            demo_value() {
                if (!_.isEmpty(this.input.defaultValue)) {
                    return this.input.defaultValue;
                }

                return "";
            }
        },
        methods: {
            handleFileUpload() {
                this.input.value = this.$refs.fileInput.files;
                this.fileList = this.$refs.fileInput.files;
            },
            clearInput() {
                this.input.value = null;
                this.fileList = [];
            }
        }
    }
</script>

<style scoped>
    hr {
        margin: 1rem 0;
    }

    .button-bar {
        display: inline-block;
    }

    .button-bar > button {
        margin-left: .5rem;
    }

    button > .svg-inline--fa {
        margin-right: .5rem;
    }

    .control {
        margin-bottom: .5rem;
    }
</style>
