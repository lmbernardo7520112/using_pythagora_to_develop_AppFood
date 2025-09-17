import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"
import { Home, ArrowLeft } from "lucide-react"

export function BlankPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 flex items-center justify-center">
      <div className="text-center space-y-6 p-8">
        <div className="text-gray-400 mb-6">
          <div className="text-9xl font-bold">404</div>
        </div>
        <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-200 mb-4">
          Page Not Found
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex items-center justify-center space-x-4">
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Go Back</span>
          </Button>
          <Button
            onClick={() => navigate('/')}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 flex items-center space-x-2"
          >
            <Home className="h-4 w-4" />
            <span>Go Home</span>
          </Button>
        </div>
      </div>
    </div>
  )
}