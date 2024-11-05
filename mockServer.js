// Import necessary modules
const { http, HttpResponse } = require("msw");

// Mock handler for websocket
const mockSocket = http.get(
  "http://localhost:3000",
  async ({ request, params }) => {
    return new Response("mocked_socket", {
      status: 409,
    });
  }
);

const mockAuthTest = http.post(
  "https://slack.com/api/auth.test",
  async ({ request, params }) => {
    return HttpResponse.json(
      {
        ok: true,
        url: "https://subarachnoid.slack.com/",
        team: "Subarachnoid Workspace",
        user: "grace",
        team_id: "T12345678",
        user_id: "W12345678",
      },
      {
        status: 200,
      }
    );
  }
);

const getMockAppsConnectionsOpenHandler = (logger) => {
  let calls = 0;
  const mockAppsConnectionsOpen = http.post(
    "https://slack.com/api/apps.connections.open",
    async ({ request, params }) => {
      if (calls > 50) {
        process.kill(process.pid, "SIGKILL");
      }
      calls++;
      logger.info(`apps.connections.open call count: ${calls}`);

      if (calls < 10) {
        return HttpResponse.json(
          { url: "ws://localhost:3000", ok: true },
          {
            status: 200,
          }
        );
      } else {
        return HttpResponse.json(
          { ok: false },
          {
            status: 429,
            statusText: "rate_limited",
            headers: {
              "Retry-After": "2",
            },
          }
        );
      }
    }
  );
  return mockAppsConnectionsOpen;
};
// Mock handler for POST requests to Slack API

// Export the mock handlers
module.exports = {
  mockAuthTest,
  mockSocket,
  getMockAppsConnectionsOpenHandler,
};
