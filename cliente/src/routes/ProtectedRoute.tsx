import { Navigate, useLocation } from "react-router-dom";
import UserState from "../integracao/UserState";

const ProtectedRoute = ({ children }: { children : JSX.Element }) => {    
    const userState = new UserState();
    const loggedIn = userState.localStorageUser;
    const location = useLocation();
      
    if (!loggedIn) {
        return <Navigate to="/auth/entrar" state={{ from: location }} />;
    }
    
    return children;
}


export default ProtectedRoute