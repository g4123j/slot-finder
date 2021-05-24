function writeError(message) {
    let errorMessage = '<br/><br/><br/><br/><br/><h1>';
    if (searchByPIN.checked) {
        if (txtPIN.value != '') {
            errorMessage += txtPIN.value + ': ' + message;
        } else {
            errorMessage += 'Please enter correct PIN.';
        }
    }
    else {
        errorMessage += districtSelector.selectedOptions[0].text + ': ' + message;
    }
    errorMessage += '</h1>';
    divResult.innerHTML = errorMessage;
}

function generateView(slots) {
    let table = generateTable(divResult, slots);
    //generateTableHead(table, [districtSelector.selectedOptions[0].text], { colspan: '100%' });
    generateTableHead(table, Object.keys(slots[0]));
}

function generateTableHead(table, data, attr) {
    let thead = table.createTHead();
    let row = thead.insertRow();
    for (let key of data) {
        let th = document.createElement("th");
        if (attr) {
            Object.keys(attr).forEach(key => {
                th.setAttribute(key, attr[key]);
            });
        }
        let text = document.createTextNode(key);
        th.appendChild(text);
        row.appendChild(th);
    }
}

function generateTable(parent, data) {
    try {
        var table = document.createElement("table");
        //table.setAttribute('id', districtSelector.selectedOptions[0].text);
        parent.appendChild(table);

        for (let element of data) {
            let row = table.insertRow();
            for (key in element) {
                let cell = row.insertCell();
                let text = document.createTextNode(element[key]);
                cell.appendChild(text);

                if (element['Vaccine'] == 'COVAXIN') {
                    row.className = 'covaxin';
                }
                else if (element['Vaccine'] == 'COVISHIELD') {
                    row.className = 'covishield';
                }
                else if (element['Vaccine'] == 'SPUTNIK') {
                    row.className = 'sputnik';
                }
            }
        }
        return table;
    } catch (error) {
        writeError(error.message);
    }
}

function getFormattedDate() {
    let date = new Date();
    let year = date.getFullYear();
    let month = (1 + date.getMonth()).toString().padStart(2, '0');
    let day = date.getDate().toString().padStart(2, '0');
    return day + '-' + month + '-' + year;
}

function savePreferences() {
    localStorage.setItem('searchByPIN', searchByPIN.checked);
    localStorage.setItem('PIN', txtPIN.value);
    localStorage.setItem('state', stateSelector.value);
    localStorage.setItem('district', districtSelector.value);
    localStorage.setItem('age', ageSelector.value);
    localStorage.setItem('dose', doseSelector.value);
    localStorage.setItem('vaccine', vaccineSelector.value);
    localStorage.setItem('sortCenters', sortCenters.checked);
    localStorage.setItem('sortCriteria', sortCriteria.value);
    localStorage.setItem('refreshTime', refreshTimeTextBox.value);
}

async function loadPreferences() {
    if (localStorage.getItem('searchByPIN')) {
        if (localStorage.getItem('searchByPIN') == "true") {
            searchByPIN.checked = true;
        } else {
            searchByDistrict.checked = true;
        }
        searchOptionChange();
    }
    localStorage.getItem('PIN') && (txtPIN.value = localStorage.getItem('PIN'));
    localStorage.getItem('state') && (stateSelector.value = localStorage.getItem('state'));
    await updateDistricts();
    localStorage.getItem('district') && (districtSelector.value = localStorage.getItem('district'));
    localStorage.getItem('age') && (ageSelector.value = localStorage.getItem('age'));
    localStorage.getItem('dose') && (doseSelector.value = localStorage.getItem('dose'));
    localStorage.getItem('vaccine') && (vaccineSelector.value = localStorage.getItem('vaccine'));
    localStorage.getItem('sortCenters') && (sortCenters.checked = localStorage.getItem('sortCenters') == "true");
    localStorage.getItem('sortCriteria') && (sortCriteria.value = localStorage.getItem('sortCriteria'));
    localStorage.getItem('refreshTime') && (refreshTimeTextBox.value = localStorage.getItem('refreshTime'));
}

function toggleSort() {
    sortCriteria.disabled = !sortCenters.checked;
}

async function callURL(url) {
    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.error) {
            writeError(data.error);
        } else {
            return data;
        }
    }
    catch (error) {
        writeError(error.message);
    }
}

async function fillStates() {
    const json = await callURL('https://cdn-api.co-vin.in/api/v2/admin/location/states/');
    if (json.states) {
        json.states.forEach((state) => {
            let opt = document.createElement('option');
            opt.value = state.state_id;
            opt.innerHTML = state.state_name;
            stateSelector.appendChild(opt);
        });
    }
    await updateDistricts();
}

async function updateDistricts() {
    while (districtSelector.options.length) {
        districtSelector.remove(0);
    }

    const json = await callURL('https://cdn-api.co-vin.in/api/v2/admin/location/districts/' + stateSelector.value);
    if (json.districts) {
        json.districts.forEach((district) => {
            let opt = document.createElement('option');
            opt.value = district.district_id;
            opt.innerHTML = district.district_name;
            districtSelector.appendChild(opt);
        });
    }
}

function updateMessages() {
    const msgs = [
        "'Search by PIN' option is now available."
        , "Support for 'Sputnik V' is not updated yet. Kindly use 'All' option for 'Vaccine'."
        , "Preferences are auto saved except for 'Audio'."
    ]

    let ol = document.createElement("OL");
    ol.setAttribute("id", "messages");
    ol.setAttribute("style", "margin-top: 5px;");
    divMessage.appendChild(ol);

    msgs.forEach(msg => {
        var li = document.createElement("LI");
        var msgText = document.createTextNode(msg);
        li.appendChild(msgText);
        ol.appendChild(li);
    });
}

let mySideNav = document.getElementById("mySidenav");

function openNav() {
    if (mySideNav.style.width == '550px') {
        closeNav();
    } else {
        mySideNav.style.width = "550px";
        mySideNav.style.height = "auto";
        mySideNav.style.border = '1px solid black';
    }
}

function closeNav() {
    mySideNav.style.width = "0px";
    mySideNav.style.height = "0px";
    mySideNav.style.border = 'none';
}

window.addEventListener('click', function (e) {
    if (!document.getElementById('mySidenav').contains(e.target) && !document.getElementById('myMenu').contains(e.target)) {
        // Clicked in box		
        closeNav();
    } else {

        // document.getElementById("mySidenav").style.width = "0px";
    }
});

function searchOptionChange() {
    if (searchByPIN.checked) {
        document.getElementsByClassName('searchByPIN')[0].style.display = '';
        document.getElementsByClassName('searchByDistrict')[0].style.display = 'none';
        document.getElementsByClassName('searchByDistrict')[1].style.display = 'none';
    }
    else {
        document.getElementsByClassName('searchByPIN')[0].style.display = 'none';
        document.getElementsByClassName('searchByDistrict')[0].style.display = '';
        document.getElementsByClassName('searchByDistrict')[1].style.display = '';
    }
}

function toggleAudioClicked(started = false) {
    startStopAudio.play();
    customAudio.disabled = !started;
}

var userFile = document.getElementById('userFile');
userFile.addEventListener("change", handleFiles, false);
function uploadAudio() {
    if (customAudio.value == 'userAudio') {
        userFile.click();
    }
    else {
        slotFoundAudio = new Audio('https://mobcup.net/va/3333afbbf22897e2953914da36fd741eb');
        userFile.value = '';
    }
}

function handleFiles(event) {
    var files = event.target.files;
    if (files.length > 0) {
        if (files[0].type.split('/')[0] == 'audio') {
            slotFoundAudio.src = URL.createObjectURL(files[0]);
            slotFoundAudio.load();
        }
        else {
            customAudio.value == 'defaultAudio';
        }
    }
    else {
        customAudio.value == 'defaultAudio';
    }
}