import { useAuth0 } from "@auth0/auth0-react";

const LoginButton = () => {
  const { loginWithRedirect } = useAuth0();

  return <button onClick={() => loginWithRedirect()}><i className="fa-solid fa-user p-3  text-black hover:text-emerald-500 transition-all duration-300 transform hover:scale-110"></i></button>;
};

export default LoginButton;