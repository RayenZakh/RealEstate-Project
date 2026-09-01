import { Routes, Route } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import MainLayout from "./layouts/MainLayout";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import PropertyMap from "./pages/PropertyMap";
import AddProperty from "./pages/AddProperty";
import Register from "./pages/Register";
import Login from "./pages/Login";

function App() {
    return (
        <AuthProvider>
            <Routes>
                <Route element={<MainLayout />}>
                    <Route path="/" element={<Home />} />
                    <Route path="/PropertyMap" element={<PropertyMap />} />
                    <Route
                        path="/AddProperty"
                        element={
                            <ProtectedRoute>
                                <AddProperty />
                            </ProtectedRoute>
                        }
                    />
                    <Route path="/register" element={<Register />} />
                    <Route path="/login" element={<Login />} />
                </Route>
            </Routes>
        </AuthProvider>
    );
}

export default App;