<template>
    <div class="columns" style="margin: 0 20px;">
        <div class="column is-9">
            <input-group-component :form="form" ref="InputGroupComponent"></input-group-component>
        </div>
        <div class="column is-3">
            <sidebar-component></sidebar-component>
        </div>

        <preview-component ref="PreviewComponent" :form="form"></preview-component>
    </div>
</template>

<script>
    import InputGroupComponent from "./ui/InputGroupComponent";
    import { dom } from '@fortawesome/fontawesome-svg-core'
    import SidebarComponent from "./ui/SidebarComponent";
    import PreviewComponent from "./ui/PreviewComponent";
    dom.watch();

    var default_form_value = () => ({
        uuid: Math.random(),
        title: '',
        input_groups: [],
        layout: ""
    });

    export default {
        name: "form-builder-template",
        components: {
            PreviewComponent,
            SidebarComponent,
            InputGroupComponent
        },
        props: {
            form: {
                type: Object
            }
        },
        // data: () => ({
        //     form: {
        //         sections: [],
        //         layout: "",
        //         _uniqueId: Math.random()
        //     }
        // }),
        methods: {
            getValue() {
                return this.form;
            },
            setValue(val) {
                this.form = val;
            },
            preview() {
                this.$refs.PreviewComponent.openModal(this.form);
            }
        }
    }
</script>

<style scoped>

</style>
