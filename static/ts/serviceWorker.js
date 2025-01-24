// TODO: make this typescript

self.addEventListener('push', async (e) => {
    console.log(e.data)
    const data = e.data.json();
    const promiseChain = self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon,
    });
    await e.waitUntil(promiseChain);
});