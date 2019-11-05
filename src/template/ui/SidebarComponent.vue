<template>
  <div class="panel">
    <div class="controlSidebar list-group" v-show="!isConfig">
      <div class="panel-heading">
        <h5 class="title is-5">Available inputs</h5>
      </div>
      <div id="sidebarControls">
        <a
          href="javascript:void(0)"
          class="panel-block list-group-item list-group-item-action input-wrapper bd-notification"
          v-for="(obj, value) in controls"
          :data-input-type="value"
          :key="'sidebar_control_' + value"
        >
          <font-awesome-icon :icon="obj.icon"></font-awesome-icon>
          {{obj.label}}
        </a>
      </div>
    </div>
    <div class="settingSidebar card" v-if="isConfig">
      <div class="card-body">
        <div class="row mb-2">
          <div class="col-md-6">
            <h4>{{controlInfo.label}}</h4>
          </div>
          <div class="col-md-6 text-right">
            <button class="btn btn-default" @click="applyEditSidebar">Apply</button>
            <button class="btn btn-default" @click="closeEditSidebar">Close</button>
          </div>
        </div>

        <base-config-component :control="controlInfo"></base-config-component>

        <component v-if="configComponent != null" :is="configComponent" :control="controlInfo"></component>

        <base-style-component :control="controlInfo"></base-style-component>
      </div>
    </div>
  </div>
</template>

<script>
  import { INPUT_TYPES } from "sethFormBuilder/config/input_constant";
  import {
    eventBus,
    EventHandlerConstant
  } from "sethFormBuilder/template/handler/event_handler";
  import { InputHandler } from "sethFormBuilder/template/handler/input_handler";
  import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
  import { Hooks } from "sethFormBuilder/template/components/hook_lists";

  export default {
    components: { FontAwesomeIcon },
    name: "sidebar-component",
    data: () => ({
      controls: INPUT_TYPES,
      isConfig: false,
      controlInfo: null,
      configComponent: null
    }),
    methods: {
      closeEditSidebar() {
        this.isConfig = false;
        this.controlInfo = null;
        InputHandler.clearSelect();
      },
      applyEditSidebar() {
        if (this.controlInfo.name !== InputHandler.getSelectedItem()) {
          return;
        }

        // pre apply
        this.controlInfo.decimalPlace = parseInt(this.controlInfo.decimalPlace);

        // before hook here
        let b4Run = Hooks.Sidebar.beforeApplyConfig.runSequence(this.controlInfo);
        if (b4Run === false) {
          return;
        }

        eventBus.$emit(
          EventHandlerConstant.ON_APPLY_EDITOR_SIDEBAR,
          this.controlInfo
        );

        // after hook here
        Hooks.Sidebar.afterApplyConfig.run(this.controlInfo);
      }
    },
    created() {
      // catch event activate sidebar here
      eventBus.$on(EventHandlerConstant.ACTIVATE_EDITOR_SIDEBAR, controlInfo => {
        // before hook here
        let b4Run = Hooks.Sidebar.beforeOpenConfig.runSequence(controlInfo);
        if (b4Run === false) {
          return;
        }

        // open config
        this.isConfig = true;
        this.controlInfo = controlInfo;
        this.configComponent = null;

        // retrieve config component
        if (_.accessStr(this.controls[controlInfo.type], "source.config")) {
          this.configComponent = this.controls[controlInfo.type].source.config;
        }

        // after hook here
        Hooks.Sidebar.afterOpenConfig.run(this.controlInfo);
      });
    },
    mounted() {
      // insert controls
      $(".list-group-item", $("#sidebarControls")).draggable({
        appendTo: "body",
        containment: "",
        scroll: false,
        helper: "clone",
        revert: true,
        zIndex: 9999,
        cancel: ".list-group-item-success",
        start: function(event, ui) {
          $(ui.helper).css("width", `${$(event.target).width()}px`);
        }
      });

      $(this.$el)
        .find(".controlSidebar")
        .droppable({
          accept: ".controlItemWrapper",
          drop: function(event, ui) {
            // remove control
            eventBus.$emit(EventHandlerConstant.REMOVE_CONTROL, ui);
          },
          over: function(event, ui) {
            ui.helper.css("border", "1px solid red");
          }
        });
    }
  };
</script>

<style scoped>
  #sidebarControls > a > svg {
    margin-right: 0.5rem;
  }
</style>
