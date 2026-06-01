import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from './db'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const admin = await prisma.admin.findUnique({
          where: { email: credentials.email },
        })

        if (!admin) return null

        const isValid = await bcrypt.compare(credentials.password, admin.password)
        if (!isValid) return null

        return { id: String(admin.id), email: admin.email, name: admin.name ?? 'Admin' }
      },
    }),
  ],
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/admin/login',
  },
  callbacks: {
    async session({ session, token }) {
      if (token && session.user) {
        session.user.email = token.email as string
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}
