
    document.getElementById('logoutBtn').addEventListener('click', function () {
        window.location.href = "/logout";
    });



    document.getElementById('logForm').addEventListener('submit', function (e) {
        e.preventDefault();
        const activityType = document.getElementById('activityType').value;
        const duration = parseInt(document.getElementById('duration').value);
        const calories = parseInt(document.getElementById('calories').value);
        const date = document.getElementById('date').value;

        const activityData = { activityType, duration, calories, date };

        fetch('/log_activity', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(activityData)
        })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
            updateLogHistory();
            renderCharts();
            this.reset();
        });
    });

    function updateLogHistory() {
        fetch('/get_log_history')
        .then(response => response.json())
        .then(data => {
            logHistory.innerHTML = '';
            data.activities.forEach((activity, index) => {
                const li = document.createElement('li');
                li.className = 'list-group-item d-flex justify-content-between align-items-center';
                li.innerHTML = `${activity.activityType} - ${activity.duration} mins - ${activity.calories} calories - ${activity.date}`;
                
                const deleteButton = document.createElement('button');
                deleteButton.className = 'btn btn-danger btn-sm';
                deleteButton.textContent = 'Delete';
                deleteButton.onclick = () => {
                    fetch(`/delete_activity/${activity.id}`, { method: 'DELETE' })
                    .then(response => response.json())
                    .then(data => {
                        alert(data.message);
                        updateLogHistory(); // Refresh the log
                    });
                };

                li.appendChild(deleteButton);
                logHistory.appendChild(li);
            });
        });
    }

    const activities = [];
    const barCtx = document.getElementById('barChart').getContext('2d');
    const lineCtx = document.getElementById('lineChart').getContext('2d');
    const pieCtx = document.getElementById('pieChart').getContext('2d');
    const scatterCtx = document.getElementById('scatterChart').getContext('2d');
    const bubbleCtx = document.getElementById('bubbleChart').getContext('2d');
    const areaCtx = document.getElementById('areaChart').getContext('2d');
    const progressRingCtx = document.getElementById('progressRing').getContext('2d');
    const comboCtx = document.getElementById('comboChart').getContext('2d');
    const radarCtx = document.getElementById('radarChart').getContext('2d');
    let barChart, lineChart, pieChart, scatterChart, bubbleChart, areaChart, progressRingChart, comboChart, radarChart;
    let editingIndex = -1; // Track the activity being edited

    document.getElementById('logForm').addEventListener('submit', function (e) {
        e.preventDefault();
        const activityType = document.getElementById('activityType').value;
        const duration = parseInt(document.getElementById('duration').value);
        const calories = parseInt(document.getElementById('calories').value);
        const date = document.getElementById('date').value; // Get the date

        if (editingIndex >= 0) {
            // Update existing activity
            activities[editingIndex] = { activityType, duration, calories, date };
            alert("Activity updated successfully!");
        } else {
            // Log new activity
            activities.push({ activityType, duration, calories, date });
            alert("Activity logged successfully!");
        }

        updateLogHistory();
        renderCharts();
        this.reset();
        editingIndex = -1; // Reset editing index
        document.querySelector('button[type="submit"]').textContent = 'Log Activity';
    });

    document.getElementById('filterInput').addEventListener('input', function () {
        const filterValue = this.value.toLowerCase();
        updateLogHistory(filterValue);
    });

    document.getElementById('downloadLog').addEventListener('click', function () {
        const dataStr = JSON.stringify(activities, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'log_history.json';
        a.click();
        URL.revokeObjectURL(url);
    });

    document.getElementById('uploadLog').addEventListener('change', function (event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                try {
                    const uploadedActivities = JSON.parse(e.target.result);
                    if (Array.isArray(uploadedActivities)) {
                        activities.splice(0, activities.length, ...uploadedActivities); // Clear and add new activities
                        updateLogHistory();
                        renderCharts();
                        alert("Log history uploaded successfully!");
                    } else {
                        alert("Invalid file format. Please upload a valid JSON file.");
                    }
                } catch (error) {
                    alert("Error reading file: " + error.message);
                }
            };
            reader.readAsText(file);
        }
    });

    function updateLogHistory(filter = '') {
        logHistory.innerHTML = '';
        activities
            .filter(activity => activity.activityType.toLowerCase().includes(filter))
            .forEach((activity, index) => {
                const li = document.createElement('li');
                li.className = 'list-group-item d-flex justify-content-between align-items-center';
                
                // Add fitness icon based on activity type
                const icon = getActivityIcon(activity.activityType);
                li.innerHTML = `<i class="${icon} activity-icon"></i>${activity.activityType} - ${activity.duration} mins - ${activity.calories} calories - ${activity.date}`;

                // Edit button
                const editButton = document.createElement('button');
                editButton.className = 'btn btn-warning btn-sm';
                editButton.textContent = 'Edit';
                editButton.onclick = () => {
                    document.getElementById('activityType').value = activity.activityType;
                    document.getElementById('duration').value = activity.duration;
                    document.getElementById('calories').value = activity.calories;
                    document.getElementById('date').value = activity.date; // Set the date
                    editingIndex = index; // Set the editing index
                    updateLogHistory(); // Update the log display
                    document.querySelector('button[type="submit"]').textContent = 'Update Activity'; // Change button text
                };

                // Delete button
                const deleteButton = document.createElement('button');
                deleteButton.className = 'btn btn-danger btn-sm';
                deleteButton.textContent = 'Delete';
                deleteButton.onclick = () => {
                    activities.splice(index, 1); // Remove the activity
                    updateLogHistory(); // Update the log display
                    renderCharts(); // Re-render the charts
                };

                li.appendChild(editButton);
                li.appendChild(deleteButton);
                logHistory.appendChild(li);
            });
    }

    function getActivityIcon(activityType) {
        switch (activityType.toLowerCase()) {
            case 'running':
                return 'fas fa-running';
            case 'cycling':
                return 'fas fa-bicycle';
            case 'swimming':
                return 'fas fa-swimmer';
            case 'yoga':
                return 'fas fa-om';
            case 'weightlifting':
                return 'fas fa-dumbbell';
            case 'hiking':
                return 'fas fa-hiking';
            case 'walking':
                return 'fas fa-walking';
            case 'boxing':
                return 'fas fa-fist-raised';
            case 'dancing':
                return 'fas fa-music';
            case 'crossfit':
                return 'fas fa-people-arrows';
            case 'skiing':
                return 'fas fa-skiing';
            case 'skating':
                return 'fas fa-skating';
            case 'soccer':
                return 'fas fa-futbol';
            case 'basketball':
                return 'fas fa-basketball-ball';
            case 'tennis':
                return 'fas fa-table-tennis';
            case 'golf':
                return 'fas fa-golf-ball';
            case 'baseball':
                return 'fas fa-baseball-ball';
            case 'volleyball':
                return 'fas fa-volleyball-ball';
            case 'rock climbing':
                return 'fas fa-mountain';
            case 'fishing':
                return 'fas fa-fish';
            case 'surfing':
                return 'fas fa-water';
            default:
                return 'fas fa-futbol'; // Default icon
        }
    }

    function renderCharts() {
        const labels = activities.map(activity => activity.activityType);
        const caloriesData = activities.map(activity => activity.calories);
        const durationData = activities.map(activity => activity.duration);
        

        // Bar Chart
        if (barChart) {
            barChart.destroy();
        }
        barChart = new Chart(barCtx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Calories Burned',
                    data: caloriesData,
                    backgroundColor: 'rgba(75, 192, 192, 0.5)',
                    borderColor: 'rgba(75, 192, 192, 1)',
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

        // Line Chart
        if (lineChart) {
            lineChart.destroy();
        }
        lineChart = new Chart(lineCtx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Duration',
                    data: durationData,
                    fill: false,
                    borderColor: 'rgba(153, 102, 255, 1)',
                    tension: 0.1
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

        // Pie Chart
        if (pieChart) {
            pieChart.destroy();
        }
        pieChart = new Chart(pieCtx, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Calories Distribution',
                    data: caloriesData,
                    backgroundColor: labels.map((_, index) => `hsl(${index * 360 / labels.length}, 70%, 50%)`),
                    hoverOffset: 4
                }]
            }
        });

        // Scatter Chart
        if (scatterChart) {
            scatterChart.destroy();
        }
        scatterChart = new Chart(scatterCtx, {
            type: 'scatter',
            data: {
                datasets: [{
                    label: 'Calories vs Duration',
                    data: activities.map(activity => ({
                        x: activity.duration,
                        y: activity.calories
                    })),
                    backgroundColor: 'rgba(255, 99, 132, 0.5)'
                }]
            },
            options: {
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Duration (minutes)'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Calories Burned'
                        }
                    }
                }
            }
        });

        // Bubble Chart
        if (bubbleChart) {
            bubbleChart.destroy();
        }
        bubbleChart = new Chart(bubbleCtx, {
            type: 'bubble',
            data: {
                datasets: [{
                    label: 'Activities',
                    data: activities.map(activity => ({
                        x: activity.duration,
                        y: activity.calories,
                        r: Math.sqrt(activity.calories) * 2 // Radius based on calories
                    })),
                    backgroundColor: 'rgba(54, 162, 235, 0.5)'
                }]
            },
            options: {
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Duration (minutes)'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Calories Burned'
                        }
                    }
                }
            }
        });

        // Area Chart
        if (areaChart) {
            areaChart.destroy();
        }
        areaChart = new Chart(areaCtx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Calories Burned',
                    data: caloriesData,
                    fill: true,
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgba(75, 192, 192, 1)',
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
    
    // Progress Ring
    if (progressRingChart) {
        progressRingChart.destroy();
    }
    const totalCalories = caloriesData.reduce((a, b) => a + b, 0);
    const targetCalories = 2000; // Example target
    progressRingChart = new Chart(progressRingCtx, {
        type: 'doughnut',
        data: {
            labels: ['Burned', 'Remaining'],
            datasets: [{
                label: 'Calories Progress',
                data: [totalCalories, targetCalories - totalCalories],
                backgroundColor: ['#36A2EB', '#FF6384'],
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    callbacks: {
                        label: function(tooltipItem) {
                            return tooltipItem.label + ': ' + tooltipItem.raw + ' calories';
                        }
                    }
                }
            }
        }
    });

    // Combo Chart
    if (comboChart) {
        comboChart.destroy();
    }
    comboChart = new Chart(comboCtx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Calories Burned',
                data: caloriesData,
                backgroundColor: 'rgba(75, 192, 192, 0.5)',
                yAxisID: 'calories',
            }, {
                label: 'Duration',
                data: durationData,
                type: 'line',
                borderColor: 'rgba(153, 102, 255, 1)',
                fill: false,
                yAxisID: 'duration',
            }]
        },
        options: {
            scales: {
                calories: {
                    type: 'linear',
                    position: 'left',
                    beginAtZero: true
                },
                duration: {
                    type: 'linear',
                    position: 'right',
                    beginAtZero: true
                }
            }
        }
    });

// Radar Chart
if (radarChart) {
    radarChart.destroy();
}
radarChart = new Chart(radarCtx, {
    type: 'radar',
    data: {
        labels: activities.map(activity => activity.activityType),
        datasets: [{
            label: 'Calories Burned',
            data: activities.map(activity => activity.calories),
            backgroundColor: 'rgba(75, 192, 192, 0.2)', // Fill color
            borderColor: 'rgba(75, 192, 192, 1)', // Line color
            borderWidth: 2,
            pointBackgroundColor: 'rgba(75, 192, 192, 1)', // Point color
            pointBorderColor: '#fff', // Point border color
            pointBorderWidth: 2,
            pointRadius: 5,
        }]
    },
    options: {
        scales: {
            r: {
                angleLines: {
                    display: true,
                },
                suggestedMin: 0,
                suggestedMax: Math.max(...activities.map(activity => activity.calories)) + 50, // Adjust max value
                ticks: {
                    stepSize: 50 // Adjust based on your data scale
                }
            }
        },
        elements: {
            line: {
                tension: 0.2 // Smoothness of the line
            }
        },
        plugins: {
            tooltip: {
                callbacks: {
                    label: function(context) {
                        return `${context.label}: ${context.raw} calories`;
                    }
                }
            }
        }
    }
});

}




