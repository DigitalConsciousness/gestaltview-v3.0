import { z } from "zod";

export const RUNTIME_HANDOFF_CONTRACT_VERSION =
  "gestaltview.runtime-handoff.v1" as const;

export const runtimeRoomSchema = z.enum([
  "blackboard",
  "transcriptory",
  "sanctuary",
  "tribunal",
  "creation_corner",
  "artifact_gallery",
  "dynamic_inner_world",
  "external_scaffold",
  "orchestration",
]);

export const runtimeHandoffIntentSchema = z.enum([
  "continue",
  "review",
  "synthesize",
  "render",
  "stage",
  "project",
]);

export const runtimeHandoffStateSchema = z.enum([
  "prepared",
  "offered",
  "accepted",
  "processing",
  "completed",
  "declined",
  "failed",
  "cancelled",
  "expired",
]);

const jsonPrimitiveSchema = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.null(),
]);
export type RuntimeHandoffJson =
  | z.infer<typeof jsonPrimitiveSchema>
  | RuntimeHandoffJson[]
  | { [key: string]: RuntimeHandoffJson };
export const runtimeHandoffJsonSchema: z.ZodType<RuntimeHandoffJson> = z.lazy(
  () =>
    z.union([
      jsonPrimitiveSchema,
      z.array(runtimeHandoffJsonSchema),
      z.record(z.string(), runtimeHandoffJsonSchema),
    ]),
);

export const runtimeHandoffSourceSchema = z.object({
  room: runtimeRoomSchema,
  entityType: z.string().trim().min(1).max(80),
  entityId: z.string().trim().min(1).max(200),
  revision: z.string().trim().min(1).max(120).optional(),
  immutableRef: z.string().trim().min(1).max(500),
});

export const runtimeHandoffDestinationSchema = z.object({
  room: runtimeRoomSchema,
  requestedAction: z.string().trim().min(1).max(120),
});

export const runtimeHandoffPayloadSchema = z.object({
  context: z.record(z.string(), runtimeHandoffJsonSchema).default({}),
  references: z
    .array(
      z.object({
        type: z.string().trim().min(1).max(80),
        ref: z.string().trim().min(1).max(500),
        label: z.string().trim().min(1).max(160).optional(),
      }),
    )
    .max(50)
    .default([]),
});

export const runtimeHandoffProvenanceSchema = z.object({
  actorType: z.enum(["user", "digital_intelligence", "service"]),
  actorId: z.string().trim().min(1).max(200),
  originatingRoute: z.string().trim().min(1).max(300),
  consentScope: z.array(z.string().trim().min(1).max(120)).max(50),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const runtimeHandoffReceiptSchema = z
  .object({
    acknowledgedAt: z.string().datetime().optional(),
    destinationEntityRef: z.string().trim().min(1).max(500).optional(),
    failure: z
      .object({
        code: z.string().trim().min(1).max(100),
        message: z.string().trim().min(1).max(1000),
        retryable: z.boolean(),
      })
      .optional(),
  })
  .nullable();

export const createRuntimeHandoffSchema = z.object({
  contractVersion: z.literal(RUNTIME_HANDOFF_CONTRACT_VERSION),
  source: runtimeHandoffSourceSchema,
  destination: runtimeHandoffDestinationSchema,
  payload: runtimeHandoffPayloadSchema,
  selectedEmbodiments: z
    .array(z.string().trim().min(1).max(120))
    .max(20)
    .default([]),
  intent: runtimeHandoffIntentSchema,
  idempotencyKey: z.string().trim().min(16).max(200),
  provenance: runtimeHandoffProvenanceSchema.pick({
    actorType: true,
    actorId: true,
    originatingRoute: true,
    consentScope: true,
  }),
});

export const transitionRuntimeHandoffSchema = z
  .object({
    state: runtimeHandoffStateSchema.exclude(["prepared"]),
    receipt: runtimeHandoffReceiptSchema.optional(),
  })
  .superRefine((value, context) => {
    if (value.state === "accepted" && !value.receipt?.acknowledgedAt) {
      context.addIssue({
        code: "custom",
        path: ["receipt", "acknowledgedAt"],
        message:
          "Accepted handoffs require a durable acknowledgement timestamp.",
      });
    }
    if (value.state === "completed" && !value.receipt?.destinationEntityRef) {
      context.addIssue({
        code: "custom",
        path: ["receipt", "destinationEntityRef"],
        message: "Completed handoffs require a destination entity reference.",
      });
    }
    if (value.state === "failed" && !value.receipt?.failure) {
      context.addIssue({
        code: "custom",
        path: ["receipt", "failure"],
        message: "Failed handoffs require structured failure evidence.",
      });
    }
  });

export const runtimeHandoffSchema = createRuntimeHandoffSchema.extend({
  handoffId: z.string().uuid(),
  ownerId: z.string().uuid(),
  state: runtimeHandoffStateSchema,
  provenance: runtimeHandoffProvenanceSchema,
  receipt: runtimeHandoffReceiptSchema,
});

export const allowedRuntimeHandoffTransitions: Record<
  z.infer<typeof runtimeHandoffStateSchema>,
  readonly z.infer<typeof runtimeHandoffStateSchema>[]
> = {
  prepared: ["offered", "cancelled", "expired"],
  offered: ["accepted", "declined", "cancelled", "expired"],
  accepted: ["processing", "cancelled", "expired"],
  processing: ["completed", "failed", "cancelled", "expired"],
  completed: [],
  declined: [],
  failed: [],
  cancelled: [],
  expired: [],
};

export function canTransitionRuntimeHandoff(
  from: z.infer<typeof runtimeHandoffStateSchema>,
  to: z.infer<typeof runtimeHandoffStateSchema>,
): boolean {
  return allowedRuntimeHandoffTransitions[from].includes(to);
}

export type CreateRuntimeHandoff = z.infer<typeof createRuntimeHandoffSchema>;
export type RuntimeHandoff = z.infer<typeof runtimeHandoffSchema>;
export type RuntimeHandoffState = z.infer<typeof runtimeHandoffStateSchema>;
export type TransitionRuntimeHandoff = z.infer<
  typeof transitionRuntimeHandoffSchema
>;
