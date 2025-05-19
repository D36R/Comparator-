import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter'
import json from 'react-syntax-highlighter/dist/esm/languages/hljs/json'
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs'

SyntaxHighlighter.registerLanguage('json', json)

const JsonViewer = ({ jsonFiles }) => {
  const { id } = useParams()
  const [jsonData, setJsonData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [viewMode, setViewMode] = useState('table') // 'table', 'raw', or 'tree'

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const file = jsonFiles.find(f => f.id === id)
        if (!file) {
          throw new Error(`No JSON file found with ID: ${id}`)
        }
        
        const response = await fetch(file.path)
        
        if (!response.ok) {
          throw new Error(`Failed to fetch JSON file: ${response.statusText}`)
        }
        
        const data = await response.json()
        setJsonData(data)
      } catch (err) {
        console.error('Error fetching JSON data:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchData()
    }
  }, [id, jsonFiles])

  const TableView = ({ data }) => {
    if (!Array.isArray(data) || data.length === 0) {
      return <div className="text-gray-500">No data available</div>
    }

    // Get all unique keys from the objects
    const allKeys = [...new Set(data.flatMap(item => Object.keys(item)))]

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {allKeys.map(key => (
                <th 
                  key={key}
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {key}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((item, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                {allKeys.map(key => (
                  <td key={`${index}-${key}`} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {typeof item[key] === 'object' 
                      ? JSON.stringify(item[key]) 
                      : String(item[key] || '')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  const RawView = ({ data }) => {
    const jsonString = JSON.stringify(data, null, 2)
    
    return (
      <div className="bg-gray-50 rounded overflow-auto max-h-[70vh]">
        <SyntaxHighlighter language="json" style={docco}>
          {jsonString}
        </SyntaxHighlighter>
      </div>
    )
  }

  const TreeView = ({ data }) => {
    if (!Array.isArray(data)) {
      return <div>Invalid data format</div>
    }

    return (
      <div className="overflow-auto max-h-[70vh]">
        <ul className="list-disc pl-5">
          {data.map((item, index) => (
            <li key={index} className="mb-4 p-4 border rounded-lg shadow-sm bg-gray-50">
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(item).map(([key, value]) => (
                  <div key={key} className="mb-2">
                    <span className="font-medium text-gray-700">{key}: </span>
                    <span className="text-gray-600">{typeof value === 'object' ? JSON.stringify(value) : value}</span>
                  </div>
                ))}
              </div>
            </li>
          ))}
        </ul>
      </div>
    )
  }

  if (loading) {
    return <div className="text-center py-4">Loading...</div>
  }

  if (error) {
    return <div className="text-red-500 py-4">Error: {error}</div>
  }

  if (!jsonData) {
    return <div className="text-gray-500 py-4">No data available</div>
  }

  const currentFile = jsonFiles.find(f => f.id === id)

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-700">
          {currentFile ? `${currentFile.id} - ${currentFile.name}` : `JSON File ${id}`}
        </h2>
        <div className="flex space-x-2">
          <button
            className={`px-3 py-1 text-sm rounded ${viewMode === 'table' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
            onClick={() => setViewMode('table')}
          >
            Table
          </button>
          <button
            className={`px-3 py-1 text-sm rounded ${viewMode === 'tree' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
            onClick={() => setViewMode('tree')}
          >
            Tree
          </button>
          <button
            className={`px-3 py-1 text-sm rounded ${viewMode === 'raw' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
            onClick={() => setViewMode('raw')}
          >
            Raw
          </button>
        </div>
      </div>

      {viewMode === 'table' && <TableView data={jsonData} />}
      {viewMode === 'raw' && <RawView data={jsonData} />}
      {viewMode === 'tree' && <TreeView data={jsonData} />}
    </div>
  )
}

export default JsonViewer