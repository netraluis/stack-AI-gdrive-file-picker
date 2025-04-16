"use client"
import { AuthProvider, useAuth } from "./context/authContext"

import { Toaster } from "@/components/ui/sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { LogOut, AlertCircle } from "lucide-react"
import FilePickerKnowledge from "./components/filePickerKnowledge"



// Login Form Component
const LoginForm = () => {
  const { email, setEmail, password, setPassword, loading, error, login } = useAuth()

  return (
    <div className="flex min-h-screen bg-muted/30 items-center justify-center px-4">
      <Card className="max-w-md w-full">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Stack AI File Picker</CardTitle>
          <CardDescription className="text-center">Sign in to access your Google Drive files</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Login Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form className="space-y-4" onSubmit={login}>
            <div className="space-y-2">
              <Input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
              />

              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <div className="text-sm text-center text-muted-foreground">
            <p className="mt-1">Use the test account:</p>
            <p className="font-semibold">stackaitest@gmail.com</p>
            <p className="font-semibold">!z4ZnxkyLYs#vR</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Connection Error Component
const ConnectionError = () => {
  const { logout } = useAuth()

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center px-4">
      <Card className="max-w-md w-full text-center">
        <CardHeader>
          <CardTitle className="text-destructive">Connection Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-6">
            No Google Drive connection found. Please connect your Google Drive in Stack AI first.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button onClick={logout} variant="outline">
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

// Main Dashboard Component
const Dashboard = () => {
  const { email, logout, connectionId } = useAuth()

  if (!connectionId) {
    return <ConnectionError />
  }

  return (
    <div className="min-h-screen bg-muted/30 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h1 className="text-3xl font-bold">Stack AI Knowledge Base Manager</h1>
          <div className="flex items-center">
            <span className="text-sm text-muted-foreground mr-4">{email}</span>
            <Button onClick={logout} variant="outline" size="sm">
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>

        <Separator className="mb-6" />

        <FilePickerKnowledge />
      </div>
    </div>
  )
}

// Main Application Component with Auth Context
const AppContent = () => {
  const { isLoggedIn } = useAuth()

  if (!isLoggedIn) {
    return <LoginForm />
  }

  return <Dashboard />
}

// Wrapper component with AuthProvider
export default function App() {
  return (
    <AuthProvider>
      <AppContent />
      <Toaster />
    </AuthProvider>
  )
}
