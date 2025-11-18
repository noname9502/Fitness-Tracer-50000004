// Create header section
    const header = document.createElement('div');
    header.className = 'd-flex justify-content-between align-items-center mb-3';

    // Create title
    const title = document.createElement('h1');
    title.className = 'text-center flex-grow-1';
    title.textContent = '⚙️ Admin Dashboard';

    // Create logout button
    const logoutBtn = document.createElement('button');
    logoutBtn.id = 'logoutBtn';
    logoutBtn.className = 'btn btn-danger';
    logoutBtn.textContent = 'Logout';

    // Append title and button to header
    header.appendChild(title);
    header.appendChild(logoutBtn);

    // Append header to app div
    document.getElementById('app').appendChild(header);

    // Add event listener to logout button