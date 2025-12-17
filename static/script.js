const nodes = ['Node1', 'Node2', 'Node3'];

//Time delay between IP generations (randomized)
const MIN_SIMULATION_INTERVAL = 100;
const MAX_SIMULATION_INTERVAL = 500;

//Randomized Node processing times
const MIN_PROCESS_TIME = 2000;
const MAX_PROCESS_TIME = 5000;

let simulationTimer;
let simulationRunning = false;

//IP-to-node mapping
let ipToNodeMap = {};

//Load balancing state for round-robin logic
let roundRobinIndex = 0;

// Threshold for switching to Node3 (e.g., when Node1 or Node2's queue exceeds this value)
const THRESHOLD = 20;

//Maximum requests allowed per IP(for rate limiting)
const RATE_LIMIT = 5;

//Stores timestamps
let ipRequestTimestamps = {};

//Node queues
let nodeQueues = {
    'Node1': [],
    'Node2': [],
    'Node3': []
};


//Current Load Balancer Mode: roundRobin, threshold, or leastOccupied
let loadBalancerMode = 'roundRobin';

//Constant to control burst behavior
const BURST_INTERVAL = 500;

//Burst size (how many requests an IP makes in a burst)
const BURST_SIZE = 5;

//Function to generate a random IP address
function generateRandomIP() {
    return `${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`;
}

//Function to handle rate limiting
function checkRateLimit(ip) {
    const now = Date.now();
    
    if (!ipRequestTimestamps[ip]) {
        ipRequestTimestamps[ip] = [];
    }

    ipRequestTimestamps[ip] = ipRequestTimestamps[ip].filter(timestamp => now - timestamp < 1000);

    if (ipRequestTimestamps[ip].length >= RATE_LIMIT) {
        return false;
    }

    ipRequestTimestamps[ip].push(now);
    return true;
}

//Function to toggle load balancer mode
function toggleLoadBalancerMode() {
    loadBalancerMode = document.getElementById('loadBalancerMode').value;
    console.log(`Load Balancer Mode: ${loadBalancerMode}`);
}

//Function to route traffic based on the load balancing mode
function getNodeForIP(ip) {
    if (ipToNodeMap[ip]) {
        return ipToNodeMap[ip];
    }

    //Round Robin Logic
    if (loadBalancerMode === 'roundRobin') {
        const selectedNode = nodes[roundRobinIndex];
        ipToNodeMap[ip] = selectedNode;
        roundRobinIndex = (roundRobinIndex + 1) % nodes.length;
        return selectedNode;
    }

    //Threshold-Based Logic
    const node1Load = nodeQueues['Node1'].length;
    const node2Load = nodeQueues['Node2'].length;

    if (loadBalancerMode === 'threshold') {
        if (node1Load < THRESHOLD && node2Load < THRESHOLD) {
            const selectedNode = (node1Load <= node2Load) ? 'Node1' : 'Node2';
            ipToNodeMap[ip] = selectedNode;
            return selectedNode;
        }
        ipToNodeMap[ip] = 'Node3';
        return 'Node3';
    }

    //Least Occupied Logic
    if (loadBalancerMode === 'leastOccupied') {
        const loads = {
            'Node1': nodeQueues['Node1'].length,
            'Node2': nodeQueues['Node2'].length,
            'Node3': nodeQueues['Node3'].length
        };

        //Find the node with the least load
        const selectedNode = Object.keys(loads).reduce((a, b) => (loads[a] < loads[b] ? a : b));
        ipToNodeMap[ip] = selectedNode;
        return selectedNode;
    }
}

//Function to update the load display for each node in the UI
function updateNodeLoadDisplay() {
    const maxQueueLength = 50;

    // Update progress bars
    document.getElementById('node1-progress').style.width = `${(nodeQueues['Node1'].length / maxQueueLength) * 100}%`;
    document.getElementById('node2-progress').style.width = `${(nodeQueues['Node2'].length / maxQueueLength) * 100}%`;
    document.getElementById('node3-progress').style.width = `${(nodeQueues['Node3'].length / maxQueueLength) * 100}%`;

//     // Conditionally update the queue length text
//     if (document.getElementById('show-queue-length').checked) {
//         document.getElementById('node1-load').textContent = `Queue length: ${nodeQueues['Node1'].length}`;
//         document.getElementById('node2-load').textContent = `Queue length: ${nodeQueues['Node2'].length}`;
//         document.getElementById('node3-load').textContent = `Queue length: ${nodeQueues['Node3'].length}`;
//     }
}

//Function to simulate node processing a request (with random processing time)
function processRequest(node) {
    const processingTime = Math.floor(Math.random() * (MAX_PROCESS_TIME - MIN_PROCESS_TIME + 1)) + MIN_PROCESS_TIME;
    setTimeout(() => {
        nodeQueues[node].shift(); // Remove the request from the queue
        updateNodeLoadDisplay(); 

        if (nodeQueues[node].length === 0) {
            console.log(`${node} queue is empty.`);
        }
    }, processingTime);
}

//Function to handle burst requests for the same IP
function handleBurstRequests(ip) {
    let burstCount = 0;
    const burstInterval = setInterval(() => {
        if (burstCount >= BURST_SIZE) {
            clearInterval(burstInterval);
            return;
        }

        const selectedNode = getNodeForIP(ip);
        nodeQueues[selectedNode].push(ip);  //Add the IP to the node's queue

        const logEntry = `${ip} -- ${selectedNode}\n`;
        document.getElementById('log').value += logEntry;

        //Update the node load display on the dashboard
        updateNodeLoadDisplay();

        document.getElementById('ipDisplay').textContent = `Generated IP: ${ip}`;
        document.getElementById('nodeDisplay').textContent = `Linked Node: ${selectedNode}`;

        //Start processing the request in the node
        processRequest(selectedNode);

        //Logging the IP - Node
        logIPToNode(ip, selectedNode);

        burstCount++;
    }, BURST_INTERVAL);
}

//Function to start the simulation
function startSimulation() {
    if (simulationRunning) return;
    simulationRunning = true;
    document.getElementById('status-text').textContent = 'Running';
    document.getElementById('log').value = "";

    simulationTimer = setInterval(() => {
        const randomIP = generateRandomIP();
        if (!checkRateLimit(randomIP)) {
            console.log(`Rate limit exceeded for IP: ${randomIP}`);
            return;
        }
        handleBurstRequests(randomIP);
    }, Math.floor(Math.random() * (MAX_SIMULATION_INTERVAL - MIN_SIMULATION_INTERVAL + 1)) + MIN_SIMULATION_INTERVAL);
}

//Function to stop the simulation
function stopSimulation() {
    if (!simulationRunning) return;
    clearInterval(simulationTimer);
    simulationRunning = false;
    document.getElementById('status-text').textContent = 'Idle';
}

//Function for logging IP - node mapping
function logIPToNode(ip, node) {
    fetch('/log-ip', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ip, node })
    })
    .then(response => response.json())
    .then(data => {
        console.log('IP logged successfully:', data);
    })
    .catch(error => {
        console.error('Error logging IP:', error);
    });
}
