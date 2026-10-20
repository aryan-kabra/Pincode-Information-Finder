const modeToggle = document.getElementById('modeToggle');
const pincodeSearchBox = document.getElementById('pincodeSearchBox');
const locationSearchBox = document.getElementById('locationSearchBox');

const pincodeInput = document.getElementById("pincode");
const searchBtn = document.getElementById("searchBtn");

const stateSelect = document.getElementById("stateSelect");
const districtInput = document.getElementById("districtInput");
const areaInput = document.getElementById("areaInput");
const areaSuggestions = document.getElementById("areaSuggestions");
const findPinBtn = document.getElementById("findPinBtn");

const loading = document.getElementById("loading");
const errorBox = document.getElementById("error");
const resultCard = document.getElementById("resultCard");
const multipleResultsBox = document.getElementById("multipleResultsBox");
const postOfficeSelect = document.getElementById("postOfficeSelect");

const mainSubtitle = document.getElementById("mainSubtitle");
const officeName = document.getElementById("officeName");
const pinValue = document.getElementById("pinValue");
const deliveryStatus = document.getElementById("deliveryStatus");
const district = document.getElementById("district");
const state = document.getElementById("state");
const branchType = document.getElementById("branchType");
const region = document.getElementById("region");
const division = document.getElementById("division");

let currentMode = 'pincode'; 
let fetchedOffices = [];

window.onload = function () {
    
};

modeToggle.addEventListener("click", function () {
    errorBox.classList.add("hidden");
    resultCard.classList.add("hidden");
    multipleResultsBox.classList.add("hidden");

    if (currentMode === 'pincode') {
        currentMode = 'location';
        document.body.classList.add('area-mode-active');
        pincodeSearchBox.classList.add('hidden');
        locationSearchBox.classList.remove('hidden');
        modeToggle.textContent = "Switch to Pincode Search";
        mainSubtitle.textContent = "Select your State, District, and Area to find your exact Pincode.";
    } else {
        currentMode = 'pincode';
        document.body.classList.remove('area-mode-active');
        locationSearchBox.classList.add('hidden');
        pincodeSearchBox.classList.remove('hidden');
        modeToggle.textContent = "Don't know your Pincode??";
        mainSubtitle.textContent = "Enter any valid Indian Pincode to view Post Office details.";
    }
});

// Pincode Search Event Listener
searchBtn.addEventListener("click", function () {
    const pin = pincodeInput.value.trim();
    searchPincode(pin);
});

pincodeInput.addEventListener("keypress", function (event) {
    if (event.key === "Enter") searchBtn.click();
});

// Location Search Event Listener
findPinBtn.addEventListener("click", function () {
    searchByLocation();
});

function sortPostOfficesByHierarchy(offices) {
    return offices.sort((a, b) => {
        const nameA = (a.Name || "").toLowerCase();
        const nameB = (b.Name || "").toLowerCase();
        const distA = (a.District || "").toLowerCase();
        const distB = (b.District || "").toLowerCase();
        const typeA = (a.BranchType || "").toLowerCase();
        const typeB = (b.BranchType || "").toLowerCase();


        const isHeadA = typeA.includes("head");
        const isHeadB = typeB.includes("head");
        if (isHeadA && !isHeadB) return -1;
        if (isHeadB && !isHeadA) return 1;

        
        const isMainA = distA && nameA.includes(distA);
        const isMainB = distB && nameB.includes(distB);
        if (isMainA && !isMainB) return -1;
        if (isMainB && !isMainA) return 1;

        
        const getRank = (t) => {
            if (t.includes("sub")) return 2;
            if (t.includes("branch")) return 3;
            return 4;
        };

        const rankA = getRank(typeA);
        const rankB = getRank(typeB);
        if (rankA !== rankB) return rankA - rankB;

        return nameA.localeCompare(nameB);
    });
}

// Direct Pincode Search Function
async function searchPincode(pincode) {
    errorBox.classList.add("hidden");
    resultCard.classList.add("hidden");
    multipleResultsBox.classList.add("hidden");

    if (pincode.length !== 6 || isNaN(pincode)) {
        showError("Please enter a valid 6-digit Indian Pincode.");
        return;
    }

    loading.classList.remove("hidden");

    try {
        const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
        const data = await response.json();
        loading.classList.add("hidden");

        if (data[0].Status === "Error" || !data[0].PostOffice) {
            showError("No Post Office found for this Pincode.");
            return;
        }

        fetchedOffices = sortPostOfficesByHierarchy(data[0].PostOffice);
        displayOfficeDetails(fetchedOffices[0]);
        setupMultipleOfficeDropdown(fetchedOffices);

        saveSearch("Pincode", pincode, fetchedOffices[0]);

    } catch (err) {
        loading.classList.add("hidden");
        showError("Something went wrong. Please check your internet connection.");
    }
}

async function searchByLocation() {
    const selectedState = stateSelect.value;
    const districtVal = districtInput.value.trim();
    const areaVal = areaInput.value.trim();

    const queryTerm = areaVal || districtVal;

    if (!queryTerm || queryTerm.length < 3) {
        showError("Please enter at least 3 letters in District/City or Area field.");
        return;
    }

    errorBox.classList.add("hidden");
    resultCard.classList.add("hidden");
    multipleResultsBox.classList.add("hidden");
    loading.classList.remove("hidden");

    try {
        const response = await fetch(`https://api.postalpincode.in/postoffice/${encodeURIComponent(queryTerm)}`);
        const data = await response.json();
        loading.classList.add("hidden");

        if (data[0].Status === "Error" || !data[0].PostOffice) {
            showError("No Post Office or Pincode details found for this location.");
            return;
        }

        let offices = data[0].PostOffice;

        if (selectedState !== "All") {
            const filtered = offices.filter(po => po.State.toLowerCase() === selectedState.toLowerCase());
            if (filtered.length > 0) offices = filtered;
        }

        if (districtVal) {
            const distFiltered = offices.filter(po => po.District.toLowerCase().includes(districtVal.toLowerCase()));
            if (distFiltered.length > 0) offices = distFiltered;
        }

        fetchedOffices = sortPostOfficesByHierarchy(offices);

        displayOfficeDetails(fetchedOffices[0]);
        setupMultipleOfficeDropdown(fetchedOffices);

        saveSearch("Location", queryTerm, fetchedOffices[0]);

        populateAutocomplete(fetchedOffices);
        
    } catch (err) {
        loading.classList.add("hidden");
        showError("Failed to fetch postal data. Please try again.");
    }
}

function displayOfficeDetails(office) {
    
    officeName.textContent = office.Name;
    pinValue.textContent = office.Pincode;
    district.textContent = office.District;
    state.textContent = office.State;
    branchType.textContent = office.BranchType;
    region.textContent = office.Region || '-';
    division.textContent = office.Division || '-';

    deliveryStatus.textContent = office.DeliveryStatus;
    deliveryStatus.className = "status";
    if (office.DeliveryStatus.toLowerCase() === "delivery") {
        deliveryStatus.classList.add("delivery");
    } else {
        deliveryStatus.classList.add("non-delivery");
    }

    resultCard.classList.remove("hidden");
}

function setupMultipleOfficeDropdown(offices) {
    if (offices.length <= 1) {
        multipleResultsBox.classList.add("hidden");
        return;
    }

    postOfficeSelect.innerHTML = "";
    offices.forEach((po, index) => {
        const opt = document.createElement("option");
        opt.value = index;
        opt.textContent = `${po.Name} - Pincode: ${po.Pincode} (${po.District}, ${po.State})`;
        postOfficeSelect.appendChild(opt);
    });

    multipleResultsBox.classList.remove("hidden");

    postOfficeSelect.onchange = function () {
        const selected = offices[postOfficeSelect.value];
        if (selected) displayOfficeDetails(selected);
    };
}

function populateAutocomplete(offices) {
    areaSuggestions.innerHTML = "";
    const uniqueNames = [...new Set(offices.map(po => po.Name))];
    uniqueNames.slice(0, 10).forEach(name => {
        const opt = document.createElement("option");
        opt.value = name;
        areaSuggestions.appendChild(opt);
    });
}

function showError(message) {
    errorBox.textContent = message;
    errorBox.classList.remove("hidden");
}

async function saveSearch(searchType, searchValue, office) {
    const formData = new FormData();

    formData.append("search_type", searchType);
    formData.append("search_value", searchValue);
    formData.append("post_office", office.Name);
    formData.append("district", office.District);
    formData.append("state", office.State);
    formData.append("pincode", office.Pincode);

    try {
        await fetch("save_search.php", {
            method: "POST",
            body: formData
        });
    } catch (error) {
        console.log("Unable to save search.");
    }
}