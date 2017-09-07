'use strict';
(function () {
    var isStopped = true,
        volume = 0.1,
        defaultFreq = 440;

    var TONE = T('saw', {freq: parseFreq(), mul: volume});

    document.addEventListener('click', toggle);
    window.addEventListener('hashchange', updateFreq);
    setTimeout(toggle, 500);

    function parseFreq() {
        var hash = location.hash;
        var freq = parseInt(hash.substr(hash.lastIndexOf('#') + 1));

        if (freq > 20 && freq < 20000) {
            return freq;
        } else {
            location.hash = '#' + defaultFreq;
            console.warn('Invalid Frequency: ' + freq);
            return defaultFreq;
        }
    }

    function updateFreq() {
        TONE.set('freq', parseFreq());
    }

    function toggle() {
        TONE[isStopped ? 'play' : 'pause']();
        isStopped = !isStopped;
    }
}());
