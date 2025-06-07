import NotificationCenter from './components/NotificationCenter';

const App = () => {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm">
          <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center">
              <Link to="/" className="text-xl font-bold text-[#32ADE6]">
                TalenTag
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <NotificationCenter />
              {/* ... existing navigation items ... */}
            </div>
          </nav>
        </header>
        {/* ... existing routes ... */}
      </div>
    </AuthProvider>
  );
}; 