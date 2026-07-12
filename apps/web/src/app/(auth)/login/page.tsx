import type { Metadata } from 'next';
import { LoginForm } from '@/components/auth/LoginForm';

export const metadata: Metadata = {
  title: 'Connexion',
};

export default function LoginPage() {
  return (
    <main className="min-h-screen flex bg-gradient-to-br from-primary-50 via-white to-accent-50">
      {/* Panneau gauche — branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary-600 flex-col items-center justify-center p-12 relative overflow-hidden">
        {/* Décoration fond */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent-400 rounded-full translate-y-1/2 -translate-x-1/2" />
        </div>

        <div className="relative z-10 text-center text-white max-w-sm">
          {/* Logo SVG ANOUANZÊ */}
          <div className="flex justify-center mb-6">
            <svg viewBox="0 0 120 120" width="100" height="100" xmlns="http://www.w3.org/2000/svg">
              {/* Cercle */}
              <circle cx="60" cy="52" r="46" fill="none" stroke="white" strokeWidth="3.5" strokeDasharray="200 60" strokeLinecap="round"/>
              {/* Main (feuille verte en bas) */}
              <path d="M20 78 Q40 65 60 70 Q80 65 100 78 Q85 95 60 90 Q35 95 20 78Z" fill="rgba(255,255,255,0.25)"/>
              {/* Personnage central (vert foncé) */}
              <circle cx="60" cy="30" r="8" fill="white"/>
              <path d="M45 60 Q60 45 75 60" fill="white"/>
              <line x1="45" y1="48" x2="35" y2="38" stroke="white" strokeWidth="3" strokeLinecap="round"/>
              <line x1="75" y1="48" x2="85" y2="38" stroke="white" strokeWidth="3" strokeLinecap="round"/>
              {/* Personnage gauche (orange) */}
              <circle cx="36" cy="38" r="6" fill="#F28C25"/>
              <path d="M24 62 Q36 50 48 62" fill="#F28C25"/>
              <line x1="25" y1="50" x2="18" y2="42" stroke="#F28C25" strokeWidth="2.5" strokeLinecap="round"/>
              <line x1="47" y1="50" x2="52" y2="42" stroke="#F28C25" strokeWidth="2.5" strokeLinecap="round"/>
              {/* Personnage droit (orange) */}
              <circle cx="84" cy="38" r="6" fill="#F28C25"/>
              <path d="M72 62 Q84 50 96 62" fill="#F28C25"/>
              <line x1="73" y1="50" x2="68" y2="42" stroke="#F28C25" strokeWidth="2.5" strokeLinecap="round"/>
              <line x1="95" y1="50" x2="102" y2="42" stroke="#F28C25" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          </div>

          <h1 className="text-3xl font-bold tracking-tight">
            ANOUANZÊ{' '}
            <span className="text-accent-300">ERP</span>
          </h1>
          <p className="text-primary-100 text-sm mt-2 font-medium">
            L&apos;ERP des associations, ONG et organisations à but non lucratif
          </p>

          <div className="mt-10 space-y-3 text-left">
            {[
              'Comptabilité conforme SYCEBNL / OHADA',
              'Gestion complète de vos projets & bailleurs',
              'Suivi des membres, bénéficiaires et RH',
              'Tableaux de bord et rapports en temps réel',
              'Sécurisé, multi-organisations, mobile',
            ].map((f) => (
              <div key={f} className="flex items-center gap-2 text-sm text-primary-100">
                <svg className="w-4 h-4 text-accent-300 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                {f}
              </div>
            ))}
          </div>

          <div className="mt-10 pt-6 border-t border-primary-500 text-xs text-primary-200">
            Édité par IBIG Soft — IBIG SARL<br />
            <span className="italic">&ldquo;L&apos;excellence est notre passion&rdquo;</span>
          </div>
        </div>
      </div>

      {/* Panneau droit — formulaire */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Logo mobile */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary-600 mb-3">
              <span className="text-white font-bold text-xl">A</span>
            </div>
            <h1 className="text-xl font-bold">
              <span className="text-primary-600">ANOUANZÊ</span>{' '}
              <span className="text-accent-400">ERP</span>
            </h1>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-bold text-neutral-800">Connexion</h2>
            <p className="text-sm text-neutral-500 mt-1">Accédez à votre espace de gestion</p>
          </div>

          <div className="card p-6 shadow-card">
            <LoginForm />
          </div>

          <p className="text-center text-xs text-neutral-400 mt-6">
            © {new Date().getFullYear()} IBIG SARL — ANOUANZÊ ERP
          </p>
        </div>
      </div>
    </main>
  );
}
