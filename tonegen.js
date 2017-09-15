(function () {
    'use strict';
    setupPositioning();

    var AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) {
        return console.warn('🔇');
    }
    var audioCtx = new AudioContext();


    var dryGain = 0.5,
        wetGain = 0.75,
        masterGain = 1;

    var TONE = audioCtx.createOscillator(),
        lowpass = audioCtx.createBiquadFilter(),
        masterGainNode = audioCtx.createGain();

    const frequencyTable = [
        46.249, 92.499, 184.997, 369.994, // F#

        29.135, 58.270, 115.541, 233.082, // A#

        34.648, 69.296, 138.591, 277.183, // C#

        38.891, 77.782, 155.563, 311.127  // D#
    ];

    setupAudioNodes();
    setupEventControls();

    function setupEventControls() {
        var isStopped = true;

        // Don't autostart in iOS:
        if (navigator.userAgent.match(/iPhone|iPod|iPad/i)) {
            var startAudioButPreventNavigation = function (e) {
                (TONE.noteOn || TONE.start).call(TONE, 0);
                startNicely();
                // Prevent accidental navigation on initial sound toggle:
                e.preventDefault();
                document.body.removeEventListener('touchstart', startAudioButPreventNavigation, true);
                document.body.addEventListener('touchstart', updateFreq);
            };
            document.body.addEventListener('touchstart', startAudioButPreventNavigation, true);
        } else {
            TONE.start(0);
            startNicely();
            document.body.addEventListener(
                navigator.userAgent.match(
                    /Mobile|Windows Phone|Lumia|Android|webOS|Blackberry|PlayBook|BB10|Opera Mini|\bCrMo\/|Opera Mobi/i)
                    ? 'touchstart'
                    : 'click',
                updateFreq
            );
        }

        window.addEventListener('close', stopNicely);

        function startNicely() {
            sweepToVolume(masterGain);
            masterGainNode.connect(audioCtx.destination);
            isStopped = false;
        }

        function stopNicely() {
            sweepToVolume(1e-45);
            masterGainNode.disconnect(audioCtx.destination);
            isStopped = true;
        }

        function sweepToVolume(volume) {
            var t = audioCtx.currentTime, gain = masterGainNode.gain;
            gain.setValueAtTime(gain.value, t);
            gain.exponentialRampToValueAtTime(volume, t + 0.03);
        }
    }

    function setupAudioNodes() {
        masterGainNode.gain.value = masterGain;

        var wetGainNode = audioCtx.createGain();
        wetGainNode.gain.value = wetGain;
        wetGainNode.connect(masterGainNode);

        lowpass.type = 'lowpass';
        lowpass.frequency.value = 130.81;
        lowpass.Q.value = 1;

        lowpass.connect(wetGainNode);

        var dryGainNode = audioCtx.createGain();
        dryGainNode.gain.value = dryGain;
        dryGainNode.connect(lowpass);
        dryGainNode.connect(masterGainNode);

        TONE.type = 'sawtooth';
        updateFreq();
        TONE.connect(dryGainNode);

        const lfoGain = audioCtx.createGain();
        lfoGain.gain.value = 0.2;
        lfoGain.connect(masterGainNode.gain);

        const lfo = audioCtx.createOscillator();
        lfo.connect(lfoGain);
        lfo.frequency.value = 0.5;
        lfo.start(0);

        const filterLfoGain = audioCtx.createGain();
        filterLfoGain.gain.value = 1;
        filterLfoGain.connect(lowpass.frequency);

        const filterLfo = audioCtx.createOscillator();
        filterLfo.connect(filterLfoGain);
        filterLfo.frequency.value = 4;
        filterLfo.start(0);

        const detuneLfoGain = audioCtx.createGain();
        detuneLfoGain.gain.value = 0.5;
        detuneLfoGain.connect(TONE.frequency);

        const detuneLfo = audioCtx.createOscillator();
        detuneLfo.connect(detuneLfoGain);
        detuneLfo.frequency.value = 0.125;
        detuneLfo.start(0);
    }

    function updateFreq() {
        var newFreq = randomFreq();
        TONE.frequency.setValueAtTime(newFreq, 0);
        lowpass.frequency.setValueAtTime(newFreq + 1, 0);
    }

    function randomFreq() {
        return frequencyTable[Math.floor(Math.random() * frequencyTable.length)];
    }

    function setupPositioning() {
        window.scrollTo(0, 0);
        // 1) Don't allow vertical scrolling on iOS/Safari
        if (/safari/i.test(navigator.userAgent)) {
            document.body.addEventListener('touchmove', function (e) {
                e.preventDefault();
            });
        }

        // 2) Force portrait mode
        if ('onorientationchange' in window) {
            var reorient = function (e) {
                document.body.style.setProperty('transform', (window.orientation % 180) ? 'rotate(-90deg)' : '', '');
            };
            window.onorientationchange = reorient;
            window.setTimeout(reorient, 0);
        }
    }
}());
