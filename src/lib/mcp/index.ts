import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listMyStores from "./tools/list-my-stores";
import listStoreProducts from "./tools/list-store-products";
import listStoreOrders from "./tools/list-store-orders";
import getSubscriptionStatus from "./tools/get-subscription-status";
import updateProductVisibility from "./tools/update-product-visibility";

const projectRef =
  import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "krinstore-mcp",
  title: "KrinStore",
  version: "0.1.0",
  instructions:
    "Tools for managing a signed-in KrinStore seller's stores: list stores, list products and orders, check subscription, and toggle product visibility.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [
    listMyStores,
    listStoreProducts,
    listStoreOrders,
    getSubscriptionStatus,
    updateProductVisibility,
  ],
});
