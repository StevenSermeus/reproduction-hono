import { z } from "zod";

import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { logger } from "@/server/libs/logger";

import { defaultHook } from "@/server/middleware/zod-handle";
import type { VariablesHonoAuth } from "@/server/variables";
const MAX_UPLOAD_SIZE = 1024 * 1024 * 50; // 50MB
const ACCEPTED_FILE_TYPES = [
  "image/png",
  "image/gif",
  "image/jpeg",
  "image/webp",
];

export const FileRequestSchema = z
  .instanceof(File)
  .refine((file) => file.size <= MAX_UPLOAD_SIZE, {
    message: `File size must be less than ${MAX_UPLOAD_SIZE / 1024 / 1024}MB`,
  })
  .refine((file) => ACCEPTED_FILE_TYPES.includes(file.type), {
    message: `File type must be one of ${ACCEPTED_FILE_TYPES.map((type) => type.split("/")[1]).join(", ")}`,
  })
  .openapi({
    type: "string",
    format: "binary",
  });
export const storyStepRoute = createRoute({
  method: "post",
  description: "Create a new story step with dialogs",
  tags: ["StoryStep"],
  path: "/",
  security: [],
  middleware: [],
  request: {
    body: {
      content: {
        "multipart/form-data": {
          schema: z.object({
            title: z.string().max(255).min(2),
            image: FileRequestSchema,
            dialogs: z.preprocess(
              (v) => JSON.parse(v as string),
              z.array(
                z.object({
                  title: z.string().max(255).min(2),
                  content: z.string().max(10000).min(2),
                  order: z.number().int().nonnegative(),
                })
              )
            ),
          }),
        },
      },
    },
  },
  responses: {
    500: {
      description: "Internal Server Error",
      content: {
        "application/json": {
          schema: z.object({
            message: z.string(),
          }),
        },
      },
    },
    201: {
      description: "Story step information",
      content: {
        "application/json": {
          schema: z.object({
            message: z.string(),
          }),
        },
      },
    },
  },
});

export const createStoryStepRouter = new OpenAPIHono<{
  Variables: VariablesHonoAuth;
}>({
  defaultHook: defaultHook,
}).openapi(storyStepRoute, async (ctx) => {
  try {
    const { title, dialogs } = ctx.req.valid("form");
    console.log("title", title);
    console.log("dialogs", dialogs);

    return ctx.json({ message: "Story step created" }, 201);
  } catch (error) {
    logger.error(error);
    return ctx.json({ message: "Internal Server Error" }, 500);
  }
});
