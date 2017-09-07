'use strict';
(function () {
    var isStopped = true,
        defaultFreq = 440;

    var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (!audioCtx) {
        return alert('No Audio :c');
    }

    var TONE = audioCtx.createOscillator();

    TONE.type = 'sawtooth';
    TONE.frequency.value = parseFreq();
    TONE.connect(audioCtx.destination);

    document.addEventListener('click', toggle);
    window.addEventListener('hashchange', updateFreq);
    setTimeout(toggle, 500);

    function parseFreq() {
        var hash = location.hash;
        var freq = parseFloat(hash.substr(hash.lastIndexOf('#') + 1));

        if (freq > 20 && freq < 20000) {
            return freq;
        } else {
            location.hash = '#' + defaultFreq;
            console.warn('Invalid Frequency: ' + freq);
            return defaultFreq;
        }
    }

    function updateFreq() {
        TONE.frequency.value = parseFreq();
    }

    function toggle() {
        TONE[isStopped ? 'start' : 'stop']();
        isStopped = !isStopped;
    }
}());
