import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { getJobHistory } from '../api/api'

const PRIORITY_COLUMNS = ['_id', 'id', 'local_id', 'filename', 'status', 'created_at', 'rows_in', 'rows_out']

const sortColumns = (rows) => {
  const keys = new Set()
  rows.forEach((row) => {
    Object.keys(row || {}).forEach((key) => keys.add(key))
  })

  const all = Array.from(keys)
  const pinned = PRIORITY_COLUMNS.filter((col) => all.includes(col))
  const rest = all.filter((col) => !pinned.includes(col)).sort((a, b) => a.localeCompare(b))
  return [...pinned, ...rest]
}

const displayValue = (value) => {
  if (value === null || value === undefined || value === '') return '-'
  if (Array.isArray(value) || typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

export function JobHistoryScreen() {
  const navigate = useNavigate()
  const [jobs, setJobs] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let ignore = false

    const load = async () => {
      try {
        setIsLoading(true)
        setError('')
        const history = await getJobHistory(300)
        if (!ignore) setJobs(Array.isArray(history) ? history : [])
      } catch (err) {
        if (!ignore) {
          setError(err?.message || 'Unable to load job history.')
          setJobs([])
        }
      } finally {
        if (!ignore) setIsLoading(false)
      }
    }

    load()
    return () => {
      ignore = true
    }
  }, [])

  const columnHelper = useMemo(() => createColumnHelper(), [])
  const columnKeys = useMemo(() => sortColumns(jobs), [jobs])

  const columns = useMemo(() => {
    return columnKeys.map((key) =>
      columnHelper.accessor((row) => row?.[key], {
        id: key,
        header: () => key,
        cell: (info) => displayValue(info.getValue()),
      }),
    )
  }, [columnHelper, columnKeys])

  const table = useReactTable({
    data: jobs,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="screen preview-screen">
      <div className="topbar">
        <button className="nav-back-btn" onClick={() => navigate('/')}>
          ← Back to Upload
        </button>
        <div>
          <p className="eyebrow">Automated Data Cleaner</p>
          <h1>Job History</h1>
        </div>
      </div>

      <main className="preview-main">
        <section className="panel preview">
          <div className="panel-header">
            <h2>Past Cleaning Jobs</h2>
          </div>

          {isLoading && <LoadingSpinner label="Loading jobs from browser/server..." fullScreen />}
          {!isLoading && error && <div className="preview-error">{error}</div>}
          {!isLoading && !error && jobs.length === 0 && <p className="no-data-notice">No jobs found yet.</p>}
          {!isLoading && !error && jobs.length > 0 && (
            <div className="preview-success">
              Showing {jobs.length} job{jobs.length !== 1 ? 's' : ''}
            </div>
          )}

          {!isLoading && !error && jobs.length > 0 && (
            <div className="table-container">
              <table className="preview-table">
                <thead>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <th key={header.id}>{flexRender(header.column.columnDef.header, header.getContext())}</th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody>
                  {table.getRowModel().rows.map((row) => (
                    <tr key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
