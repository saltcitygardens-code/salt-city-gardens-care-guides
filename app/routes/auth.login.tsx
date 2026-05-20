import { json } from "@remix-run/node";

export const loader = () => {
  return json({ error: "Login route not needed for proxy" }, { status: 200 });
};

export default function Login() {
  return <div>Auth login placeholder</div>;
}