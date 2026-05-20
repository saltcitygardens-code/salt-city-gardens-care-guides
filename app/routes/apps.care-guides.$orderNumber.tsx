import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

export const loader = async () => {
  return json({ 
    message: "✅ Care Guides route is working!", 
    orderNumber: "Test successful" 
  });
};

export default function CareGuides() {
  const data = useLoaderData();
  return (
    <div style={{ padding: "40px", textAlign: "center", fontFamily: "Arial" }}>
      <h1>🌱 Salt City Gardens Care Guides</h1>
      <p>{data.message}</p>
      <p>Order: {data.orderNumber}</p>
    </div>
  );
}