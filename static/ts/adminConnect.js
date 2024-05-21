"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const adminSocket = window.io('/admin');
function update() {
    console.log("update called");
    adminSocket.emit("updateMain", {
        type: "update",
    });
}
function lockWave() {
    return __awaiter(this, void 0, void 0, function* () {
        yield fetch('/lockWave', {
            method: 'POST'
        });
        update();
    });
}
function updateStatus(button, status) {
    return __awaiter(this, void 0, void 0, function* () {
        let number = button.parentElement.parentElement.children[0].children[0].value;
        let time = new Date();
        let data = {
            number: number,
            time: time,
            status: status
        };
        yield fetch('/updateBusStatus', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        update();
        // rerender the page
        // location.reload
    });
}
function sendWave() {
    return __awaiter(this, void 0, void 0, function* () {
        yield fetch('/sendWave', {
            method: 'POST'
        });
        update();
        // location.reload
    });
}
function addToWave(button) {
    return __awaiter(this, void 0, void 0, function* () {
        yield updateStatus(button, "Loading");
    });
}
function removeFromWave(button) {
    return __awaiter(this, void 0, void 0, function* () {
        yield updateStatus(button, "");
    });
}
function addToNextWave(button) {
    return __awaiter(this, void 0, void 0, function* () {
        yield updateStatus(button, "Next Wave");
    });
}
function reset(button) {
    return __awaiter(this, void 0, void 0, function* () {
        yield updateStatus(button, "");
    });
}
function resetAllBusses(button) {
    return __awaiter(this, void 0, void 0, function* () {
        yield fetch('/resetAllBusses', {
            method: 'POST'
        });
        // location.reload
        update();
    });
}
function updateBusChange(button) {
    return __awaiter(this, void 0, void 0, function* () {
        // children are number, change, time, status
        let number = button.parentElement.parentElement.children[0].children[0].value;
        let change = button.parentElement.parentElement.children[1].children[0].value;
        let time = new Date();
        let data = {
            number: number,
            change: change,
            time: time,
        };
        yield fetch('/updateBusChange', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        // location.reload
        update();
    });
}
//# sourceMappingURL=adminConnect.js.map