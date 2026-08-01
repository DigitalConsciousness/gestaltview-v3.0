import { createStorefrontCart, getStorefrontCatalog } from "@/lib/storefront";

type CartRequest = {
  variantId?: unknown;
  offerHandle?: unknown;
  configuration?: unknown;
};

export async function POST(request: Request) {
  let input: CartRequest;
  try {
    input = (await request.json()) as CartRequest;
  } catch {
    return Response.json({ error: "invalid_request" }, { status: 400 });
  }
  if (typeof input.variantId !== "string" || typeof input.offerHandle !== "string") {
    return Response.json({ error: "invalid_request" }, { status: 400 });
  }
  if (process.env.STOREFRONT_CHECKOUT_ENABLED !== "true") {
    return Response.json({ error: "checkout_not_commissioned" }, { status: 503 });
  }

  const catalog = await getStorefrontCatalog();
  const product = catalog.products.find((item) => item.handle === input.offerHandle);
  const variant = product?.variants.find((item) => item.id === input.variantId && item.availableForSale);
  if (!product || !variant || product.commerceRoute !== "shopify_checkout") {
    return Response.json({ error: "offer_unavailable" }, { status: 404 });
  }

  const configuration = input.configuration && typeof input.configuration === "object"
    ? Object.entries(input.configuration as Record<string, unknown>)
        .filter((entry): entry is [string, string] => typeof entry[1] === "string")
        .slice(0, 8)
        .map(([key, value]) => ({ key: `gestaltview_${key.slice(0, 40)}`, value: value.slice(0, 120) }))
    : [];
  try {
    const cart = await createStorefrontCart({
      variantId: variant.id,
      attributes: [
        { key: "gestaltview_offer_handle", value: product.handle },
        { key: "gestaltview_manifest_version", value: "1.0.0" },
        ...configuration,
      ],
    });
    return Response.json(cart, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("[shopify-storefront] cart creation failed", error instanceof Error ? error.message : "unknown");
    return Response.json({ error: "checkout_unavailable" }, { status: 502 });
  }
}
