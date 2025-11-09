import React from "react";
import { useParams } from "next/navigation";

function OneReportPage() {
  const { id } = useParams();
  return (
    <div>
      <h1>Reporte {id}</h1>
    </div>
  );
}

export default OneReportPage;
