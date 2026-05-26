import { useState } from "react";

const ComplianceReport = () => {
  const [loanId, setLoanId] = useState("");
  const [partyId, setPartyId] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchLoanInterestReceipt = async () => {
    if (!loanId) {
      setError("Loan ID is required");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("http://localhost:5000/api/loan-interest-receipt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
        loanid: Number(loanId),
        partyid: partyId ? Number(partyId) : null,
      }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || "Unable to fetch loan interest receipt details.");
        return;
      }

      const loanDetails = data.loanDetails ?? data.data?.[0] ?? [];
      const receiptDetails = data.receiptDetails ?? data.data?.[1] ?? [];

      setResult({ loanDetails, receiptDetails });
    } catch (err) {
      console.error(err);
      setError("Server error while fetching loan details.");
    } finally {
      setLoading(false);
    }
  };

  const csvEscape = (value) => {
    if (value === null || value === undefined) {
      return "";
    }

    const stringValue = String(value);

    if (stringValue.includes("\n") || stringValue.includes(",") || stringValue.includes('"')) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }

    return stringValue;
  };

  const buildCsvSection = (title, rows) => {
    let csv = `"${title}"\r\n`;

    if (!rows || rows.length === 0) {
      return csv + "No rows returned\r\n\r\n";
    }

    const headers = Object.keys(rows[0]);
    csv += headers.map(csvEscape).join(",") + "\r\n";
    rows.forEach((row) => {
      csv += headers.map((header) => csvEscape(row[header])).join(",") + "\r\n";
    });
    csv += "\r\n";
    return csv;
  };

  const downloadAsExcel = () => {
    if (!result) return;

    const csv =
      buildCsvSection("Loan Details", result.loanDetails) +
      buildCsvSection("Receipt Details", result.receiptDetails);

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `loan-interest-receipt-${loanId || "report"}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const renderTable = (rows, index) => {
    if (!rows || rows.length === 0) {
      return (
        <div key={index} className="rounded-2xl border border-gray-200 bg-white p-4 mb-6">
          <div className="font-semibold mb-2">Result set {index + 1}</div>
          <div className="text-sm text-gray-500">No rows returned.</div>
        </div>
      );
    }

    const headers = Object.keys(rows[0]);

    return (
      <div key={index} className="rounded-2xl border border-gray-200 bg-white p-4 mb-6">
        <div className="font-semibold mb-3">Result set {index + 1}</div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm text-left">
            <thead className="bg-gray-100">
              <tr>
                {headers.map((header) => (
                  <th key={header} className="px-3 py-2 font-medium text-gray-700">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {rows.map((row, rowIndex) => (
                <tr key={rowIndex} className={rowIndex % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  {headers.map((header) => (
                    <td key={header} className="px-3 py-2 text-gray-700">
                      {
  header.toLowerCase().includes("date")
    ? new Date(row[header]).toLocaleDateString("en-GB")
    : row[header] ?? ""
}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto bg-white rounded-3xl p-8 shadow-xl">
        <h1 className="text-2xl font-bold mb-2">Loan Interest Receipt Details</h1>
        {/* <p className="text-sm text-gray-500 mb-6">
          This page calls <code>USP_GetLoanInterestReceiptDetails</code> with <strong>ActionName=&quot;SpuriousData&quot;</strong> and the provided Loan ID.
        </p> */}

        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">Loan ID</label>
          <input
            type="number"
            value={loanId}
            onChange={(e) => setLoanId(e.target.value)}
            placeholder="Enter Loan ID"
            className="w-full rounded-xl border border-gray-300 p-3 focus:border-blue-500 focus:outline-none"
          />

          <label className="block text-sm font-medium text-gray-700">Party ID (optional)</label>
          <input
            type="number"
            value={partyId}
            onChange={(e) => setPartyId(e.target.value)}
            placeholder="Enter Party ID"
            className="w-full rounded-xl border border-gray-300 p-3 focus:border-blue-500 focus:outline-none"
          />

          {error && <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">{error}</div>}

          <button
            type="button"
            onClick={fetchLoanInterestReceipt}
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 px-4 py-3 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Loading..." : "Fetch Receipt Details"}
          </button>
        </div>

        {result && (
          <div className="mt-8">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-bold">Report Results</h2>
                {/* <p className="text-sm text-gray-500">Download the returned data as an Excel-compatible CSV file.</p> */}
              </div>
              <button
                type="button"
                onClick={downloadAsExcel}
                className="rounded-xl bg-green-600 px-4 py-3 text-white hover:bg-green-700"
              >
                Download in Excel
              </button>
            </div>

            <h2 className="text-xl font-bold mb-3">Loan Details</h2>
            {renderTable(result.loanDetails, 0)}

            <h2 className="text-xl font-bold mb-3 mt-8">Receipt Details</h2>
            {renderTable(result.receiptDetails, 1)}
          </div>
        )}
      </div>
    </div>
  );
};

export default ComplianceReport;