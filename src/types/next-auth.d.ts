import 'next-auth';

declare module 'next-auth' {
  interface Session {
    accessToken: string;
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
    };
  }

  interface User {
    role: string;
    accessToken: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: string;
    accessToken: string;
  }
}
