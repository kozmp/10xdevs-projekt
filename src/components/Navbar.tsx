import { useAuth } from "./hooks/useAuth";
import { Button } from "./ui/button";

interface NavbarProps {
  isAuthenticated: boolean;
}

export const Navbar = ({ isAuthenticated: initialIsAuthenticated }: NavbarProps) => {
  const { isAuthenticated, handleLogout } = useAuth({ isAuthenticated: initialIsAuthenticated });

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-2.5 dark:bg-gray-800 dark:border-gray-700">
      <div className="flex flex-wrap justify-between items-center">
        <div className="flex items-center">
          <a href="/" className="flex items-center">
            <span className="self-center text-xl font-semibold whitespace-nowrap dark:text-white">10x Devs</span>
          </a>
        </div>

        <div className="flex items-center">
          {isAuthenticated ? (
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Wyloguj się
            </Button>
          ) : (
            <a href="/login">
              <Button variant="ghost">Zaloguj się</Button>
            </a>
          )}
        </div>
      </div>
    </nav>
  );
};
