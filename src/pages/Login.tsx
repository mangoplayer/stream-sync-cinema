
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LoginForm from "@/components/auth/LoginForm";
import { getSession } from "@/services/api";
import MainLayout from "@/components/layout/MainLayout";

const Login = () => {
  const navigate = useNavigate();
  const session = getSession();
  
  useEffect(() => {
    // If already logged in, redirect to home
    if (session) {
      navigate("/");
    }
  }, [session, navigate]);
  
  return (
    <MainLayout requireAuth={false}>
      <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <LoginForm />
      </div>
    </MainLayout>
  );
};

export default Login;
