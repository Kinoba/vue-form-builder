import FormBuilder from './FormBuilder';

module.exports = {
    devtool: 'source-map',
    install: function (Vue, options) {
        Vue.component('form-builder', FormBuilder);
    }
};
