import { AuthForm } from '@components/AuthForm';
import { fireEvent, screen } from '@testing-library/dom';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const mockLogin = jest.fn();
const mockRegister = jest.fn();
const mockPush = jest.fn();

jest.mock('@shared/providers/AuthProvider', () => ({
  useAuth: () => ({
    login: mockLogin,
    register: mockRegister,
    logout: jest.fn(),
    user: null,
    token: null,
    isAuthenticated: false,
  }),
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('AuthForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('affiche les erreurs de validation', async () => {
    render(<AuthForm mode="login" />);

    fireEvent.submit(screen.getByRole('button', { name: /se connecter/i }));

    expect(await screen.findByText(/Email invalide/i)).toBeInTheDocument();
    expect(
      await screen.findByText(/Mot de passe trop court/i)
    ).toBeInTheDocument();
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('appelle login après succès', async () => {
    mockLogin.mockResolvedValue({
      token: 'token',
      user: { id: '1', email: 'test@example.com' },
    });

    render(<AuthForm mode="login" />);

    await userEvent.type(screen.getByLabelText(/Email/i), 'test@example.com');
    await userEvent.type(
      screen.getByLabelText(/Mot de passe/i),
      'SecurePass123'
    );

    fireEvent.submit(screen.getByRole('button', { name: /se connecter/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'SecurePass123',
      });
    });
    // La redirection vers /documents est gérée par AuthLayout (hors scope AuthForm)
  });

  it('appelle register en mode création de compte', async () => {
    mockRegister.mockResolvedValue({
      token: 'token',
      user: { id: '1', email: 'new@example.com' },
    });

    render(<AuthForm mode="register" />);

    await userEvent.type(screen.getByLabelText(/Email/i), 'new@example.com');
    await userEvent.type(
      screen.getByLabelText(/Mot de passe/i),
      'SecurePass123'
    );

    fireEvent.submit(screen.getByRole('button', { name: /créer un compte/i }));

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith({
        email: 'new@example.com',
        password: 'SecurePass123',
      });
    });
    // La redirection vers /documents est gérée par AuthLayout (hors scope AuthForm)
  });
});
