import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { authenticate } from "../shopify.server";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.public.appProxy(request);
  const orderNumber = params.orderNumber;

  if (!orderNumber) {
    return json({ error: "No order number provided" });
  }

  const response = await admin.graphql(`
    query($query: String!) {
      orders(first: 1, query: $query) {
        edges {
          node {
            name
            lineItems(first: 50) {
              edges {
                node {
                  product {
                    title
                    handle
                    metafield(namespace: "custom", key: "care_guide_pdf") {
                      value
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  `, { variables: { query: `name:#${orderNumber}` } });

  const orderData = await response.json();
  const order = orderData.data?.orders?.edges[0]?.node;

  if (!order) {
    return json({ error: "Order not found" });
  }

  // Deduplicate products
  const uniqueProducts = [];
  const seen = new Set();

  order.lineItems.edges.forEach(({ node }) => {
    const handle = node.product?.handle;
    if (handle && !seen.has(handle)) {
      seen.add(handle);
      uniqueProducts.push({
        title: node.product.title,
        pdfUrl: node.product.metafield?.value || null,
      });
    }
  });

  return json({ orderName: order.name, products: uniqueProducts });
};

export default function CareGuides() {
  const { orderName, products, error } = useLoaderData();

  if (error) {
    return <h1 style={{color: "red", textAlign: "center"}}>{error}</h1>;
  }

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "20px", fontFamily: "system-ui, Arial, sans-serif" }}>
      <header style={{ textAlign: "center", marginBottom: "40px" }}>
        <h1 style={{ color: "#2e7d32", fontSize: "2.5em" }}>🌱 Salt City Gardens</h1>
        <h2 style={{ color: "#1b5e20" }}>Personalized Care Guides</h2>
        <p style={{ fontSize: "1.2em" }}>Order {orderName}</p>
      </header>

      <p style={{ textAlign: "center", fontSize: "1.1em", marginBottom: "30px" }}>
        Your plants are grown-to-order and pre-hardened for the Greater Salt Lake City, Ogden, Park City & Tooele areas.
      </p>

      <div id="guides">
        {products.map((p: any, i: number) => (
          <div key={i} style={{ margin: "35px 0", padding: "25px", border: "1px solid #ddd", borderRadius: "12px" }}>
            <h3 style={{ marginTop: 0, color: "#1b5e20" }}>{p.title}</h3>
            
            {p.pdfUrl ? (
              <p>
                <a href={p.pdfUrl} target="_blank" rel="noopener noreferrer"
                   style={{ color: "#2e7d32", fontWeight: "bold", fontSize: "17px", textDecoration: "none" }}>
                  📄 View / Download Care Guide PDF
                </a>
              </p>
            ) : (
              <p><em>No care guide PDF available yet for this plant.</em></p>
            )}
          </div>
        ))}
      </div>

      <div style={{ textAlign: "center", margin: "50px 0" }}>
        <button 
          onClick={() => window.print()}
          style={{ background: "#2e7d32", color: "white", padding: "16px 40px", fontSize: "18px", border: "none", borderRadius: "8px", cursor: "pointer" }}
        >
          📥 Print or Save Complete Guide as PDF
        </button>
      </div>

      <footer style={{ textAlign: "center", color: "#555", fontSize: "14px", marginTop: "40px" }}>
        Questions? Reply to your order email or call us — we're your local Salt Lake City nursery.
      </footer>
    </div>
  );
}