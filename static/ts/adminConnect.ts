/// <reference path="./socket-io-client.d.ts"/>

var adminSocket = window.io('/admin'); 
var countDownDate = new Date();

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
    const html = ejs.render(document.getElementById("getRender")!.getAttribute("render")!, {data: data});
    // console.log(html)
    document.getElementById("content")!.innerHTML = html;
    
    // update the timer input to match the actual value
    var timerValue: any = document.getElementById("timerDurationSelector");
    if(timerValue === null) { timerValue = {value: 1} }
    fetch('/getTimer', {method: "GET"})
        .then(response => response.json())
        .then(json => { timerValue.value = json.minutes; console.log(json) });
    console.log(timerValue.value);
});

function update() {
    // console.log("update called")
    adminSocket.emit("updateMain", {
        type: "update",
    });
}

async function lockWave() {
    await fetch('/lockWave', {
        method: 'POST'
    })
    update()
}

async function updateTimer() {
    var timerValue: any = document.getElementById("timerDurationSelector");

    if(timerValue === null) { timerValue = {value: 1} }
    const res = await fetch("/setTimer", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({minutes: timerValue.value})
    });
    if (!res.ok) {
        console.log(`Response status: ${res.status}`);
    } else {
        console.log(await res.text());
    }
}

async function updateStatus(button, status) {
    let number = button.parentElement.parentElement.children[0].children[0].value
    let time =  new Date()

    let data = {
        number: number,
        time: time,
        status: status
    }


    await fetch('/updateBusStatus', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })

    update()

    // rerender the page
    // location.reload
}

async function sendWave() {
    await fetch('/sendWave', {
        method: 'POST'
    })
    update()

    // location.reload
}

async function addToWave(button) {
    await updateStatus(button, "Loading")
}

async function removeFromWave(button) {
    await updateStatus(button, "")
}

async function addToNextWave(button) {
    await updateStatus(button, "Next Wave")
}

async function reset(button) {
    await updateStatus(button, "")
}

async function resetAllBusses(button) {
    await fetch('/resetAllBusses', {
        method: 'POST'
    })
    // location.reload
    update()

}

async function updateBusChange(button) {
    // children are number, change, time, status
    let number = button.parentElement.parentElement.children[0].children[0].value
    let change = button.parentElement.parentElement.children[1].children[0].value
    let time =  new Date()

    let data = {
        number: number,
        change: change,
        time: time,
    }
    await fetch('/updateBusChange', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    // location.reload
    update()

}

// Set the date we're counting down to
fetch('/leavingAt')
    .then(response => response.json())
    .then(data => {
        // convert the data string to a date object
        const leavingAt = new Date(data);
        
        countDownDate = leavingAt; // Assign the value to countDownDate
        console.log(leavingAt)

    })
    .catch(error => {
        console.error('Error:', error);
    });

// Update the count down every 1 second
var x = setInterval(async function() {
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
        element.innerHTML = "The current wave will leave in " + minutes + "min " + seconds + "sec ";
    });

    // If the count down is over, write some text 
    if (distance < 0) {
        document.querySelectorAll("[id=timer]").forEach((element) => {
            element.innerHTML = "The current wave is about to leave!";
        });
    }
}, 1000);

