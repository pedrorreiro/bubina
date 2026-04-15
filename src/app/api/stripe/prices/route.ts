import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { stripe, PRICES } from "@/lib/stripe";

type PriceType = "monthly" | "annual";

interface StripePricePayload {
  id: string;
  unitAmount: number;
  currency: string;
  interval: "month" | "year" | null;
}

async function fetchStripePrice(
  type: PriceType,
): Promise<StripePricePayload | null> {
  const priceId = type === "monthly" ? PRICES.monthly : PRICES.annual;
  if (!priceId) return null;

  const price = await stripe.prices.retrieve(priceId);
  if (!price || price.deleted || price.unit_amount === null) return null;

  return {
    id: price.id,
    unitAmount: price.unit_amount,
    currency: price.currency,
    interval: price.recurring?.interval ?? null,
  };
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const [monthly, annual] = await Promise.all([
      fetchStripePrice("monthly"),
      fetchStripePrice("annual"),
    ]);

    return NextResponse.json({ monthly, annual });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro ao buscar preços";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
