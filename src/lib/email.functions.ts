import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const PayloadSchema = z.object({
  to: z.string().email(),
  customer_name: z.string().min(1).max(200),
  order_number: z.string().min(1).max(50),
  items: z.array(z.object({
    name: z.string(), quantity: z.number(), price: z.number(),
  })).min(1).max(50),
  subtotal: z.number(),
  discount: z.number(),
  total: z.number(),
  payment_method: z.string(),
  address: z.string(),
  city: z.string(),
});

export const sendOrderConfirmation = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => PayloadSchema.parse(input))
  .handler(async ({ data }) => {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.warn("RESEND_API_KEY not set — skipping email");
      return { ok: false, reason: "no_api_key" };
    }

    const itemsHtml = data.items.map((i) =>
      `<tr><td style="padding:8px 0;border-bottom:1px solid #eee;">${i.name} × ${i.quantity}</td><td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right;">Rs ${(i.price * i.quantity).toLocaleString("en-PK")}</td></tr>`
    ).join("");

    const html = `
<!DOCTYPE html><html><body style="font-family:Georgia,serif;background:#faf8f5;padding:24px;color:#1a1a1a;">
  <div style="max-width:600px;margin:auto;background:#fff;padding:32px;border:1px solid #e8e4dd;">
    <h1 style="font-size:28px;color:#c9a84c;margin:0 0 8px;">Z Shaikh Perfumes</h1>
    <p style="color:#666;margin:0 0 24px;font-size:13px;letter-spacing:2px;text-transform:uppercase;">Order Confirmation</p>
    <h2 style="font-size:22px;margin:0 0 8px;">Thank you, ${data.customer_name}!</h2>
    <p style="color:#444;line-height:1.6;">Your order <strong>${data.order_number}</strong> is confirmed and will be delivered within <strong>3 business days maximum</strong> across Pakistan.</p>
    <table style="width:100%;border-collapse:collapse;margin:24px 0;font-size:14px;">
      ${itemsHtml}
      <tr><td style="padding:8px 0;">Subtotal</td><td style="padding:8px 0;text-align:right;">Rs ${data.subtotal.toLocaleString("en-PK")}</td></tr>
      ${data.discount > 0 ? `<tr><td style="padding:8px 0;color:#c9a84c;">Easypaisa Discount</td><td style="padding:8px 0;text-align:right;color:#c9a84c;">- Rs ${data.discount.toLocaleString("en-PK")}</td></tr>` : ""}
      <tr><td style="padding:8px 0;">Shipping</td><td style="padding:8px 0;text-align:right;color:#c9a84c;">Free</td></tr>
      <tr><td style="padding:12px 0;border-top:2px solid #1a1a1a;font-weight:bold;font-size:16px;">Total</td><td style="padding:12px 0;border-top:2px solid #1a1a1a;text-align:right;font-weight:bold;font-size:16px;">Rs ${data.total.toLocaleString("en-PK")}</td></tr>
    </table>
    <p style="margin:0 0 4px;"><strong>Payment:</strong> ${data.payment_method === "easypaisa" ? "Easypaisa Online Transfer" : "Cash on Delivery"}</p>
    <p style="margin:0 0 4px;"><strong>Delivery to:</strong> ${data.address}, ${data.city}</p>
    <hr style="border:none;border-top:1px solid #eee;margin:24px 0;">
    <p style="color:#999;font-size:12px;">For questions, contact us at zshaikhperfumes@gmail.com</p>
  </div>
</body></html>`;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        from: "Z Shaikh Perfumes <onboarding@resend.dev>",
        to: [data.to],
        reply_to: "zshaikhperfumes@gmail.com",
        subject: `Order ${data.order_number} confirmed — Z Shaikh Perfumes`,
        html,
      }),
    });
    if (!res.ok) {
      const err = await res.text();
      console.error("Resend error:", err);
      return { ok: false, reason: err };
    }
    return { ok: true };
  });
