import AuthLayout from '../auth-layout';

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthLayout>{children}</AuthLayout>;
} 