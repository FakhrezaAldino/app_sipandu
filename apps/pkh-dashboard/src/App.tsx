import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Kelompok from './pages/Kelompok';
import KelompokDetail from './pages/KelompokDetail';
import Absensi from './pages/Absensi';
import AbsensiForm from './pages/AbsensiForm';
import Prestasi from './pages/Prestasi';
import PrestasiDetail from './pages/PrestasiDetail';
import Usaha from './pages/Usaha';
import UsahaDetail from './pages/UsahaDetail';
import Permasalahan from './pages/Permasalahan';
import PermasalahanDetail from './pages/PermasalahanDetail';
import Graduasi from './pages/Graduasi';
import GraduasiDetail from './pages/GraduasiDetail';
import InputLaporan from './pages/InputLaporan';
import InputJadwal from './pages/InputJadwal';
import KPMDetail from './pages/KPMDetail';
import Unauthorized from './pages/Unauthorized';
import AdminDashboard from './pages/Admin/AdminDashboard';
import PendampingList from './pages/Admin/PendampingList';
import AdminKelompokList from './pages/Admin/AdminKelompokList';
import AdminKPMList from './pages/Admin/AdminKPMList';
import MainLayout from './layouts/MainLayout';

import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/Auth/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />


          {/* Protected Routes (All Auth Users) */}
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/kelompok" element={<Kelompok />} />
              <Route path="/kelompok/:id" element={<KelompokDetail />} />
              <Route path="/absensi" element={<Absensi />} />
              <Route path="/absensi/form" element={<AbsensiForm />} />
              <Route path="/prestasi" element={<Prestasi />} />
              <Route path="/prestasi/:id" element={<PrestasiDetail />} />
              <Route path="/usaha" element={<Usaha />} />
              <Route path="/usaha/:id" element={<UsahaDetail />} />
              <Route path="/permasalahan" element={<Permasalahan />} />
              <Route path="/permasalahan/:id" element={<PermasalahanDetail />} />
              <Route path="/graduasi" element={<Graduasi />} />
              <Route path="/graduasi/:id" element={<GraduasiDetail />} />
              <Route path="/kpm/:id" element={<KPMDetail />} />
              <Route path="/laporan/input" element={<InputLaporan />} />
              <Route path="/jadwal/input" element={<InputJadwal />} />
            </Route>
          </Route>

          {/* Admin Specific Routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route element={<MainLayout />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/pendamping" element={<PendampingList />} />
              <Route path="/admin/kelompok" element={<AdminKelompokList />} />
              <Route path="/admin/kpm" element={<AdminKPMList />} />
            </Route>
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
