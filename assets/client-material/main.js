var downX = null;
var downY = null;

var video = null;
var gestureLayer = null;

var guides = null;
var cursor = null;
var actionAble = false;

var infoText = null;
var myOrien = null;

var vmax = 0;
var vmin = 0;

document.addEventListener("DOMContentLoaded", function (event) {

    gestureLayer = document.getElementById("gesture-layer");
    infoText = document.getElementById('info');

    gestureLayer.addEventListener('mousedown', onDown);
    gestureLayer.addEventListener('mousemove', onMove);
    gestureLayer.addEventListener('mouseup', onUp);

    gestureLayer.addEventListener('touchstart', onTouchDown);
    gestureLayer.addEventListener('touchmove', onTouchMove);
    gestureLayer.addEventListener('touchend', onTouchEnd);

    video = document.getElementById('my-video');
    // 此处不能使用lambda () => 结构的表示闭包，因为iOS 9及以下不支持。
    video.addEventListener('loadstart', function () {
        // 不全用durationchange监听方法，因为在Android 4.4（vivo）手机上会执行两次，第一次video duration为100，第二次正常值。
        // 为避免以后出现类似的问题，使用loadstart监听，并在配置文件中携带videoDuration值。
        guides = data.ctrl;

        restoreData(window.screen.width, window.screen.height, data.videoDuration)

        if ("undefined" != typeof webkit) {
            // iOS
            webkit.messageHandlers.video.postMessage('video_did_start_playing');
        } else {
            // Android
            window.android.mediationStart();
        }
    })

    video.oncanplay = function () {
        if ("undefined" != typeof webkit) {
            // iOS
            webkit.messageHandlers.video.postMessage('video_did_end_loading');
        }
    };

    video.onended = function () {
        if ("undefined" != typeof webkit) {
            webkit.messageHandlers.video.postMessage('video_did_end_playing');
            pauseVideoAudio();
        } else {
            window.PlayableAds.mediationEnd();
        }
    }
});

function restoreData(screenWidth, screenHeight, videoDuration) {
    if (videoDuration == Infinity || !guides) return;

    if (screenHeight < screenWidth) {
        vmin = screenHeight;
        vmax = screenWidth;
    } else {
        vmin = screenWidth;
        vmax = screenHeight;
    }

    for (var i = 0; i < guides.length; i++) {
        var csr = guides[i];
        csr.span.start *= videoDuration;
        csr.span.loopStart *= videoDuration;
        csr.span.end *= videoDuration;
        csr.event[0].block[0] *= vmin;
        csr.event[0].block[1] *= vmax;
        csr.event[0].block[2] *= vmin;
        csr.event[0].block[3] *= vmax;
        csr.passed = false;
    }
}

refreshFrame();

function refreshFrame() {
    requestAnimationFrame(refreshFrame);

    if (!video || !guides) return;
    var ct = video.currentTime;
    for (var i = 0; i < guides.length; i++) {
        var cs = guides[i];
        if (cs.span.start <= ct && ct < cs.span.end) {
            cursor = cs;
        }
    }

    if (!cursor || cursor.passed) return;

    if (ct > cursor.span.end) {
        if (cursor.span.start == cursor.span.loopStart) {
            video.currentTime = cursor.span.end;
            video.pause();
        } else {
            video.currentTime = cursor.span.loopStart;
        }
    }
}

function onClicked() {
    log('onClicked: NO')
    if (actionAble && !cursor.passed && cursor.event[0].action[4]) {
        log('onClicked: YES')
        passCursor();
    }
}

function onSwipeLeft() {
    log('onSwipeLeft: NO');
    if (actionAble && !cursor.passed && cursor.event[0].action[3]) {
        log('onSwipeLeft: YES');
        passCursor();
    }
}

function onSwipeUp() {
    log('onSwipeUp: NO');
    if (actionAble && !cursor.passed && cursor.event[0].action[1]) {
        log('onSwipeUp: YES');
        passCursor();
    }
}

function onSwipeRight() {
    log('onSwipeRight: NO');
    if (actionAble && !cursor.passed && cursor.event[0].action[5]) {
        log('onSwipeRight: YES');
        passCursor();
    }
}

function onSwipeDown() {
    log('onSwipeDown: NO');
    if (actionAble && !cursor.passed && cursor.event[0].action[7]) {
        log('onSwipeDown: YES');
        passCursor();
    }
}

function passCursor() {
    video.currentTime = cursor.span.end;
    video.play();
    cursor.passed = true;
}

function onDown(e) {
    var tc = transformCoor(e.clientX, e.clientY);
    downX = tc[0];
    downY = tc[1];
    log(downX + ":" + downY);

    if (!cursor) return;

    var rect = cursor.event[0].block;
    if (rect[0] < downX && downX < rect[2] && rect[1] < downY && downY < rect[3]) {
        actionAble = true;
    } else {
        actionAble = false;
    }
}

function onMove(e) {
    if (!downX || !downY) {
        return;
    }
    var tc = transformCoor(e.clientX, e.clientY);
    var upX = tc[0];
    var upY = tc[1];

    var deltaX = downX - upX;
    var deltaY = downY - upY;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX > 0) {
            onSwipeLeft();
            resetDwonXY();
        } else {

            onSwipeRight();
            resetDwonXY();
        }
    } else if (Math.abs(deltaX) < Math.abs(deltaY)) {
        if (deltaY > 0) {
            onSwipeUp();
            resetDwonXY();
        } else {
            onSwipeDown();
            resetDwonXY();
        }
    }
}

function onUp(e) {
    var upX = e.clientX;
    var upY = e.clientY;
    var tc = transformCoor(e.clientX, e.clientY);
    upX = tc[0];
    upY = tc[1];
    if (upX == downX && upY == downY) {
        onClicked();
    }
    resetDwonXY();
}

function onTouchDown(e) {
    onDown(e.touches[0])
    e.preventDefault();
}

function onTouchMove(e) {
    onMove(e.touches[0]);
    e.preventDefault();
}

function onTouchEnd(e) {
    if (e.touches.length == 0) onUp(e.changedTouches[0]);
}

function resetDwonXY() {
    downX = null;
    downY = null;
}

function startAd() {
    var video = document.getElementById('my-video');
    video.currentTime = 0;
    video.play();

    var audio = document.getElementById('my-audio');
    audio.currentTime = 0;
    audio.play();
}

function pauseVideoAudio() {
    var video = document.getElementById('my-video');
    var audio = document.getElementById('my-audio');

    video.pause();
    audio.pause();
}

function resumeVideoAudio() {
    var video = document.getElementById('my-video');
    var audio = document.getElementById('my-audio');

    video.play();
    audio.play();
}

function transformCoor(x, y) {
    var coor = [];
    if (myOrien == 'lr') {
        coor[0] = vmin - y;
        coor[1] = x;
    } else if (myOrien == 'll') {
        coor[0] = y;
        coor[1] = vmax - x;
    } else if(myOrien == 'ud'){
        coor[0] = vmin - x;
        coor[1] = vmax - y;
    }else{
        coor[0] = x;
        coor[1] = y;
    }
    return coor;
}
function updateOrientation() {
    rotateScene(window.orientation);
    console.log(window.orientation)
}

function rotateScene(orientation) {
    var e = document.getElementById('landscape-ad');
    if (orientation == 180) {
        e.setAttribute("class", "upside-down");
    } else if (orientation == -90) {
        e.setAttribute("class", "landscape-left");
    } else if (orientation == 90) {
        e.setAttribute("class", "landscape-right");
    } else {
        e.setAttribute("class", "portrait");
    }
}

function log(msg) {
    if (!infoText) {
        infoText = document.getElementById('info');
    }
    infoText.innerHTML = msg;
}

window.onorientationchange = updateOrientation;