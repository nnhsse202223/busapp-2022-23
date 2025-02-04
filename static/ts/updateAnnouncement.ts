let announcementList: string[];
fetch("/announcementList").then((res) => res.json()).then((data) => announcementList = data).then(() => console.log(announcementList));

let newAnnouncement: string;
fetch("/updateAnnouncement").then((res) => res.text()).then((data) => newAnnouncement = data);

async function saveAnnouncement() {
    if (!confirm("Are you sure you would like to update the announcements?")) return;
    
    await fetch("/updateAnnouncement", {
        method: 'POST',
        headers: {
            accept: 'application.json',
            'Content-Type': 'application/json'
        },
        body: 
        JSON.stringify({
            busList: busList
        })
    });

    updateAnnouncement();

    window.location.assign("/admin");
}

updateAnnouncement();

window.location.assign("/admin");