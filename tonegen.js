(function () {
    'use strict';

    var AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) {
        return alert('No Audio :c');
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

    // Don't autostart in iOS
    if (!TONE.noteOn) {
        TONE.start();
    } else {
        // Prevent accidental navigation on initial sound toggle
        var wrapper = document.getElementById('cube');
        var preventNavigation = function (e) {
            e.preventDefault();
            allowNavigation();
            return false;
        };
        var allowNavigation = function () {
            wrapper.removeEventListener('touchstart', preventNavigation, true);
        };
        wrapper.addEventListener('touchstart', preventNavigation, true);
    }

    document.addEventListener('click', toggleSound);
    window.addEventListener('touchstart', toggleSound);
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
        // iOS needs to be triggered here, after user-event:
        if (TONE.playbackState !== TONE.PLAYING_STATE) {
            TONE.noteOn(0);
            (allowNavigation || function () {
            })();
        }
        (isStopped ? startNicely : stopNicely)();
        isStopped = !isStopped;
    }

    function startNicely() {
        sweepToVolume(gainVolume);
        TONE.connect(gainNode);
    }

    function stopNicely() {
        sweepToVolume(1e-45);
        TONE.disconnect(gainNode);
    }

    function sweepToVolume(volume) {
        var t = audioCtx.currentTime, gain = gainNode.gain;
        gain.setValueAtTime(gain.value, t);
        gain.exponentialRampToValueAtTime(volume, t + 0.03);
    }
}());
