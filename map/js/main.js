var Main = Main || {};
(function(window, $, exports, undefined) {
    'use strict';

    exports.init = function () {
        bindListeners();
    };

    let bindListeners = function () {

        // expand listener for upper textbox
        $('.expand-arrow').on('click', function (){
            $(this)
                .find('img')
                .toggle()
                .parents('.expand-container')
                .find('.disclaimer-expand-text')
                .toggle();
        });

        $('#disclaimer-collapse, #filter-collapse').on('click', function (){
            $(this).find('img').toggle();

            if ($(this).parents('.disclaimer, .filter').find('.disclaimer-left, .filter-left').is(':visible')) {
                $(this).parents('.disclaimer, .filter').find('.disclaimer-left, .filter-left').hide();
            } else {
                $(this).parents('.disclaimer, .filter').find('.disclaimer-left, .filter-left').show();
            }
        });

    };

})(window, jQuery, Main);

$(function (){
    Main.init();
});