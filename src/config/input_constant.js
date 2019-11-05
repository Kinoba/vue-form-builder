// icon
import {faEdit} from '@fortawesome/free-solid-svg-icons/faEdit';
import {faCalculator} from '@fortawesome/free-solid-svg-icons/faCalculator';
import {faCalendarAlt} from '@fortawesome/free-solid-svg-icons/faCalendarAlt';
import {faClock} from '@fortawesome/free-solid-svg-icons/faClock';
import {faCheck} from '@fortawesome/free-solid-svg-icons/faCheck';
import {faDatabase} from '@fortawesome/free-solid-svg-icons/faDatabase';
import {faFile} from '@fortawesome/free-solid-svg-icons/faFile';
import {faParagraph} from '@fortawesome/free-solid-svg-icons/faParagraph';
import {faAlignJustify} from '@fortawesome/free-solid-svg-icons/faAlignJustify';

// GUI Control
import GUICheckboxControl from 'sethFormBuilder/gui/ui/controls/CheckboxControl';
import GUIDatePickerControl from 'sethFormBuilder/gui/ui/controls/DatePickerControl';
import GUINumberControl from 'sethFormBuilder/gui/ui/controls/NumberControl';
import GUISelectControl from 'sethFormBuilder/gui/ui/controls/SelectControl';
import GUITextControl from 'sethFormBuilder/gui/ui/controls/TextControl';
import GUIParagraphControl from 'sethFormBuilder/gui/ui/controls/ParagraphControl';
import GUITimePickerControl from 'sethFormBuilder/gui/ui/controls/TimePickerControl';
import GUITextAreaControl from 'sethFormBuilder/gui/ui/controls/TextAreaControl';
import GUIFileControl from 'sethFormBuilder/gui/ui/controls/FileControl';

// TEMPLATE Control
import TEMPLATETextInput from 'sethFormBuilder/template/ui/common/inputs/TextInput';
import TEMPLATENumberInput from 'sethFormBuilder/template/ui/common/inputs/NumberInput';
import TEMPLATECheckboxInput from 'sethFormBuilder/template/ui/common/inputs/CheckboxInput';
import TEMPLATEDatePickerInput from 'sethFormBuilder/template/ui/common/inputs/DatePickerInput';
import TEMPLATETimePickerInput from 'sethFormBuilder/template/ui/common/inputs/TimePickerInput';
import TEMPLATESelectInput from 'sethFormBuilder/template/ui/common/inputs/SelectInput';
import TEMPLATETextAreaInput from 'sethFormBuilder/template/ui/common/inputs/TextAreaInput';
import TEMPLATEParagraphInput from 'sethFormBuilder/template/ui/common/inputs/ParagraphInput';
import TEMPLATEFileInput from 'sethFormBuilder/template/ui/common/inputs/FileInput';

// CONFIG CONTROL
// import SIDEBARDatePickerControl from 'sethFormBuilder/template/ui/sidebar_items/DatePickerConfigComponent';
// import SIDEBARTimePickerControl from 'sethFormBuilder/template/ui/sidebar_items/TimePickerConfigComponent';
// import SIDEBARSelectControl from 'sethFormBuilder/template/ui/sidebar_items/SelectConfigComponent';
// import SIDEBARNumberControl from 'sethFormBuilder/template/ui/sidebar_items/NumberConfigComponent';
// import SIDEBARTextControl from 'sethFormBuilder/template/ui/sidebar_items/TextConfigComponent';
// import SIDEBARCheckboxControl from 'sethFormBuilder/template/ui/sidebar_items/CheckboxConfigComponent';
// import SIDEBARTextAreaControl from 'sethFormBuilder/template/ui/sidebar_items/TextConfigComponent';

// Template Control
// special key for control:
// other_properties: {
//     x: "zzz",
//     c: "xxx",
//     ...
// },
// validation_func: function() {
//  // validation function here
// }
//
const INPUT_TYPES = {
    text: {
        label:"Text Input",
        icon: faEdit,
        source: {
            gui: GUITextControl,
            template: TEMPLATETextInput,
            //config: SIDEBARTextControl
        }
    },
    number: {
        label:"Number Input",
        icon: faCalculator,
        source: {
            gui: GUINumberControl,
            template: TEMPLATENumberInput,
            //config: SIDEBARNumberControl
        }
    },
    date: {
        label: "Date Picker",
        icon: faCalendarAlt,
        source: {
            gui: GUIDatePickerControl,
            template: TEMPLATEDatePickerInput,
            //config: SIDEBARDatePickerControl,
        }
    },
    time: {
        label:"Time Picker",
        icon: faClock,
        source: {
            gui: GUITimePickerControl,
            template: TEMPLATETimePickerInput,
            //config: SIDEBARTimePickerControl,
        }
    },
    select: {
        label: "Select Option",
        icon: faDatabase,
        source: {
            gui: GUISelectControl,
            template: TEMPLATESelectInput,
            //config: SIDEBARSelectControl
        }
    },
    checkbox: {
        label:"Checkbox",
        icon: faCheck,
        source: {
            gui: GUICheckboxControl,
            template: TEMPLATECheckboxInput,
            //config: SIDEBARCheckboxControl
        }
    },
    textarea: {
        label: 'Text Area',
        icon: faAlignJustify,
        source: {
            gui: GUITextAreaControl,
            template: TEMPLATETextAreaInput,
            //config: SIDEBARTextAreaControl
        }
    },
    paragraph: {
        label: 'Paragraph',
        icon: faParagraph,
        source: {
            gui: GUIParagraphControl,
            template: TEMPLATEParagraphInput,
            //config: SIDEBARTextAreaControl
        }
    },
    file: {
        label:"File",
        icon: faFile,
        source: {
            gui: GUIFileControl,
            template: TEMPLATEFileInput,
            //config: SIDEBARTextAreaControl
        }
    }
};

export {
    INPUT_TYPES
}
