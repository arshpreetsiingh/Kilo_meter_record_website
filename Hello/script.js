let totalKilometers = 0;

document.addEventListener('DOMContentLoaded', () => {
    loadRecords();
    updateTotalKilometers();
    updateMonthlySummary();
    renderChart();
    setupDarkModeToggle();
});

function recordKilometers() {
    let kilometersInput = document.getElementById('kilometers');
    let dateInput = document.getElementById('date');
    let kilometers = parseFloat(kilometersInput.value);
    let date = dateInput.value;

    if (!isNaN(kilometers) && kilometers >= 0 && date) {
        let record = { kilometers: kilometers, date: date };
        saveRecord(record);

        totalKilometers += kilometers;
        updateTotalKilometers();
        addRecordToList(record);
        updateMonthlySummary();
        renderChart();

        kilometersInput.value = '';
        dateInput.value = '';
    } else {
        alert('Please enter valid kilometers and select a date.');
    }
}

function saveRecord(record) {
    let records = JSON.parse(localStorage.getItem('records')) || [];
    records.push(record);
    localStorage.setItem('records', JSON.stringify(records));
}

function loadRecords() {
    let records = JSON.parse(localStorage.getItem('records')) || [];
    records.forEach(record => {
        totalKilometers += record.kilometers;
        addRecordToList(record);
    });
}

function updateTotalKilometers() {
    document.getElementById('total-kilometers').innerText = `Total Kilometers Driven: ${totalKilometers.toFixed(1)} km`;
}

function addRecordToList(record) {
    let recordsList = document.getElementById('records');
    let recordElement = document.createElement('div');
    recordElement.className = 'record-item';
    recordElement.innerHTML = `
        <span>${record.date} - ${record.kilometers.toFixed(1)} km</span>
        <div>
            <button class="edit" onclick="editRecord(this, ${record.kilometers}, '${record.date}')"><i class="fas fa-edit"></i></button>
            <button class="delete" onclick="deleteRecord(this, ${record.kilometers}, '${record.date}')"><i class="fas fa-trash-alt"></i></button>
        </div>
    `;
    recordsList.appendChild(recordElement);
}

function deleteRecord(button, kilometers, date) {
    let records = JSON.parse(localStorage.getItem('records')) || [];
    records = records.filter(record => record.date !== date || record.kilometers !== kilometers);
    localStorage.setItem('records', JSON.stringify(records));
    
    totalKilometers -= kilometers;
    updateTotalKilometers();
    updateMonthlySummary();
    renderChart();
    
    button.closest('.record-item').remove();
}

function resetRecords() {
    if (confirm('Are you sure you want to reset all records?')) {
        localStorage.removeItem('records');
        totalKilometers = 0;
        updateTotalKilometers();
        document.getElementById('records').innerHTML = '';
        document.getElementById('monthly-summary').innerHTML = '';
        renderChart();
    }
}

function updateMonthlySummary() {
    let records = JSON.parse(localStorage.getItem('records')) || [];
    let monthlySummary = {};

    records.forEach(record => {
        let month = record.date.substring(0, 7); // Extract the "YYYY-MM" part
        if (!monthlySummary[month]) {
            monthlySummary[month] = 0;
        }
        monthlySummary[month] += record.kilometers;
    });

    let summaryContainer = document.getElementById('monthly-summary');
    summaryContainer.innerHTML = '';

    for (let month in monthlySummary) {
        let monthItem = document.createElement('div');
        monthItem.className = 'month-item';
        monthItem.innerText = `${month}: ${monthlySummary[month].toFixed(1)} km`;
        summaryContainer.appendChild(monthItem);
    }
}

function filterRecords() {
    let startDate = document.getElementById('start-date').value;
    let endDate = document.getElementById('end-date').value;
    let records = JSON.parse(localStorage.getItem('records')) || [];

    let filteredRecords = records.filter(record => {
        return (!startDate || record.date >= startDate) && (!endDate || record.date <= endDate);
    });

    document.getElementById('records').innerHTML = '';
    filteredRecords.forEach(record => {
        addRecordToList(record);
    });
}

function searchRecords() {
    let searchInput = document.getElementById('search-input').value.toLowerCase();
    let records = JSON.parse(localStorage.getItem('records')) || [];

    let filteredRecords = records.filter(record => {
        return record.date.includes(searchInput) || record.kilometers.toString().includes(searchInput);
    });

    document.getElementById('records').innerHTML = '';
    filteredRecords.forEach(record => {
        addRecordToList(record);
    });
}

function sortRecords() {
    let sortBy = document.getElementById('sort-by').value;
    let records = JSON.parse(localStorage.getItem('records')) || [];

    records.sort((a, b) => {
        if (sortBy === 'date') {
            return new Date(a.date) - new Date(b.date);
        } else if (sortBy === 'kilometers') {
            return a.kilometers - b.kilometers;
        }
    });

    document.getElementById('records').innerHTML = '';
    records.forEach(record => {
        addRecordToList(record);
    });
}

function editRecord(button, kilometers, date) {
    let newKilometers = prompt("Enter new kilometers:", kilometers);
    let newDate = prompt("Enter new date (YYYY-MM-DD):", date);

    if (newKilometers !== null && newDate !== null && !isNaN(parseFloat(newKilometers)) && newDate) {
        let records = JSON.parse(localStorage.getItem('records')) || [];
        let index = records.findIndex(record => record.date === date && record.kilometers === kilometers);

        if (index !== -1) {
            totalKilometers -= records[index].kilometers;
            records[index].kilometers = parseFloat(newKilometers);
            records[index].date = newDate;

            localStorage.setItem('records', JSON.stringify(records));
            totalKilometers += parseFloat(newKilometers);

            updateTotalKilometers();
            updateMonthlySummary();
            renderChart();
            document.getElementById('records').innerHTML = '';
            records.forEach(record => {
                addRecordToList(record);
            });
        }
    }
}

function exportRecords() {
    let records = JSON.parse(localStorage.getItem('records')) || [];
    if (records.length === 0) {
        alert('No records to export.');
        return;
    }

    let csvContent = "data:text/csv;charset=utf-8,Date,Kilometers\n";
    records.forEach(record => {
        csvContent += `${record.date},${record.kilometers}\n`;
    });

    let encodedUri = encodeURI(csvContent);
    let link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'scooty_records.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function renderChart() {
    let records = JSON.parse(localStorage.getItem('records')) || [];
    let monthlySummary = {};

    records.forEach(record => {
        let month = record.date.substring(0, 7); // Extract the "YYYY-MM" part
        if (!monthlySummary[month]) {
            monthlySummary[month] = 0;
        }
        monthlySummary[month] += record.kilometers;
    });

    let labels = Object.keys(monthlySummary);
    let data = Object.values(monthlySummary);

    const ctx = document.getElementById('chart').getContext('2d');
    if (window.kilometersChart) {
        window.kilometersChart.destroy();
    }
    window.kilometersChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Kilometers Driven',
                data: data,
                backgroundColor: 'rgba(54, 162, 235, 0.6)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function setupDarkModeToggle() {
    const toggleButton = document.getElementById('toggle-dark-mode');
    toggleButton.addEventListener('click', () => {
        document.documentElement.toggleAttribute('data-theme');
    });
}
