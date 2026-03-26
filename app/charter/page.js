'use client';

import Link from 'next/link';
import { useLang, LangPicker } from '../i18n';

export default function CharterPage() {
  const { t } = useLang();
  return (
    <>
      {/* Navigation */}
      <nav className="nav">
        <div className="nav-left">
          <Link href="/">
            <div className="nav-brand"><img src="/miwo-nav.png" alt="MIWO" /></div>
          </Link>
          <div className="nav-div" />
          <div className="nav-section" style={{ color: 'var(--copper)' }}>{t('charterTitle')}</div>
        </div>
        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          <Link href="/sports" className="nav-btn">{t('sport')}</Link>
          <Link href="/history" className="nav-btn">{t('history')}</Link>
          <Link href="/classics" className="nav-btn">{t('classics')}</Link>
          <Link href="/arts" className="nav-btn">{t('arts')}</Link>
          <Link href="/nature" className="nav-btn">{t('nature')}</Link>
          <Link href="/science" className="nav-btn">{t('science')}</Link>
          <Link href="/cook" className="nav-btn">{t('cook')}</Link>
          <LangPicker />
          <Link href="/" className="nav-btn">{t('home')}</Link>
        </div>
      </nav>

      <div style={{
        maxWidth: '720px',
        margin: '0 auto',
        padding: '100px 24px 80px',
      }}>
        {/* Charter header */}
        <div style={{ marginBottom: '48px', textAlign: 'center' }}>
          <img src="/miwo-brand.png" alt="MIWO" style={{ width: '140px', height: 'auto', display: 'inline-block', marginBottom: '24px' }} />
          <h1 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(32px, 4vw, 48px)',
            fontWeight: 600,
            color: 'var(--text)',
            lineHeight: 1.15,
            marginBottom: '12px',
          }}>
            {t('charterPageTitle')}
          </h1>
          <p style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '18px',
            color: 'var(--text-muted)',
            lineHeight: 1.7,
          }}>
            {t('charterPageSub')}
          </p>
        </div>

        {/* Charter values */}
        <div style={{ marginBottom: '48px' }}>
          <div style={{
            borderTop: '1px solid var(--border)',
            paddingTop: '32px',
            marginBottom: '32px',
          }}>
            <div style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '11px',
              fontWeight: 600,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--copper)',
              marginBottom: '12px',
            }}>
              {t('charter1label')}
            </div>
            <p style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '17px',
              color: 'var(--text)',
              lineHeight: 1.8,
            }}>
              {t('charter1')}
            </p>
          </div>

          <div style={{
            borderTop: '1px solid var(--border)',
            paddingTop: '32px',
            marginBottom: '32px',
          }}>
            <div style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '11px',
              fontWeight: 600,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--copper)',
              marginBottom: '12px',
            }}>
              {t('charter2label')}
            </div>
            <p style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '17px',
              color: 'var(--text)',
              lineHeight: 1.8,
            }}>
              {t('charter2')}
            </p>
          </div>

          <div style={{
            borderTop: '1px solid var(--border)',
            paddingTop: '32px',
            marginBottom: '32px',
          }}>
            <div style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '11px',
              fontWeight: 600,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--copper)',
              marginBottom: '12px',
            }}>
              {t('charter3label')}
            </div>
            <p style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '17px',
              color: 'var(--text)',
              lineHeight: 1.8,
            }}>
              {t('charter3')}
            </p>
          </div>

          <div style={{
            borderTop: '1px solid var(--border)',
            paddingTop: '32px',
            marginBottom: '32px',
          }}>
            <div style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '11px',
              fontWeight: 600,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--copper)',
              marginBottom: '12px',
            }}>
              {t('charter4label')}
            </div>
            <p style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '17px',
              color: 'var(--text)',
              lineHeight: 1.8,
            }}>
              {t('charter4')}
            </p>
          </div>

          <div style={{
            borderTop: '1px solid var(--border)',
            paddingTop: '32px',
            marginBottom: '32px',
          }}>
            <div style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '11px',
              fontWeight: 600,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--copper)',
              marginBottom: '12px',
            }}>
              {t('charter5label')}
            </div>
            <p style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '17px',
              color: 'var(--text)',
              lineHeight: 1.8,
            }}>
              {t('charter5')}
            </p>
          </div>

          <div style={{
            borderTop: '1px solid var(--border)',
            paddingTop: '32px',
            marginBottom: '32px',
          }}>
            <div style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '11px',
              fontWeight: 600,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--copper)',
              marginBottom: '12px',
            }}>
              {t('charter6label')}
            </div>
            <p style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '17px',
              color: 'var(--text)',
              lineHeight: 1.8,
            }}>
              {t('charter6')}
            </p>
          </div>
        </div>

        {/* Link to impressum / creators */}
        <div style={{
          textAlign: 'center',
          paddingTop: '24px',
          borderTop: '1px solid var(--border)',
        }}>
          <Link
            href="/impressum"
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '13px',
              color: 'var(--copper)',
              letterSpacing: '0.02em',
              textDecoration: 'none',
              transition: 'opacity 0.2s',
            }}
          >
            {t('meetTheCreators')} →
          </Link>
        </div>
      </div>
    </>
  );
}
