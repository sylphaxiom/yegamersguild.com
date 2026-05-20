import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react";
import Thinking from "../baubles/Thinking";
import { Outlet } from "react-router";

export default withAuthenticationRequired(Admin, {
  onRedirecting: () => <Thinking />,
});

export function Admin() {
  const { user } = useAuth0();

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold">Admin Console</h1>
      <p>Welcome, {user?.name}!</p>
      <Outlet />
    </div>
  );
}
