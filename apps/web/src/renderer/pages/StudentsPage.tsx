import { DashboardLayout } from '../components/dashboard/Layout/DashboardLayout';
import { StudentsList } from '../components/students/StudentsList';

export function StudentsPage() {
  return (
    <DashboardLayout>
      <StudentsList />
    </DashboardLayout>
  );
}
