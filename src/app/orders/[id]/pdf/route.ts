import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import PDFDocument from "pdfkit";

type Order = {
  id: string;
  quantity: number;
  customer_name: string | null;
  customer_phone: string | null;
  status: string;
  created_at: string;
  products: { name: string; price: number; discount: number | null } | null;
};

function money(value: number) {
  return new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    maximumFractionDigits: 0,
  }).format(value);
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("orders")
    .select("*, products(name, price, discount)")
    .eq("id", id)
    .maybeSingle();

  if (!data) return NextResponse.json({ error: "not found" }, { status: 404 });
  const order = data as Order;

  const doc = new PDFDocument({ size: "A4", margin: 50 });
  const chunks: Buffer[] = [];
  doc.on("data", (chunk: Buffer) => chunks.push(chunk));
  const done = new Promise<Buffer>((resolve) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
  });

  const left = 50;
  const right = doc.page.width - 50;
  const width = right - left;
  const totalWidth = 130;

  const unitPrice = Number(order.products?.price ?? 0);
  const discount = Number(order.products?.discount ?? 0);
  const finalUnit = discount > 0 ? unitPrice * (1 - discount / 100) : unitPrice;
  const total = finalUnit * order.quantity;

  doc.font("Times-Roman").fontSize(30).fillColor("#2d211b").text("MATI", left, 48, {
    width,
    align: "center",
    characterSpacing: 7,
  });
  doc
    .font("Helvetica")
    .fontSize(8)
    .fillColor("#8e462b")
    .text("CEYLON OBJECTS  /  HAND-CAST IN SRI LANKA", left, 88, {
      width,
      align: "center",
      characterSpacing: 1.4,
    });

  doc.font("Times-Roman").fontSize(26).fillColor("#2d211b").text("Order receipt", left, 140);
  doc
    .font("Helvetica")
    .fontSize(9)
    .fillColor("#756459")
    .text(
      `Order ${order.id.slice(0, 8).toUpperCase()}  ·  ${new Date(order.created_at).toLocaleDateString("en-LK", { day: "numeric", month: "long", year: "numeric" })}`,
      left,
      176,
    );

  doc.moveTo(left, 202).lineTo(right, 202).strokeColor("#d8cdbf").stroke();

  doc.font("Helvetica-Bold").fontSize(7).fillColor("#756459");
  doc.text("PIECE", left, 218, { width: width * 0.5 });
  doc.text("QTY", left + width * 0.52, 218, { width: 40, align: "center" });
  doc.text("UNIT", left + width * 0.65, 218, { width: 70, align: "right" });
  doc.text("TOTAL", left + width * 0.83, 218, {
    width: width * 0.17,
    align: "right",
  });

  doc.moveTo(left, 236).lineTo(right, 236).strokeColor("#d8cdbf").stroke();

  doc.font("Times-Roman").fontSize(15).fillColor("#2d211b");
  doc.text(order.products?.name ?? "One-of-one piece", left, 250, { width: width * 0.5 });
  doc.font("Helvetica").fontSize(10).fillColor("#2d211b");
  doc.text(String(order.quantity), left + width * 0.52, 253, { width: 40, align: "center" });
  doc.text(money(finalUnit), left + width * 0.65, 253, { width: 70, align: "right" });
  doc.text(money(total), left + width * 0.83, 253, {
    width: width * 0.17,
    align: "right",
  });

  doc.moveTo(left, 288).lineTo(right, 288).strokeColor("#d8cdbf").stroke();

  doc.font("Helvetica-Bold").fontSize(7).fillColor("#756459").text("ORDERED BY", left, 310);
  doc.font("Helvetica").fontSize(10).fillColor("#2d211b");
  doc.text(order.customer_name || "Not provided", left, 325);
  doc.text(order.customer_phone || "Phone not provided", left, 341);

  doc.font("Helvetica-Bold").fontSize(7).fillColor("#756459").text("STATUS", left, 375);
  doc
    .font("Helvetica")
    .fontSize(10)
    .fillColor("#2d211b")
    .text(order.status || "pending", left, 390);

  doc
    .font("Helvetica")
    .fontSize(8)
    .fillColor("#756459")
    .text(
      "Each piece is hand-cast from white cement in a silicone mould, dried and glazed individually. Small variations in tone, texture and form are part of its one-of-one character.",
      left,
      430,
      { width, lineGap: 3 },
    );

  doc.font("Helvetica-Bold").fontSize(8).fillColor("#8e462b").text("TOTAL", left, 500, {
    width: width - totalWidth - 12,
    align: "right",
  });
  doc.font("Times-Roman").fontSize(24).fillColor("#2d211b").text(money(total), left + width - totalWidth, 493, {
    width: totalWidth,
    align: "right",
  });

  doc.moveTo(left, 548).lineTo(right, 548).strokeColor("#d8cdbf").stroke();

  doc
    .font("Helvetica")
    .fontSize(8)
    .fillColor("#756459")
    .text("Send this PDF to the atelier on WhatsApp to confirm your order.", left, 570, {
      width,
      align: "center",
    });
  doc
    .font("Helvetica")
    .fontSize(7)
    .fillColor("#9b8d81")
    .text("MATI  ·  Hand-cast in Sri Lanka  ·  One of one", left, 585, {
      width,
      align: "center",
    });

  doc.end();
  const pdf = await done;

  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="MATI-order-${order.id.slice(0, 8)}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
