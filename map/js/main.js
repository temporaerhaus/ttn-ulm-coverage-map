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

    };

})(window, jQuery, Main);

$(function (){
    Main.init();
});