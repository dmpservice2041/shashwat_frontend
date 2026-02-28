import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Hospitals from './pages/Hospitals';
import Doctors from './pages/Doctors';
import Patients from './pages/Patients';
import Suppliers from './pages/Suppliers';
import Products from './pages/Products';
import Purchase from './pages/Purchase';
import Quotation from './pages/Quotation';
import Challan from './pages/Challan';
import Usage from './pages/Usage';
import Invoice from './pages/Invoice';
import Payment from './pages/Payment';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />

            <Route path="/hospitals" element={<Hospitals />} />
            <Route path="/doctors" element={<Doctors />} />
            <Route path="/patients" element={<Patients />} />
            <Route path="/suppliers" element={<Suppliers />} />
            <Route path="/products" element={<Products />} />

            <Route path="/purchase" element={<Purchase />} />
            <Route path="/quotation" element={<Quotation />} />
            <Route path="/challan" element={<Challan />} />
            <Route path="/usage" element={<Usage />} />
            <Route path="/invoice" element={<Invoice />} />
            <Route path="/payment" element={<Payment />} />

            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
