import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'

export function PreviewScreen({
  previewData,
  isPreviewLoading,
  previewError,
  previewNotice,
  previewSummary,
  allMissingColumns,
  showAllColumns,
  setShowAllColumns,
}) {
  const navigate = useNavigate()

  if (!previewData?.rows?.length) {
    return (
      <div className="screen preview-screen">
        <div className="topbar">
          <button className="nav-back-btn" onClick={() => navigate('/configure')}>
            ← Back to Configure
          </button>
          <div>
            <p className="eyebrow">Automated Data Cleaner</p>
            <h1>Preview Results</h1>
          </div>
        </div>
        <main className="preview-main">
          <p className="no-data-notice">Generate a preview to see results.</p>
        </main>
      </div>
    )
  }

  const displayHeaders = previewData?.headers || []
  const displayRows = previewData?.rows || []

  const previewColumnHelper = createColumnHelper()
  const previewColumns = useMemo(() => {
    return displayHeaders.map((header) =>
      previewColumnHelper.accessor((row) => row?.[header] ?? '', {
        id: header,
        header: () => header,
        cell: (info) => String(info.getValue() ?? ''),
      }),
    )
  }, [displayHeaders])

  const previewRowsSliced = useMemo(() => displayRows.slice(0, 10), [displayRows])

  const previewTable = useReactTable({
    data: previewRowsSliced,
    columns: previewColumns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="screen preview-screen">
      <div className="topbar">
        <button className="nav-back-btn" onClick={() => navigate('/configure')}>
          ← Back to Configure
        </button>
        <div>
          <p className="eyebrow">Automated Data Cleaner</p>
          <h1>Preview Results</h1>
        </div>
      </div>

      <main className="preview-main">
        <section className="panel missing">
          <div className="panel-header">
            <h2>Missing Values by Column</h2>
          </div>
          <div className="bars">
            {(showAllColumns ? allMissingColumns : allMissingColumns.slice(0, 5)).length > 0 ? (
              (showAllColumns ? allMissingColumns : allMissingColumns.slice(0, 5)).map((item) => (
                <div className="bar-row" key={item.label}>
                  <span className="label-with-tag">{item.label}</span>
                  <div className="bar">
                    <div className="bar-fill" style={{ width: `${item.value}%`, background: item.color }} />
                  </div>
                  <strong>{item.value}%</strong>
                </div>
              ))
            ) : (
              <p className="no-data">No missing values detected.</p>
            )}
          </div>
          {allMissingColumns.length > 5 && (
            <button className="view-all-btn" onClick={() => setShowAllColumns(!showAllColumns)}>
              {showAllColumns ? 'Show Top 5 Columns' : 'View All Columns'}
            </button>
          )}
        </section>

        <section className="panel preview">
          <div className="panel-header">
            <h2>Data Preview</h2>
          </div>
          {isPreviewLoading && <div className="preview-loading">Loading cleaned data...</div>}
          {previewError && <div className="preview-error">{previewError}</div>}
          {previewNotice && !isPreviewLoading && <div className="preview-loading">{previewNotice}</div>}
          {previewData?.rows && !isPreviewLoading && (
            <div className="preview-success">
              Preview of {previewData.rows.length} cleaned row{previewData.rows.length !== 1 ? 's' : ''}
            </div>
          )}

          {previewSummary && (
            <div className="summary-card">
              <h4>Data Issue Summary</h4>
              <p>
                <strong>Health score:</strong> {previewSummary.health}%
              </p>
              {previewSummary.missingData && previewSummary.missingData.length > 0 && (
                <div className="missing-list">
                  <strong>Top missing columns:</strong>
                  <ul>
                    {previewSummary.missingData.map((item) => (
                      <li key={item.label}>
                        {item.label}: {item.value}%
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <div className="table-container">
            <table className="preview-table">
              <thead>
                {previewTable.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th key={header.id}>{flexRender(header.column.columnDef.header, header.getContext())}</th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {previewTable.getRowModel().rows.map((row) => (
                  <tr key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button className="nav-next-btn" onClick={() => navigate('/export')}>
            Proceed to Export →
          </button>
        </section>
      </main>
    </div>
  )
}
