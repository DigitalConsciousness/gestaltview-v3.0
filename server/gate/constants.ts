export const GATE_TABLES = {
  buyers: "gate_buyers",
  drafts: "gate_package_drafts",
  orders: "gate_orders",
  orderItems: "gate_order_items",
  buildJobs: "gate_build_jobs",
  artifacts: "gate_artifacts",
  supportRequests: "gate_support_requests",
} as const;

export const GATE_LOCAL_STORAGE_BUCKET = "local-gate-zips";
export const GATE_STORAGE_PATH_PREFIX = "gate-packages";
