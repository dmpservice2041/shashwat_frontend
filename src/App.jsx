import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Hospitals from './pages/Hospitals';
import Doctors from './pages/Doctors';
import Patients from './pages/Patients';
import Suppliers from './pages/Suppliers';
import ProductsPage from './pages/inventory/products/ProductsPage';
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

// Masters
import MastersLandingPage from './pages/masters/MastersLandingPage';
import ManufacturersPage from './pages/masters/ManufacturersPage';
import DepartmentsPage from './pages/masters/DepartmentsPage';
import CategoriesPage from './pages/masters/CategoriesPage';
import SubCategoriesPage from './pages/masters/SubCategoriesPage';
import MaterialTypesPage from './pages/masters/MaterialTypesPage';
import UnitsPage from './pages/masters/UnitsPage';
import TaxCodesPage from './pages/masters/TaxCodesPage';
import WarehousesPage from './pages/masters/WarehousesPage';

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
              <Route path="/products" element={<ProductsPage />} />
            </Route>
            <Route element={<ProtectedRoute module="purchases" requiredPermission="purchases:view" />}>
              <Route path="/purchase" element={<Purchase />} />
            </Route>

            {/* Masters */}
            <Route element={<ProtectedRoute module="masters" requiredPermission="masters:view" />}>
              <Route path="/masters" element={<MastersLandingPage />} />
              <Route path="/masters/manufacturers" element={<ManufacturersPage />} />
              <Route path="/masters/departments" element={<DepartmentsPage />} />
              <Route path="/masters/categories" element={<CategoriesPage />} />
              <Route path="/masters/sub-categories" element={<SubCategoriesPage />} />
              <Route path="/masters/material-types" element={<MaterialTypesPage />} />
              <Route path="/masters/units" element={<UnitsPage />} />
              <Route path="/masters/tax-codes" element={<TaxCodesPage />} />
              <Route path="/masters/warehouses" element={<WarehousesPage />} />
            </Route>

            {/* Operations */}
            <Route element={<ProtectedRoute module="quotations" requiredPermission="quotations:view" />}>
              <Route path="/quotation" element={<Quotation />} />
            </Route>
            <Route element={<ProtectedRoute module="challans" requiredPermission="challans:view" />}>
              <Route path="/challan" element={<Challan />} />
            </Route>
            <Route element={<ProtectedRoute module="usages" requiredPermission="usages:view" />}>
              <Route path="/usage" element={<Usage />} />
            </Route>
            <Route element={<ProtectedRoute module="invoices" requiredPermission="invoices:view" />}>
              <Route path="/invoice" element={<Invoice />} />
            </Route>
            <Route element={<ProtectedRoute module="payments" requiredPermission="payments:view" />}>
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

            <Route path="/profile" element={<Profile />} />
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
