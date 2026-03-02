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
import Users from './pages/Users';
import Roles from './pages/Roles';
import OrganizationList from './pages/admin/organizations/OrganizationList';
import OrganizationDetails from './pages/admin/organizations/OrganizationDetails';
import OrganizationModuleSettings from './pages/admin/organizations/OrganizationModuleSettings';
import PermissionDenied from './pages/PermissionDenied';
import Toast from './components/common/Toast';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route element={<ProtectedRoute allowedOrganizationTypes={['ADMIN']} withLayout={true} />}>
            <Route path="/admin/organizations" element={<OrganizationList />} />
            <Route path="/admin/organizations/:id" element={<OrganizationDetails />} />
            <Route path="/admin/organizations/:id/modules" element={<OrganizationModuleSettings />} />
          </Route>

          <Route element={<ProtectedRoute withLayout={true} />}>
            <Route path="/dashboard" element={<Dashboard />} />

            {/* Health & People */}
            <Route element={<ProtectedRoute module="hospitals" requiredPermission="hospitals:view" />}>
              <Route path="/hospitals" element={<Hospitals />} />
            </Route>
            <Route element={<ProtectedRoute module="doctors" requiredPermission="doctors:view" />}>
              <Route path="/doctors" element={<Doctors />} />
            </Route>
            <Route element={<ProtectedRoute module="patients" requiredPermission="patients:view" />}>
              <Route path="/patients" element={<Patients />} />
            </Route>

            {/* Supply Chain */}
            <Route element={<ProtectedRoute module="suppliers" requiredPermission="suppliers:view" />}>
              <Route path="/suppliers" element={<Suppliers />} />
            </Route>
            <Route element={<ProtectedRoute module="products" requiredPermission="products:view" />}>
              <Route path="/products" element={<Products />} />
            </Route>
            <Route element={<ProtectedRoute module="purchase" requiredPermission="purchase:view" />}>
              <Route path="/purchase" element={<Purchase />} />
            </Route>

            {/* Operations */}
            <Route element={<ProtectedRoute module="quotation" requiredPermission="quotation:view" />}>
              <Route path="/quotation" element={<Quotation />} />
            </Route>
            <Route element={<ProtectedRoute module="challan" requiredPermission="challan:view" />}>
              <Route path="/challan" element={<Challan />} />
            </Route>
            <Route element={<ProtectedRoute module="usage" requiredPermission="usage:view" />}>
              <Route path="/usage" element={<Usage />} />
            </Route>
            <Route element={<ProtectedRoute module="invoice" requiredPermission="invoice:view" />}>
              <Route path="/invoice" element={<Invoice />} />
            </Route>
            <Route element={<ProtectedRoute module="payment" requiredPermission="payment:view" />}>
              <Route path="/payment" element={<Payment />} />
            </Route>

            {/* Utility */}
            <Route element={<ProtectedRoute module="reports" requiredPermission="reports:view" />}>
              <Route path="/reports" element={<Reports />} />
            </Route>
            <Route element={<ProtectedRoute module="users" requiredPermission="users:view" />}>
              <Route path="/users" element={<Users />} />
            </Route>
            <Route element={<ProtectedRoute module="roles" requiredPermission="roles:view" />}>
              <Route path="/roles" element={<Roles />} />
            </Route>

            <Route element={<ProtectedRoute module="settings" requiredPermission="settings:view" />}>
              <Route path="/settings" element={<Settings />} />
            </Route>
            <Route path="/permission-denied" element={<PermissionDenied />} />
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
      <Toast />
    </AuthProvider>
  );
}

export default App;
