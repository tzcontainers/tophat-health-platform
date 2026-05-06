'use client';

import {useEffect, useState} from 'react';

type CookiePreferences = {
    necessary: true;
    experience: boolean;
    updatedAt: string;
    version: 1;
};

const CONSENT_KEY = 'th_cookie_consent';
const CONSENT_MAX_AGE_SECONDS = 60 * 60 * 24 * 180;

function buildPreferences(experience: boolean): CookiePreferences {
    return {
        necessary: true,
        experience,
        updatedAt: new Date().toISOString(),
        version: 1
    };
}

function getCookie(name: string) {
    if (typeof document === 'undefined') return null;
    const prefix = `${name}=`;
    const cookie = document.cookie
        .split('; ')
        .find((entry) => entry.startsWith(prefix));

    return cookie ? decodeURIComponent(cookie.slice(prefix.length)) : null;
}

function readStoredConsent(): CookiePreferences | null {
    if (typeof window === 'undefined') return null;

    const stored = localStorage.getItem(CONSENT_KEY) || getCookie(CONSENT_KEY);
    if (!stored) return null;

    try {
        const parsed = JSON.parse(stored) as Partial<CookiePreferences>;
        if (parsed.necessary === true && typeof parsed.experience === 'boolean') {
            return {
                necessary: true,
                experience: parsed.experience,
                updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : new Date().toISOString(),
                version: 1
            };
        }
    } catch {
        return null;
    }

    return null;
}

function storeConsent(preferences: CookiePreferences) {
    const value = JSON.stringify(preferences);
    localStorage.setItem(CONSENT_KEY, value);
    document.cookie = `${CONSENT_KEY}=${encodeURIComponent(value)}; Path=/; Max-Age=${CONSENT_MAX_AGE_SECONDS}; SameSite=Lax`;
    window.dispatchEvent(new CustomEvent('th-cookie-consent-change', {detail: preferences}));
}

export function CookieConsent() {
    const [ready, setReady] = useState(false);
    const [showBanner, setShowBanner] = useState(false);
    const [showPreferences, setShowPreferences] = useState(false);
    const [experienceCookies, setExperienceCookies] = useState(false);

    useEffect(() => {
        const stored = readStoredConsent();
        if (stored) {
            setExperienceCookies(stored.experience);
            setShowBanner(false);
        } else {
            setShowBanner(true);
        }
        setReady(true);
    }, []);

    function save(experience: boolean) {
        const preferences = buildPreferences(experience);
        storeConsent(preferences);
        setExperienceCookies(experience);
        setShowBanner(false);
        setShowPreferences(false);
    }

    if (!ready) return null;

    return (
        <>
            {showBanner && (
                <section className="cookie-consent" role="dialog" aria-label="Cookie consent">
                    <div className="cookie-copy">
                        <span className="eyebrow">Privacy preferences</span>
                        <h2>Choose how cookies support your workspace.</h2>
                        <p>
                            We use essential cookies for security, sign-in, and consent. Optional cookies help remember
                            experience preferences across visits.
                        </p>
                    </div>
                    <div className="cookie-actions">
                        <button className="btn secondary" type="button" onClick={() => setShowPreferences(true)}>
                            Manage
                        </button>
                        <button className="btn secondary" type="button" onClick={() => save(false)}>
                            Reject optional
                        </button>
                        <button className="btn" type="button" onClick={() => save(true)}>
                            Accept all
                        </button>
                    </div>
                </section>
            )}

            {showPreferences && (
                <div className="cookie-modal-backdrop">
                    <section className="cookie-modal" role="dialog" aria-modal="true" aria-label="Cookie preferences">
                        <div className="section-title">
                            <div>
                                <span className="eyebrow">Cookie preferences</span>
                                <h2 style={{margin: 0}}>Privacy controls</h2>
                            </div>
                            <button
                                className="btn secondary compact"
                                type="button"
                                onClick={() => setShowPreferences(false)}
                            >
                                Close
                            </button>
                        </div>

                        <div className="cookie-option">
                            <div>
                                <strong>Essential cookies</strong>
                                <p className="muted">Required for secure access, form protection, and saving consent.</p>
                            </div>
                            <span className="badge success">Always on</span>
                        </div>

                        <label className="cookie-option cookie-toggle">
                            <div>
                                <strong>Experience cookies</strong>
                                <p className="muted">Remember non-essential preferences for a smoother workspace.</p>
                            </div>
                            <input
                                type="checkbox"
                                checked={experienceCookies}
                                onChange={(event) => setExperienceCookies(event.target.checked)}
                            />
                        </label>

                        <div className="cookie-actions">
                            <button className="btn secondary" type="button" onClick={() => save(false)}>
                                Reject optional
                            </button>
                            <button className="btn" type="button" onClick={() => save(experienceCookies)}>
                                Save preferences
                            </button>
                        </div>
                    </section>
                </div>
            )}

            {!showBanner && !showPreferences && (
                <button className="cookie-settings" type="button" onClick={() => setShowPreferences(true)}>
                    Cookie settings
                </button>
            )}
        </>
    );
}
