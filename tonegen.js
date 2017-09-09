(function () {
    'use strict';
    // Mobile positioning hacks:
    // 1) Don't allow scrolling
    window.scrollTo(0, 0);
    document.body.addEventListener('touchmove', function (e) {
        e.preventDefault();
    });
    // 2) Force portrait mode
    var reorient = function (e) {
        document.body.style.setProperty('transform', (window.orientation % 180) ? 'rotate(-90deg)' : '', '');
    };
    window.onorientationchange = reorient;
    window.setTimeout(reorient, 0);

    var AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) {
        return console.warn('🔇');
    }

    var isStopped = true,
        defaultFreq = 440,
        gainVolume = 0.75;

    var audioCtx = new AudioContext();

    var gainNode = audioCtx.createGain();
    gainNode.gain.value = gainVolume;
    gainNode.connect(audioCtx.destination);

    var TONE = audioCtx.createOscillator();
    TONE.type = 'sawtooth';
    updateFreq();

    // Don't autostart in iOS:
    if (TONE.noteOn) {
        var startAudioButPreventNavigation = function (e) {
            TONE.noteOn(0);

            // Prevent accidental navigation on initial sound toggle:
            e.preventDefault();
            document.body.removeEventListener('touchstart', startAudioButPreventNavigation, true);
        };
        document.body.addEventListener('touchstart', startAudioButPreventNavigation, true);
    } else {
        TONE.start();
        startNicely();
    }

    document.body.addEventListener('click', toggleSound);
    document.body.addEventListener('touchstart', toggleSound);
    window.addEventListener('hashchange', updateFreq);
    window.addEventListener('close', stopNicely);

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

    function toggleSound() {
        (isStopped ? startNicely : stopNicely)();
    }

    function startNicely() {
        sweepToVolume(gainVolume);
        TONE.connect(gainNode);
        isStopped = false;
    }

    function stopNicely() {
        sweepToVolume(1e-45);
        TONE.disconnect(gainNode);
        isStopped = true;
    }

    function sweepToVolume(volume) {
        var t = audioCtx.currentTime, gain = gainNode.gain;
        gain.setValueAtTime(gain.value, t);
        gain.exponentialRampToValueAtTime(volume, t + 0.03);
    }
}());
