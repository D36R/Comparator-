import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'

const JsonViewer = ({ jsonFiles }) => {
  const { id } = useParams()
  const [jsonData, setJsonData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [categoryText, setCategoryText] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState('')
  const [categoryTexts, setCategoryTexts] = useState({})
  const [textSaveStatus, setTextSaveStatus] = useState(null)

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

  // Fetch category texts only once on component mount
  useEffect(() => {
    const fetchCategoryTexts = async () => {
      try {
        const response = await fetch('/categoryTexts.json')
        if (!response.ok) {
          throw new Error('Failed to fetch category texts')
        }
        const data = await response.json()
        setCategoryTexts(data)
      } catch (err) {
        console.error('Error fetching category texts:', err)
      }
    }

    fetchCategoryTexts()
  }, []) // Empty dependency array - run only once on mount

  // Update current category text when ID changes or when categoryTexts is loaded
  useEffect(() => {
    if (id && categoryTexts[id] !== undefined) {
      setCategoryText(categoryTexts[id])
      setEditText(categoryTexts[id])
    } else {
      setCategoryText('')
      setEditText('')
    }
    setIsEditing(false)
  }, [id, categoryTexts])

  const handleEditClick = () => {
    setIsEditing(true)
    setEditText(categoryText)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditText(categoryText)
  }

  const handleSaveEdit = async () => {
    try {
      // Update local state first for immediate UI feedback
      const updatedTexts = {
        ...categoryTexts,
        [id]: editText
      }
      setCategoryTexts(updatedTexts)
      setCategoryText(editText)
      setIsEditing(false)
      
      // In a real application, this would send the data to a server
      // For this demo, we'll simulate a successful save
      setTextSaveStatus('Saved successfully!')
      
      // Clear the status message after 3 seconds
      setTimeout(() => {
        setTextSaveStatus(null)
      }, 3000)
    } catch (err) {
      console.error('Error saving category text:', err)
      setTextSaveStatus('Error saving text. Please try again.')
      
      // Clear the error message after 3 seconds
      setTimeout(() => {
        setTextSaveStatus(null)
      }, 3000)
    }
  }

  const handleDeleteText = async () => {
    if (window.confirm('Are you sure you want to delete this text?')) {
      try {
        // Update local state first for immediate UI feedback
        const updatedTexts = {
          ...categoryTexts,
          [id]: ''
        }
        setCategoryTexts(updatedTexts)
        setCategoryText('')
        setEditText('')
        
        // In a real application, this would send the data to a server
        // For this demo, we'll simulate a successful delete
        setTextSaveStatus('Text deleted successfully!')
        
        // Clear the status message after 3 seconds
        setTimeout(() => {
          setTextSaveStatus(null)
        }, 3000)
      } catch (err) {
        console.error('Error deleting category text:', err)
        setTextSaveStatus('Error deleting text. Please try again.')
        
        // Clear the error message after 3 seconds
        setTimeout(() => {
          setTextSaveStatus(null)
        }, 3000)
      }
    }
  }

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

      {/* Category Text Section */}
      <div className="mt-8 border-t pt-4">
        <h3 className="text-lg font-medium text-gray-700 mb-2">Category Notes</h3>
        
        {isEditing ? (
          <div>
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md mb-2 min-h-[120px]"
              placeholder="Add your notes about this category here..."
            />
            <div className="flex gap-2">
              <button
                onClick={handleSaveEdit}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
              >
                Save
              </button>
              <button
                onClick={handleCancelEdit}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="bg-gray-50 p-4 rounded-md min-h-[80px] mb-2">
              {categoryText ? (
                <p className="whitespace-pre-wrap">{categoryText}</p>
              ) : (
                <p className="text-gray-400 italic">No notes added for this category yet.</p>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleEditClick}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
              >
                {categoryText ? 'Edit' : 'Add Notes'}
              </button>
              {categoryText && (
                <button
                  onClick={handleDeleteText}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        )}
        
        {textSaveStatus && (
          <div className={`mt-2 p-2 rounded-md ${textSaveStatus.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            {textSaveStatus}
          </div>
        )}
      </div>
    </div>
  )
}

export default JsonViewer