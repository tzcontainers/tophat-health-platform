'use client';

import {apiJson} from '@/lib/api';
import {AuthSession} from '@/lib/auth';
import {useEffect, useRef, useState} from 'react';

type GoogleCredentialResponse = {
    credential?: string;
};

type GoogleAccounts = {
    accounts: {
        id: {
            initialize(config: {
                client_id: string;
                callback: (response: GoogleCredentialResponse) => void;
                cancel_on_tap_outside?: boolean;
            }): void;
            renderButton(
                parent: HTMLElement,
                options: {
                    theme?: 'outline' | 'filled_blue' | 'filled_black';
                    size?: 'large' | 'medium' | 'small';
                    type?: 'standard' | 'icon';
                    shape?: 'rectangular' | 'pill' | 'circle' | 'square';
                    text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
                    width?: number;
                }
            ): void;
        };
    };
};

declare global {
    interface Window {
        google?: GoogleAccounts;
    }
}

type GoogleSignInButtonProps = {
    onSuccess: (session: AuthSession) => void;
    onError: (message: string) => void;
};

export function GoogleSignInButton({onSuccess, onError}: GoogleSignInButtonProps) {
    const buttonRef = useRef<HTMLDivElement>(null);
    const [ready, setReady] = useState(false);
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

    useEffect(() => {
        if (!clientId) return;
        const googleClientId = clientId;

        const existingScript = document.querySelector<HTMLScriptElement>('script[src="https://accounts.google.com/gsi/client"]');

        function initialize() {
            if (!window.google || !buttonRef.current) return;

            window.google.accounts.id.initialize({
                client_id: googleClientId,
                cancel_on_tap_outside: true,
                callback: async (response) => {
                    if (!response.credential) {
                        onError('Google did not return a credential.');
                        return;
                    }

                    try {
                        const session = await apiJson<AuthSession>('/api/v1/auth/google', 'POST', {
                            credential: response.credential
                        }, 'public');
                        onSuccess(session);
                    } catch (error) {
                        onError(error instanceof Error ? error.message : 'Google sign-in failed.');
                    }
                }
            });

            buttonRef.current.innerHTML = '';
            window.google.accounts.id.renderButton(buttonRef.current, {
                theme: 'outline',
                size: 'large',
                type: 'standard',
                shape: 'pill',
                text: 'continue_with',
                width: 320
            });
            setReady(true);
        }

        if (existingScript) {
            if (window.google) initialize();
            existingScript.addEventListener('load', initialize);
            return () => existingScript.removeEventListener('load', initialize);
        }

        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.addEventListener('load', initialize);
        document.head.appendChild(script);

        return () => script.removeEventListener('load', initialize);
    }, [clientId, onError, onSuccess]);

    if (!clientId) {
        return (
            <div className="google-fallback">
                Google sign-in is unavailable in this environment.
            </div>
        );
    }

    return (
        <div className="google-signin-wrap">
            <div ref={buttonRef}/>
            {!ready && <div className="google-loading">Preparing Google sign-in...</div>}
        </div>
    );
}
