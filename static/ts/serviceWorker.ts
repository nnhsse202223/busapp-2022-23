

self.addEventListener('push', async (e: any) => {
    console.log(e.data)
    const data = e.data.json();
    const tmp: any = self;
    if(data.bus) {
      const promiseChain = tmp.registration.showNotification(data.title, {
        body: data.body,
        icon: data.icon,
      });
      await e.waitUntil(promiseChain);
    }
});

