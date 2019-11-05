import {faEdit} from '@fortawesome/free-solid-svg-icons/faEdit';
import {faCalculator} from '@fortawesome/free-solid-svg-icons/faCalculator';
import {faCalendarAlt} from '@fortawesome/free-solid-svg-icons/faCalendarAlt';
import {faClock} from '@fortawesome/free-solid-svg-icons/faClock';
import {faCheck} from '@fortawesome/free-solid-svg-icons/faCheck';
import {faDatabase} from '@fortawesome/free-solid-svg-icons/faDatabase';
import {faFile} from '@fortawesome/free-solid-svg-icons/faFile';
import {faParagraph} from '@fortawesome/free-solid-svg-icons/faParagraph';
import {faAlignJustify} from '@fortawesome/free-solid-svg-icons/faAlignJustify';

var FORM_CONSTANTS = {};
var INPUT_CONSTANTS = {};
var API_CONSTANTS = {};

FORM_CONSTANTS.InputGroupLayout = {
  collapse: "Collapse",
  tab: "Tab",
  // inner: "Inner Parent",
};

FORM_CONSTANTS.InputGroup = {
    uuid: null,
    name: "",
    label: "",
    order: 0,
    rows_attributes: [],
    conditions: [],

    // config
    //labelPosition: "left", // left or top

    // for dynamic
    //isDynamic: false,
    //minInstance: 1,
    //maxInstance: 0, //0 for unlimited
    //instances: [], // for save data in GUI to easily to retrieve @@
};

FORM_CONSTANTS.Row = {
    uuid: null,
    inputs_attributes: [],
    name: "",
    order: 0,
};

FORM_CONSTANTS.Input = {
    uuid: null,
    input_type: "",
    name: "",
    label: "",
    order: 0,
    properties: {},
    validations: {},

    //Other properties
    fieldName: "",
    // defaultValue: "",
    value: "",
    // className: 'col-md-4',
    // readonly: false,
    // labelBold: false,
    // labelItalic: false,
    // labelUnderline: false,
    // required: false,
    // isMultiLine: false,
    // isInteger: false,
    // decimalPlace: 0,
    // isTodayValue: false,
    // dateFormat: "dd/mm/yy",
    // isNowTimeValue: false,
    // timeFormat: "HH:mm", // enhancement later
    // isMultiple: false,
    // isAjax: false, // is ajax data source or not
    // dataOptions: [], // static data source
    // ajaxDataUrl: "", // ajax data source
    // isChecked: false
};

FORM_CONSTANTS.Type = {
    text: {
        label:"Text Input",
        icon: faEdit
    },
    number: {
        label:"Number Input",
        icon: faCalculator
    },
    date: {
        label: "Date Picker",
        icon: faCalendarAlt
    },
    time: {
        label:"Time Picker",
        icon: faClock
    },
    select: {
        label: "Select Option",
        icon: faDatabase
    },
    checkbox: {
        label:"Checkbox",
        icon: faCheck
    },
    textarea: {
        label:"Text Area",
        icon: faAlignJustify
    },
    paragraph: {
        label: "Paragraph",
        icon: faParagraph
    },
    file: {
        label:"Input File",
        icon: faFile
    }
};

FORM_CONSTANTS.WidthOptions = {
    "col-md-1": "Width 1 parts",
    "col-md-2": "Width 2 parts",
    "col-md-3": "Width 3 parts",
    "col-md-4": "Width 4 parts",
    "col-md-5": "Width 5 parts",
    "col-md-6": "Width 6 parts",
    "col-md-7": "Width 7 parts",
    "col-md-8": "Width 8 parts",
    "col-md-9": "Width 9 parts",
    "col-md-10": "Width 10 parts",
    "col-md-11": "Width 11 parts",
    "col-md-12": "Width 12 parts",
};

FORM_CONSTANTS.OptionDefault = {
    id: "",
    text: ""
};

INPUT_CONSTANTS.DateFormat = {
    // rule: date picker format => moment format
    'dd/mm/yy': "D/M/YYYY",
    'dd-mm-yy': "D-M-YYYY",
    'mm/dd/yy': "M/D/YYYY",
    'mm-dd-yy': "M/D/YYYY",
    'yy/mm/dd': "YYYY/M/D",
    'yy-mm-dd': "YYYY-M-D",
};

INPUT_CONSTANTS.TimeFormat = {
    'H:m': 'H:m',
    'HH:mm': 'HH:mm',
    'h:m p': "h:m A",
    'hh:mm p': "hh:mm A"
};

API_CONSTANTS.url = 'http://localhost:3000';

export {
    FORM_CONSTANTS,
    INPUT_CONSTANTS,
    API_CONSTANTS
}
