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
    return __awaiter(this, void 0, void 0, function* () {
        let permission = yield Notification.requestPermission();
        if (permission === "granted") {
            if ('serviceWorker' in navigator) {
                navigator.serviceWorker.register('/js/serviceWorker.js', {
                    scope: '/',
                });
                console.log("a");
                var registration;
                try {
                    registration = yield navigator.serviceWorker.ready;
                }
                catch (e) { }
                console.log("b");
                const subscription = yield registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: urlBase64ToUint8Array(publicKey),
                });
                console.log("c");
                /*
                await fetch('/subscription', {
                    method: 'POST',
                    body: JSON.stringify({subscription, buses: [10, 11]}),
                    headers: {
                        'content-type': 'application/json',
                    },
                });
                */
                const greeting = new Notification('Notifications were successfully enabled!', { icon: "/img/busAppIcon.png" });
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
//# sourceMappingURL=pushNotifs.js.map