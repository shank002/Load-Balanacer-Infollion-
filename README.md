HOW TO RUN THIS SOLUTION: (TASK3 - Write a solution for Load-Balancer)
Git-Clone this repository / Download this repo. as zip

1. Exceute the virtual-environment
   -> $ python3 -m venv virtual
   -> $ . /virtual/bin/activate (For UNIX Based OS)
   -> $ . \virtual\scripts\activate.bat (For Windows OS)

   
3. Install all python-lib depandencies, given in the requirements.txt
   -> $ python3 -m pip install -r requirements.txt
   
4. Execute app.py: SHELL:> $ python3 app.py

5. Access the solution at(Web-browser link): http://localhost:5000/ or http://127.0.0.1:5000

6. Browser Interface is really simple:
   -> Start and Stop button to start/stop simulation.
   -> Select Load-Balancer algorithm: Round_Robin, Threshold Mode and Least_Occupied
   -> The dashboard shows the loads in each node.
   -> The load is dependent on the length of queue on each server.

7. The log-window on the left simply shows the IP address and its selected node where request was forwarded.
8. On the root folder, this program do create another log-file, locally (named: Logfile.txt, in the folder, Logs).

=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

ABOUT THE IMPLEMENTED LOGIC:

ROUND-ROBIN:
-> Round-robin logic forwards incoming requests sequentially to each server in the pool, ensuring traffic is evenly distributed without favoring any single server.
-> Limitations: Basic round-robin does not consider server load, response time, or health, so it may perform poorly if servers have unequal resources or varying performance.

THRESHOLD LOGIC:
-> Two nodes handle traffic under normal conditions as primary nodes, while the third node acts as a standby or overflow node that receives traffic only when a defined load threshold is exceeded.
-> This approach optimizes resource usage by avoiding constant traffic to the third node while still providing scalability and fault tolerance during traffic spikes.

LEAST_QUEUED LOGIC:
-> Least-queued logic directs incoming requests to the node with the smallest number of pending requests, aiming to minimize wait time and improve response latency.
-> This approach is especially effective when request processing times vary, as it prevents already-busy nodes from becoming bottlenecks.

=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

WHAT DOES THIS SIMULATION INCLUDES:
1. IP stickiness (session persistence)
  -> Once an IP is mapped to a node (ipToNodeMap), all subsequent requests from that IP are routed to the same node.

2. Threshold-based overflow handling
  -> Node1 and Node2 act as primary nodes; traffic is redirected to Node3 only when either primary node’s queue exceeds a predefined threshold.

3. Least-queue dynamic load awareness
  -> Routes requests to the node with the smallest active queue, adapting in real time to varying request loads.

4. Rate limiting per IP
  -> Enforces a maximum number of requests per IP per second to simulate protection against abuse or traffic spikes.

5. Burst traffic simulation
  -> Simulates real-world burst behavior where a single IP sends multiple requests in short intervals.

6. Randomized traffic generation
  -> Generates random IP addresses and random request intervals to mimic unpredictable client traffic.

7. Variable processing time per node
  -> Each request is processed with a randomized delay, simulating different request handling times.

8. Queue-based request handling
  -> Each node maintains its own request queue, visually representing load and congestion.

9. Real-time load visualization
-> Displays node load using progress bars that update dynamically based on queue length.

10. Simulation control (start/stop)
  -> Allows starting and stopping the traffic simulation with clear runtime status indication.

11. Request lifecycle simulation
  -> Requests are added to queues, processed asynchronously, and removed upon completion.

12. Client-side logging and monitoring
  -> Logs IP-to-node assignments in real time and displays them in a UI log panel.

13. Backend logging integration
  -> Sends IP-node mappings to a backend endpoint (/log-ip) for persistence or analysis.

14. Configurable system parameters
  -> Thresholds, rate limits, burst size, processing times, and simulation intervals are easily adjustable for experimentation.
