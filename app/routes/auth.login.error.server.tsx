import { isRouteErrorResponse, useRouteError } from "@remix-run/react";

export default function ErrorBoundary() {
  const error = useRouteError();

  return (
    <div style={{ padding: "40px", textAlign: "center" }}>
      <h1>Error</h1>
      <p>{isRouteErrorResponse(error) ? error.data : "Something went wrong"}</p>
    </div>
  );
}