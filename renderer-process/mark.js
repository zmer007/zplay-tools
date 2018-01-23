var marks = [];
var activeMark = null;
var screenOrientation = null;

function setActiveMark(id) {
    activeMark = marks.getById(id);
}

function getActivedMark() {
    return activeMark;
}

function setActiveEventBlock(l, t, r, b) {
    if (l != -1) activeMark.event[0].block[0] = l;
    if (t != -1) activeMark.event[0].block[1] = t;
    if (r != -1) activeMark.event[0].block[2] = r;
    if (b != -1) activeMark.event[0].block[3] = b;
}

function setActiveAction(position, state) {
    if (position < 0 || position > 8) return;
    activeMark.event[0].action[position] = parseInt(state);
}

function reset() {
    activeMark = null;
    marks = [];
}

function removeMark(id) {
    marks.remove(id);
}

function addEmptyMark(id) {
    marks.push(mark(id))
}

function mark(id) {
    return {
        id: id,
        span: {
            start: 0,
            loopStart: 0,
            end: 0
        },
        event: [{
            // 响应action的区域：分别left, top, right, bottom
            block: [0, 0, 0, 0],
            // 0: 无动作，全为0
            // 以下为相应位中表示的动作，0代表非，1代表是
            // 1: 向左上滑动  2：向上滑动  3：向右上滑动
            // 4: 向左滑动    5：点击     6：向右滑动
            // 7: 向左下滑动  8：向下滑动  9：向右下滑动
            action: [0, 0, 0, 0, 0, 0, 0, 0, 0]
        }]
    };
}

function getAllMarksJson() {
    return JSON.stringify(marks);
}

function getAllMarks() {
    return marks;
}

function normalAllMarks(screenWidth, screenHeight, progressBarWidth) {
    var ms = [];
    for (var i = 0; i < marks.length; i++) {
        var mk = marks[i];
        var m = mark(mk.id);
        m.span.start = mk.span.start / progressBarWidth;
        m.span.loopStart = mk.span.loopStart / progressBarWidth;
        m.span.end = mk.span.end / progressBarWidth;
        m.event[0].block[0] = mk.event[0].block[0] / screenWidth;
        m.event[0].block[1] = mk.event[0].block[1] / screenHeight;
        m.event[0].block[2] = mk.event[0].block[2] / screenWidth;
        m.event[0].block[3] = mk.event[0].block[3] / screenHeight;
        m.event[0].action = mk.event[0].action;
        ms.push(m);
    }
    return ms;
}

function marks2jsfile(screenWidth, screenHeight, progressBarWidth, videoDuration) {
    var ms = [];
    var isPortrait = screenOrientation == "portrait";

    for (var i = 0; i < marks.length; i++) {
        var mk = marks[i];
        var m = mark(mk.id);
        m.span.start = mk.span.start / progressBarWidth;
        m.span.loopStart = mk.span.loopStart / progressBarWidth;
        m.span.end = mk.span.end / progressBarWidth;
        var blc = [mk.event[0].block[0], mk.event[0].block[1], mk.event[0].block[2], mk.event[0].block[3]];
        blc[0] = blc[0] / screenWidth;
        blc[1] = blc[1] / screenHeight;
        blc[2] = blc[2] / screenWidth;
        blc[3] = blc[3] / screenHeight;
        m.event[0].block = isPortrait ? blc : landCoor2portCoor(blc);
        m.event[0].action = mk.event[0].action;
        ms.push(m);
    }

    var data = {
        screenOrientation: screenOrientation,
        videoDuration: videoDuration,
        ctrl: ms
    }
    var jsFile = 'data = ' + JSON.stringify(data);
    return jsFile;
}

function landCoor2portCoor(landCoor) {
    return [1 - landCoor[3], landCoor[0], 1 - landCoor[1], landCoor[2]];
}

function getMark(id) {
    return marks.getById(id);
}

function setOrientation(orientation) {
    screenOrientation = orientation;
}

Array.prototype.remove = function (id) {
    var index = 0;
    var find = false;
    for (; index < this.length; index++) {
        if (this[index].id == id) {
            find = true;
            break;
        }
    }
    if (find) this.splice(index, 1);
}

Array.prototype.getById = function (id) {
    var result = null;
    for (var i = 0; i < this.length; i++) {
        var v = this[i];
        if (v.id == id) {
            result = v;
            break;
        }
    }
    return result;
}


module.exports = {
    setActivemark: setActiveMark,
    getActivedMark: getActivedMark,
    add: addEmptyMark,
    getChild: getMark,
    remove: removeMark,
    reset: reset,
    getMarks: getAllMarks,
    getNormaledMarks: normalAllMarks,
    getMarksJsFile: marks2jsfile,
    setActiveEventBlock: setActiveEventBlock,
    setActiveAction: setActiveAction,
    setOrientation: setOrientation,
}