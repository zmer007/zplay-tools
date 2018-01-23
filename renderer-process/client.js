/**
 * 改动此文件任何代码都要考虑此文件在移动web上的表现
 */
const ipc = require('electron').ipcRenderer
const $ = require('jquery')
var guides = null;

var downX = null;
var downY = null;

var video = null;
var gestureLayer = null;
var gestureRect = null;
var logView = null;

var cursor = null;
var actionAble = false;

ipc.on('file-cached', (event, filename) => {
	if (filename) {
		$.getJSON(filename, (data) => {
            guides = data;
            gestureRect = gestureLayer.getBoundingClientRect();
            restoreData(gestureRect.width, gestureRect.height, video.duration)
            video.currentTime = 0;
            video.play();
        });
	}
})

$(() => {
    //do work
    gestureLayer = document.getElementById("gesture-layer");
    logView = document.getElementById("log-text")

    gestureLayer.addEventListener('mousedown', onDown);
    gestureLayer.addEventListener('mousemove', onMove);
    gestureLayer.addEventListener('mouseup', onUp);

    gestureLayer.addEventListener('touchstart', onTouchDown);
    gestureLayer.addEventListener('touchmove', onTouchMove);
    gestureLayer.addEventListener('touchend', onTouchEnd);


    video = document.getElementById('my-video');
    // TODO: 在此处使用window不合适，只能用在手机上，先注释掉
    // video.addEventListener('durationchange', () => {
    //     restoreData(window.screen.width, window.screen.height, video.duration)
    //     window.android.startVideo();
    // })
});

// $.getJSON("zprf.json", function (data) {
//     guides = data;
// })


function restoreData(screenWidth, screenHeight, videoDuration) {
    if(videoDuration == Infinity){
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

updateVideo();

function updateVideo() {
    requestAnimationFrame(updateVideo);
    if (!gestureLayer || gestureLayer.style.display == 'none' || !guides) return;
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
    log('clicked, NO')
    if (actionAble && !cursor.passed && cursor.event[0].action[4]) {
        log('clicked, YES')
        passCursor();
    }
}

function onSwipeLeft() {
    log('swipe left, NO')
    if (actionAble && !cursor.passed && cursor.event[0].action[3]) {
        log('swipe left, YES')
        passCursor();
    }
}

function onSwipeUp() {
    log('swipe up, NO')
    if (actionAble && !cursor.passed && cursor.event[0].action[1]) {
        log('swipe up, YES')
        passCursor();
    }
}

function onSwipeRight() {
    log('swipe right, NO')
    if (actionAble && !cursor.passed && cursor.event[0].action[5]) {
        log('swipe right, YES')
        passCursor();
    }
}


function onSwipeDown() {
    log('swipe down, NO')
    if (actionAble && !cursor.passed && cursor.event[0].action[7]) {
        log('swipe down, YES')
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

    var gestureDownX = e.clientX - gestureRect.left;
    var gestureDownY = e.clientY - gestureRect.top;
    
    if (!cursor) return;
    
    var rect = cursor.event[0].block;
    if (rect[0] < gestureDownX && gestureDownX < rect[2] && rect[1] < gestureDownY && gestureDownY < rect[3]) {
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
    logView.innerHTML = msg;
}