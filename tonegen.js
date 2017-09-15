(function () {
    'use strict';
    setupPositioning();

    var AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) {
        return console.warn('🔇');
    }
    var audioCtx = new AudioContext();

    var TONE, masterGainNode;

    var dryGain = 0.5,
        wetGain = 0.35,
        masterGain = 1;

    const frequencyTable = [
        46.249, 92.499, 184.997, 369.994, 739.989,// F#

        29.135, 58.270, 115.541, 233.082, 466.164,// A#

        34.648, 69.296, 138.591, 277.183, 554.365,// C#

        38.891, 77.782, 155.563, 311.127, 622.254 // D#
    ];

    buildAudioNodes();
    setupEventControls();

    function setupEventControls() {
        var isStopped = true;

        // Don't autostart in iOS:
        if (/iphone/i.test(navigator.userAgent)) {
            var startAudioButPreventNavigation = function (e) {
                (TONE.noteOn || TONE.start).call(TONE, 0);
                startNicely();
                // Prevent accidental navigation on initial sound toggle:
                e.preventDefault();
                document.body.removeEventListener('touchstart', startAudioButPreventNavigation, true);
                document.body.addEventListener('touchstart', toggleSound);
            };
            document.body.addEventListener('touchstart', startAudioButPreventNavigation, true);
        } else {
            TONE.start(0);
            startNicely();
            document.body.addEventListener('touchstart', toggleSound);
        }

        document.body.addEventListener('click', toggleSound);
        window.addEventListener('close', stopNicely);

        function toggleSound() {
            hopOctave();
            // if (isStopped) {
            //     startNicely();
            // } else {
            //     stopNicely();
            // }
        }

        function hopOctave() {
            updateFreq();
        }

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

    function buildAudioNodes() {

        masterGainNode = audioCtx.createGain();
        masterGainNode.gain.value = masterGain;

        var wetGainNode = audioCtx.createGain();
        wetGainNode.gain.value = wetGain;
        wetGainNode.connect(masterGainNode);

        var lowpass = audioCtx.createBiquadFilter();
        lowpass.type = 'lowpass';
        lowpass.frequency.value = 130.81;
        lowpass.Q.value = 4;

        lowpass.connect(wetGainNode);

        var dryGainNode = audioCtx.createGain();
        dryGainNode.gain.value = dryGain;
        dryGainNode.connect(lowpass);
        dryGainNode.connect(masterGainNode);

        const lfoGain = audioCtx.createGain();
        lfoGain.gain.value = 0.2;
        lfoGain.connect(masterGainNode.gain);

        const lfo = audioCtx.createOscillator();
        lfo.connect(lfoGain);
        lfo.connect(lowpass.frequency);
        lfo.frequency.value = 0.5;
        lfo.start(0);


        const filterLfoGain = audioCtx.createGain();
        filterLfoGain.gain.value = 0.2;
        filterLfoGain.connect(masterGainNode.gain);

        const filterLfo = audioCtx.createOscillator();
        filterLfo.connect(filterLfoGain);
        filterLfo.connect(lowpass.frequency);
        filterLfo.frequency.value = 0.5;
        filterLfo.start(0);

        TONE = audioCtx.createOscillator();
        TONE.type = 'sawtooth';
        updateFreq();
        TONE.connect(dryGainNode);
    }

    function updateFreq() {
        TONE.frequency.setValueAtTime(randomFreq(), 0);
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
