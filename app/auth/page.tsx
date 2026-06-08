import AuthForm from './AuthForm';

interface Props {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default function AuthPage({ searchParams }: Props) {
  const defaultTab = searchParams.tab === 'signup' ? 'signup' : 'signin';
  const error = typeof searchParams.error === 'string' ? searchParams.error : undefined;
  return <AuthForm defaultTab={defaultTab} initialError={error} />;
}
