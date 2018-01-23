const $ = require('jquery')

function vh(numb) {
    return $(window).height() * (numb) / 100.0;
}

module.exports = {
    vh: vh
};