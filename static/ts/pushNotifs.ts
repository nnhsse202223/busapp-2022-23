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
    let permission = await Notification.requestPermission();
    if(permission === "granted") {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/serviceWorker.js', {
              scope: '/',
            });

            var registration = await navigator.serviceWorker.ready;
            console.log("a")
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(publicKey),
            });
            console.log("b")
            const response = await fetch('/subscription', {    
                method: 'POST',    
                body: JSON.stringify({subscription, buses: [10, 11]}),    
                headers: {      
                    'content-type': 'application/json',    
                },  
            });
            console.log("c")

            if(response.ok) { console.log(await response.text()) }
            else {console.log("error!" + response.status)}
            console.log("d")
            
            const greeting = new Notification('Notifications were successfully enabled!', {icon: "/img/busAppIcon.png"});
        } else {
            alert("Your browser does not support ServiceWorkers. Push notifications will not work.");
        }
    } else {
        alert("You denied notification permission, this will result in push notifications not working");
    }
}