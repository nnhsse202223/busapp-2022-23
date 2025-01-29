"use strict";
/// <reference path="./socket-io-client.d.ts"/>
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var adminSocket = window.io("/admin");
var countDownDate = new Date();
var updatingCount = 0;
adminSocket.on("update", (data) => {
    // console.log("update received")
    // console.log(data)
    // convert from time strings to dates to allow conversion to local time
    data.allBuses.forEach((bus) => {
        if (bus.time != "")
            bus.time = new Date(bus.time);
    });
    countDownDate = new Date(data.leavingAt);
    // rerender the page
    const html = ejs.render(document.getElementById("getRender").getAttribute("render"), { data: data });
    // console.log(html)
    document.getElementById("content").innerHTML = html;
    // update the timer input to match the actual value
    var timerValue = document.getElementById("timerDurationSelector");
    if (timerValue === null) {
        timerValue = { value: 1 };
    }
    fetch("/getTimer", { method: "GET" })
        .then((response) => response.json())
        .then((json) => {
        timerValue.value = json.minutes;
        console.log(json);
    });
});
function update() {
    // console.log("update called")
    adminSocket.emit("updateMain", {
        type: "update",
    });
}
function lockWave() {
    return __awaiter(this, void 0, void 0, function* () {
        // await fetch('/lockWave', {
        //     method: 'POST'
        // })
        yield fetchWithAlert("/lockWave", "POST", {}, {});
        update();
    });
}
function updateTimer() {
    return __awaiter(this, void 0, void 0, function* () {
        var timerValue = document.getElementById("timerDurationSelector");
        if (timerValue === null) {
            timerValue = { value: 1 };
        }
        // const res = await fetch("/setTimer", {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json'
        //     },
        //     body: JSON.stringify({minutes: timerValue.value})
        // });
        const res = yield fetchWithAlert("/setTimer", "POST", {
            "Content-Type": "application/json",
        }, { minutes: timerValue.value });
        if (!res.ok) {
            console.log(`Response status: ${res.status}`);
        }
        else {
            console.log(yield res.text());
        }
    });
}
function updateStatus(button, status) {
    return __awaiter(this, void 0, void 0, function* () {
        let number = button.parentElement.parentElement.children[0].children[0].value;
        let time = new Date();
        let data = {
            number: number,
            time: time,
            status: status,
        };
        // await fetch('/updateBusStatus', {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json'
        //     },
        //     body: JSON.stringify(data)
        // })
        yield fetchWithAlert("/updateBusStatus", "POST", {
            "Content-Type": "application/json",
        }, data);
        update();
        // rerender the page
        // location.reload
    });
}
function sendWave() {
    return __awaiter(this, void 0, void 0, function* () {
        // alert("Update sent to server");
        // var response = await fetch('/sendWave', {
        //     method: 'POST'
        // })
        // if (response.ok) {
        //     alert("Update applied");
        // } else {
        //     alert("Update failed");
        // }
        yield fetchWithAlert("/sendWave", "POST", {}, {});
        update();
        // location.reload
    });
}
function addToWave(button) {
    return __awaiter(this, void 0, void 0, function* () {
        yield updateStatus(button, "Loading");
        // let number = button.parentElement.parentElement.children[0].children[0].value
        // alert(number + " added to wave");
    });
}
function removeFromWave(button) {
    return __awaiter(this, void 0, void 0, function* () {
        yield updateStatus(button, "");
        // let number = button.parentElement.parentElement.children[0].children[0].value
        // alert(number + "removed from wave");
    });
}
function addToNextWave(button) {
    return __awaiter(this, void 0, void 0, function* () {
        yield updateStatus(button, "Next Wave");
        // let number = button.parentElement.parentElement.children[0].children[0].value
        // alert(number + " added to next wave");
    });
}
function reset(button) {
    return __awaiter(this, void 0, void 0, function* () {
        yield updateStatus(button, "");
    });
}
function resetAllBusses(button) {
    return __awaiter(this, void 0, void 0, function* () {
        // await fetch('/resetAllBusses', {
        //     method: 'POST'
        // })
        yield fetchWithAlert("/resetAllBusses", "POST", {}, {});
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
        // await fetch('/updateBusChange', {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json'
        //     },
        //     body: JSON.stringify(data)
        // })
        yield fetchWithAlert("/updateBusChange", "POST", {
            "Content-Type": "application/json",
        }, data);
        // location.reload
        update();
    });
}
// Set the date we're counting down to
fetch("/leavingAt")
    .then((response) => response.json())
    .then((data) => {
    // convert the data string to a date object
    const leavingAt = new Date(data);
    countDownDate = leavingAt; // Assign the value to countDownDate
    console.log(leavingAt);
})
    .catch((error) => {
    console.error("Error:", error);
});
// Update the count down every 1 second
var x = setInterval(function () {
    return __awaiter(this, void 0, void 0, function* () {
        // Get today's date and time
        var now = new Date().getTime();
        // Find the distance between now and the count down date
        var distance = countDownDate.getTime() - now;
        // console.log("distance: " + distance);
        // Time calculations for days, hours, minutes and seconds
        var days = Math.floor(distance / (1000 * 60 * 60 * 24));
        var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((distance % (1000 * 60)) / 1000);
        // Output the result in an element with id="demo"
        document.querySelectorAll("[id=timer]").forEach((element) => {
            element.innerHTML =
                "The current wave will leave in " + minutes + "min " + seconds + "sec ";
        });
        // If the count down is over, write some text
        if (distance < 0) {
            document.querySelectorAll("[id=timer]").forEach((element) => {
                element.innerHTML = "The current wave is about to leave!";
            });
        }
    });
}, 1000);
function fetchWithAlert(endpoint, method, header, data) {
    return __awaiter(this, void 0, void 0, function* () {
        setHidden(false);
        updatingCount++;
        console.log(updatingCount);
        var response = yield fetch(endpoint, {
            method: method,
            headers: header,
            body: JSON.stringify(data),
        });
        if (response.ok) {
            updatingCount--;
            console.log(updatingCount);
            if (updatingCount !== 0) {
                setHidden(true);
            }
            else {
                setHidden(false);
            }
            // alert("Update applied");
        }
        else {
            alert("Update failed");
        }
        return response;
    });
}
function setHidden(option) {
    return __awaiter(this, void 0, void 0, function* () {
        var div = document.getElementsByClassName("popup")[0];
        if (div) {
            if (option) {
                div.style.top = "-100px";
            }
            else {
                div.style.top = "10px";
            }
        }
    });
}
//# sourceMappingURL=adminConnect.js.map