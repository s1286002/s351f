"use client";

import { useEffect } from "react";
import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";

/**
 * API Documentation Page
 * Displays the OpenAPI documentation for the API endpoints
 */
export default function ApiDocsPage() {
  useEffect(() => {
    document.title = "API Documentation - School Management System";
  }, []);

  return (
    <div className="swagger-ui-container">
      <SwaggerUI url="/swagger.json" />
    </div>
  );
}
