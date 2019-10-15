var InputHandler = {};

InputHandler.clearSelect = function () {
    $(".inputItem").removeClass('onSelect');
};

InputHandler.setSelect = function (inputID) {
    $("#" + inputID).addClass('onSelect');
};

InputHandler.getSelectedItem = function () {
    return $(".onSelect").attr('id');
};

InputHandler.isinputNameExisted = function (rowID, inputName) {
    var inputs = $(`#${rowID}`).parents(".inputGroupBody").find(`[name='${inputName}']`);
    return inputs.length >= 1;
};

export {
    InputHandler
}
