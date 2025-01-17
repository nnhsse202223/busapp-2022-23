let busList: number[];
fetch("/busList").then((res) => res.json()).then((data) => busList = data).then(() => console.log(busList));

let newBusEmptyRow: string;
fetch("/updateBusListEmptyRow").then((res) => res.text()).then((data) => newBusEmptyRow = data);

let newBusRow: string;
fetch("/updateBusListPopulatedRow").then((res) => res.text()).then((data) => newBusRow = data);

function newBus_busList() {
    const row = (<HTMLTableElement> document.getElementsByClassName("buslist-table")[0]).insertRow(1);
    const html = ejs.render(newBusEmptyRow);
    row.innerHTML = html;
    let input = row.children[0]!.children[0] as HTMLInputElement;
    input.focus();
}

function addBus_busList(confirmButton: HTMLElement) {
    let row = confirmButton.parentElement!.parentElement! as HTMLTableRowElement;
    let number = parseInt((row.children[0]!.children[0] as HTMLInputElement).value);
    let index = busList.findIndex((currentNumber) => {return number < currentNumber});
    if (index == -1) index = busList.length;
    busList.splice(index, 0, number);
    row.remove();
    const newRow = (<HTMLTableElement> document.getElementsByClassName("buslist-table")[0]).insertRow(index + 1);
    const html = ejs.render(newBusRow, {number: number});
    newRow.innerHTML = html;
    newBus_busList();
}

function removeBus_busList(secondChild: HTMLElement) {
    let row = secondChild.parentElement!.parentElement! as HTMLTableRowElement;
    let number = row.children[0]!.innerHTML as string;
    busList.splice(busList.indexOf(parseInt(number)), 1);
    row.remove();
}

async function save() {
    if (!confirm("Are you sure you would like to update the bus list and reset all live pages?")) return;
    
    await fetch("/updateBusList", {
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

    updateBusList();
    window.location.assign("/admin");
}

function discardChanges() {
    if (confirm("Are you sure you would like to discard changes?")) location.reload();
}
