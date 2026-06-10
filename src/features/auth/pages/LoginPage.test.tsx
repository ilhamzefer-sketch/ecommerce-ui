import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { LoginPage } from "./LoginPage";

const loginMock = vi.fn();

vi.mock("../use-auth", () => ({
  useAuth: () => ({
    login: loginMock
  })
}));

describe("LoginPage", () => {
  beforeEach(() => {
    loginMock.mockReset();
  });

  it("renders the login form", () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    expect(screen.getByRole("heading", { name: "Hesabınıza daxil olun" })).toBeInTheDocument();
    expect(screen.getByLabelText("Email və ya istifadəçi adı")).toBeInTheDocument();
    expect(screen.getByLabelText("Şifrə")).toBeInTheDocument();
  });

  it("shows validation messages before submit", async () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    await userEvent.click(screen.getByRole("button", { name: /daxil ol/i }));

    expect(screen.getByText("Email və ya istifadəçi adını daxil edin.")).toBeInTheDocument();
    expect(screen.getByText("Şifrəni daxil edin.")).toBeInTheDocument();
    expect(loginMock).not.toHaveBeenCalled();
  });
});
