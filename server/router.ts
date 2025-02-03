import express, {Request, Response} from "express";
import {OAuth2Client, TokenPayload} from "google-auth-library";
import { getBuses, readData, readWhitelist } from './jsonHandler';
import path from "path";
import fs, {readFileSync} from "fs";
export const router = express.Router();
import webpush from 'web-push';
const dotenv = require("dotenv");
const Announcement = require("./model/announcement");
const Bus = require("./model/bus");
const Weather = require("./model/weather");
const Wave = require("./model/wave");
const Subscription = require("./model/subscription");

const CLIENT_ID = "319647294384-m93pfm59lb2i07t532t09ed5165let11.apps.googleusercontent.com"
const oAuth2 = new OAuth2Client(CLIENT_ID);

dotenv.config({ path: ".env" });
// Remember to set vapid keys in .env - run ```npx web-push generate-vapid-keys``` to generate
const vapidPrivateKey = process.env.VAPID_PRIVATE;
const vapidPublicKey = process.env.VAPID_PUBLIC;

webpush.setVapidDetails(
    'mailto:test@test.com',
    vapidPublicKey,
    vapidPrivateKey,
);

const bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: true }));

Announcement.findOneAndUpdate({}, {announcement: ""}, {upsert: true});
Announcement.findOneAndUpdate({}, {tvAnnouncement: ""}, {upsert: true});
let timer = 30;

// Homepage. This is where students will view bus information from. 
router.get("/", async (req: Request, res: Response) => {
    // Reads from data file and displays data
    let data = {
        buses: await getBuses(), weather: await Weather.findOne({}),
        isLocked: false,
        leavingAt: new Date(),
        vapidPublicKey
    };
    data.isLocked = (await Wave.findOne({})).locked;
    data.leavingAt = (await Wave.findOne({})).leavingAt;

    res.render("index", {
        data: data,
        render: fs.readFileSync(path.resolve(__dirname, "../views/include/indexContent.ejs")),
        announcement: (await Announcement.findOne({})).announcement
    });
});

// tv route
router.get("/tv", async (req: Request, res: Response) => {
    // Reads from data file and displays data
    res.render("tv", {
        data: await readData(),
        render: fs.readFileSync(path.resolve(__dirname, "../views/include/tvIndexContent.ejs")),                                
        announcement: (await Announcement.findOne({})).tvAnnouncement
    })
})

// Login page. User authenticates here and then is redirected to admin (where they will be authorized)
router.get("/login", (req: Request, res: Response) => {
    res.render("login");
});

// Authenticates the user
router.post("/auth/v1/google", async (req: Request, res: Response) => {
    let token = req.body.token; // Gets token from request body
    let ticket = await oAuth2.verifyIdToken({ // Verifies and decodes token    
        idToken: token,
        audience: CLIENT_ID
    });
    req.session.userEmail = ticket.getPayload()!.email!; // Store email in session
    res.status(201).end();
});

// Checks if the user's email is in the whitelist and authorizes accordingly
function authorize(req: Request) {
    req.session.isAdmin = readWhitelist().admins.includes(<string> req.session.userEmail); 
}



/* Admin page. This is where bus information can be updated from
Reads from data file and displays data */
router.get("/admin", async (req: Request, res: Response) => {
    // If user is not authenticated (email is not is session) redirects to login page
    if (!req.session.userEmail) {
        res.redirect("/login");
        return;
    }
    
    // Authorizes user, then either displays admin page or unauthorized page

    let data = {
        allBuses: await getBuses(),
        nextWave: await Bus.find({status: "Next Wave"}),
        loading: await Bus.find({status: "Loading"}),
        isLocked: false, 
        leavingAt: new Date(),
        timer: timer
    };
    data.isLocked = (await Wave.findOne({})).locked;
    data.leavingAt = (await Wave.findOne({})).leavingAt;
    authorize(req);
    if (req.session.isAdmin) {
        res.render("admin", {
            data: data,
            render: fs.readFileSync(path.resolve(__dirname, "../views/include/adminContent.ejs")),
        });
    }
    else {
        res.render("unauthorized");
    }
});


router.get("/serviceWorker.js", async (req: Request, res: Response) => {
    res.sendFile("serviceWorker.js", { root: path.join(__dirname, '../static/ts/') });
})

router.post("/subscribe", async (req: Request, res: Response) => {
    const subscription = req.body.pushObject;
    const num = Number(req.body.busNumber);
    const rm = req.body.remove;
    if(rm) {
        (await Subscription.find({subscription, bus: num})).forEach(async (e) => await Subscription.findByIdAndDelete(e._id));
    } else {
        await Subscription.create({subscription, bus: num})
    }
    res.send("success!");
})

router.get("/waveStatus", async (req: Request, res: Response) => {
    // get the wave status from the wave schema
    const wave = await Wave.findOne({});
    res.send(wave.locked);
});

router.post("/updateBusChange", async (req: Request, res: Response) => {
    if (!req.session.userEmail) {
        res.redirect("/login");
        return;
    }

    let busNumber = req.body.number;
    let busChange = req.body.change;
    let time = req.body.time;
    await Bus.findOneAndUpdate({busNumber: busNumber}, {busChange: busChange, time: time});
    res.send("success");
});

router.post("/updateBusStatus", async (req: Request, res: Response) => {
    if (!req.session.userEmail) {
        res.redirect("/login");
        return;
    }

    let busNumber = req.body.number;
    let busStatus = req.body.status;
    let time = req.body.time;
    await Bus.findOneAndUpdate({busNumber: busNumber}, {status: busStatus, time: time});
    res.send("success");
});


router.post("/sendWave", async (req: Request, res: Response) => {
    if (!req.session.userEmail) {
        res.redirect("/login");
        return;
    }

    if(!(null === await Wave.findOne({locked: true})))(await Bus.find({status: "Loading"})).forEach(async (bus) => {
        (await Subscription.find({bus: bus.busNumber})).forEach(async (sub) => {
            try {
                await webpush.sendNotification(JSON.parse(sub.subscription), JSON.stringify({
                    title: 'Your Bus Just Left!',
                    body: `Bus number ${bus.busNumber} just left.`,
                    icon: "/img/busAppIcon.png"
                }));
            } catch(e) {
                if(typeof(e) == webpush.WebPushError && (<webpush.WebPushError>e).statusCode === 410) {
                    await Subscription.findByIdAndDelete(sub._id);
                }
            }
        });
    })

    await Bus.updateMany({ status: "Loading" }, { $set: { status: "Gone" } });
    await Bus.updateMany({ status: "Next Wave" }, { $set: { status: "Loading" } });
    await Wave.findOneAndUpdate({}, { locked: false }, { upsert: true });
    
    res.send("success");
});

router.post("/lockWave", async (req: Request, res: Response) => {
    if (!req.session.userEmail) {
        res.redirect("/login");
        return;
    }

    await Wave.findOneAndUpdate({}, { locked: !(await Wave.findOne({})).locked }, { upsert: true });
    const leavingAt = new Date();
    leavingAt.setSeconds(leavingAt.getSeconds() + timer);
    await Wave.findOneAndUpdate({}, { leavingAt: leavingAt }, { upsert: true });

    if(!(null === await Wave.findOne({locked: true})))(await Bus.find({status: "Loading"})).forEach(async (bus) => {
        (await Subscription.find({bus: bus.busNumber})).forEach(async (sub) => {
            try {
                await webpush.sendNotification(JSON.parse(sub.subscription), JSON.stringify({
                    title: 'Your Bus is Here!',
                    body: `Bus number ${bus.busNumber} is currently loading, and will leave in ${Math.floor(timer/60)} minutes and ${timer % 60} seconds`,
                    icon: "/img/busAppIcon.png"
                }));
            } catch(e) {
                if(typeof(e) == webpush.WebPushError && (<webpush.WebPushError>e).statusCode === 410) {
                    await Subscription.findByIdAndDelete(sub._id);
                }
            }
        });
    })
    res.send("success");
});

router.post("/setTimer", async (req: Request, res: Response) => {
    if (!req.session.userEmail) {
        res.redirect("/login");
        return;
    }

    var tmpTimer = Number(req.body.minutes) * 60;
    if(Number.isNaN(tmpTimer) || tmpTimer === null) {
        tmpTimer = 30;
    }
    timer = tmpTimer;
    res.send("success");
});

router.get("/getTimer", async (req: Request, res: Response) => {
    res.send(JSON.stringify({minutes: timer/60}));
});

router.get("/leavingAt", async (req: Request, res: Response) => {
    const leavingAt = (await Wave.findOne({})).leavingAt;
    res.send(leavingAt);

});

router.post("/resetAllBusses", async (req: Request, res: Response) => {
    if (!req.session.userEmail) {
        res.redirect("/login");
        return;
    }

    await Bus.updateMany({}, { $set: { status: "" } }); 
    res.send("success");

});

router.get("/beans", async (req: Request, res: Response) => {
    res.sendFile(path.resolve(__dirname, "../static/img/beans.jpg"));
});

// old manifest, leaving it because im not sure if anything still uses it?
router.get("/manifest.webmanifest", (req: Request, res: Response) => {
    res.sendFile(path.resolve(__dirname, "../data/manifest.webmanifest"))
});

// new manifest
router.get("/manifest.json", (req: Request, res: Response) => {
    res.sendFile(path.resolve(__dirname, "../data/manifest.json"))
});


/* Admin page. This is where bus information can be updated from
Reads from data file and displays data */
router.get("/updateBusList", async (req: Request, res: Response) => {
    // If user is not authenticated (email is not is session) redirects to login page
    if (!req.session.userEmail) {
        res.redirect("/login");
        return;
    }

    // Authorizes user, then either displays admin page or unauthorized page

    // get all the bus numbers of all the buses from the database and make a list of them
    const busList: string[] = await Bus.find().distinct("busNumber");

    let data = { busList: busList };

    authorize(req);
    if (req.session.isAdmin) {
        res.render("updateBusList",
        {
            data: data
        });
    }
    else {
        res.render("unauthorized");
    }
});

router.get("/makeAnnouncement", async (req: Request, res: Response) => {
    // If user is not authenticated (email is not is session) redirects to login page
    if (!req.session.userEmail) {
        res.redirect("/login");
        return;
    }+
    
    // Authorizes user, then either displays admin page or unauthorized page
    authorize(req);
    if (req.session.isAdmin) {
        res.render("makeAnnouncement",
        {
            currentAnnouncement: (await Announcement.findOne({})).announcement,
            currentTvAnnouncement: (await Announcement.findOne({})).tvAnnouncement
        });
    }
    else {
        res.render("unauthorized");
    }
});

router.get('/whitelist', (req: Request,res: Response)=>{
    // If user is not authenticated (email is not is session) redirects to login page
    if (!req.session.userEmail) {
        res.redirect("/login");
        return;
    }
    
    // Authorizes user, then either displays admin page or unauthorized page
    authorize(req);
    if (req.session.isAdmin) {
        res.render("updateWhitelist", {
            whitelist: readWhitelist()
        });
    }
    else {
        res.render("unauthorized");
    }
})

router.get('/updateWhitelist', (req: Request,res: Response)=>{
    // If user is not authenticated (email is not is session) redirects to login page
    if (!req.session.userEmail) {
        res.redirect("/login");
        return;
    }
    
    // Authorizes user, then either displays admin page or unauthorized page
    authorize(req);
    if (req.session.isAdmin) {
        res.render("updateWhitelist");
    }
    else {
        res.render("unauthorized");
    }
})
router.get("/updateBusListEmptyRow", (req: Request, res: Response) => {
    res.sendFile(path.resolve(__dirname, "../views/sockets/updateBusListEmptyRow.ejs"));
});

router.get("/updateBusListPopulatedRow", (req: Request, res: Response) => {
    res.sendFile(path.resolve(__dirname, "../views/sockets/updateBusListPopulatedRow.ejs"));
});

router.get("/adminEmptyRow", (req: Request, res: Response) => {
    res.sendFile(path.resolve(__dirname, "../views/sockets/adminEmptyRow.ejs"));
});

router.get("/busList", async (req: Request, res: Response) => {
    res.type("json").send(await Bus.find().distinct("busNumber"));
});

//TODO: consult if we want this to be publically accessible or not, idk why it would need to be anyway
router.get("/whitelistFile", (req: Request, res: Response) => {
    res.type("json").send(readFileSync(path.resolve(__dirname, "../data/whitelist.json")));
});

router.post("/updateBusList", async (req: Request, res: Response) => {
    if (!req.session.userEmail) {
        res.redirect("/login");
        return;
    }

    // use the posted bus list to update the database, removing any buses that are not in the list, and adding any buses that are in the list but not in the database
    const busList: string[] = req.body.busList;
    
    let buses = await Bus.find({});
    buses.forEach((bus: any) => { // for each bus in the database
        if (!busList.includes(bus.busNumber)) { // if the bus is not in the list
            Bus.findOneAndDelete({ busNumber: bus.busNumber }).exec(); // remove the bus from the database
        }
    });
    busList.forEach(async (busNumber: string) => { // for each bus in the list
        if (!buses.map( (bus: any) => bus.busNumber).includes(busNumber)) { // if the bus is not in the database
            try {
                const newBus = new Bus({ // add the bus to the database
                    busNumber: busNumber,
                    busChange: 0,
                    status: "normal",
                    time: new Date(),
                });
                await newBus.save();
            } catch (error) {
                console.log("bus creation failed");
            }
        }
    });
    res.status(201).end();
});

router.get('/help',(req: Request, res: Response)=>{
res.render('help');
})
router.post("/whitelistFile",(req:Request,res: Response) => {
    if (!req.session.userEmail) {
        res.redirect("/login");
        return;
    }

    fs.writeFileSync(path.resolve(__dirname, "../data/whitelist.json"), JSON.stringify(req.body.admins));
});

router.post("/submitAnnouncement", async (req: Request, res: Response) => {    //overwrites the announcement in the database
    if (!req.session.userEmail) {
        res.redirect("/login");
        return;
    }

    await Announcement.findOneAndUpdate({}, {announcement: req.body.announcement, tvAnnouncement: req.body.tvAnnouncement}, {upsert: true});
    res.redirect("/admin");
});


router.post("/clearAnnouncement", async (req: Request, res: Response) => {
    if (!req.session.userEmail) {
        res.redirect("/login");
        return;
    }
    
    await Announcement.findOneAndUpdate({}, {announcement: ""}, {upsert: true});
});

