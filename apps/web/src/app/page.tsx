import Link from 'next/link';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import HeroSlider from '@/components/sara/HeroSlider';
import SaraChat from '@/components/sara/SaraChat';
import InfoBar from '@/components/landing/InfoBar';
import OpenSaraButton from '@/components/landing/OpenSaraButton';
import WhatsAppButton from '@/components/landing/WhatsAppButton';
import CookieBanner from '@/components/landing/CookieBanner';
import PWABanner from '@/components/landing/PWABanner';
import LandingNav from '@/components/landing/LandingNav';
import IbigSolutions from '@/components/landing/IbigSolutions';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata');
  return {
    title: t('title'),
    description: t('description'),
    keywords: t('keywords').split(',').map((k) => k.trim()),
    robots: 'index, follow',
    openGraph: {
      title: t('ogTitle'),
      description: t('ogDescription'),
      type: 'website',
    },
  };
}

/* ─── TYPES DES CONTENUS TRADUITS ──────────────────────────────────────── */

type IconItem = { icon: string; title: string; desc: string };
type Problem = { before: string; after: string };
type Step = { num: string; title: string; desc: string };
type Testimonial = { name: string; role: string; org: string; avatar: string; text: string };
type FaqItem = { q: string; a: string };
type PartnerFeature = { icon: string; label: string };
type Plan = { name: string; price: string; annual: string; desc: string; features: string[]; not: string[]; cta: string };

/* ─── PRÉSENTATION DES PLANS (non traduisible) ─────────────────────────── */

const PLAN_STYLES = [
  { id: 'essentiel', href: '/demo', highlight: false, color: 'border-neutral-200 bg-white', ctaColor: 'bg-neutral-800 hover:bg-neutral-900 text-white' },
  { id: 'starter', href: '/demo', highlight: false, color: 'border-neutral-200 bg-white', ctaColor: 'bg-neutral-800 hover:bg-neutral-900 text-white' },
  { id: 'pro', href: '/demo', highlight: true, color: 'border-primary-600 bg-white', ctaColor: 'bg-primary-600 hover:bg-primary-700 text-white' },
  { id: 'enterprise', href: '/contact', highlight: false, color: 'border-neutral-200 bg-neutral-50', ctaColor: 'bg-accent-400 hover:bg-amber-500 text-white' },
] as const;

/* ─── PAGE ─────────────────────────────────────────────────────────────── */

export default async function LandingPage() {
  const t = await getTranslations();

  const certifications = t.raw('certifications.items') as string[];
  const problems = t.raw('problems.items') as Problem[];
  const benefits = t.raw('benefits.items') as IconItem[];
  const modules = t.raw('modules.items') as IconItem[];
  const audiences = t.raw('audiences.items') as IconItem[];
  const steps = t.raw('steps.items') as Step[];
  const saraFeatures = t.raw('sara.features') as string[];
  const securityItems = t.raw('security.items') as IconItem[];
  const pwaFeatures = t.raw('pwa.features') as string[];
  const pwaDevices = t.raw('pwa.devices') as string[];
  const compareRows = t.raw('pricing.compareRows') as string[][];
  const ibigItems = t.raw('ibig.items') as IconItem[];
  const testimonials = t.raw('testimonials.items') as Testimonial[];
  const partnerFeatures = t.raw('partners.features') as PartnerFeature[];
  const faqItems = t.raw('faq.items') as FaqItem[];
  const reassurance = t.raw('finalCta.reassurance') as string[];

  const plans = PLAN_STYLES.map((style) => ({
    ...style,
    ...(t.raw(`pricing.plans.${style.id}`) as Plan),
  }));

  return (
    <div className="min-h-screen bg-white font-sans text-neutral-800">

      {/* ══ BARRE INFO ══ */}
      <InfoBar />

      {/* ══ NAVBAR ══ */}
      <LandingNav />

      {/* ══ HERO SLIDER ══ */}
      <HeroSlider />

      {/* ══ CERTIFICATIONS ══ */}
      <section className="bg-neutral-900 py-4 sm:py-5 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-center gap-6">
          <span className="text-xs text-neutral-500 font-semibold uppercase tracking-widest">{t('certifications.label')}</span>
          {certifications.map((c) => (
            <span key={c} className="text-sm font-bold text-neutral-300 border border-neutral-700 px-4 py-1.5 rounded-full">{c}</span>
          ))}
          <span className="text-xs text-neutral-600">{t('certifications.note')}</span>
        </div>
      </section>

      {/* ══ PROBLÈMES RÉSOLUS ══ */}
      <section className="py-12 sm:py-24 px-4 sm:px-6 lg:px-20 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-bold text-red-600 uppercase tracking-widest bg-red-50 px-3 py-1.5 rounded-full">{t('problems.badge')}</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-800 mt-4 mb-4">{t('problems.titleLine1')}<br />{t('problems.titleLine2')}</h2>
            <p className="text-neutral-500 max-w-xl mx-auto text-lg">{t('problems.subtitle')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {problems.map((p, i) => (
              <div key={i} className="rounded-2xl border border-neutral-100 overflow-hidden shadow-sm">
                <div className="bg-red-50 px-5 py-4 flex items-start gap-3">
                  <span className="text-red-400 text-lg shrink-0 mt-0.5">✗</span>
                  <p className="text-sm text-red-700 font-medium leading-relaxed">{p.before}</p>
                </div>
                <div className="bg-primary-50 px-5 py-4 flex items-start gap-3">
                  <span className="text-primary-600 text-lg shrink-0 mt-0.5">✓</span>
                  <p className="text-sm text-primary-800 font-medium leading-relaxed">{p.after}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ BÉNÉFICES ══ */}
      <section className="py-12 sm:py-24 px-4 sm:px-6 lg:px-20 bg-neutral-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-bold text-primary-600 uppercase tracking-widest bg-primary-50 px-3 py-1.5 rounded-full">{t('benefits.badge')}</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-800 mt-4 mb-4">{t('benefits.titleLine1')}<br />{t('benefits.titleLine2')}</h2>
            <p className="text-neutral-500 max-w-xl mx-auto text-lg">{t('benefits.subtitle')}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((b) => (
              <div key={b.title} className="bg-white rounded-2xl p-7 border border-neutral-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-3xl mb-4">{b.icon}</div>
                <h3 className="font-bold text-neutral-800 text-lg mb-2">{b.title}</h3>
                <p className="text-sm text-neutral-500 leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FONCTIONNALITÉS / MODULES ══ */}
      <section id="fonctionnalites" className="py-12 sm:py-24 px-4 sm:px-6 lg:px-20 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-bold text-primary-600 uppercase tracking-widest bg-primary-50 px-3 py-1.5 rounded-full">{t('modules.badge')}</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-800 mt-4 mb-4">{t('modules.titleLine1')}<br />{t('modules.titleLine2')}</h2>
            <p className="text-neutral-500 max-w-xl mx-auto text-lg">{t('modules.subtitle')}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {modules.map((m) => (
              <div key={m.title} className="group flex gap-4 p-6 border border-neutral-100 hover:border-primary-200 rounded-2xl hover:shadow-lg transition-all bg-white hover:bg-primary-50/30">
                <div className="text-3xl shrink-0 mt-0.5">{m.icon}</div>
                <div>
                  <h3 className="font-bold text-neutral-800 mb-1.5 group-hover:text-primary-700 transition-colors">{m.title}</h3>
                  <p className="text-sm text-neutral-500 leading-relaxed">{m.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ PUBLICS CONCERNÉS ══ */}
      <section className="py-12 sm:py-24 px-4 sm:px-6 lg:px-20 bg-neutral-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-bold text-primary-600 uppercase tracking-widest bg-primary-50 px-3 py-1.5 rounded-full">{t('audiences.badge')}</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-800 mt-4 mb-4">{t('audiences.titleLine1')}<br />{t('audiences.titleLine2')}</h2>
            <p className="text-neutral-500 max-w-xl mx-auto text-lg">{t('audiences.subtitle')}</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
            {audiences.map((p) => (
              <div key={p.title} className="bg-white rounded-2xl p-6 border border-neutral-100 shadow-sm text-center hover:border-primary-200 hover:shadow-md transition-all">
                <div className="text-4xl mb-3">{p.icon}</div>
                <h3 className="font-bold text-neutral-800 mb-2">{p.title}</h3>
                <p className="text-xs text-neutral-500 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ COMMENT ÇA MARCHE ══ */}
      <section id="comment-ca-marche" className="py-12 sm:py-24 px-4 sm:px-6 lg:px-20 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-bold text-primary-600 uppercase tracking-widest bg-primary-50 px-3 py-1.5 rounded-full">{t('steps.badge')}</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-800 mt-4 mb-4">{t('steps.title')}</h2>
            <p className="text-neutral-500 max-w-lg mx-auto text-lg">{t('steps.subtitle')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((e, i) => (
              <div key={e.num} className="relative">
                {i < 2 && <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-primary-200 to-transparent z-0" />}
                <div className="relative bg-white rounded-2xl p-8 shadow-sm border border-neutral-100 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-primary-600 text-white font-black text-xl flex items-center justify-center mx-auto mb-5">{e.num}</div>
                  <h3 className="font-bold text-neutral-800 text-lg mb-3">{e.title}</h3>
                  <p className="text-sm text-neutral-500 leading-relaxed">{e.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link href="/demo" className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-bold px-8 py-4 rounded-xl transition-colors shadow-lg">
              {t('steps.cta')}
            </Link>
          </div>
        </div>
      </section>

      {/* ══ SARA IA ══ */}
      <section className="py-12 sm:py-24 px-4 sm:px-6 lg:px-20 bg-gradient-to-br from-primary-800 to-primary-900 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-xs font-bold text-accent-400 uppercase tracking-widest bg-accent-400/10 border border-accent-400/30 px-3 py-1.5 rounded-full">{t('sara.badge')}</span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-6 mb-5 leading-tight">{t('sara.titleLine1')}<br />{t('sara.titleLine2')}</h2>
              <p className="text-white/70 text-lg mb-8 leading-relaxed">{t('sara.desc')}</p>
              <ul className="space-y-3 mb-8">
                {saraFeatures.map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm text-white/80">
                    <span className="w-5 h-5 rounded-full bg-accent-400/20 border border-accent-400/40 flex items-center justify-center shrink-0">
                      <span className="text-accent-400 text-xs">✓</span>
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
              <OpenSaraButton className="inline-flex items-center gap-2 bg-accent-400 hover:bg-amber-500 text-white font-bold px-6 py-3 rounded-xl transition-colors">
                {t('sara.cta')}
              </OpenSaraButton>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
              <div className="bg-primary-700/50 rounded-xl p-4 mb-4">
                <p className="text-xs text-white/50 mb-3 font-semibold">{t('sara.chatTitle')}</p>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <div className="w-6 h-6 rounded-full bg-accent-400/20 flex items-center justify-center shrink-0 text-xs">🤖</div>
                    <div className="bg-white/10 rounded-xl rounded-tl-none px-3 py-2 text-xs text-white/80 max-w-[80%]">
                      {t('sara.chatBot1')}
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <div className="bg-accent-400/20 border border-accent-400/30 rounded-xl rounded-tr-none px-3 py-2 text-xs text-white max-w-[80%]">
                      {t('sara.chatUser')}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-6 h-6 rounded-full bg-accent-400/20 flex items-center justify-center shrink-0 text-xs">🤖</div>
                    <div className="bg-white/10 rounded-xl rounded-tl-none px-3 py-2 text-xs text-white/80 max-w-[80%]">
                      {t('sara.chatBot2Before')}<strong>{t('sara.chatBot2Pro')}</strong>{t('sara.chatBot2Middle')}<strong>{t('sara.chatBot2Starter')}</strong>{t('sara.chatBot2After')}
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-xs text-white/40 text-center">{t('sara.poweredBy')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ══ SÉCURITÉ ══ */}
      <section className="py-12 sm:py-24 px-4 sm:px-6 lg:px-20 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-bold text-primary-600 uppercase tracking-widest bg-primary-50 px-3 py-1.5 rounded-full">{t('security.badge')}</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-800 mt-4 mb-4">{t('security.titleLine1')}<br />{t('security.titleLine2')}</h2>
            <p className="text-neutral-500 max-w-xl mx-auto text-lg">{t('security.subtitle')}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {securityItems.map((s) => (
              <div key={s.title} className="bg-neutral-50 rounded-2xl p-6 border border-neutral-100 text-center">
                <div className="text-3xl mb-3">{s.icon}</div>
                <h3 className="font-bold text-neutral-800 mb-2 text-sm">{s.title}</h3>
                <p className="text-xs text-neutral-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ PWA ══ */}
      <section className="py-10 sm:py-20 px-4 sm:px-6 lg:px-20 bg-neutral-900 text-white">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-xs font-bold text-accent-400 uppercase tracking-widest bg-accent-400/10 border border-accent-400/30 px-3 py-1.5 rounded-full">{t('pwa.badge')}</span>
              <h2 className="text-4xl font-bold mt-6 mb-4">{t('pwa.titleLine1')}<br />{t('pwa.titleLine2')}</h2>
              <p className="text-white/70 mb-6 leading-relaxed">{t('pwa.desc')}</p>
              <ul className="space-y-2 mb-8">
                {pwaFeatures.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-white/70">
                    <span className="text-accent-400">✓</span> {f}
                  </li>
                ))}
              </ul>
              <p className="text-xs text-white/40 mt-4">{t('pwa.iphoneNote')}</p>
            </div>
            <div className="flex items-center justify-center gap-6">
              {['💻', '📱', '📱'].map((d, i) => (
                <div key={i} className={`bg-white/5 border border-white/10 rounded-2xl p-6 text-center ${i === 1 ? 'scale-110' : 'opacity-70'}`}>
                  <div className="text-4xl mb-3">{d}</div>
                  <p className="text-xs text-white/50">{pwaDevices[i]}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══ TARIFS ══ */}
      <section id="tarifs" className="py-12 sm:py-24 px-4 sm:px-6 lg:px-20 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-bold text-primary-600 uppercase tracking-widest bg-primary-50 px-3 py-1.5 rounded-full">{t('pricing.badge')}</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-800 mt-4 mb-4">{t('pricing.titleLine1')}<br />{t('pricing.titleLine2')}</h2>
            <p className="text-neutral-500 max-w-lg mx-auto text-lg">{t('pricing.subtitle')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {plans.map((plan) => (
              <div key={plan.id} className={`relative flex flex-col rounded-2xl border-2 ${plan.color} ${plan.highlight ? 'shadow-2xl scale-[1.02]' : 'shadow-sm'} overflow-hidden`}>
                {plan.highlight && (
                  <div className="bg-primary-600 text-white text-xs font-bold text-center py-2 tracking-wide">{t('pricing.popular')}</div>
                )}
                <div className="p-7 flex flex-col flex-1">
                  <div className="mb-6">
                    <h3 className="font-black text-xl text-neutral-800 mb-1">{plan.name}</h3>
                    <p className="text-xs text-neutral-400 mb-4">{plan.desc}</p>
                    <div className="flex items-end gap-1 mb-1">
                      {plan.annual ? (
                        <><span className="text-3xl font-black text-neutral-800">{plan.price}</span><span className="text-sm text-neutral-400 mb-1">{t('pricing.perMonth')}</span></>
                      ) : (
                        <span className="text-2xl font-black text-neutral-800">{plan.price}</span>
                      )}
                    </div>
                    {plan.annual && (
                      <p className="text-xs text-primary-600 font-semibold">
                        {t('pricing.perYear', { price: plan.annual })} <span className="text-neutral-400 font-normal">{t('pricing.monthsFree')}</span>
                      </p>
                    )}
                  </div>
                  <ul className="space-y-2.5 flex-1 mb-6">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-neutral-700">
                        <span className="text-primary-500 shrink-0 mt-0.5 font-bold">✓</span>{f}
                      </li>
                    ))}
                    {plan.not.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-neutral-300">
                        <span className="shrink-0 mt-0.5">✕</span>{f}
                      </li>
                    ))}
                  </ul>
                  <Link href={plan.href} className={`block text-center py-3 px-5 rounded-xl font-bold text-sm transition-all ${plan.ctaColor}`}>{plan.cta}</Link>
                </div>
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-neutral-400 mt-8">
            {t('pricing.taxNote')}{' '}
            <Link href="/contact" className="text-primary-600 hover:underline">{t('pricing.quoteLink')}</Link>
          </p>
          {/* Tableau comparatif */}
          <div className="mt-16 overflow-x-auto">
            <h3 className="text-2xl font-bold text-neutral-800 mb-6 text-center">{t('pricing.compareTitle')}</h3>
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-neutral-50">
                  <th className="text-left px-5 py-4 font-semibold text-neutral-600 w-1/3">{t('pricing.compareFeature')}</th>
                  {plans.map((p) => (
                    <th key={p.id} className={`text-center px-4 py-4 font-bold ${p.highlight ? 'text-primary-600 bg-primary-50' : 'text-neutral-700'}`}>{p.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {compareRows.map(([feat, ...vals]) => (
                  <tr key={feat} className="border-t border-neutral-100 hover:bg-neutral-50 transition-colors">
                    <td className="px-5 py-3.5 text-neutral-700 font-medium">{feat}</td>
                    {vals.map((v, i) => (
                      <td key={i} className={`text-center px-4 py-3.5 ${plans[i].highlight ? 'bg-primary-50/50' : ''} ${v === '✓' ? 'text-primary-600 font-bold text-base' : v === '—' ? 'text-neutral-300' : 'text-neutral-700'}`}>{v}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ══ AVANTAGES IBIG SOFT ══ */}
      <section className="py-12 sm:py-24 px-4 sm:px-6 lg:px-20 bg-neutral-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-bold text-primary-600 uppercase tracking-widest bg-primary-50 px-3 py-1.5 rounded-full">{t('ibig.badge')}</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-800 mt-4 mb-4">{t('ibig.titleLine1')}<br />{t('ibig.titleLine2')}</h2>
            <p className="text-neutral-500 max-w-xl mx-auto text-lg">{t('ibig.subtitle')}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {ibigItems.map((a) => (
              <div key={a.title} className="bg-white rounded-2xl p-6 border border-neutral-100 shadow-sm">
                <div className="text-3xl mb-3">{a.icon}</div>
                <h3 className="font-bold text-neutral-800 mb-2">{a.title}</h3>
                <p className="text-sm text-neutral-500 leading-relaxed">{a.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center">
            <a href="https://ibigsoft.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 border border-primary-200 text-primary-600 hover:bg-primary-50 font-semibold px-6 py-3 rounded-xl transition-colors text-sm">
              {t('ibig.cta')}
            </a>
          </div>
        </div>
      </section>

      {/* ══ TÉMOIGNAGES ══ */}
      <section id="temoignages" className="py-12 sm:py-24 px-4 sm:px-6 lg:px-20 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-bold text-primary-600 uppercase tracking-widest bg-primary-50 px-3 py-1.5 rounded-full">{t('testimonials.badge')}</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-800 mt-4 mb-4">{t('testimonials.title')}</h2>
            <p className="text-neutral-500 max-w-lg mx-auto text-lg">{t('testimonials.subtitle')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((tm) => (
              <div key={tm.name} className="bg-white rounded-2xl border border-neutral-100 p-7 shadow-sm flex flex-col">
                <div className="flex gap-1 mb-4">{[1,2,3,4,5].map((s) => <span key={s} className="text-accent-400 text-sm">★</span>)}</div>
                <p className="text-neutral-600 leading-relaxed mb-6 flex-1 italic text-sm">&laquo;&nbsp;{tm.text}&nbsp;&raquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-primary-100 flex items-center justify-center shrink-0">
                    <span className="text-xs font-black text-primary-700">{tm.avatar}</span>
                  </div>
                  <div>
                    <p className="font-bold text-neutral-800 text-sm">{tm.name}</p>
                    <p className="text-xs text-neutral-400">{tm.role}</p>
                    <p className="text-xs text-primary-600 font-medium">{tm.org}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ IBIG PARTNERS ══ */}
      <section className="py-12 sm:py-24 px-4 sm:px-6 lg:px-20 bg-gradient-to-br from-accent-400 to-amber-500 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <span className="text-xs font-bold uppercase tracking-widest bg-white/20 border border-white/30 px-3 py-1.5 rounded-full">{t('partners.badge')}</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-6 mb-5">{t('partners.titleLine1')}<br />{t('partners.titleLine2')}</h2>
          <p className="text-white/85 text-lg mb-8 max-w-2xl mx-auto leading-relaxed">
            {t('partners.desc')}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10 max-w-2xl mx-auto">
            {partnerFeatures.map((f) => (
              <div key={f.label} className="bg-white/15 border border-white/25 rounded-xl p-4 text-center">
                <div className="text-2xl mb-2">{f.icon}</div>
                <p className="text-sm font-semibold">{f.label}</p>
              </div>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="https://ibigpartners.com/" target="_blank" rel="noopener noreferrer"
              className="bg-white text-accent-500 font-bold px-8 py-4 rounded-xl hover:bg-neutral-50 transition-colors shadow-xl">
              {t('partners.ctaPrimary')}
            </a>
            <a href="https://ibigpartners.com/" target="_blank" rel="noopener noreferrer"
              className="bg-white/15 border border-white/30 text-white font-semibold px-8 py-4 rounded-xl hover:bg-white/25 transition-colors">
              {t('partners.ctaSecondary')}
            </a>
          </div>
          <p className="text-xs text-white/60 mt-6">{t('partners.disclaimer')}</p>
        </div>
      </section>

      {/* ══ FAQ ══ */}
      <section id="faq" className="py-12 sm:py-24 px-4 sm:px-6 lg:px-20 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-bold text-primary-600 uppercase tracking-widest bg-primary-50 px-3 py-1.5 rounded-full">{t('faq.badge')}</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-800 mt-4 mb-4">{t('faq.title')}</h2>
          </div>
          <div className="space-y-4">
            {faqItems.map((f) => (
              <details key={f.q} className="group border border-neutral-100 rounded-2xl overflow-hidden">
                <summary className="flex items-center justify-between px-6 py-5 cursor-pointer font-semibold text-neutral-800 hover:bg-neutral-50 transition-colors list-none">
                  {f.q}
                  <span className="text-primary-500 text-xl font-light group-open:rotate-45 transition-transform shrink-0 ml-4">+</span>
                </summary>
                <div className="px-6 pb-5 text-sm text-neutral-600 leading-relaxed border-t border-neutral-50 pt-4">{f.a}</div>
              </details>
            ))}
          </div>
          <div className="text-center mt-10">
            <p className="text-sm text-neutral-500 mb-4">{t('faq.moreQuestions')}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/contact" className="inline-flex items-center gap-2 border border-primary-200 text-primary-600 hover:bg-primary-50 font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm">
                {t('faq.contactCta')}
              </Link>
              <OpenSaraButton className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm">
                {t('faq.saraCta')}
              </OpenSaraButton>
            </div>
          </div>
        </div>
      </section>

      {/* ══ CENTRE D'AIDE ══ */}
      <section className="py-8 sm:py-16 px-4 sm:px-6 lg:px-20 bg-neutral-50">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-5 sm:p-8 flex flex-col sm:flex-row items-center gap-6">
            <div className="text-5xl shrink-0">🆘</div>
            <div className="flex-1 text-center sm:text-left">
              <h3 className="text-xl font-bold text-neutral-800 mb-2">{t('help.title')}</h3>
              <p className="text-sm text-neutral-500 mb-4">{t('help.desc')}</p>
              <div className="flex flex-col sm:flex-row gap-2">
                <Link href="/contact" className="inline-flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors">
                  {t('help.ticketCta')}
                </Link>
                <a href="tel:+2250555059901" className="inline-flex items-center justify-center gap-2 border border-neutral-200 text-neutral-700 hover:border-primary-300 text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors">
                  {t('help.phone')}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ CTA FINAL ══ */}
      <section className="bg-gradient-to-br from-primary-700 to-[#2E9E4F] py-12 sm:py-24 px-4 sm:px-6 text-white text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-5 leading-tight">
            {t('finalCta.titleLine1')}<br />{t('finalCta.titleLine2')}
          </h2>
          <p className="text-white/70 max-w-xl mx-auto mb-10 text-lg">
            {t('finalCta.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <Link href="/demo" className="bg-accent-400 hover:bg-amber-500 text-white font-bold px-6 sm:px-10 py-3.5 sm:py-4 rounded-xl text-base sm:text-lg transition-all shadow-xl hover:-translate-y-0.5">
              {t('finalCta.primary')}
            </Link>
            <Link href="/contact" className="bg-white/10 hover:bg-white/20 border border-white/30 text-white font-semibold px-6 sm:px-10 py-3.5 sm:py-4 rounded-xl text-base sm:text-lg transition-colors">
              {t('finalCta.secondary')}
            </Link>
          </div>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm text-white/50 mb-8">
            {reassurance.map((r) => <span key={r}>{r}</span>)}
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-white/60">
            <span>📧 contact@ibigsoft.com</span>
            <span>📞 +225 05 55 05 99 01</span>
            <span>📞 +225 27 22 27 60 14</span>
          </div>
        </div>
      </section>

      {/* ══ ÉCOSYSTÈME IBIG SOFT (script universel — carrousel des solutions) ══ */}
      <IbigSolutions />

      {/* ══ FOOTER ══ */}
      <footer className="bg-[#0a0f0d] text-neutral-400">
        {/* Bande accent top */}
        <div className="h-1 bg-gradient-to-r from-primary-600 via-accent-400 to-primary-600" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 pt-10 sm:pt-16 pb-8 sm:pb-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-6 sm:gap-10 mb-14">
            {/* Brand */}
            <div className="col-span-2 lg:col-span-2">
              <div className="flex items-center gap-3 mb-5">
                <img src="/logo.svg" alt="" className="w-10 h-10" />
                <div className="flex items-baseline gap-1.5">
                  <span className="font-extrabold text-white text-lg tracking-tight">ANOUANZÊ</span>
                  <span className="text-accent-400 font-bold text-[11px] bg-accent-400/10 border border-accent-400/30 px-1.5 py-0.5 rounded-md">ERP</span>
                </div>
              </div>
              <p className="text-sm leading-relaxed text-neutral-500 max-w-[260px] mb-4">
                {t('footer.tagline')}<br/>
                <span className="text-primary-500 font-medium">{t('footer.compliance')}</span>
              </p>
              <p className="text-xs text-neutral-600 mb-5">
                {t('footer.productOfPrefix')} <span className="text-neutral-500 font-semibold">{t('footer.productOfBrand')}</span><br/>{t('footer.productOfLegal')}
              </p>
              <a href="https://ibigsoft.com" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-500 hover:text-primary-400 border border-primary-800 hover:border-primary-600 px-3 py-1.5 rounded-lg transition-colors">
                {t('footer.ibigLink')}
              </a>
            </div>

            {/* Navigation */}
            <div>
              <h4 className="text-primary-400 font-bold mb-4 text-[11px] uppercase tracking-widest">{t('footer.navTitle')}</h4>
              <ul className="space-y-2.5 text-sm">
                {([
                  ['#fonctionnalites', 'features'],
                  ['#comment-ca-marche', 'howItWorks'],
                  ['#tarifs', 'pricing'],
                  ['#temoignages', 'testimonials'],
                  ['/demo', 'demo'],
                  ['/login', 'login'],
                ] as const).map(([href, key]) => (
                  <li key={key}><a href={href} className="hover:text-white transition-colors">{t(`footer.nav.${key}`)}</a></li>
                ))}
              </ul>
            </div>

            {/* Ressources */}
            <div>
              <h4 className="text-primary-400 font-bold mb-4 text-[11px] uppercase tracking-widest">{t('footer.resourcesTitle')}</h4>
              <ul className="space-y-2.5 text-sm">
                {([
                  ['/contact', 'help'],
                  ['/contact', 'ticket'],
                  ['#faq', 'faq'],
                  ['https://ibigsoft.com', 'blog'],
                  ['/conditions-sara', 'saraTerms'],
                ] as const).map(([href, key]) => (
                  <li key={key}><a href={href} className="hover:text-white transition-colors">{t(`footer.resources.${key}`)}</a></li>
                ))}
              </ul>
            </div>

            {/* IBIG SOFT */}
            <div>
              <h4 className="text-primary-400 font-bold mb-4 text-[11px] uppercase tracking-widest">{t('footer.ibigTitle')}</h4>
              <ul className="space-y-2.5 text-sm">
                {([
                  ['https://ibigsoft.com', 'about'],
                  ['https://ibigpartners.com/', 'becomePartner'],
                  ['https://ibigpartners.com/', 'partners'],
                  ['/contact', 'contact'],
                ] as const).map(([href, key]) => (
                  <li key={key}><a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" className="hover:text-white transition-colors">{t(`footer.ibig.${key}`)}</a></li>
                ))}
              </ul>
            </div>

            {/* Légal + Contact — 18 liens : sur 2 colonnes pour ne pas étirer le footer */}
            <div className="sm:col-span-2 lg:col-span-2">
              <h4 className="text-primary-400 font-bold mb-4 text-[11px] uppercase tracking-widest">{t('footer.legalTitle')}</h4>
              <ul className="text-sm mb-7 sm:columns-2 sm:gap-x-6 [&>li]:break-inside-avoid [&>li]:mb-2.5 space-y-2.5 sm:space-y-0">
                {([
                  ['/mentions-legales', 'mentions'],
                  ['/confidentialite', 'privacy'],
                  ['/cgu', 'cgu'],
                  ['/cookies', 'cookies'],
                  ['/licence', 'eula'],
                  ['/propriete-intellectuelle', 'ip'],
                  ['/conditions-commerciales', 'commercial'],
                  ['/politique-sauvegarde', 'backup'],
                  ['/politique-support', 'support'],
                  ['/politique-resiliation', 'termination'],
                  ['/politique-remboursement', 'refund'],
                  ['/traitement-donnees', 'dataProcessing'],
                  ['/protection-marque', 'trademark'],
                  ['/conditions-essai', 'trial'],
                  ['/conditions-sara', 'saraTerms'],
                  ['/limitation-responsabilite-ia', 'aiLiability'],
                  ['/gestion-compte', 'account'],
                  ['/reclamations', 'claims'],
                ] as const).map(([href, key]) => (
                  <li key={key}><Link href={href} className="hover:text-white transition-colors">{t(`footer.legal.${key}`)}</Link></li>
                ))}
              </ul>
              <h4 className="text-primary-400 font-bold mb-3 text-[11px] uppercase tracking-widest">{t('footer.contactTitle')}</h4>
              <div className="space-y-1.5 text-xs text-neutral-500">
                <div className="flex items-center gap-2">
                  <span className="text-neutral-600">📍</span><span>{t('footer.city')}</span>
                </div>
                <a href="mailto:contact@ibigsoft.com" className="flex items-center gap-2 hover:text-white transition-colors">
                  <span className="text-neutral-600">✉</span> contact@ibigsoft.com
                </a>
                <a href="tel:+2252722276014" className="flex items-center gap-2 hover:text-white transition-colors">
                  <span className="text-neutral-600">📞</span> +225 27 22 27 60 14
                </a>
                <a href="tel:+2250555059901" className="flex items-center gap-2 hover:text-white transition-colors">
                  <span className="text-neutral-600">📞</span> +225 05 55 05 99 01
                </a>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-neutral-800/60 pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-neutral-600">
            <p>
              {t.rich('footer.copyright', {
                year: String(new Date().getFullYear()),
                b: (chunks) => <strong className="text-neutral-400">{chunks}</strong>,
                a: (chunks) => (
                  <a href="https://ibigsoft.com" target="_blank" rel="noopener noreferrer" className="text-neutral-500 hover:text-white transition-colors font-medium">{chunks}</a>
                ),
              })}
            </p>
            <div className="flex items-center gap-2 shrink-0">
              <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
              <span className="text-primary-600 font-medium">{t('footer.status')}</span>
            </div>
          </div>
        </div>
      </footer>

      {/* ══ FLOTTANTS ══ */}
      <SaraChat />
      <WhatsAppButton />
      <PWABanner />
      <CookieBanner />
    </div>
  );
}
