"use strict";
/// <reference path="./socket-io-client.d.ts"/>
var adminSocket = window.io('/admin');
adminSocket.on("update", (data) => {
    console.log("update received");
    console.log(data);
    window.location.reload();
});
function updateAnnouncement() {
    console.log("update called");
    adminSocket.emit("updateMain", {
        type: "update",
    });
}
//# sourceMappingURL=updateAnnouncementConnect.js.map