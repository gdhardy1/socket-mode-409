# Scenario: Unexpected server response: 409 leads to rate limiting

This experiment simulates a scenario in which the Bolt socket mode client will start abusing the `apps.connections.open` API endpoint. Here are the simulation conditions:

- A basic Slack app is started in socket mode using the default configuration. 

- On start up, the app will call `apps.connections.open`; a mock server will intercept the call and return a mock websocket url.
   
   ```log
   [23:50:12.864] DEBUG (82560): http request result: {"url":"ws://localhost:3000","ok":true,"response_metadata":{}}
   ```
  
- The `SocketModeClient` will attempt to initiate a connection; the mock server will intercept the call and return `409` status

    ```log
    [23:50:12.867] ERROR (82560): WebSocket error! Error: Failed to send message on websocket: Unexpected server response: 409
    ```
- After 10 calls to `apps.connections.open`, the mock server will begin rate limiting by returning `429` response
    ```log
    [00:15:18.617] DEBUG (17844): Going to retrieve a new WSS URL ...
    [00:15:18.617] DEBUG (17844): apiCall('apps.connections.open') start
    [00:15:18.618] DEBUG (17844): http request url: https://slack.com/api/apps.connections.open
    [00:15:18.618] DEBUG (17844): http request body: {}
    [00:15:18.618] DEBUG (17844): http request headers: {"Accept":"application/json, text/plain, */*","User-Agent":"@slack:socket-mode/2.0.2 @slack:bolt/4.1.0 @slack:web-api/7.7.0 node/18.16.1 darwin/23.6.0","Authorization":"[[REDACTED]]"}
    [00:15:18.621] INFO (17844): apps.connections.open call count: 10
    [00:15:18.622] DEBUG (17844): http response received
    [00:15:18.622] INFO (17844): API Call failed due to rate limiting. Will retry in 2 seconds.
    ```

# Run the Experiment
Execute `npm run start` to start the experiment. The experiment will kill the node process automatically after 50 calls to `apps.connections.open` have been made.