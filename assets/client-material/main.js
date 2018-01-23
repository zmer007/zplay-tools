var downX = null;
var downY = null;

var video = null;
var gestureLayer = null;

var guides = null;
var cursor = null;
var actionAble = false;

var infoText = null;

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
        if (data.screenOrientation == 'landscape'){
            video.className = 'landscape-video';
        }else {
            video.className = 'portrait-video';
        }

        restoreData(window.screen.width, window.screen.height, data.videoDuration)

        try {
            // iOS
            webkit.messageHandlers.playable.postMessage('readyToPlay');
        }catch(e){
            // 在个别机型使用如下方式打印日志会使程序崩溃，如vivo X520L(Android 4.4.2)机型。
            // console.log(`The client hasn't "playable.readyToPlay" event.`);
        }

        try{
            // Android
            window.android.startVideo();
        } catch (e) {
            // 在个别机型使用如下方式打印日志会使程序崩溃，如vivo X520L(Android 4.4.2)机型。
            // console.log(`The client hasn't "android.startVideo()" function`);
        }
    })
});

function restoreData(screenWidth, screenHeight, videoDuration) {
    if (videoDuration == Infinity) {
        return;
    }

    if (!guides) return;
    for (var i = 0; i < guides.length; i++) {
        var csr = guides[i];
        csr.span.start *= videoDuration;
        csr.span.loopStart *= videoDuration;
        csr.span.end *= videoDuration;
        csr.event[0].block[0] *= screenWidth;
        csr.event[0].block[1] *= screenHeight;
        csr.event[0].block[2] *= screenWidth;
        csr.event[0].block[3] *= screenHeight;
        csr.passed = false;
    }
}

refreshFrame();

function refreshFrame() {
    if(video && video.ended){
        window.location.replace('playable-landpage.html');
        return;
    }
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
    downX = e.clientX;
    downY = e.clientY;

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

    var upX = e.clientX;
    var upY = e.clientY;

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

function log(msg) {
    // if (!infoText) {
    //     infoText = document.getElementById('info');
    // }
    // infoText.innerHTML = msg;
}