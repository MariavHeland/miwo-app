'use client';

import Link from 'next/link';
import { useLang, LangPicker } from '../i18n';

export default function ImpressumPage() {
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
          <div className="nav-section" style={{ color: 'var(--copper)' }}>{t('impressum')}</div>
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
        paddingTop: '100px',
        maxWidth: '720px',
        margin: '0 auto',
        padding: '100px 24px 80px',
      }}>
        {/* Founders */}
        <div style={{
          display: 'flex',
          gap: '48px',
          marginBottom: '64px',
          justifyContent: 'center',
          flexWrap: 'wrap',
        }}>
          <div style={{ textAlign: 'center' }}>
            <img
              src="/maria-portrait.jpg"
              alt="Maria"
              style={{
                width: '180px',
                height: '220px',
                objectFit: 'cover',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border)',
                marginBottom: '16px',
              }}
            />
            <div style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '18px',
              fontWeight: 600,
              color: 'var(--text)',
            }}>
              Maria
            </div>
            <div style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '12px',
              color: 'var(--text-muted)',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              marginTop: '4px',
            }}>
              Co-Founder
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <img
              src="/johnny-portrait.jpg"
              alt="Johnny"
              style={{
                width: '180px',
                height: '220px',
                objectFit: 'cover',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border)',
                marginBottom: '16px',
              }}
            />
            <div style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '18px',
              fontWeight: 600,
              color: 'var(--text)',
            }}>
              Johnny
            </div>
            <div style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '12px',
              color: 'var(--text-muted)',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              marginTop: '4px',
            }}>
              Co-Founder
            </div>
          </div>
        </div>

        {/* MIWO description */}
        <div style={{ marginBottom: '16px' }}>
          <img src="/miwo-brand.png" alt="MIWO" style={{ width: '160px', height: 'auto', display: 'block' }} />
        </div>
        <p style={{
          fontFamily: 'var(--font-serif)',
          fontSize: '16px',
          color: 'var(--text-muted)',
          lineHeight: 1.8,
          marginBottom: '48px',
        }}>
          My World. A conversational news intelligence service — built to cut through noise,
          fight misinformation, and deliver depth. Not a chatbot. Not a search engine.
          A trusted editor, available around the clock, in any language.
        </p>

        {/* Impressum */}
        <div style={{
          borderTop: '1px solid var(--rule)',
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
            marginBottom: '20px',
          }}>
            Impressum
          </div>

          <div style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '15px',
            color: 'var(--text)',
            lineHeight: 2,
          }}>
            <strong>MIWO</strong> is an initiative by Tindra Film GbR<br />
            <br />
            Greifenhagener Stra&szlig;e 12<br />
            10437 Berlin<br />
            Germany
          </div>
        </div>

        {/* Copyright / Legal */}
        <div style={{
          borderTop: '1px solid var(--rule)',
          paddingTop: '32px',
          marginBottom: '64px',
        }}>
          <div style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '11px',
            fontWeight: 600,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--copper)',
            marginBottom: '20px',
          }}>
            Legal
          </div>
          <p style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '14px',
            color: 'var(--text-muted)',
            lineHeight: 1.8,
            marginBottom: '12px',
          }}>
            &copy; {new Date().getFullYear()} Tindra Film GbR. All rights reserved.
          </p>
          <p style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '14px',
            color: 'var(--text-muted)',
            lineHeight: 1.8,
          }}>
            MIWO&thinsp;&trade; and the MIWO name and logo are trademarks of Tindra Film GbR.
            Content generated by MIWO is for informational purposes only and does not constitute
            professional advice. All editorial output is AI-assisted and should be independently verified.
          </p>
        </div>
      </div>

    </>
  );
}
