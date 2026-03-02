import { compare } from 'bcryptjs';
import { NextAuthOptions } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { prisma } from './prisma';

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt' },
  providers: [
    Credentials({
      name: 'credentials',
      credentials: { email: { label: 'Email' }, password: { label: 'Password', type: 'password' } },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await prisma.user.findUnique({ where: { email: credentials.email } });
        if (!user || !(await compare(credentials.password, user.passwordHash))) return null;
        return { id: user.id, email: user.email, name: user.name, role: user.role, orgId: user.orgId } as any;
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) { if (user) Object.assign(token, user); return token; },
    async session({ session, token }) { (session.user as any) = token; return session; }
  }
};
