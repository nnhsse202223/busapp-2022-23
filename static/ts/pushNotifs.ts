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


async function enablePushNotifications(publicKey) {
    if ('Notification' in window && 'serviceWorker' in navigator) {
        let permission = await Notification.requestPermission();
        if(permission === "granted") {
                navigator.serviceWorker.register('/serviceWorker.js', { scope: '/' });

                var registration = await navigator.serviceWorker.ready;
                const subscription = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: urlBase64ToUint8Array(publicKey),
                });

                localStorage.setItem("pushObject", JSON.stringify(subscription))

                const pins = (localStorage.getItem("pins") ?? "").split(", ");
                for(var i = 0; i < pins.length; i++) {
                    const response = await fetch("/subscribe", {
                        headers: {
                            "Content-Type": "application/json",
                        },
                        method: "POST",
                        body: JSON.stringify({busNumber: Number(pins[i]) , pushObject: localStorage.getItem("pushObject"), remove: false}),
                    });

                    if(response.ok) { console.log(await response.text()) }
                    else {console.log("error!" + response.status); alert("Something went wrong while subscribing to your pinned buses. Please unpin and repin them.")}
                }
                
                
                document.getElementById("notif-container")?.remove()
        } else {
            alert("You denied notification permission, this will result in push notifications not working");
        }
    } else if('serviceWorker' in navigator) {
        alert("")
    } else {
        alert("Your browser is not supported :(");
    }
}

var areServiceWorkersWorking = navigator.serviceWorker.getRegistrations().then(e => {
    if(e.length !== 0) {
        e.forEach( i => {
            if(!i.active) {
                console.log(i); 
                return false;
            }
        } )
    } else {
        return false;
    }
    return true;
});

areServiceWorkersWorking.then(condition => {
    if (Notification.permission === "granted" && condition) {
        console.log(areServiceWorkersWorking);
        document.getElementById("notif-container")?.remove()
    }
})