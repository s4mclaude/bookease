import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import sql from '@/lib/db'

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Senha', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const users = await sql`
          SELECT id, email, name, password
          FROM users
          WHERE email = ${credentials.email as string}
        `

        const user = users[0]
        if (!user) return null

        const senhaCorreta = await bcrypt.compare(
          credentials.password as string,
          user.password as string
        )

        if (!senhaCorreta) return null

        return {
          id: user.id as string,
          email: user.email as string,
          name: (user.name as string) ?? null,
        }
      },
    }),
  ],
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) token.id = user.id
      return token
    },
    session({ session, token }) {
      if (token.id) session.user.id = token.id as string
      return session
    },
  },
})
