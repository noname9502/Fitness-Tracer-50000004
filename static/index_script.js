document.addEventListener('DOMContentLoaded', () => {
    const logForm = document.getElementById('logForm');
    const logHistory = document.getElementById('logHistory');
    const filterInput = document.getElementById('filterInput');
    const downloadLog = document.getElementById('downloadLog');
    const uploadLog = document.getElementById('uploadLog');

    const barCtx = document.getElementById('barChart').getContext('2d');
    const lineCtx = document.getElementById('lineChart').getContext('2d');
    const pieCtx = document.getElementById('pieChart').getContext('2d');
    const scatterCtx = document.getElementById('scatterChart').getContext('2d');
    const bubbleCtx = document.getElementById('bubbleChart').getContext('2d');
    const areaCtx = document.getElementById('areaChart').getContext('2d');
    const progressRingCtx = document.getElementById('progressRing').getContext('2d');
    const comboCtx = document.getElementById('comboChart').getContext('2d');
    const radarCtx = document.getElementById('radarChart').getContext('2d');

    let activities = [];
    let editingId = null;

    // Fetch activities from DB 
    async function loadActivities() {
        try {
            const response = await fetch('/get_log_history');
            const data = await response.json();
            activities = data.activities || [];
            updateLogHistory();
            renderCharts();
        } catch (err) {
            console.error("Failed to fetch activities:", err);
        }
    }

    // Log / Edit activity 
    logForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const activityType = document.getElementById('activityType').value;
        const duration = parseInt(document.getElementById('duration').value);
        const calories = parseInt(document.getElementById('calories').value);
        const date = document.getElementById('date').value;

        const activityData = { activityType, duration, calories, date };

        try {
            if (editingId) {
                // Update existing activity
                const res = await fetch(`/update_activity/${editingId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(activityData)
                });
                const data = await res.json();
                alert(data.message);
            } else {
                // Add new activity
                const res = await fetch('/log_activity', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(activityData)
                });
                const data = await res.json();
                alert(data.message);
            }

            editingId = null;
            logForm.reset();
            document.querySelector('button[type="submit"]').textContent = 'Log Activity';
            await loadActivities();
        } catch (err) {
            console.error("Failed to log activity:", err);
        }
    });

    // Update Log History 
   async function updateLogHistory(filter = '') {
    const logHistory = document.getElementById('logHistory');
    logHistory.innerHTML = '';

    activities
        .filter(activity => activity.activityType.toLowerCase().includes(filter))
        .forEach((activity) => {
            const li = document.createElement('li');
            li.className = 'list-group-item d-flex justify-content-between align-items-center';
            
            const icon = getActivityIcon(activity.activityType);
            li.innerHTML = `<i class="${icon} activity-icon"></i>${activity.activityType} - ${activity.duration} mins - ${activity.calories} calories - ${activity.date}`;

            // Edit button
            const editBtn = document.createElement('button');
            editBtn.className = 'btn btn-warning btn-sm';
            editBtn.textContent = 'Edit';
            editBtn.onclick = () => {
                document.getElementById('activityType').value = activity.activityType;
                document.getElementById('duration').value = activity.duration;
                document.getElementById('calories').value = activity.calories;
                document.getElementById('date').value = activity.date;
                editingId = activity.id;  // Use DB ID
                document.querySelector('button[type="submit"]').textContent = 'Update Activity';
            };

            // Delete button
            const delBtn = document.createElement('button');
            delBtn.className = 'btn btn-danger btn-sm';
            delBtn.textContent = 'Delete';
            delBtn.onclick = async () => {
                if (confirm('Are you sure you want to delete this activity?')) {
                    const res = await fetch(`/delete_activity/${activity.id}`, { method: 'DELETE' });
                    const data = await res.json();
                    alert(data.message);
                    await loadActivities(); // Reload activities from DB
                }
            };

            li.appendChild(editBtn);
            li.appendChild(delBtn);
            logHistory.appendChild(li);
        });
}


    // Activity Icons 
    function getActivityIcon(type) {
        const icons = {
            running: 'fas fa-running',
            cycling: 'fas fa-bicycle',
            swimming: 'fas fa-swimmer',
            yoga: 'fas fa-om',
            weightlifting: 'fas fa-dumbbell',
            hiking: 'fas fa-hiking',
            walking: 'fas fa-walking',
            boxing: 'fas fa-fist-raised',
            dancing: 'fas fa-music',
            crossfit: 'fas fa-people-arrows',
            skiing: 'fas fa-skiing',
            skating: 'fas fa-skating',
            soccer: 'fas fa-futbol',
            basketball: 'fas fa-basketball-ball',
            tennis: 'fas fa-table-tennis',
            golf: 'fas fa-golf-ball',
            baseball: 'fas fa-baseball-ball',
            volleyball: 'fas fa-volleyball-ball',
            'rock climbing': 'fas fa-mountain',
            fishing: 'fas fa-fish',
            surfing: 'fas fa-water'
        };
        return icons[type.toLowerCase()] || 'fas fa-futbol';
    }

    // Filter Input 
    filterInput.addEventListener('input', () => {
        updateLogHistory(filterInput.value.toLowerCase());
    });

    // Charts 
    let barChart, lineChart, pieChart, scatterChart, bubbleChart, areaChart, progressRingChart, comboChart, radarChart;

    function renderCharts() {
        const labels = activities.map(a => a.activityType);
        const caloriesData = activities.map(a => a.calories);
        const durationData = activities.map(a => a.duration);

        // Bar Chart 
        if (barChart) barChart.destroy();
        barChart = new Chart(barCtx, {
            type: 'bar',
            data: { labels, datasets: [{ label: 'Calories Burned', data: caloriesData, backgroundColor: 'rgba(75,192,192,0.5)', borderColor: 'rgba(75,192,192,1)', borderWidth: 1 }] },
            options: { scales: { y: { beginAtZero: true } } }
        });

        // Line Chart 
        if (lineChart) lineChart.destroy();
        lineChart = new Chart(lineCtx, {
            type: 'line',
            data: { labels, datasets: [{ label: 'Duration', data: durationData, borderColor: 'rgba(153,102,255,1)', fill: false, tension: 0.1 }] },
            options: { scales: { y: { beginAtZero: true } } }
        });

        // Pie Chart 
        if (pieChart) pieChart.destroy();
        pieChart = new Chart(pieCtx, {
            type: 'pie',
            data: { labels, datasets: [{ label: 'Calories Distribution', data: caloriesData, backgroundColor: labels.map((_, i) => `hsl(${i*360/labels.length},70%,50%)`), hoverOffset: 4 }] }
        });

        // Scatter Chart 
        if (scatterChart) scatterChart.destroy();
        scatterChart = new Chart(scatterCtx, {
            type: 'scatter',
            data: { datasets: [{ label: 'Calories vs Duration', data: activities.map(a => ({ x: a.duration, y: a.calories })), backgroundColor: 'rgba(255,99,132,0.5)' }] },
            options: { scales: { x: { title: { display: true, text: 'Duration (minutes)' } }, y: { title: { display: true, text: 'Calories Burned' } } } }
        });

        //  Bubble Chart 
        if (bubbleChart) bubbleChart.destroy();
        bubbleChart = new Chart(bubbleCtx, {
            type: 'bubble',
            data: { datasets: [{ label: 'Activities', data: activities.map(a => ({ x: a.duration, y: a.calories, r: Math.sqrt(a.calories)*2 })), backgroundColor: 'rgba(54,162,235,0.5)' }] },
            options: { scales: { x: { title: { display: true, text: 'Duration (minutes)' } }, y: { title: { display: true, text: 'Calories Burned' } } } }
        });

        // Area Chart 
        if (areaChart) areaChart.destroy();
        areaChart = new Chart(areaCtx, {
            type: 'line',
            data: { labels, datasets: [{ label: 'Calories Burned', data: caloriesData, fill: true, backgroundColor: 'rgba(75,192,192,0.2)', borderColor: 'rgba(75,192,192,1)', borderWidth: 1 }] },
            options: { scales: { y: { beginAtZero: true } } }
        });

        // Progress Ring 
        if (progressRingChart) progressRingChart.destroy();
        const totalCalories = caloriesData.reduce((a,b)=>a+b,0);
        const targetCalories = 2000;
        progressRingChart = new Chart(progressRingCtx, {
            type: 'doughnut',
            data: { labels: ['Burned','Remaining'], datasets: [{ data: [totalCalories,targetCalories-totalCalories], backgroundColor:['#36A2EB','#FF6384'], hoverOffset: 4 }] },
            options: { plugins: { tooltip: { callbacks: { label: t=>`${t.label}: ${t.raw} calories` } } } }
        });

        // Combo Chart 
        if (comboChart) comboChart.destroy();
        comboChart = new Chart(comboCtx, {
            data: {
                labels,
                datasets: [
                    { label: 'Calories Burned', data: caloriesData, type: 'bar', backgroundColor:'rgba(75,192,192,0.5)', yAxisID:'calories' },
                    { label: 'Duration', data: durationData, type: 'line', borderColor:'rgba(153,102,255,1)', fill:false, yAxisID:'duration' }
                ]
            },
            options: {
                scales: {
                    calories: { type:'linear', position:'left', beginAtZero:true },
                    duration: { type:'linear', position:'right', beginAtZero:true }
                }
            }
        });

        // Radar Chart 
        if (radarChart) radarChart.destroy();
        radarChart = new Chart(radarCtx, {
            type:'radar',
            data:{
                labels: labels,
                datasets:[{ label:'Calories Burned', data: caloriesData, backgroundColor:'rgba(75,192,192,0.2)', borderColor:'rgba(75,192,192,1)', borderWidth:2, pointBackgroundColor:'rgba(75,192,192,1)', pointBorderColor:'#fff', pointBorderWidth:2, pointRadius:5 }]
            },
            options:{ scales:{ r:{ angleLines:{ display:true }, suggestedMin:0, suggestedMax: Math.max(...caloriesData)+50, ticks:{ stepSize:50 } } } }
        });
    }

    // Logout 
    document.getElementById('logoutBtn').addEventListener('click', () => {
        window.location.href = '/logout';
    });

    //  Initial Load 
    loadActivities();
});
