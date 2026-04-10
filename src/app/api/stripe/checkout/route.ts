import { createClient } from "@/lib/supabase-server";
import { stripe, PRICES } from "@/lib/stripe";
import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { priceType } = await req.json();

  if (priceType !== "monthly" && priceType !== "annual") {
    return NextResponse.json(
      { error: "Tipo de plano inválido" },
      { status: 400 },
    );
  }

  // Buscar loja do usuário
  const { data: loja, error: dbError } = await supabase
    .from("lojas")
    .select("id, stripe_customer_id")
    .eq("user_id", user.id)
    .single();

  if (dbError || !loja) {
    return NextResponse.json({ error: "Loja não encontrada" }, { status: 404 });
  }

  // Criar ou reutilizar Customer no Stripe
  let customerId = loja.stripe_customer_id;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: {
        loja_id: loja.id,
        user_id: user.id,
      },
    });
    customerId = customer.id;

    // Salvar o customer_id na loja
    await supabase
      .from("lojas")
      .update({ stripe_customer_id: customerId })
      .eq("id", loja.id);
  }

  // Determinar URL base
  const headersList = await headers();
  const host = headersList.get("host");
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
  const baseUrl = `${protocol}://${host}`;

  // Criar Checkout Session
  const priceId = priceType === "monthly" ? PRICES.monthly : PRICES.annual;

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: `${baseUrl}/pedido?checkout=success`,
    cancel_url: `${baseUrl}/paywall`,
    metadata: {
      loja_id: loja.id,
      user_id: user.id,
    },
  });

  return NextResponse.json({ url: session.url });
}
