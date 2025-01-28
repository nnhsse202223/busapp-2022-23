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
// npx web-push generate-vapid-keys
const urlBase64ToUint8Array = (base64String) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
};
function enablePushNotifications(publicKey) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
        let permission = yield Notification.requestPermission();
        if (permission === "granted") {
            if ('serviceWorker' in navigator) {
                navigator.serviceWorker.register('/serviceWorker.js', {
                    scope: '/',
                });
                var registration = yield navigator.serviceWorker.ready;
                const subscription = yield registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: urlBase64ToUint8Array(publicKey),
                });
                localStorage.setItem("pushObject", JSON.stringify(subscription));
                const pins = ((_a = localStorage.getItem("pins")) !== null && _a !== void 0 ? _a : "").split(", ");
                for (var i = 0; i < pins.length; i++) {
                    const response = yield fetch("/subscribe", {
                        headers: {
                            "Content-Type": "application/json",
                        },
                        method: "POST",
                        body: JSON.stringify({ busNumber: Number(pins[i]), pushObject: localStorage.getItem("pushObject"), remove: false }),
                    });
                    if (response.ok) {
                        console.log(yield response.text());
                    }
                    else {
                        console.log("error!" + response.status);
                        alert("Error! Please try again...");
                    }
                }
                const greeting = new Notification('Notifications were successfully enabled!', { icon: "/img/busAppIcon.png" });
                (_b = document.getElementById("notif-container")) === null || _b === void 0 ? void 0 : _b.remove();
            }
            else {
                alert("Your browser does not support ServiceWorkers. Push notifications will not work.");
            }
        }
        else {
            alert("You denied notification permission, this will result in push notifications not working");
        }
    });
}
var areServiceWorkersWorking = navigator.serviceWorker.getRegistrations().then(e => {
    if (e.length !== 0) {
        e.forEach(i => {
            if (!i.active) {
                console.log(i);
                return false;
            }
        });
    }
    else {
        return false;
    }
    return true;
});
areServiceWorkersWorking.then(condition => {
    var _a;
    if (Notification.permission === "granted" && condition) {
        console.log(areServiceWorkersWorking);
        (_a = document.getElementById("notif-container")) === null || _a === void 0 ? void 0 : _a.remove();
    }
});
//# sourceMappingURL=pushNotifs.js.map