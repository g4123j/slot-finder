var defaultRefreshTime = 5;		//seconds

var startStopAudio = new Audio('https://mobcup.net/va/77f42445a619e9fa82ec6345a4f073be6');
var slotFoundAudio = new Audio('https://mobcup.net/va/3333afbbf22897e2953914da36fd741eb');

var stateSelector = document.getElementById("stateSelector");
var districtSelector = document.getElementById("districtSelector");
var ageSelector = document.getElementById("ageSelector");
var doseSelector = document.getElementById("doseSelector");
var vaccineSelector = document.getElementById("vaccineSelector");

var toggleAudio = document.getElementById("toggleAudio");
var sortCenters = document.getElementById("sortCenters");
var sortCriteria = document.getElementById("sortCriteria");

var refreshTimeTextBox = document.getElementById("refreshTime");

var divResult = document.getElementById("divResult");

var divMessage = document.getElementById("divMessage");
updateMessages();

var txtPIN = document.getElementById('txtPIN');
var searchURL = '';

var searchByPIN = document.getElementById('PIN');
var searchByDistrict = document.getElementById('DISTRICT');

var customAudio = document.getElementById('customAudio');

function updateTime() {
    let num = Number(refreshTimeTextBox.value);
    refreshTime = (isNaN(num) ? defaultRefreshTime : (num > 0 ? num : defaultRefreshTime));
    refreshTimeTextBox.value = refreshTime;
    refreshTime *= 1000;
    openNav();
    startSearching();
}

var refreshTime;
var refreshCycle;

fillStates().then(() => {
    loadPreferences().then(() => {
        searchOptionChange();
        toggleSort();
        updateTime();
    }).catch((error) => {
        writeError('Failed to load preferences');
        updateTime();
    });
}).catch((error) => {
    writeError('Failed to load State and Districts, kindly refresh the page or try after some time');
    updateTime();
});

function startSearching() {
    savePreferences();
    refreshCycle && clearInterval(refreshCycle);
    searchSlots();
    refreshCycle = setInterval(() => {
        searchSlots();
    }, refreshTime);
}

let regex = new RegExp('\\d{6}');
function validatePIN() {
    let value = txtPIN.value;
    return regex.test(value) ? true : false;
}

async function searchSlots() {
    try {
        divResult.innerHTML = '';
        if (searchByPIN.checked) {
            if (validatePIN()) {
                searchURL = 'https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByPin?pincode=' + txtPIN.value + '&date=' + getFormattedDate();
            }
            else {
                writeError('Invalid PIN');
                return;
            }
        }
        else {
            searchURL = 'https://cdn-api.co-vin.in/api/v2/appointment/sessions/calendarByDistrict?district_id=' + districtSelector.value + '&date=' + getFormattedDate();
        }

        const data = await callURL(searchURL);

        let slots = [];
        if (data && data.centers) {
            let counter = 1;
            data.centers.forEach((center) => {
                center.sessions.sort((a, b) => { new Date(a.date) - new Date(b.date) })
                    .forEach((session) => {
                        if (vaccineSelector.value != 'ALL' && session.vaccine != vaccineSelector.value) {
                            return false;
                        }
                        if (session.min_age_limit == ageSelector.value) {
                            const res = {
                                'No.': counter,
                                Name: center.name,
                                Pincode: center.pincode,
                                Vaccine: session.vaccine,
                                Date: session.date,
                                Count: 0
                            };

                            if (doseSelector.value == 0) {
                                res.Count = Math.ceil(session.available_capacity);
                            } else if (doseSelector.value == 1) {
                                res.Count = Math.ceil(session.available_capacity_dose1);
                            } else if (doseSelector.value == 2) {
                                res.Count = Math.ceil(session.available_capacity_dose2);
                            }
                            if (res.Count > 0) {
                                counter++;
                                slots.push(res);
                            }
                        }
                    });
            });
        }
        if (slots.length > 0) {
            if (sortCenters.checked) {
                if (typeof slots[0][sortCriteria.value] == "number") {
                    slots.sort((a, b) => b[sortCriteria.value] - a[sortCriteria.value]);
                }
                else if (typeof slots[0][sortCriteria.value] == "string") {
                    slots.sort((a, b) => a[sortCriteria.value].localeCompare(b[sortCriteria.value]))
                }
                slots.map((item, index) => {
                    item['No.'] = index + 1;
                });
            }
            generateView(slots);
            toggleAudio.checked && slotFoundAudio.play();
        }
        else {
            writeError('No slots');
        }
    }
    catch (error) {
        writeError(error.message);
    }
}