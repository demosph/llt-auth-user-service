import j2s from "joi-to-swagger";
import {
  registerSchema,
  loginSchema,
  refreshSchema,
  oauthGoogleIdTokenSchema,
} from "../schemas/authSchemas.js";
import { patchMeSchema, putPrefsSchema } from "../schemas/userSchemas.js";

export function buildSwagger() {
  const { swagger: Register } = j2s(registerSchema.extract("body"));
  const { swagger: Login } = j2s(loginSchema.extract("body"));
  const { swagger: Refresh } = j2s(refreshSchema.extract("body"));
  const { swagger: GISIdToken } = j2s(oauthGoogleIdTokenSchema.extract("body"));
  const { swagger: PatchMe } = j2s(patchMeSchema.extract("body"));
  const { swagger: PutPrefs } = j2s(putPrefsSchema.extract("body"));

  return {
    openapi: "3.0.0",
    info: { title: "LiteLifeTrip Auth & User API", version: "1.0.0" },
    servers: [{ url: "/api/v1", description: "API v1" }],
    paths: {
      "/auth/register": {
        post: { requestBody: body(Register), responses: okAuth() },
      },
      "/auth/login": {
        post: { requestBody: body(Login), responses: okAuth() },
      },
      "/auth/oauth/google/idtoken": {
        post: {
          requestBody: body(GISIdToken),
          responses: {
            200: { description: "OK" },
            400: { description: "ValidationError" },
            401: { description: "InvalidIdToken / EmailNotVerifiedByGoogle" },
          },
        },
      },
      "/auth/refresh": {
        post: {
          requestBody: body(Refresh),
          responses: { 200: { description: "OK" } },
        },
      },
      "/auth/logout": {
        post: {
          requestBody: body({
            type: "object",
            properties: { refreshToken: { type: "string" } },
            required: ["refreshToken"],
          }),
          responses: { 200: { description: "OK" } },
        },
      },
      "/users/me": {
        get: {
          security: [bearer()],
          responses: { 200: { description: "OK" } },
        },
        patch: {
          security: [bearer()],
          requestBody: body(PatchMe),
          responses: { 200: { description: "OK" } },
        },
      },
      "/users/me/preferences": {
        get: {
          security: [bearer()],
          responses: { 200: { description: "OK" } },
        },
        put: {
          security: [bearer()],
          requestBody: body(PutPrefs),
          responses: { 200: { description: "OK" } },
        },
      },
    },
    components: {
      securitySchemes: {
        bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
      },
    },
  };
}

function bearer() {
  return { bearerAuth: [] };
}
function body(schema) {
  return { required: true, content: { "application/json": { schema } } };
}
function okAuth() {
  return {
    201: { description: "Created" },
    200: { description: "OK" },
    400: { description: "ValidationError" },
    401: { description: "Unauthorized" },
    409: { description: "Conflict" },
  };
}
