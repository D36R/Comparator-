import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'

const JsonViewer = ({ jsonFiles }) => {
  const { id } = useParams()
  const [jsonData, setJsonData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

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
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-gray-700">
          {currentFile ? `${currentFile.id} - ${currentFile.name}` : `JSON File ${id}`}
        </h2>
      </div>

      <TableView data={jsonData} />
    </div>
  )
}

export default JsonViewer