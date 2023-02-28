"use strict";
var admins;
fetch("/whitelistFile").then((data) => data.json()).then((data) => admins = data);
var newAdminEmptyRow;
fetch("/adminEmptyRow").then((res) => res.text()).then((data) => newAdminEmptyRow = data);
//var newAdminRow: string;
// fetch("/adminPopulatedRow").then((res) => res.text()).then((data) => newAdminRow = data);
function addAdmin_admins(newAddress) {
    if (newAddress.includes('@') && newAddress.includes('naperville203.org') && (newAddress.indexOf('@') < newAddress.indexOf('naperville203.org'))) {
        console.log(newAddress);
        console.log(newAdminEmptyRow);
        const row = document.getElementsByClassName("buslist-table")[0].insertRow(1);
        const html = ejs.render(newAdminEmptyRow, { newAddress: newAddress });
        console.log(html);
        row.innerHTML = html;
        admins.splice(0, 0, newAddress);
        fetch("/whitelistFile", {
            method: 'POST',
            headers: {
                accept: 'application.json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                admins: admins
            })
        });
    }
}
function removeAdmin_admins(address) {
    admins.splice(admins.indexOf(address), 1);
    let table = document.querySelector(".buslist-table");
    let rows = table.children[1].children;
    for (let row of rows) {
        console.log(row.children[0].innerHTML);
        if (row.children[0].innerHTML.trim() == address.trim()) {
            row.remove();
            break;
        }
    }
    //row.remove();
    fetch("/whitelistFile", {
        method: 'POST',
        headers: {
            accept: 'application.json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            admins: admins
        })
    });
}
//# sourceMappingURL=updateWhitelist.js.map