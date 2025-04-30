
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const NavBar = () => {
  const { isAuthenticated, isAdmin, logout } = useAuth();
  
  return (
    <nav className="bg-white border-b shadow-sm py-4 px-4 md:px-8">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2">
          <div className="text-primary-600 font-bold text-2xl">InstaStore</div>
        </Link>

        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              {isAdmin && (
                <Link to="/admin">
                  <Button variant="outline">Administration</Button>
                </Link>
              )}
              <Button variant="ghost" onClick={logout}>
                Déconnexion
              </Button>
            </>
          ) : (
            <Link to="/login">
              <Button variant="outline">Se connecter</Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
