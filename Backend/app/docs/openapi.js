const bearer = [{ bearerAuth: [] }];

const messageResponse = {
  description: "Response",
  content: {
    "application/json": {
      schema: {
        type: "object",
        properties: {
          message: { type: "string" },
          data: {},
        },
      },
    },
  },
};

const errorResponse = {
  description: "Error",
  content: {
    "application/json": {
      schema: {
        type: "object",
        properties: {
          message: { type: "string" },
        },
      },
    },
  },
};

const openapi = {
  openapi: "3.0.3",
  info: {
    title: "Student portal API",
    version: "1.0.0",
    description:
      "Sign in, copy accessToken from the response, then use Authorize with that bearer token for staff routes.",
  },
  servers: [{ url: "/" }],
  tags: [
    { name: "Auth" },
    { name: "Initialize" },
    { name: "Institutions" },
    { name: "Support" },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Supabase access token from POST /api/auth/signin.",
      },
      webhookSecret: {
        type: "apiKey",
        in: "header",
        name: "X-Webhook-Secret",
      },
    },
    schemas: {
      SignUp: {
        type: "object",
        required: ["email", "password", "role"],
        properties: {
          email: { type: "string", format: "email" },
          password: { type: "string" },
          firstName: { type: "string" },
          lastName: { type: "string" },
          phone: { type: "string" },
          role: {
            type: "string",
            enum: ["SYSTEM_ADMIN", "INSTITUTION_ADMIN", "SITE_ADMIN", "LECTURER", "STUDENT"],
          },
        },
      },
      SignIn: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email" },
          password: { type: "string" },
        },
      },
      ResetPassword: {
        type: "object",
        required: ["email"],
        properties: {
          email: { type: "string", format: "email" },
        },
      },
      UpdatePassword: {
        type: "object",
        required: ["password"],
        properties: {
          password: { type: "string" },
          accessToken: { type: "string" },
          refreshToken: { type: "string" },
        },
      },
      InitializeAdmin: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email" },
          password: { type: "string" },
        },
      },
      StartSession: {
        type: "object",
        required: ["siteId"],
        properties: {
          siteId: { type: "string", format: "uuid" },
        },
      },
      TicketStatus: {
        type: "object",
        required: ["status"],
        properties: {
          status: {
            type: "string",
            enum: ["IN_PROGRESS", "WAITING", "DONE"],
          },
        },
      },
      TicketReply: {
        type: "object",
        required: ["text"],
        properties: {
          text: { type: "string" },
        },
      },
    },
  },
  paths: {
    "/api/auth/signup": {
      post: {
        tags: ["Auth"],
        summary: "Create a user",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/SignUp" } } },
        },
        responses: { 200: messageResponse, 400: errorResponse },
      },
    },
    "/api/auth/signin": {
      post: {
        tags: ["Auth"],
        summary: "Sign in",
        description: "Returns the user in data and the Supabase accessToken for Authorize.",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/SignIn" } } },
        },
        responses: { 200: messageResponse, 400: errorResponse },
      },
    },
    "/api/auth/reset-password": {
      post: {
        tags: ["Auth"],
        summary: "Send a password reset email",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/ResetPassword" } } },
        },
        responses: { 200: messageResponse, 400: errorResponse },
      },
    },
    "/api/auth/update-password": {
      post: {
        tags: ["Auth"],
        summary: "Update the signed-in user's password",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/UpdatePassword" } } },
        },
        responses: { 200: messageResponse, 400: errorResponse },
      },
    },
    "/api/initialize": {
      get: {
        tags: ["Initialize"],
        summary: "Check whether any user exists",
        responses: {
          200: {
            description: "Exists flag",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { exists: { type: "boolean" } },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Initialize"],
        summary: "Create the first system admin",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/InitializeAdmin" } } },
        },
        responses: { 200: messageResponse, 400: errorResponse, 403: errorResponse },
      },
    },
    "/api/institutions": {
      get: {
        tags: ["Institutions"],
        summary: "List institutions",
        parameters: [
          { name: "page", in: "query", schema: { type: "integer", minimum: 1, default: 1 } },
          { name: "pageSize", in: "query", schema: { type: "integer", minimum: 1, maximum: 50, default: 10 } },
        ],
        responses: { 200: messageResponse, 400: errorResponse },
      },
    },
    "/api/support/whatsapp/sessions": {
      post: {
        tags: ["Support"],
        summary: "Start the campus WhatsApp session",
        security: bearer,
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/StartSession" } } },
        },
        responses: { 200: messageResponse, 401: errorResponse, 403: errorResponse, 404: errorResponse, 502: errorResponse },
      },
    },
    "/api/support/whatsapp/sessions/{siteId}/qr": {
      get: {
        tags: ["Support"],
        summary: "Get the campus pairing QR",
        security: bearer,
        parameters: [
          { name: "siteId", in: "path", required: true, schema: { type: "string", format: "uuid" } },
        ],
        responses: { 200: messageResponse, 401: errorResponse, 404: errorResponse, 502: errorResponse },
      },
    },
    "/api/support/whatsapp/webhook": {
      post: {
        tags: ["Support"],
        summary: "WAHA inbound webhook",
        security: [{ webhookSecret: [] }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { type: "object" } } },
        },
        responses: { 200: messageResponse, 401: errorResponse },
      },
    },
    "/api/support/tickets": {
      get: {
        tags: ["Support"],
        summary: "List tickets in the caller's scope",
        security: bearer,
        parameters: [
          { name: "siteId", in: "query", schema: { type: "string", format: "uuid" } },
          {
            name: "status",
            in: "query",
            schema: { type: "string", enum: ["OPEN", "IN_PROGRESS", "WAITING", "DONE"] },
          },
        ],
        responses: { 200: messageResponse, 400: errorResponse, 401: errorResponse, 404: errorResponse },
      },
    },
    "/api/support/tickets/{id}": {
      get: {
        tags: ["Support"],
        summary: "Open a ticket",
        description: "When the stored status is OPEN, this sets it to IN_PROGRESS.",
        security: bearer,
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
        ],
        responses: { 200: messageResponse, 401: errorResponse, 404: errorResponse },
      },
      patch: {
        tags: ["Support"],
        summary: "Update a ticket status",
        security: bearer,
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
        ],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/TicketStatus" } } },
        },
        responses: { 200: messageResponse, 400: errorResponse, 401: errorResponse, 404: errorResponse },
      },
    },
    "/api/support/tickets/{id}/messages": {
      post: {
        tags: ["Support"],
        summary: "Reply on WhatsApp",
        security: bearer,
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
        ],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/TicketReply" } } },
        },
        responses: { 201: messageResponse, 400: errorResponse, 401: errorResponse, 404: errorResponse, 502: errorResponse },
      },
    },
  },
};

export default openapi;
