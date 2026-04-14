import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardShell from '@/components/dashboard/DashboardShell'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const displayName =
    user.user_metadata?.nom ||
    user.email?.split('@')[0] ||
    'Utilisateur'

  const email = user.email ?? ''

  return (
    <DashboardShell displayName={displayName} email={email}>
      {children}
    </DashboardShell>
  )
}
