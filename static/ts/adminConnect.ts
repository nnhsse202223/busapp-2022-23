
function lockWave() {
    fetch('/lockWave', {
        method: 'POST'
    })
    location.reload()

}

function updateStatus(button, status) {
    let number = button.parentElement.parentElement.children[0].children[0].value
    let time =  new Date()

    let data = {
        number: number,
        time: time,
        status: status
    }


    fetch('/updateBusStatus', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })

    // rerender the page
    location.reload()
}

function sendWave() {
    fetch('/sendWave', {
        method: 'POST'
    })
    //location.reload()
}

function addToWave(button) {
    updateStatus(button, "Loading")
}

function removeFromWave(button) {
    updateStatus(button, "")
}

function addToNextWave(button) {
    updateStatus(button, "Next Wave")
}

function reset(button) {
    updateStatus(button, "")

}

function updateBusChange(button) {
    // children are number, change, time, status
    let number = button.parentElement.parentElement.children[0].children[0].value
    let change = button.parentElement.parentElement.children[1].children[0].value
    let time =  new Date()

    let data = {
        number: number,
        change: change,
        time: time,
    }
    fetch('/updateBusChange', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    location.reload()
}

