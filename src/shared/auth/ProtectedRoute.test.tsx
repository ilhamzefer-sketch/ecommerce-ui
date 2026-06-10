import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";

let authStatus: "booting" | "anonymous" | "authenticated" = "anonymous";

vi.mock("../../features/auth/use-auth", () => ({
  useAuth: () => ({
    status: authStatus
  })
}));

function renderProtectedRoute() {
  return render(
    <MemoryRouter initialEntries={["/account"]}>
      <Routes>
        <Route
          path="/account"
          element={
            <ProtectedRoute>
              <div>Protected content</div>
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<div>Login destination</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe("ProtectedRoute", () => {
  it("redirects anonymous users to login", () => {
    authStatus = "anonymous";
    renderProtectedRoute();

    expect(screen.getByText("Login destination")).toBeInTheDocument();
  });

  it("renders protected content for authenticated users", () => {
    authStatus = "authenticated";
    renderProtectedRoute();

    expect(screen.getByText("Protected content")).toBeInTheDocument();
  });
});
