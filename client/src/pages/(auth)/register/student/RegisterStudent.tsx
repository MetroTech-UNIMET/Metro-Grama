import RegisterStudentForm from './components/RegisterStudentForm/RegisterStudentForm';
import AuthenticationContext from '@/contexts/AuthenticationContext';

export default function RegisterStudent() {
  return (
    <div className="from-primary-500 text-UI-white h-svh bg-linear-to-b to-[#1D1B32] p-8">
      <AuthenticationContext>
        <RegisterStudentForm />
      </AuthenticationContext>
    </div>
  );
}
