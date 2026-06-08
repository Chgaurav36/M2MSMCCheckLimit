  
  
  const renderTable = (rows, index) => {
    if (!rows || rows.length === 0) {
      return (
        <div
          key={index}
          className="rounded-2xl border border-gray-200 bg-white p-4 mb-6"
        >
          <div className="font-semibold mb-2">Result set {index + 1}</div>
          <div className="text-sm text-gray-500">No rows returned.</div>
        </div>
      );
    }

    const headers = Object.keys(rows[0]);
    

    return (
      <div
        key={index}
        className="rounded-2xl border border-gray-200 bg-white p-4 mb-6"
      >
        <div className="font-semibold mb-3">Result set {index + 1}</div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm text-left">
            <thead className="bg-gray-100">
              <tr>
                {headers.map((header) => (
                  <th
                    key={header}
                    className="px-3 py-2 font-medium text-gray-700"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {rows.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className={rowIndex % 2 === 0 ? "bg-white" : "bg-gray-50"}
                >
                  {headers.map((header) => (
                    <td key={header} className="px-3 py-2 text-gray-700">
                      {header.toLowerCase().includes("date")
                        ? new Date(row[header]).toLocaleDateString("en-GB")
                        : (row[header] ?? "")}
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