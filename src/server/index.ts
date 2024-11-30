import { poweredBy } from "hono/powered-by";
import { secureHeaders } from "hono/secure-headers";

import { swaggerUI } from "@hono/swagger-ui";
import { OpenAPIHono } from "@hono/zod-openapi";
import { apiReference } from "@scalar/hono-api-reference";

import { storyStepRouter } from "./routes/story-step";

export const dynamic = "force-dynamic";

const app = new OpenAPIHono().basePath("/api");

app.use("*", poweredBy());

app.use(secureHeaders());

app.get("/ui", swaggerUI({ url: "/api/doc", syntaxHighlight: true }));
app.get(
  "/scalar",
  apiReference({
    pageTitle: "Projet name API Reference",
    layout: "modern",
    defaultHttpClient: {
      targetKey: "node",
      clientKey: "fetch",
    },
    spec: {
      url: "/api/doc",
    },
  })
);

const routes = app.route("/v1/story-step", storyStepRouter);

app.openAPIRegistry.registerComponent("securitySchemes", "AccessToken", {
  type: "apiKey",
  in: "http_only_cookie",
  scheme: "none",
  name: "access_token",
});

app.openAPIRegistry.registerComponent("securitySchemes", "RefreshToken", {
  type: "apiKey",
  in: "http_only_cookie",
  scheme: "none",
  name: "refresh_token",
});

export const hono = app;

export type AppRoutes = typeof routes;
