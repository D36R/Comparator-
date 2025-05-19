import { useState, useEffect } from 'react'
import { Route, Routes, useNavigate, useLocation } from 'react-router-dom'
import JsonViewer from './components/JsonViewer'

function App() {
  const [jsonFiles, setJsonFiles] = useState([])
  const [activeTab, setActiveTab] = useState('')
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    // Function to fetch all JSON files in the project
    const fetchJsonFiles = async () => {
      try {
        const files = [
          { id: '5', path: '/mapping_5.json', name: 'Plan de toilette' },
          { id: '6', path: '/mapping_6.json', name: 'Meuble avec vasque simple' },
          { id: '75', path: '/mapping_75.json', name: 'Tablette de salle de bain' },
          { id: '76', path: '/mapping_76.json', name: 'Porte-savon' },
          { id: '79', path: '/mapping_79.json', name: 'Miroir simple de salle de bain' },
          { id: '80', path: '/mapping_80.json', name: 'Miroir grossissant' },
          { id: '84', path: '/mapping_84.json', name: 'Rideau de douche' },
          { id: '85', path: '/mapping_85.json', name: 'Barre pour rideau de douche' },
          { id: '86', path: '/mapping_86.json', name: 'Anneau de douche' },
          { id: '89', path: '/mapping_89.json', name: 'Porte-serviette' },
          { id: '94', path: '/mapping_94.json', name: 'Poubelle de salle de bain' },
          { id: '97', path: '/mapping_97.json', name: 'Carrelage mural parement' },
          { id: '100', path: '/mapping_100.json', name: 'Mosaique' },
          { id: '102', path: '/mapping_102.json', name: 'Produit de préparation du carrelage' },
          { id: '103', path: '/mapping_103.json', name: 'Colle pour carrelage, brique de verre, plaquette de parement' },
          { id: '104', path: '/mapping_104.json', name: 'Joint pour carrelage, brique de verre, plaquette de parement' },
          { id: '105', path: '/mapping_105.json', name: 'Produit d\'entretien pour carrelage, brique de verre, plaquette de parement' },
          { id: '106', path: '/mapping_106.json', name: 'Profilé de finition sol et mur' },
          { id: '107', path: '/mapping_107.json', name: 'Plaquette de parement' },
          { id: '110', path: '/mapping_110.json', name: 'Accessoire et produit d\'assemblage brique de verre' },
        ]
        
        setJsonFiles(files)
        
        // If no active tab, set the first one
        if (!activeTab && files.length > 0) {
          setActiveTab(files[0].id)
          if (location.pathname === '/') {
            navigate(`/json/${files[0].id}`)
          }
        }
      } catch (error) {
        console.error('Error fetching JSON files:', error)
      }
    }

    fetchJsonFiles()
  }, [activeTab, navigate, location.pathname])

  const handleTabClick = (tabId) => {
    setActiveTab(tabId)
    navigate(`/json/${tabId}`)
  }

  return (
    <div className="min-h-screen w-full bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">JSON Comparator</h1>
        
        {/* Tabs */}
        <div className="mb-4 border-b border-gray-200">
          <div className="flex overflow-x-auto">
            {jsonFiles.map((file) => (
              <button
                key={file.id}
                className={`py-2 px-4 font-medium text-sm ${
                  activeTab === file.id 
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => handleTabClick(file.id)}
              >
                {file.id} - {file.name}
              </button>
            ))}
          </div>
        </div>
        
        {/* Content */}
        <div className="bg-white rounded-lg shadow p-6">
          <Routes>
            <Route path="/" element={<div className="text-center text-gray-500">Select a JSON file to view</div>} />
            <Route path="/json/:id" element={<JsonViewer jsonFiles={jsonFiles} />} />
          </Routes>
        </div>
      </div>
    </div>
  )
}

export default App