import { type NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import axios from 'axios';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const res = await axios.post(`${process.env.API_URL}/auth/login`, {
          email: credentials.email,
          password: credentials.password,
        });

        const { data } = res.data as { data: { user: { id: string; email: string; name: string; role: string }; accessToken: string } };
        if (!data?.accessToken) return null;

        return {
          id: data.user.id,
          email: data.user.email,
          name: data.user.name,
          role: data.user.role,
          accessToken: data.accessToken,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.accessToken = user.accessToken;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      session.accessToken = token.accessToken;
      session.user.role = token.role;
      return session;
    },
  },
  pages: { signIn: '/login' },
  session: { strategy: 'jwt' },
};
