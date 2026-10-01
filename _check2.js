
/* ═══════════════════════════════════════════════════════════════
   ESCENA 2 — Can U feel me?
   OBSERVAR → DESCUBRIR → ACERCARSE → REVELAR → TRANSFORMAR
   → VOLVER
═══════════════════════════════════════════════════════════════ */
(function () {
    'use strict';
    
    /* DEBUG LOGGER VISUAL */
    var debugLog = document.createElement('div');
    debugLog.style.cssText = 'position:fixed; top:10px; left:10px; background:rgba(0,0,0,0.8); color:lime; z-index:9999; padding:10px; font-family:monospace; font-size:12px; max-width: 400px;';
    document.body.appendChild(debugLog);
    window.onerror = function(msg, url, line) {
        debugLog.innerHTML += 'ERROR: ' + msg + ' en linea ' + line + '<br>';
    };
    function log(msg) { debugLog.innerHTML += msg + '<br>'; }
    
    log('Iniciando script escena 2...');

    /* ── Refs cama (escena 2) ── */
    var stage      = document.getElementById('s2-stage');
    var zoomer     = document.getElementById('s2-zoomer');
    var lCama      = document.getElementById('l-cama');
    var lAlmohada  = document.getElementById('l-almohada');
    var lRemedio   = document.getElementById('l-remedio');
    var hsCama     = document.getElementById('hs-cama');
    var hsAlmohada = document.getElementById('hs-almohada');
    var hsRemedio  = document.getElementById('hs-remedio');
    var remedioFg  = document.getElementById('remedio-fg');
    var remedioGif = document.getElementById('remedio-gif');
    var returnHint = document.getElementById('return-hint');
    var introFade  = document.getElementById('intro-fade');

    /* ── Refs escritorio (escena 3) ── */
    var lEscritorio  = document.getElementById('l-escritorio');
    var lCuaderno    = document.getElementById('l-cuaderno');
    var lCelular     = document.getElementById('l-celular');
    var hsEscritorio = document.getElementById('hs-escritorio');
    var hsCuaderno   = document.getElementById('hs-cuaderno');
    var hsCelular    = document.getElementById('hs-celular');

    /* ── Estado del celular ── */
    var celularUnlocked = false; /* se desbloquea tras usar el cuaderno */

    /* ── Refs cuaderno viewer ── */
    var cOverlay  = document.getElementById('cuaderno-overlay');
    var cWrap     = document.getElementById('cuaderno-wrap');
    var cBase     = document.getElementById('c-base');
    var cCurrent  = document.getElementById('c-current');
    var cFlip     = document.getElementById('c-flip');
    var cZoneL    = document.getElementById('c-zone-left');
    var cZoneR    = document.getElementById('c-zone-right');
    var cCounter  = document.getElementById('c-counter');
    var cClose    = document.getElementById('c-close');

    /* ── Estados escena 2 (cama) ── */
    var S = {
        INIT: 0, BED: 1, ZOOMING: 2,
        PILLOW: 3, FADING: 4, REMEDIO: 5,
        ZOOM_REM: 6, GIF: 7, RETURNING: 8
    };
    var state = S.INIT;

    /* ── Estado escena 3 (escritorio) ── */
    /* s3Unlocked: true luego del primer click a la cama */
    var s3Unlocked   = false;
    var s3Active     = false;
    /* s3InDesk: true cuando el usuario está en zoom del escritorio */
    var s3InDesk     = false;

    var S3_ZOOM_SCALE  = 2.5;
    var S3_ZOOM_DUR    = 2800;
    var S3_ZOOM_BACK   = 2800;
    /* Origen del zoom hacia el escritorio:
       centro escritorio = (652+308, 428+195) = (960, 623)
       como % de 1920×1080: 50%, 57.7% */
    var S3_ORIGIN = '61% 55%';

    /* ── Dimensiones de diseño ── */
    var DW = 1920, DH = 1080;
    var ZOOM_SCALE   = 3.5;
    var ZOOM_DUR_MS  = 4200;  /* más lento = más cinematográfico */
    var ZOOM_BACK_MS = 3400;

    /* ══════════════════════════════════════════
       ESCALADO DEL STAGE — modo cover
    ══════════════════════════════════════════ */
    function scaleStage() {
        var sc = Math.max(window.innerWidth / DW, window.innerHeight / DH);
        stage.style.transform = 'translate(-50%,-50%) scale(' + sc + ')';
    }
    scaleStage();
    window.addEventListener('resize', scaleStage);

    /* ══════════════════════════════════════════
       TRANSFORM-ORIGIN DEL ZOOM
       Apunta al centro de la almohada en coordenadas del stage.

       Almohada: left=355, top=580, width=270
       Centro almohada aprox: x=490, y=670
       Como % del stage 1920×1080: x=25.5%, y=62%
    ══════════════════════════════════════════ */
    zoomer.style.transformOrigin = '25.5% 62%';

    /* ══════════════════════════════════════════
       ENTRADA — el fade lo maneja el CSS
       JS activa la cama tras el fade
    ══════════════════════════════════════════ */
    setTimeout(function () {
        introFade.classList.add('gone');
    }, 300);
    setTimeout(activateBed, 1200);

    /* ══════════════════════════════════════════
       ESTADO 1 — CAMA INTERACTIVA
       Pulsación lenta como una respiración.
    ══════════════════════════════════════════ */
    function activateBed() {
        log('activateBed() llamado, activando cama...');
        state = S.BED;
        lCama.classList.add('breathing');
        hsCama.classList.add('active');
        hsCama.addEventListener('mouseenter', onBedEnter);
        hsCama.addEventListener('mouseleave', onBedLeave);
        hsCama.addEventListener('click',      onBedClick);
    }

    function onBedEnter() {
        if (state === S.BED) lCama.classList.add('hvr');
    }
    function onBedLeave() {
        lCama.classList.remove('hvr');
    }

    /* ── Clic en la cama ── */
    function onBedClick() {
        log('Clic en la cama detectado!');
        if (state !== S.BED) return;
        state = S.ZOOMING;

        /* Desbloquear escritorio en la primera interacción con la cama */
        if (!s3Unlocked) s3Unlocked = true;

        /* Pausar escritorio si estaba activo */
        if (s3Active) {
            s3Active = false;
            hsEscritorio.classList.remove('active');
            lEscritorio.classList.remove('s3-breathing', 'hvr', 's3-stop');
        }

        hsCama.classList.remove('active');
        hsCama.removeEventListener('mouseenter', onBedEnter);
        hsCama.removeEventListener('mouseleave', onBedLeave);
        hsCama.removeEventListener('click',      onBedClick);
        lCama.classList.remove('hvr');

        /* Detener breathing suavemente */
        lCama.classList.remove('breathing');
        lCama.classList.add('stop-anim');

        /* Restaurar transform-origin al de la cama antes de zoom */
        zoomer.style.transformOrigin = '25.5% 62%';

        setTimeout(doZoom, 500);
    }

    /* ══════════════════════════════════════════
       ZOOM CINEMATOGRÁFICO HACIA LA ALMOHADA
    ══════════════════════════════════════════ */
    function doZoom() {
        /* Easing cinematográfico: arranca suave, cruza con fluidez, frena suave.
           cubic-bezier(0.45, 0.05, 0.55, 0.95) — smooth in-out, sin tirones. */
        zoomer.style.transition =
            'transform ' + (ZOOM_DUR_MS / 1000).toFixed(1) + 's cubic-bezier(0.45,0.05,0.55,0.95)';
        void zoomer.offsetWidth; /* force reflow */
        zoomer.style.transform = 'scale(' + ZOOM_SCALE + ')';
        setTimeout(activatePillow, ZOOM_DUR_MS + 200);
    }

    /* ══════════════════════════════════════════
       ESTADO 3 — ALMOHADA INTERACTIVA
    ══════════════════════════════════════════ */
    function activatePillow() {
        state = S.PILLOW;
        zoomer.style.transition = 'none'; /* quitar transición ya terminada */

        lAlmohada.classList.add('glowing');
        hsAlmohada.classList.add('active');
        hsAlmohada.addEventListener('mouseenter', onPillowEnter);
        hsAlmohada.addEventListener('mouseleave', onPillowLeave);
        hsAlmohada.addEventListener('click',      onPillowClick);
    }

    function onPillowEnter() {
        if (state === S.PILLOW) lAlmohada.classList.add('hvr');
    }
    function onPillowLeave() {
        lAlmohada.classList.remove('hvr');
    }

    /* ── Clic en la almohada ── */
    function onPillowClick() {
        if (state !== S.PILLOW) return;
        state = S.FADING;

        hsAlmohada.classList.remove('active');
        hsAlmohada.removeEventListener('mouseenter', onPillowEnter);
        hsAlmohada.removeEventListener('mouseleave', onPillowLeave);
        hsAlmohada.removeEventListener('click',      onPillowClick);
        lAlmohada.classList.remove('hvr', 'glowing');

        /* Fade out orgánico de la almohada */
        lAlmohada.style.opacity = '0';

        /* El remedio siempre estuvo ahí, lo descubrimos */
        setTimeout(function () {
            lRemedio.style.opacity = '1';
        }, 360);

        setTimeout(activateRemedio, 1750);
    }

    /* ══════════════════════════════════════════
       ESTADO 5 — REMEDIO INTERACTIVO (descubierto)
    ══════════════════════════════════════════ */
    function activateRemedio() {
        state = S.REMEDIO;
        lRemedio.classList.add('discovered');
        hsRemedio.classList.add('active');
        hsRemedio.addEventListener('mouseenter', onRemedioEnter);
        hsRemedio.addEventListener('mouseleave', onRemedioLeave);
        hsRemedio.addEventListener('click',      onRemedioClick);
    }

    function onRemedioEnter() {
        if (state === S.REMEDIO) lRemedio.classList.add('hvr');
    }
    function onRemedioLeave() {
        lRemedio.classList.remove('hvr');
    }

    /* ── Clic en el remedio ── */
    function onRemedioClick() {
        if (state !== S.REMEDIO) return;
        state = S.ZOOM_REM;

        hsRemedio.classList.remove('active');
        hsRemedio.removeEventListener('mouseenter', onRemedioEnter);
        hsRemedio.removeEventListener('mouseleave', onRemedioLeave);
        hsRemedio.removeEventListener('click',      onRemedioClick);
        lRemedio.classList.remove('discovered', 'hvr');

        startRemedioApproach();
    }

    /* ════════════════════════════════════════════
       TRANSICIÓN: REMEDIO SE ACERCA A CÁMARA
       Comienza pequeño y de costado (rotado -80°),
       crece hasta el tamaño del GIF mientras se orienta.
       Sin corte visible entre remedio.png y remedio.gif.
    ════════════════════════════════════════════ */
    function startRemedioApproach() {
        var CSS_ROT = 82; /* grados de rotación del remedio acostado en la escena */

        /* Centro del remedio en viewport — getBoundingClientRect() ya incluye la rotación CSS */
        var rect    = lRemedio.getBoundingClientRect();
        var startCX = rect.left + rect.width  / 2;
        var startCY = rect.top  + rect.height / 2;

        /* Aspect ratio natural de Remedio.png */
        var nw     = lRemedio.naturalWidth  || 60;
        var nh     = lRemedio.naturalHeight || 92;
        var aspect = nw / nh;

        /* Tamaño en viewport del elemento SIN rotación (design space × stageScale) */
        var stSc = Math.max(window.innerWidth / 1920, window.innerHeight / 1080);
        var dW   = 60;          /* width en design space */
        var dH   = dW / aspect; /* height proporcional */
        var scrW = dW * stSc;
        var scrH = dH * stSc;

        /* Tamaño destino: igualar exactamente al GIF (88 vh de alto) */
        var vh       = window.innerHeight;
        var targetH  = vh * 0.88;
        var scFactor = targetH / scrH; /* escala total necesaria */

        /* Centro destino = centro del viewport */
        var vw = window.innerWidth;
        var dx = vw / 2 - startCX;
        var dy = vh / 2 - startCY;

        /* Inicializar remedioFg en la misma posición, tamaño y rotación que el remedio */
        remedioFg.style.display  = 'block';
        remedioFg.style.width    = scrW + 'px';
        remedioFg.style.height   = scrH + 'px';
        remedioFg.style.left     = (startCX - scrW / 2) + 'px';
        remedioFg.style.top      = (startCY - scrH / 2) + 'px';
        remedioFg.style.transformOrigin = 'center center';
        remedioFg.style.transform  = 'rotate(' + CSS_ROT + 'deg)';
        remedioFg.style.opacity    = '1';
        remedioFg.style.transition = 'none';

        /* Ocultar el original del stage */
        lRemedio.style.transition = 'none';
        lRemedio.style.opacity    = '0';
        lRemedio.classList.remove('discovered', 'hvr');

        /* GIF: iniciar invisible */
        remedioGif.style.opacity   = '0';
        remedioGif.style.transition = 'none';

        var DUR = 3000;
        var t0  = null;

        function eio(t) { return t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2,3)/2; }

        function frame(ts) {
            if (!t0) t0 = ts;
            var t = Math.min((ts - t0) / DUR, 1);
            var e = eio(t);

            /* Escala: crece de 1 a scFactor (tamaño del GIF) */
            var sc  = 1 + (scFactor - 1) * e;
            /* Posición: se mueve al centro */
            var tx  = dx * e;
            var ty  = dy * e;
            /* Rotación: de CSS_ROT grados a 0 (se orienta mientras se acerca) */
            var rot = CSS_ROT * (1 - e);

            remedioFg.style.transform =
                'translate(' + tx.toFixed(1) + 'px,' + ty.toFixed(1) + 'px)' +
                ' scale(' + sc.toFixed(4) + ')' +
                ' rotate(' + rot.toFixed(2) + 'deg)';

            /* remedio.png se desvanece entre t=0.45 y t=0.80 */
            var fgA = 1 - Math.max(0, Math.min(1, (t - 0.45) / 0.32));
            remedioFg.style.opacity = Math.max(0, fgA).toFixed(3);

            /* remedio.gif aparece entre t=0.52 y t=0.82, continuando el movimiento */
            if (t >= 0.52) {
                var gifA = Math.min(1, (t - 0.52) / 0.28);
                remedioGif.style.opacity = gifA.toFixed(3);
            }

            if (t < 1) {
                requestAnimationFrame(frame);
            } else {
                remedioFg.style.opacity = '0';
                remedioFg.style.display = 'none';
                remedioGif.style.opacity = '1';
                remedioGif.classList.add('visible');
                state = S.GIF;

                setTimeout(function () {
                    returnHint.classList.add('visible');
                }, 3500);

                remedioGif.addEventListener('click', onReturnClick);
            }
        }

        requestAnimationFrame(function () {
            requestAnimationFrame(function () {
                requestAnimationFrame(frame);
            });
        });
    }

    /* ══════════════════════════════════════════
       VOLVER A LA HABITACIÓN
       GIF fade out → zoom back → bed state
    ══════════════════════════════════════════ */
    function onReturnClick() {
        if (state !== S.GIF) return;
        state = S.RETURNING;

        remedioGif.removeEventListener('click', onReturnClick);
        remedioGif.classList.remove('visible');

        /* Ocultar hint */
        returnHint.classList.remove('visible');

        /* 1. Fade out del GIF */
        remedioGif.style.transition = 'opacity 1.0s ease';
        remedioGif.style.opacity    = '0';

        setTimeout(function () {
            /* 2. Mientras el GIF fade: restaurar room elements
               (ocurre mientras el gif aún se ve, invisible al usuario) */
            lRemedio.style.transition = 'none';
            lRemedio.style.opacity    = '0';
            lRemedio.classList.remove('discovered', 'hvr');

            lAlmohada.style.transition = 'none';
            lAlmohada.style.opacity    = '1';
            lAlmohada.classList.remove('glowing', 'hvr');

            remedioFg.style.display = 'none';
            remedioGif.style.pointer = 'none';
            remedioGif.style.transition = 'none';
            remedioGif.style.opacity = '0';

            /* 3. Zoom back out */
            zoomer.style.transition =
                'transform ' + (ZOOM_BACK_MS / 1000).toFixed(1) + 's cubic-bezier(0.16,0.01,0.08,1.0)';
            void zoomer.offsetWidth;
            zoomer.style.transform = 'scale(1)';

            /* 4. Después del zoom back: reactivar la cama */
            setTimeout(function () {
                zoomer.style.transition = 'none';

                lCama.classList.remove('stop-anim');
                void lCama.offsetWidth; /* reset animation */

                activateBed();

                /* Activar/reactivar escritorio si ya fue desbloqueado */
                if (s3Unlocked) {
                    s3Active = true;
                    activateDesk();
                }
            }, ZOOM_BACK_MS + 200);

        }, 600); /* empieza la restauración mientras el gif termina de desvanecerse */
    }

    /* ════════════════════════════════════════════════════════════════
       ESCENA 3 — ESCRITORIO
       activateDesk → click desk → zoom 2.5x → rayo toggle → volver
    ════════════════════════════════════════════════════════════════ */
    function activateDesk() {
        s3Active = true;
        lEscritorio.classList.remove('s3-stop');
        void lEscritorio.offsetWidth;
        lEscritorio.classList.add('s3-breathing');
        hsEscritorio.classList.add('active');
        hsEscritorio.addEventListener('mouseenter', onDeskEnter);
        hsEscritorio.addEventListener('mouseleave', onDeskLeave);
        hsEscritorio.addEventListener('click',      onDeskClick);
    }

    function deactivateDesk() {
        s3Active = false;
        hsEscritorio.classList.remove('active');
        hsEscritorio.removeEventListener('mouseenter', onDeskEnter);
        hsEscritorio.removeEventListener('mouseleave', onDeskLeave);
        hsEscritorio.removeEventListener('click',      onDeskClick);
        lEscritorio.classList.remove('s3-breathing', 'hvr');
        lEscritorio.classList.add('s3-stop');
    }

    function onDeskEnter() { if (s3Active && !s3InDesk) lEscritorio.classList.add('hvr'); }
    function onDeskLeave() { lEscritorio.classList.remove('hvr'); }

    function onDeskClick() {
        if (!s3Active || s3InDesk || state !== S.BED) return;
        s3InDesk = true;

        /* Pausar la cama mientras se interactúa con el escritorio */
        hsCama.classList.remove('active');
        lCama.classList.remove('breathing');
        lCama.classList.add('stop-anim');

        deactivateDesk();

        /* Actualizar origin al escritorio y hacer zoom */
        zoomer.style.transformOrigin = S3_ORIGIN;
        setTimeout(function () {
            zoomer.style.transition =
                'transform ' + (S3_ZOOM_DUR / 1000).toFixed(1) + 's cubic-bezier(0.16,0.01,0.08,1.0)';
            void zoomer.offsetWidth;
            zoomer.style.transform = 'scale(' + S3_ZOOM_SCALE + ')';
            setTimeout(activateReturnClick, S3_ZOOM_DUR + 200);
        }, 400);
    }

    function activateReturnClick() {
        zoomer.style.transition = 'none';
        zoomer.addEventListener('click', onZoomerClickDesk);
        /* Activar cuaderno como clickeable */
        hsCuaderno.classList.add('active');
        hsCuaderno.style.cursor = 'pointer';
        hsCuaderno.addEventListener('click', onCuadernoClick);
        /* Activar celular si ya fue desbloqueado (se detecta via global) */
        if (window._celularUnlocked) {
            lCelular.classList.remove('locked');
            lCelular.classList.add('unlocked');
            hsCelular.classList.add('active');
            hsCelular.style.cursor = 'pointer';
            hsCelular.addEventListener('click', onCelularClick);
        }
        setTimeout(function () {
            if (s3InDesk) returnHint.classList.add('visible');
        }, 5000);
    }

    function onCelularClick(e) {
        e.stopPropagation();
        window.openCelular();
    }


    function onZoomerClickDesk() {
        if (!s3InDesk) return;
        startReturnDesk();
    }

    function startReturnDesk() {
        if (!s3InDesk) return;
        s3InDesk = false;

        zoomer.removeEventListener('click', onZoomerClickDesk);
        returnHint.classList.remove('visible');

        /* Desactivar cuaderno */
        hsCuaderno.classList.remove('active');
        hsCuaderno.removeEventListener('click', onCuadernoClick);

        /* Desactivar celular */
        hsCelular.classList.remove('active');
        hsCelular.removeEventListener('click', onCelularClick);

        /* Zoom back al cuarto */
        zoomer.style.transition =
            'transform ' + (S3_ZOOM_BACK / 1000).toFixed(1) + 's cubic-bezier(0.16,0.01,0.08,1.0)';
        void zoomer.offsetWidth;
        zoomer.style.transform = 'scale(1)';

        setTimeout(function () {
            zoomer.style.transition = 'none';

            /* Reactivar cama y escritorio */
            lCama.classList.remove('stop-anim');
            void lCama.offsetWidth;
            activateBed();
            activateDesk();

            /* Desbloquear y activar biblioteca */
            window.unlockBiblioteca();
            if (typeof window.activateBibliotecaWhenReady === 'function') {
                window.activateBibliotecaWhenReady();
            }
        }, S3_ZOOM_BACK + 200);
    }

    /* Exponer función para activar el celular desde afuera del IIFE */
    window.tryActivateCelular = function () {
        if (!s3InDesk) return;
        lCelular.classList.remove('locked');
        lCelular.classList.add('unlocked');
        hsCelular.classList.add('active');
        hsCelular.style.cursor = 'pointer';
        hsCelular.addEventListener('click', onCelularClick);
    };

    /* ── Coordinación con biblioteca (escena 4) ── */
    window.isBedReady = function () { return state === S.BED; };

    /* Placeholder; la biblioteca IIFE los sobrescribe */
    window.unlockBiblioteca = function () {};

    window.pauseScenes = function () {
        if (state === S.BED) {
            hsCama.classList.remove('active');
            hsCama.removeEventListener('mouseenter', onBedEnter);
            hsCama.removeEventListener('mouseleave', onBedLeave);
            hsCama.removeEventListener('click',      onBedClick);
            lCama.classList.remove('breathing', 'hvr');
            lCama.classList.add('stop-anim');
        }
        if (s3Active) deactivateDesk();
    };

    window.resumeScenes = function () {
        lCama.classList.remove('stop-anim');
        void lCama.offsetWidth;
        activateBed();
        if (s3Unlocked && !s3Active) activateDesk();
        if (typeof window.activateBibliotecaWhenReady === 'function') {
            window.activateBibliotecaWhenReady();
        }
    };

})();

/* ═════════════════════════════════════════
   CUADERNO VIEWER — Lógica independiente
═════════════════════════════════════════ */
(function () {
    'use strict';

    var PAGES = [
        'cuaderno en blanco.png',
        'cuaderno hoja 1.png',
        'cuaderno hoja 2.png',
        'cuaderno hoja 3.png'
    ];
    var FLIP_MS  = 380;   /* duración de cada fase */
    var TOTAL_MS = 820;   /* FLIP_MS * 2 + pequeño gap */

    var pageIdx  = 0;
    var flipping = false;

    var overlay  = document.getElementById('cuaderno-overlay');
    var wrap     = document.getElementById('cuaderno-wrap');
    var cBase    = document.getElementById('c-base');
    var cCurrent = document.getElementById('c-current');
    var cFlip    = document.getElementById('c-flip');
    var cZoneL   = document.getElementById('c-zone-left');
    var cZoneR   = document.getElementById('c-zone-right');
    var cCounter = document.getElementById('c-counter');
    var cClose   = document.getElementById('c-close');

    /* ── Escalar el wrap al viewport ── */
    function scaleWrap() {
        var sc = Math.min(
            window.innerWidth  * 0.92 / 900,
            window.innerHeight * 0.88 / 570
        );
        wrap.style.transform = 'scale(' + sc + ')';
    }
    window.addEventListener('resize', scaleWrap);

    /* ── Actualizar counter ── */
    function updateCounter() {
        cCounter.textContent = (pageIdx + 1) + ' / ' + PAGES.length;
    }

    /* ── Ocultar zonas de click dependiendo del estado ── */
    function updateZones() {
        cZoneL.style.pointerEvents = pageIdx > 0 ? 'auto' : 'none';
        cZoneL.style.opacity       = pageIdx > 0 ? '1' : '0';
        cZoneR.style.pointerEvents = pageIdx < PAGES.length - 1 ? 'auto' : 'none';
        cZoneR.style.opacity       = pageIdx < PAGES.length - 1 ? '1' : '0';
    }

    /* ── Abrir el cuaderno ── */
    window.openCuaderno = function () {
        pageIdx  = 0;
        flipping = false;
        cBase.src    = PAGES[0];
        cCurrent.src = PAGES[0];
        cBase.classList.add('loaded');
        cCurrent.classList.add('loaded');
        wrap.classList.add('ready');
        cFlip.style.display = 'none';
        updateCounter();
        updateZones();
        scaleWrap();
        overlay.classList.add('open');
        requestAnimationFrame(function () {
            overlay.classList.add('visible');
        });
    };

    /* ── Cerrar el cuaderno ── */
    function closeCuaderno() {
        overlay.classList.remove('visible');
        /* Primera vez que se cierra: desbloquear el celular */
        if (typeof window.unlockCelular === 'function') {
            window.unlockCelular();
        }
        setTimeout(function () {
            overlay.classList.remove('open');
            wrap.classList.remove('ready');
            cBase.classList.remove('loaded');
            cCurrent.classList.remove('loaded');
        }, 520);
    }
    cClose.addEventListener('click', closeCuaderno);
    /* Click fuera del wrap = cerrar */
    overlay.addEventListener('click', function (e) {
        if (e.target === overlay) closeCuaderno();
    });

    /* ────────────────────────────────────────────
       FLIP ADELANTE (derecha → izquierda)
       Fase 1: mitad derecha de current colapsa.
       Fase 2: mitad izquierda de next se despliega.
    ──────────────────────────────────────────── */
    function flipForward() {
        if (flipping || pageIdx >= PAGES.length - 1) return;
        flipping = true;

        var curr = PAGES[pageIdx];
        var next = PAGES[pageIdx + 1];

        /* Mostrar página siguiente debajo */
        cBase.src = next;

        /* Fase 1: mitad derecha de current colapsa hacia el lomo */
        setFlip({
            left:    '50%',
            width:   '50%',
            bg:      curr,
            bgPos:   'right center',
            origin:  'left center',
            anim:    'cCollapseRight ' + FLIP_MS + 'ms ease-in forwards'
        });

        /* Fase 2: mitad izquierda de next se despliega desde el lomo */
        setTimeout(function () {
            setFlip({
                left:    '0',
                width:   '50%',
                bg:      next,
                bgPos:   'left center',
                origin:  'right center',
                anim:    'cUnfoldLeft ' + FLIP_MS + 'ms ease-out forwards'
            });
        }, FLIP_MS + 40);

        /* Finalizar */
        setTimeout(function () {
            pageIdx++;
            cCurrent.src = PAGES[pageIdx];
            cFlip.style.display = 'none';
            flipping = false;
            updateCounter();
            updateZones();
        }, TOTAL_MS);
    }

    /* ────────────────────────────────────────────
       FLIP ATRÁS (izquierda → derecha)
       Fase 1: mitad izquierda de current colapsa.
       Fase 2: mitad derecha de prev se despliega.
    ──────────────────────────────────────────── */
    function flipBackward() {
        if (flipping || pageIdx <= 0) return;
        flipping = true;

        var curr = PAGES[pageIdx];
        var prev = PAGES[pageIdx - 1];

        /* Mostrar página anterior debajo */
        cBase.src = prev;

        /* Fase 1: mitad izquierda de current colapsa hacia el lomo */
        setFlip({
            left:    '0',
            width:   '50%',
            bg:      curr,
            bgPos:   'left center',
            origin:  'right center',
            anim:    'cCollapseLeft ' + FLIP_MS + 'ms ease-in forwards'
        });

        /* Fase 2: mitad derecha de prev se despliega desde el lomo */
        setTimeout(function () {
            setFlip({
                left:    '50%',
                width:   '50%',
                bg:      prev,
                bgPos:   'right center',
                origin:  'left center',
                anim:    'cUnfoldRight ' + FLIP_MS + 'ms ease-out forwards'
            });
        }, FLIP_MS + 40);

        /* Finalizar */
        setTimeout(function () {
            pageIdx--;
            cCurrent.src = PAGES[pageIdx];
            cFlip.style.display = 'none';
            flipping = false;
            updateCounter();
            updateZones();
        }, TOTAL_MS);
    }

    /* ── Helper: configurar y mostrar el elemento de flip ── */
    function setFlip(opts) {
        /* Quitar animación primero para que se reinicie */
        cFlip.style.animation  = 'none';
        cFlip.style.display    = 'block';
        cFlip.style.left       = opts.left;
        cFlip.style.width      = opts.width;
        cFlip.style.backgroundImage    = 'url("' + opts.bg.replace(/"/g, '\\"') + '")';
        cFlip.style.backgroundSize     = '200% 100%';
        cFlip.style.backgroundPosition = opts.bgPos;
        cFlip.style.transformOrigin    = opts.origin;
        /* forzar reflow para que la animación se reinicie */
        void cFlip.offsetWidth;
        cFlip.style.animation  = opts.anim;
    }

    /* ── Eventos de zonas ── */
    cZoneR.addEventListener('click', flipForward);
    cZoneL.addEventListener('click', flipBackward);

    /* ── Teclado: flechas ── */
    document.addEventListener('keydown', function (e) {
        if (!overlay.classList.contains('visible')) return;
        if (e.key === 'ArrowRight') flipForward();
        if (e.key === 'ArrowLeft')  flipBackward();
        if (e.key === 'Escape')     closeCuaderno();
    });

})();

/* Conectar hotspot del cuaderno con el viewer */
function onCuadernoClick(e) {
    e.stopPropagation();
    window.openCuaderno();
}

/* ═════════════════════════════════════════
   GALERÍA DEL CELULAR
═════════════════════════════════════════ */
(function () {
    'use strict';

    /* Todas las fotos y videos de la carpeta FOTOS SUICI */
    var MEDIA = [
        { type: 'img', src: 'FOTOS SUICI/468638320_10161810780826049_5633287581940819252_n.jpg' },
        { type: 'img', src: 'FOTOS SUICI/Imagen de WhatsApp 2023-11-11 a las 09.53.42_8de7401f.jpg' },
        { type: 'img', src: 'FOTOS SUICI/RENI.jpg' },
        { type: 'img', src: 'FOTOS SUICI/c6043c2a-d7f4-4e0c-af51-05f86bec3bc9.jpg' },
        { type: 'img', src: 'FOTOS SUICI/IMG_0771.JPEG' },
        { type: 'img', src: 'FOTOS SUICI/IMG_3229.JPEG' },
        { type: 'img', src: 'FOTOS SUICI/IMG_2016.JPG' },
        { type: 'img', src: 'FOTOS SUICI/_MG_1057.JPG' },
        { type: 'img', src: 'FOTOS SUICI/_MG_1105.JPG' },
        { type: 'img', src: 'FOTOS SUICI/_MG_1181.JPG' },
        { type: 'img', src: 'FOTOS SUICI/_MG_1897.JPG' },
        { type: 'img', src: 'FOTOS SUICI/_MG_1898.JPG' },
        { type: 'img', src: 'FOTOS SUICI/_MG_1922.JPG' },
        { type: 'img', src: 'FOTOS SUICI/_MG_1926.JPG' },
        { type: 'img', src: 'FOTOS SUICI/_MG_2028.JPG' },
        { type: 'img', src: 'FOTOS SUICI/_MG_2042.JPG' },
        { type: 'vid', src: 'FOTOS SUICI/MVI_1559.MP4', thumb: null },
        { type: 'vid', src: 'FOTOS SUICI/MVI_1597.MP4', thumb: null },
        { type: 'vid', src: 'FOTOS SUICI/MVI_1603.MP4', thumb: null },
    ];

    var viewerIdx = 0;

    window.openGaleria = function () {
        var screen = document.getElementById('phone-screen');
        /* Limpiar y construir gallery-app si no existe aún */
        var existing = document.getElementById('gallery-app');
        if (!existing) buildGalleryApp();
        var app = document.getElementById('gallery-app');
        /* Ocultar msg-app si existe */
        var msgApp = document.getElementById('msg-app');
        if (msgApp) msgApp.style.display = 'none';
        /* Asegurar que está en el screen */
        if (!app.parentNode || app.parentNode !== screen) screen.appendChild(app);
        app.classList.add('open');
        /* Asegurar que el viewer está cerrado */
        var viewer = document.getElementById('gallery-viewer');
        if (viewer) viewer.classList.remove('open');
    };

    function buildGalleryApp() {
        var screen = document.getElementById('phone-screen');

        var app = document.createElement('div');
        app.id = 'gallery-app';
        screen.appendChild(app);

        /* Header */
        var hdr = document.createElement('div');
        hdr.id = 'gallery-hdr';
        hdr.innerHTML =
            '<span id="gallery-back">‹</span>' +
            '<span id="gallery-title">galería</span>';
        app.appendChild(hdr);

        document.getElementById('gallery-back').addEventListener('click', function (e) {
            e.stopPropagation();
            closeGalleryApp();
        });

        /* Grid wrap */
        var gridWrap = document.createElement('div');
        gridWrap.id = 'gallery-grid-wrap';
        app.appendChild(gridWrap);

        var grid = document.createElement('div');
        grid.className = 'gallery-grid';
        gridWrap.appendChild(grid);

        MEDIA.forEach(function (m, i) {
            var thumb = document.createElement('div');
            thumb.className = 'gallery-thumb';

            if (m.type === 'img') {
                var img = document.createElement('img');
                img.src = m.src;
                img.loading = 'lazy';
                img.alt = '';
                thumb.appendChild(img);
            } else {
                /* Video thumbnail — generamos via canvas */
                var vEl = document.createElement('video');
                vEl.src = m.src;
                vEl.preload = 'metadata';
                vEl.muted = true;
                vEl.style.cssText = 'display:none';
                thumb.appendChild(vEl);

                var canvas = document.createElement('canvas');
                canvas.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;background:#111;';
                canvas.width = 80; canvas.height = 80;
                thumb.appendChild(canvas);

                vEl.addEventListener('loadeddata', function () {
                    vEl.currentTime = Math.min(1, vEl.duration * 0.1);
                });
                vEl.addEventListener('seeked', function () {
                    var ctx = canvas.getContext('2d');
                    ctx.drawImage(vEl, 0, 0, 80, 80);
                    /* Si falla dibujamos fondo oscuro - ya está */
                });

                /* Badge de video */
                var badge = document.createElement('div');
                badge.className = 'vid-badge';
                badge.textContent = '▶ VID';
                thumb.appendChild(badge);
            }

            thumb.addEventListener('click', (function (idx) {
                return function () { openViewer(idx); };
            })(i));

            grid.appendChild(thumb);
        });

        /* Viewer */
        var viewer = document.createElement('div');
        viewer.id = 'gallery-viewer';
        app.appendChild(viewer);

        var vHdr = document.createElement('div');
        vHdr.id = 'viewer-hdr';
        vHdr.innerHTML =
            '<span id="viewer-back">✕</span>' +
            '<span id="viewer-counter">1 / ' + MEDIA.length + '</span>';
        viewer.appendChild(vHdr);

        document.getElementById('viewer-back').addEventListener('click', function (e) {
            e.stopPropagation();
            closeViewer();
        });

        var vMedia = document.createElement('div');
        vMedia.id = 'viewer-media';
        viewer.appendChild(vMedia);

        var vImg = document.createElement('img');
        vImg.id = 'viewer-img';
        vImg.alt = '';
        vMedia.appendChild(vImg);

        var vVid = document.createElement('video');
        vVid.id = 'viewer-vid';
        vVid.controls = true;
        vVid.playsinline = true;
        vMedia.appendChild(vVid);

        var prevBtn = document.createElement('button');
        prevBtn.id = 'viewer-prev';
        prevBtn.className = 'viewer-arrow';
        prevBtn.textContent = '‹';
        prevBtn.addEventListener('click', function (e) { e.stopPropagation(); navViewer(-1); });
        vMedia.appendChild(prevBtn);

        var nextBtn = document.createElement('button');
        nextBtn.id = 'viewer-next';
        nextBtn.className = 'viewer-arrow';
        nextBtn.textContent = '›';
        nextBtn.addEventListener('click', function (e) { e.stopPropagation(); navViewer(1); });
        vMedia.appendChild(nextBtn);
    }

    function openViewer(idx) {
        viewerIdx = idx;
        var viewer = document.getElementById('gallery-viewer');
        showViewerMedia();
        viewer.classList.add('open');
    }

    function closeViewer() {
        var viewer  = document.getElementById('gallery-viewer');
        var vVid    = document.getElementById('viewer-vid');
        if (vVid) { vVid.pause(); vVid.src = ''; }
        viewer.classList.remove('open');
    }

    function navViewer(dir) {
        viewerIdx = (viewerIdx + dir + MEDIA.length) % MEDIA.length;
        showViewerMedia();
    }

    function showViewerMedia() {
        var m       = MEDIA[viewerIdx];
        var vImg    = document.getElementById('viewer-img');
        var vVid    = document.getElementById('viewer-vid');
        var counter = document.getElementById('viewer-counter');
        var prevBtn = document.getElementById('viewer-prev');
        var nextBtn = document.getElementById('viewer-next');

        counter.textContent = (viewerIdx + 1) + ' / ' + MEDIA.length;
        prevBtn.style.display = MEDIA.length > 1 ? 'block' : 'none';
        nextBtn.style.display = MEDIA.length > 1 ? 'block' : 'none';

        if (m.type === 'img') {
            vVid.pause();
            vVid.src = '';
            vVid.style.display = 'none';
            vImg.style.display = 'block';
            vImg.src = m.src;
        } else {
            vImg.style.display = 'none';
            vImg.src = '';
            vVid.style.display = 'block';
            vVid.src = m.src;
            vVid.load();
        }
    }

    function closeGalleryApp() {
        var app = document.getElementById('gallery-app');
        if (app) app.classList.remove('open');
        /* Volver a la home del celular */
        var homeScreen = document.getElementById('phone-home-screen');
        var msgApp = document.getElementById('msg-app');
        if (homeScreen) homeScreen.style.display = 'flex';
        if (msgApp) msgApp.style.display = 'none';
    }

})();

/* ═════════════════════════════════════════
   CELULAR — Mensajería ficticia
═════════════════════════════════════════ */
(function () {
    'use strict';

    /* ── Conversaciones ────────────────────────────────────── */
    var CONTACTS = [
        {
            id: 'feli', name: 'Feli ☻',
            preview: 'estás?', time: '18:42',
            bg: '#2c1200', accent: '#c4813a',
            msgs: [
                { me: true,  t: '18:31', text: 'felipe' },
                { me: false, t: '18:32', text: 'q onda' },
                { me: true,  t: '18:33', text: 'estás haciendo algo?' },
                { me: false, t: '18:35', text: 'si, estoy afuera' },
                { me: true,  t: '18:35', text: 'ahh' },
                { me: false, t: '18:36', text: 'por?' },
                { me: true,  t: '18:37', text: 'quería preguntarte algo' },
                { me: false, t: '18:37', text: 'decime' },
                { me: true,  t: '18:39', text: 'después mejor' },
                { me: false, t: '18:40', text: 'jajaj bueno' },
                { me: false, t: '18:42', text: 'mañana estoy por el centro igual' },
                { me: true,  t: '18:42', text: 'dale' },
            ]
        },
        {
            id: 'adri', name: 'Adri',
            preview: 'después te escribo', time: '17:16',
            bg: '#061828', accent: '#4a7aaa',
            msgs: [
                { me: true,  t: '17:02', text: 'adri' },
                { me: false, t: '17:04', text: 'qué pasó' },
                { me: true,  t: '17:05', text: 'hablaste con mamá?' },
                { me: false, t: '17:06', text: 'hoy no' },
                { me: true,  t: '17:07', text: 'ah' },
                { me: false, t: '17:07', text: 'por?' },
                { me: true,  t: '17:08', text: 'nada' },
                { me: false, t: '17:09', text: 'llamala vos' },
                { me: true,  t: '17:10', text: 'ya fue' },
                { me: false, t: '17:14', text: 'estoy por entrar a laburar' },
                { me: true,  t: '17:15', text: 'dale' },
                { me: false, t: '17:16', text: 'después te escribo' },
            ]
        },
        {
            id: 'meli', name: 'Meli ♥',
            preview: 'qué te pasa?', time: '15:03',
            bg: '#220a18', accent: '#a04878',
            msgs: [
                { me: false, t: '10:12', text: 'cómo estás' },
                { me: true,  t: '10:18', text: 'bien' },
                { me: true,  t: '10:18', text: 'estuve pensando en la abuela' },
                { me: false, t: '10:19', text: 'ah' },
                { me: false, t: '10:19', text: 'por qué?' },
                { me: true,  t: '10:21', text: 'no sé' },
                { me: true,  t: '10:22', text: 'soñé con ella' },
                { me: false, t: '10:23', text: 'hace cuánto fue?' },
                { me: true,  t: '10:25', text: 'dos años en agosto' },
                { me: false, t: '10:25', text: 'sí' },
                { me: true,  t: '10:28', text: 'era la única que me entendía de verdad' },
                { me: true,  t: '10:28', text: 'sin preguntar nada' },
                { me: false, t: '10:29', text: 'lo sé' },
                { me: false, t: '10:30', text: 'se notaba cuando estaban juntas' },
                { me: true,  t: '10:32', text: 'me acuerdo que le contaba todo' },
                { me: true,  t: '10:33', text: 'y ella no me juzgaba' },
                { me: true,  t: '10:33', text: 'solo me miraba y me decía que iba a estar bien' },
                { me: false, t: '10:35', text: 'qué hermoso' },
                { me: true,  t: '10:37', text: 'la extraño mucho' },
                { me: false, t: '10:38', text: 'lo sé' },
                { me: false, t: '10:38', text: 'yo también' },
                { me: false, t: '14:41', text: 'che mañana vas?' },
                { me: true,  t: '14:43', text: 'a dónde' },
                { me: false, t: '14:43', text: 'jajajaj' },
                { me: false, t: '14:44', text: 'al cumple de lau' },
                { me: true,  t: '14:48', text: 'ahhh' },
                { me: true,  t: '14:48', text: 'no sé' },
                { me: false, t: '14:49', text: 'dale vení' },
                { me: false, t: '14:49', text: 'va a estar bueno' },
                { me: true,  t: '14:52', text: 'vemos' },
                { me: false, t: '15:00', text: 'qué te pasa?' },
                { me: true,  t: '15:01', text: 'nada' },
                { me: false, t: '15:01', text: 'mmm' },
                { me: false, t: '15:01', text: 'te conozco' },
                { me: true,  t: '15:02', text: 'después te cuento' },
                { me: false, t: '15:02', text: 'bueno' },
                { me: false, t: '15:03', text: 'pero vení mañana' },
            ]
        },
        {
            id: 'santi', name: 'Santi ♥',
            preview: 'vos también', time: '12:27',
            bg: '#180f00', accent: '#8a7030',
            msgs: [
                { me: false, t: '12:08', text: 'ya comiste?' },
                { me: true,  t: '12:09', text: 'nop' },
                { me: false, t: '12:09', text: 'otra vez?' },
                { me: true,  t: '12:11', text: 'no tengo ganas' },
                { me: false, t: '12:12', text: 'te llevo algo' },
                { me: true,  t: '12:13', text: 'no' },
                { me: false, t: '12:13', text: 'dale' },
                { me: true,  t: '12:14', text: 'en serio no' },
                { me: false, t: '12:14', text: 'bueno' },
                { me: false, t: '12:18', text: 'mañana paso temprano' },
                { me: true,  t: '12:20', text: 'tan temprano?' },
                { me: false, t: '12:21', text: '8 y pico' },
                { me: true,  t: '12:22', text: 'no seas malo' },
                { me: false, t: '12:23', text: 'jajaj' },
                { me: true,  t: '12:26', text: 'dormí' },
                { me: false, t: '12:27', text: 'vos también' },
            ]
        },
    ];

    /* ── Chats viejos sin responder ─────────────────────────── */
    var OLD_CHATS = [
        {
            id: 'lau', name: 'Lau',
            preview: 'che al final conseguiste lo de la facu?',
            date: '18 sept.',
            bg: '#1a1a2a', accent: '#7070aa',
            msgs: [
                { me: true,  t: '10:14', text: 'lau te mando el apunte esta tarde' },
                { me: false, t: '10:16', text: 'dale gracias' },
                { me: false, t: '18:02', text: 'che al final conseguiste lo de la facu?' },
            ]
        },
        {
            id: 'mama', name: 'Mamá',
            preview: 'avisame cuando llegues',
            date: '16 sept.',
            bg: '#1a1210', accent: '#886655',
            msgs: [
                { me: false, t: '20:41', text: 'comí algo?' },
                { me: true,  t: '21:02', text: 'si' },
                { me: false, t: '21:03', text: 'avisame cuando llegues' },
            ]
        },
        {
            id: 'prece', name: 'Gaby (preceptora)',
            preview: 'profe los del 3C no tienen aula mañana',
            date: '12 sept.',
            bg: '#0e1818', accent: '#448877',
            msgs: [
                { me: false, t: '14:03', text: 'profe los del 3C no tienen aula mañana' },
                { me: false, t: '14:04', text: 'los mando a biblioteca?' },
            ]
        },
        {
            id: 'colega', name: 'Marcelo (profe)',
            preview: 'te mandé el cronograma del trimestre',
            date: '10 sept.',
            bg: '#181420', accent: '#776688',
            msgs: [
                { me: false, t: '20:15', text: 'profe te mandé el cronograma del trimestre' },
                { me: false, t: '20:15', text: 'fijate si está bien o lo corrijo' },
            ]
        },
        {
            id: 'prece2', name: 'Escuela',
            preview: 'las actas de agosto todavía no están',
            date: '6 sept.',
            bg: '#101818', accent: '#448866',
            msgs: [
                { me: false, t: '11:00', text: 'buen día profe' },
                { me: false, t: '11:01', text: 'las actas de agosto todavía no están cargadas' },
                { me: false, t: '11:01', text: 'cuando pueda las sube' },
            ]
        },
        {
            id: 'tio', name: 'Tío Claudio',
            preview: 'hace rato que no te veo',
            date: '28 ago.',
            bg: '#141a10', accent: '#558844',
            msgs: [
                { me: false, t: '18:00', text: 'cuándo nos juntamos' },
                { me: false, t: '18:00', text: 'hace rato que no te veo' },
            ]
        },
    ];

    /* ── SVG avatares abstractos ────────────────────────────── */
    function avatarSVG(c) {
        var a = c.accent, b = c.bg;
        if (c.id === 'feli') return '<svg viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg"><circle cx="18" cy="18" r="18" fill="' + b + '"/><circle cx="18" cy="18" r="11" fill="none" stroke="' + a + '" stroke-width="1" opacity="0.6"/><path d="M12 20 Q18 25 24 20" stroke="' + a + '" stroke-width="1.4" fill="none" stroke-linecap="round"/><circle cx="14" cy="16" r="1.1" fill="' + a + '" opacity="0.85"/><circle cx="22" cy="16" r="1.1" fill="' + a + '" opacity="0.85"/></svg>';
        if (c.id === 'adri') return '<svg viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg"><circle cx="18" cy="18" r="18" fill="' + b + '"/><line x1="10" y1="15" x2="26" y2="15" stroke="' + a + '" stroke-width="1.4" stroke-linecap="round" opacity="0.85"/><line x1="10" y1="21" x2="26" y2="21" stroke="' + a + '" stroke-width="1.4" stroke-linecap="round" opacity="0.45"/></svg>';
        if (c.id === 'meli') return '<svg viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg"><circle cx="18" cy="18" r="18" fill="' + b + '"/><path d="M18 25 L10.5 17 Q9.5 11.5 14 11.5 Q16 11.5 18 14.5 Q20 11.5 22 11.5 Q26.5 11.5 25.5 17 Z" stroke="' + a + '" stroke-width="1.2" fill="none" stroke-linejoin="round" opacity="0.88"/></svg>';
        if (c.id === 'santi') return '<svg viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg"><circle cx="18" cy="18" r="18" fill="' + b + '"/><path d="M21 10 A9.5 9.5 0 1 0 21 26 A7 7 0 1 1 21 10" fill="' + a + '" opacity="0.72"/></svg>';
        return '<svg viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg"><circle cx="18" cy="18" r="18" fill="' + b + '"/></svg>';
    }

    /* ── Avatar genérico para chats viejos (círculo simple) ── */
    function oldAvatarSVG(c) {
        return '<svg viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg"><circle cx="18" cy="18" r="18" fill="' + c.bg + '"/><circle cx="18" cy="18" r="9" fill="none" stroke="' + c.accent + '" stroke-width="1" opacity="0.5"/></svg>';
    }

    /* ── Construir la app ────────────────────────────────────── */
    function buildApp() {
        var screen = document.getElementById('phone-screen');

        /* Ocultar home si existe (no destruirla, para poder volver) */
        var home = document.getElementById('phone-home-screen');
        if (home) home.style.display = 'none';

        /* Si msg-app ya existe, solo mostrarla y resetear a la lista */
        var existing = document.getElementById('msg-app');
        if (existing) {
            existing.style.display = 'flex';
            var chatView = document.getElementById('msg-chat-view');
            var listView = document.getElementById('msg-list-view');
            if (chatView) chatView.classList.add('hidden');
            if (listView) listView.classList.remove('hidden');
            return;
        }

        var app = document.createElement('div');
        app.id = 'msg-app';
        screen.appendChild(app);

        /* ---- Vista lista ---- */
        var listView = document.createElement('div');
        listView.id = 'msg-list-view';
        listView.className = 'msg-view';
        app.appendChild(listView);

        var listHdr = document.createElement('div');
        listHdr.className = 'msg-hdr';
        listHdr.innerHTML =
            '<span id="msg-home-back" style="font-family:Georgia,serif;font-size:16px;color:rgba(175,135,255,0.75);cursor:pointer;padding-right:6px;user-select:none;line-height:1;">‹</span>' +
            '<span style="font-family:Georgia,serif;font-size:9px;letter-spacing:0.18em;color:rgba(255,242,228,0.45);">mensajes</span>';
        listView.appendChild(listHdr);

        document.getElementById('msg-home-back').addEventListener('click', function (e) {
            e.stopPropagation();
            backToHome();
        });

        function backToHome() {
            var app = document.getElementById('msg-app');
            if (app) app.style.display = 'none';
            var homeScreen = document.getElementById('phone-home-screen');
            if (homeScreen) homeScreen.style.display = 'flex';
        }

        var list = document.createElement('div');
        list.className = 'msg-list';
        listView.appendChild(list);

        /* Contactos principales */
        CONTACTS.forEach(function (c) {
            var item = document.createElement('div');
            item.className = 'msg-item';
            item.innerHTML =
                '<div class="msg-av">' + avatarSVG(c) + '</div>' +
                '<div class="msg-item-info">' +
                    '<div class="msg-item-top">' +
                        '<span class="msg-item-name">' + c.name + '</span>' +
                        '<span class="msg-item-time">' + c.time + '</span>' +
                    '</div>' +
                    '<div class="msg-item-preview">' + c.preview + '</div>' +
                '</div>';
            item.addEventListener('click', function () { openChat(c); });
            list.appendChild(item);
        });

        /* Separador — chats viejos */
        var sep = document.createElement('div');
        sep.style.cssText = [
            'padding:8px 10px 5px;',
            'font-family:Georgia,serif;',
            'font-size:7.5px;',
            'letter-spacing:0.20em;',
            'color:rgba(255,242,228,0.22);',
            'border-top:1px solid rgba(255,255,255,0.05);',
            'margin-top:4px;',
            'user-select:none;',
        ].join('');
        sep.textContent = 'anteriores';
        list.appendChild(sep);

        /* Chats viejos sin responder */
        OLD_CHATS.forEach(function (c) {
            var item = document.createElement('div');
            item.className = 'msg-item';
            item.style.opacity = '0.55';
            item.innerHTML =
                '<div class="msg-av" style="width:30px;height:30px;">' + oldAvatarSVG(c) + '</div>' +
                '<div class="msg-item-info">' +
                    '<div class="msg-item-top">' +
                        '<span class="msg-item-name" style="font-size:9px;">' + c.name + '</span>' +
                        '<span class="msg-item-time" style="color:rgba(175,135,255,0.35);">' + c.date + '</span>' +
                    '</div>' +
                    '<div class="msg-item-preview" style="color:rgba(255,242,228,0.28);font-style:italic;">' + c.preview + '</div>' +
                '</div>';
            item.addEventListener('click', function () { openOldChat(c); });
            list.appendChild(item);
        });

        /* ---- Vista chat ---- */
        var chatView = document.createElement('div');
        chatView.id = 'msg-chat-view';
        chatView.className = 'msg-view hidden';
        app.appendChild(chatView);

        var chatHdr = document.createElement('div');
        chatHdr.id = 'msg-chat-hdr';
        chatHdr.className = 'msg-chat-hdr';
        chatView.appendChild(chatHdr);

        var bubbles = document.createElement('div');
        bubbles.id = 'msg-bubbles';
        bubbles.className = 'msg-bubbles';
        chatView.appendChild(bubbles);
    }

    /* ── Abrir un chat ────────────────────────────────────── */
    function openChat(c) {
        var listView = document.getElementById('msg-list-view');
        var chatView = document.getElementById('msg-chat-view');
        var chatHdr  = document.getElementById('msg-chat-hdr');
        var bubbles  = document.getElementById('msg-bubbles');

        /* Header del chat */
        chatHdr.innerHTML =
            '<span class="msg-back" id="msg-back-btn">‹</span>' +
            '<div class="msg-av-sm">' + avatarSVG(c) + '</div>' +
            '<span class="msg-chat-name">' + c.name + '</span>';

        document.getElementById('msg-back-btn').addEventListener('click', function (e) {
            e.stopPropagation();
            closeChat();
        });

        /* Mensajes */
        bubbles.innerHTML = '';
        c.msgs.forEach(function (m) {
            var row = document.createElement('div');
            row.className = 'msg-row ' + (m.me ? 'me' : 'them');
            var bubble = document.createElement('div');
            bubble.className = 'msg-bubble ' + (m.me ? 'me' : 'them');
            bubble.innerHTML =
                '<span class="msg-btext">' + m.text + '</span>' +
                '<span class="msg-btime">' + m.t + '</span>';
            row.appendChild(bubble);
            bubbles.appendChild(row);
        });

        /* Scroll al final */
        setTimeout(function () { bubbles.scrollTop = bubbles.scrollHeight; }, 20);

        /* Transición */
        listView.classList.add('hidden');
        chatView.classList.remove('hidden');
    }

    function closeChat() {
        document.getElementById('msg-chat-view').classList.add('hidden');
        document.getElementById('msg-list-view').classList.remove('hidden');
    }

    /* ── Abrir chat viejo (solo el último mensaje, fecha, sin respuesta) ── */
    function openOldChat(c) {
        var listView = document.getElementById('msg-list-view');
        var chatView = document.getElementById('msg-chat-view');
        var chatHdr  = document.getElementById('msg-chat-hdr');
        var bubbles  = document.getElementById('msg-bubbles');

        chatHdr.innerHTML =
            '<span class="msg-back" id="msg-back-btn">‹</span>' +
            '<div class="msg-av-sm" style="opacity:0.55;">' + oldAvatarSVG(c) + '</div>' +
            '<span class="msg-chat-name" style="opacity:0.65;">' + c.name + '</span>' +
            '<span style="margin-left:auto;font-family:-apple-system,sans-serif;font-size:7px;color:rgba(175,135,255,0.35);">' + c.date + '</span>';

        document.getElementById('msg-back-btn').addEventListener('click', function (e) {
            e.stopPropagation();
            closeChat();
        });

        bubbles.innerHTML = '';

        /* Fecha como separador */
        var dateSep = document.createElement('div');
        dateSep.style.cssText = 'text-align:center;font-family:-apple-system,sans-serif;font-size:7px;color:rgba(175,135,255,0.30);margin:8px 0 10px;letter-spacing:0.10em;';
        dateSep.textContent = c.date;
        bubbles.appendChild(dateSep);

        /* Mensajes */
        c.msgs.forEach(function (m) {
            var row = document.createElement('div');
            row.className = 'msg-row ' + (m.me ? 'me' : 'them');
            var bubble = document.createElement('div');
            bubble.className = 'msg-bubble ' + (m.me ? 'me' : 'them');
            bubble.style.opacity = '0.65';
            bubble.innerHTML =
                '<span class="msg-btext">' + m.text + '</span>' +
                '<span class="msg-btime">' + m.t + '</span>';
            row.appendChild(bubble);
            bubbles.appendChild(row);
        });

        /* Nota — sin respuesta */
        var note = document.createElement('div');
        note.style.cssText = 'text-align:center;font-family:Georgia,serif;font-style:italic;font-size:7.5px;color:rgba(255,242,228,0.18);margin-top:18px;letter-spacing:0.08em;';
        note.textContent = 'sin responder';
        bubbles.appendChild(note);

        setTimeout(function () { bubbles.scrollTop = bubbles.scrollHeight; }, 20);

        listView.classList.add('hidden');
        chatView.classList.remove('hidden');
    }

    /* ── Abrir / cerrar overlay ────────────────────────────── */
    var overlay = document.getElementById('celular-overlay');
    var closeBtn = document.getElementById('celular-close');

    window.openCelular = function () {
        /* Mostrar la home screen del celular */
        buildHomeScreen();
        overlay.classList.add('open');
        requestAnimationFrame(function () { overlay.classList.add('visible'); });
    };

    function buildHomeScreen() {
        var screen = document.getElementById('phone-screen');

        /* Ocultar apps abiertas sin destruirlas */
        var oldMsg = document.getElementById('msg-app');
        if (oldMsg) oldMsg.style.display = 'none';
        var oldGallery = document.getElementById('gallery-app');
        if (oldGallery) oldGallery.classList.remove('open');

        /* Si ya existe la home, solo mostrarla */
        var existingHome = document.getElementById('phone-home-screen');
        if (existingHome) {
            existingHome.style.display = 'flex';
            return;
        }

        /* Home screen — primera vez */
        var home = document.createElement('div');
        home.id = 'phone-home-screen';
        screen.appendChild(home);

        /* Fecha en la pantalla */
        var dateEl = document.createElement('div');
        dateEl.style.cssText = 'font-family:Georgia,serif;font-size:8px;letter-spacing:0.18em;color:rgba(255,242,228,0.28);margin-bottom:14px;margin-top:4px;';
        var now = new Date();
        var days = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];
        var months = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
        dateEl.textContent = days[now.getDay()] + ', ' + now.getDate() + ' de ' + months[now.getMonth()];
        home.appendChild(dateEl);

        /* Grid de apps */
        var grid = document.createElement('div');
        grid.className = 'phone-app-grid';
        home.appendChild(grid);

        /* App: Mensajes */
        var msgIcon = document.createElement('div');
        msgIcon.className = 'phone-app-icon';
        msgIcon.innerHTML =
            '<div class="phone-app-icon-img" style="background:linear-gradient(135deg,#1e0a42,#3a0f80);">💬</div>' +
            '<span class="phone-app-icon-label">mensajes</span>';
        msgIcon.addEventListener('click', function (e) {
            e.stopPropagation();
            home.style.display = 'none';
            buildApp();
        });
        grid.appendChild(msgIcon);

        /* App: Galería */
        var galIcon = document.createElement('div');
        galIcon.className = 'phone-app-icon';
        galIcon.innerHTML =
            '<div class="phone-app-icon-img" style="background:linear-gradient(135deg,#0a2a1a,#1a5e38);">🖼️</div>' +
            '<span class="phone-app-icon-label">galería</span>';
        galIcon.addEventListener('click', function (e) {
            e.stopPropagation();
            home.style.display = 'none';
            window.openGaleria();
        });
        grid.appendChild(galIcon);
    }

    function closeCelular() {
        overlay.classList.remove('visible');
        setTimeout(function () { overlay.classList.remove('open'); }, 480);
    }
    closeBtn.addEventListener('click', function (e) { e.stopPropagation(); closeCelular(); });
    overlay.addEventListener('click', function (e) { if (e.target === overlay) closeCelular(); });

    /* ── Desbloquear (lo llama el cuaderno al cerrarse) ────────── */
    window.unlockCelular = function () {
        var lCelular = document.getElementById('l-celular');
        if (lCelular) { lCelular.classList.remove('locked'); lCelular.classList.add('unlocked'); }
        window._celularUnlocked = true;
        if (typeof window.tryActivateCelular === 'function') window.tryActivateCelular();
    };

})();

/* ═════════════════════════════════════════
   BIBLIOTECA — Escena 4
   Flujo: habitación → click biblioteca → zoom in →
          click libro → tapa → abierto + info → tapa trasera → cerrar
═════════════════════════════════════════ */
(function () {
    'use strict';

    var lBiblioteca  = document.getElementById('l-biblioteca');
    var lLibros      = document.getElementById('l-libros');
    var hsBiblioteca = document.getElementById('hs-biblioteca');
    var hsBook1      = document.getElementById('hs-book-1');
    var zoomer       = document.getElementById('s2-zoomer');

    /* El overlay del libro está después del </script> en el DOM;
       se inicializa tras DOMContentLoaded para que exista cuando se usa. */
    var libroOverlay, libroTapa, libroAbWrap, libroPageW, libroInfo, libroTrasera, libroHint, libroClose;

    window.addEventListener('DOMContentLoaded', function () {
        libroOverlay = document.getElementById('libro-overlay');
        libroTapa    = document.getElementById('libro-tapa');
        libroAbWrap  = document.getElementById('libro-abierto-wrap');
        libroPageW   = document.getElementById('libro-page-wash');
        libroInfo    = document.getElementById('libro-info');
        libroTrasera = document.getElementById('libro-trasera');
        libroHint    = document.getElementById('libro-hint');
        libroClose   = document.getElementById('libro-close');
    });

    /* ── Estado ── */
    var s4Unlocked = false;
    var s4Active   = false;
    var s4InLib    = false;

    var LBOOK = { NONE: 0, TAPA: 1, ABIERTO: 2, TRASERA: 3 };
    var lbState = LBOOK.NONE;

    var S4_ZOOM_SCALE = 2.6;
    var S4_ZOOM_DUR   = 3000;
    var S4_ZOOM_BACK  = 2600;

    /* — Calcula transform-origin apuntando al centro exacto de la biblioteca —
       Un scale() puro desde ese punto crea un zoom directo hacia los estantes
       (avance de cámara), sin barrido ni efecto panorámico lateral. */
    function computeLibOrigin() {
        var stSc     = Math.max(window.innerWidth / 1920, window.innerHeight / 1080);
        var rect     = lBiblioteca.getBoundingClientRect();
        var screenCX = rect.left + rect.width  / 2;
        var screenCY = rect.top  + rect.height / 2;
        /* Convertir pantalla → coordenadas de diseño del zoomer (0–1920, 0–1080) */
        var cx = 960 + (screenCX - window.innerWidth  / 2) / stSc;
        var cy = 540 + (screenCY - window.innerHeight / 2) / stSc;
        return (cx / 1920 * 100).toFixed(2) + '% ' + (cy / 1080 * 100).toFixed(2) + '%';
    }

    /* ── Exponer funciones globales ── */
    window.unlockBiblioteca = function () {
        s4Unlocked = true;
    };

    window.activateBibliotecaWhenReady = function () {
        if (!s4Unlocked || s4Active) return;
        s4Active = true;
        activateLib();
    };

    /* ══════════════════════════════════════════
       BIBLIOTECA INTERACTIVA — breathing
    ══════════════════════════════════════════ */
    function activateLib() {
        lBiblioteca.classList.remove('b-stop');
        void lBiblioteca.offsetWidth;
        lBiblioteca.classList.add('b-breathing');
        lLibros.classList.remove('b-stop');
        void lLibros.offsetWidth;
        lLibros.classList.add('b-breathing');
        hsBiblioteca.classList.add('active');
        hsBiblioteca.addEventListener('mouseenter', onLibEnter);
        hsBiblioteca.addEventListener('mouseleave', onLibLeave);
        hsBiblioteca.addEventListener('click',      onLibClick);
    }

    function deactivateLib() {
        s4Active = false;
        hsBiblioteca.classList.remove('active');
        hsBiblioteca.removeEventListener('mouseenter', onLibEnter);
        hsBiblioteca.removeEventListener('mouseleave', onLibLeave);
        hsBiblioteca.removeEventListener('click',      onLibClick);
        lBiblioteca.classList.remove('b-breathing', 'b-hvr');
        lBiblioteca.classList.add('b-stop');
        lLibros.classList.remove('b-breathing');
        lLibros.classList.add('b-stop');
    }

    function onLibEnter() {
        if (s4Active && !s4InLib) lBiblioteca.classList.add('b-hvr');
    }
    function onLibLeave() { lBiblioteca.classList.remove('b-hvr'); }

    /* ── Click en la biblioteca ── */
    function onLibClick() {
        if (!s4Active || s4InLib) return;
        /* Solo permitir si la cama está en estado base (no en medio de animación) */
        if (typeof window.isBedReady === 'function' && !window.isBedReady()) return;
        s4InLib = true;

        deactivateLib();
        if (typeof window.pauseScenes === 'function') window.pauseScenes();

        /* Zoom hacia la biblioteca — avance directo, sin barrido */
        var origin = computeLibOrigin();   /* capturar posición antes del timeout */
        zoomer.style.transformOrigin = origin;
        setTimeout(function () {
            zoomer.style.transition =
                'transform ' + (S4_ZOOM_DUR / 1000).toFixed(1) + 's cubic-bezier(0.16,0.01,0.08,1.0)';
            void zoomer.offsetWidth;
            zoomer.style.transform = 'scale(' + S4_ZOOM_SCALE + ')';
            setTimeout(activateBooks, S4_ZOOM_DUR + 200);
        }, 400);
    }

    /* ══════════════════════════════════════════
       LIBROS INTERACTIVOS (en zoom de biblioteca)
    ══════════════════════════════════════════ */
    function activateBooks() {
        zoomer.style.transition = 'none';
        hsBook1.classList.add('active');
        hsBook1.style.cursor = 'pointer';
        hsBook1.addEventListener('click', onBookClick);
        zoomer.addEventListener('click', onZoomerClickLib);
    }

    function deactivateBooks() {
        hsBook1.classList.remove('active');
        hsBook1.removeEventListener('click', onBookClick);
        zoomer.removeEventListener('click', onZoomerClickLib);
    }

    function onZoomerClickLib() {
        if (!s4InLib) return;
        startReturnLib();
    }

    /* ── Click en un libro: abrir overlay manteniendo biblioteca en blur de fondo ── */
    function onBookClick(e) {
        e.stopPropagation();
        deactivateBooks();
        openLibro();
    }

    /* ══════════════════════════════════════════
       LIBRO OVERLAY — 3 estados
    ══════════════════════════════════════════ */
    function resetLibroElements() {
        libroTapa.classList.remove('lb-shown');
        libroAbWrap.classList.remove('lb-shown');
        libroTrasera.classList.remove('lb-shown');
        libroPageW.classList.remove('lb-shown');
        libroInfo.classList.remove('lb-shown');
        libroHint.classList.remove('lb-shown');
        libroClose.classList.remove('lb-shown');
        libroTapa.style.cssText    = '';
        libroAbWrap.style.cssText  = '';
        libroTrasera.style.cssText = '';
        libroInfo.style.cssText    = '';
    }

    function openLibro() {
        lbState = LBOOK.TAPA;
        resetLibroElements();

        /* Fade in backdrop */
        libroOverlay.style.transition = 'none';
        libroOverlay.style.opacity    = '0';
        libroOverlay.style.pointerEvents = 'none';
        setTimeout(function () {
            libroOverlay.style.transition = 'opacity 1.0s ease';
            libroOverlay.style.opacity    = '1';
        }, 30);

        /* Aparecer tapa con scale-in suave */
        setTimeout(function () {
            libroTapa.style.opacity    = '0';
            libroTapa.style.transform  = 'scale(0.93)';
            libroTapa.style.transition = 'none';
            libroTapa.classList.add('lb-shown');
            setTimeout(function () {
                libroTapa.style.transition = 'opacity 1.0s ease, transform 1.1s cubic-bezier(.22,.7,.32,1)';
                libroTapa.style.opacity    = '1';
                libroTapa.style.transform  = 'scale(1)';
            }, 30);
        }, 700);

        /* Activar interacción y mostrar controles */
        setTimeout(function () {
            libroClose.classList.add('lb-shown');
            libroClose.addEventListener('click', onLibroCloseClick);
            libroHint.textContent = '\u2014 tocá para abrir \u2014';
            libroHint.classList.add('lb-shown');
            libroOverlay.style.pointerEvents = 'auto';
            libroOverlay.addEventListener('click', onLibroOverlayClick);
        }, 2100);
    }

    function onLibroOverlayClick(e) {
        if (e.target === libroClose) return;
        if (lbState === LBOOK.TAPA)    { openLibroAbierto(); return; }
        if (lbState === LBOOK.ABIERTO) { openLibroTrasera(); return; }
        if (lbState === LBOOK.TRASERA) { closeLibro();       return; }
    }

    function onLibroCloseClick(e) {
        e.stopPropagation();
        closeLibro();
    }

    /* ── Estado 1 → 2: Tapa → Libro abierto ── */
    function openLibroAbierto() {
        lbState = LBOOK.ABIERTO;
        libroHint.classList.remove('lb-shown');
        libroOverlay.style.pointerEvents = 'none';

        /* Fold out tapa: scaleX 1 → 0 */
        libroTapa.style.transition = 'transform 0.38s ease-in, opacity 0.24s ease 0.16s';
        libroTapa.style.transform  = 'scaleX(0)';
        libroTapa.style.opacity    = '0.08';

        setTimeout(function () {
            libroTapa.classList.remove('lb-shown');
            libroTapa.style.cssText = '';

            /* Unfold libro abierto: scaleX 0 → 1 */
            libroAbWrap.style.transform  = 'scaleX(0)';
            libroAbWrap.style.opacity    = '0.15';
            libroAbWrap.style.transition = 'none';
            libroAbWrap.classList.add('lb-shown');
            setTimeout(function () {
                libroAbWrap.style.transition = 'transform 0.46s ease-out, opacity 0.28s ease';
                libroAbWrap.style.transform  = 'scaleX(1)';
                libroAbWrap.style.opacity    = '1';

                setTimeout(function () {
                    libroAbWrap.style.transition = '';
                    /* Fade in wash sobre página izquierda */
                    libroPageW.classList.add('lb-shown');
                    /* Fade in texto de información */
                    setTimeout(function () {
                        libroInfo.classList.add('lb-shown');
                    }, 700);
                    /* Hint de continuar */
                    setTimeout(function () {
                        libroHint.textContent = '\u2014 tocá para continuar \u2014';
                        libroHint.classList.add('lb-shown');
                        libroOverlay.style.pointerEvents = 'auto';
                    }, 5000);
                }, 500);
            }, 30);
        }, 420);
    }

    /* ── Estado 2 → 3: Libro abierto → Tapa trasera ── */
    function openLibroTrasera() {
        lbState = LBOOK.TRASERA;
        libroHint.classList.remove('lb-shown');
        libroOverlay.style.pointerEvents = 'none';

        /* Quitar wash e info antes del fold */
        libroPageW.classList.remove('lb-shown');
        libroInfo.classList.remove('lb-shown');
        libroInfo.style.opacity = '0';

        /* Fold out libro abierto: scaleX 1 → 0 */
        libroAbWrap.style.transition = 'transform 0.38s ease-in, opacity 0.24s ease 0.16s';
        libroAbWrap.style.transform  = 'scaleX(0)';
        libroAbWrap.style.opacity    = '0.08';

        setTimeout(function () {
            libroAbWrap.classList.remove('lb-shown');
            libroAbWrap.style.cssText = '';

            /* Unfold tapa trasera: scaleX 0 → 1 */
            libroTrasera.style.transform  = 'scaleX(0)';
            libroTrasera.style.opacity    = '0.15';
            libroTrasera.style.transition = 'none';
            libroTrasera.classList.add('lb-shown');
            setTimeout(function () {
                libroTrasera.style.transition = 'transform 0.46s ease-out, opacity 0.28s ease';
                libroTrasera.style.transform  = 'scaleX(1)';
                libroTrasera.style.opacity    = '1';

                setTimeout(function () {
                    libroTrasera.style.transition = '';
                    /* Hint de cierre */
                    setTimeout(function () {
                        libroHint.textContent = '\u2014 tocá para cerrar \u2014';
                        libroHint.classList.add('lb-shown');
                        libroOverlay.style.pointerEvents = 'auto';
                    }, 2200);
                }, 500);
            }, 30);
        }, 420);
    }

    /* ── Cerrar overlay → reactivar escenas ── */
    function closeLibro() {
        libroOverlay.removeEventListener('click', onLibroOverlayClick);
        libroClose.removeEventListener('click', onLibroCloseClick);
        libroHint.classList.remove('lb-shown');
        libroClose.classList.remove('lb-shown');
        libroOverlay.style.pointerEvents = 'none';

        libroOverlay.style.transition = 'opacity 0.9s ease';
        libroOverlay.style.opacity    = '0';

        setTimeout(function () {
            resetLibroElements();
            lbState = LBOOK.NONE;
            libroOverlay.style.opacity = '0';
            if (typeof window.resumeScenes === 'function') window.resumeScenes();
        }, 960);
    }

    /* ══════════════════════════════════════════
       VOLVER A HABITACIÓN (sin abrir libro)
    ══════════════════════════════════════════ */
    function startReturnLib() {
        if (!s4InLib) return;
        s4InLib = false;
        deactivateBooks();
        zoomer.style.transition =
            'transform ' + (S4_ZOOM_BACK / 1000).toFixed(1) + 's cubic-bezier(0.16,0.01,0.08,1.0)';
        void zoomer.offsetWidth;
        zoomer.style.transform = 'scale(1)';
        setTimeout(function () {
            zoomer.style.transition = 'none';
            if (typeof window.resumeScenes === 'function') window.resumeScenes();
        }, S4_ZOOM_BACK + 200);
    }

})();


