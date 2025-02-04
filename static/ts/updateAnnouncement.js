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
let announcementList;
fetch("/announcementList").then((res) => res.json()).then((data) => announcementList = data).then(() => console.log(announcementList));
let newAnnouncement;
fetch("/updateAnnouncement").then((res) => res.text()).then((data) => newAnnouncement = data);
function saveAnnouncement() {
    return __awaiter(this, void 0, void 0, function* () {
        if (!confirm("Are you sure you would like to update the announcements?"))
            return;
        yield fetch("/updateAnnouncement", {
            method: 'POST',
            headers: {
                accept: 'application.json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                busList: busList
            })
        });
        updateAnnouncement();
        window.location.assign("/admin");
    });
}
updateAnnouncement();
window.location.assign("/admin");
//# sourceMappingURL=updateAnnouncement.js.map