(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/lib/api.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "apiDelete",
    ()=>apiDelete,
    "apiForm",
    ()=>apiForm,
    "apiGet",
    ()=>apiGet,
    "apiJson",
    ()=>apiJson
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
const SERVER_API_BASE_URL = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.BACKEND_API_BASE_URL || __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';
const BROWSER_API_BASE_URL = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.NEXT_PUBLIC_API_BASE_URL || '';
function headers(area) {
    return {};
}
async function parse(response) {
    if (!response.ok) {
        let message = response.statusText;
        try {
            const body = await response.json();
            message = body?.data?.error || body?.error || message;
        } catch  {}
        throw new Error(message);
    }
    const envelope = await response.json();
    return envelope.data;
}
async function attemptRefresh() {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    const response = await fetch('/api/v1/auth/refresh', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
    });
    return response.ok;
}
async function apiFetch(path, init, area, allowRefresh = true) {
    const apiBaseUrl = ("TURBOPACK compile-time falsy", 0) ? "TURBOPACK unreachable" : BROWSER_API_BASE_URL;
    try {
        const response = await fetch(`${apiBaseUrl}${path}`, {
            ...init,
            credentials: 'same-origin'
        });
        if (response.status === 401 && area !== 'public' && allowRefresh && await attemptRefresh()) {
            return apiFetch(path, init, area, false);
        }
        return response;
    } catch  {
        throw new Error(`Could not connect to the API at ${apiBaseUrl || 'the frontend API proxy'}. Start the backend or update BACKEND_API_BASE_URL.`);
    }
}
async function apiGet(path, area = 'public') {
    const response = await apiFetch(path, {
        cache: 'no-store',
        headers: headers(area)
    }, area);
    return parse(response);
}
async function apiJson(path, method, body, area) {
    const response = await apiFetch(path, {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...headers(area)
        },
        body: JSON.stringify(body)
    }, area);
    return parse(response);
}
async function apiDelete(path, area) {
    const response = await apiFetch(path, {
        method: 'DELETE',
        headers: headers(area)
    }, area);
    return parse(response);
}
async function apiForm(path, formData, area) {
    const response = await apiFetch(path, {
        method: 'POST',
        headers: headers(area),
        body: formData
    }, area);
    return parse(response);
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/ContactRequestForm.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ContactRequestForm",
    ()=>ContactRequestForm
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/api.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
function ContactRequestForm() {
    _s();
    const [message, setMessage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    async function onSubmit(event) {
        event.preventDefault();
        setLoading(true);
        setMessage('');
        const form = new FormData(event.currentTarget);
        try {
            const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiJson"])('/api/v1/public/contact-requests', 'POST', {
                name: form.get('name'),
                email: form.get('email'),
                phone: form.get('phone'),
                message: form.get('message')
            }, 'public');
            setMessage(`Request ${result.status.toLowerCase()}. Reference: ${result.id}`);
            event.currentTarget.reset();
        } catch (error) {
            setMessage(error instanceof Error ? error.message : 'Could not send contact request.');
        } finally{
            setLoading(false);
        }
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
        className: "card stack",
        onSubmit: onSubmit,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "section-title",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        style: {
                            margin: 0
                        },
                        children: "Speak with our team"
                    }, void 0, false, {
                        fileName: "[project]/components/ContactRequestForm.tsx",
                        lineNumber: 37,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "badge",
                        children: "Support"
                    }, void 0, false, {
                        fileName: "[project]/components/ContactRequestForm.tsx",
                        lineNumber: 38,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/ContactRequestForm.tsx",
                lineNumber: 36,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "form-grid",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        className: "input",
                        name: "name",
                        placeholder: "Name",
                        required: true
                    }, void 0, false, {
                        fileName: "[project]/components/ContactRequestForm.tsx",
                        lineNumber: 41,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        className: "input",
                        name: "email",
                        type: "email",
                        placeholder: "Email",
                        required: true
                    }, void 0, false, {
                        fileName: "[project]/components/ContactRequestForm.tsx",
                        lineNumber: 42,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        className: "input",
                        name: "phone",
                        placeholder: "Phone"
                    }, void 0, false, {
                        fileName: "[project]/components/ContactRequestForm.tsx",
                        lineNumber: 43,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/ContactRequestForm.tsx",
                lineNumber: 40,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                className: "textarea",
                name: "message",
                placeholder: "How can we help?"
            }, void 0, false, {
                fileName: "[project]/components/ContactRequestForm.tsx",
                lineNumber: 45,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                className: "btn",
                disabled: loading,
                children: loading ? 'Sending...' : 'Send message'
            }, void 0, false, {
                fileName: "[project]/components/ContactRequestForm.tsx",
                lineNumber: 46,
                columnNumber: 13
            }, this),
            message && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "notice",
                children: message
            }, void 0, false, {
                fileName: "[project]/components/ContactRequestForm.tsx",
                lineNumber: 47,
                columnNumber: 25
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/ContactRequestForm.tsx",
        lineNumber: 35,
        columnNumber: 9
    }, this);
}
_s(ContactRequestForm, "ujslmMszvq5gcb4cRJxnajjukkw=");
_c = ContactRequestForm;
var _c;
__turbopack_context__.k.register(_c, "ContactRequestForm");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=_f015c4f1._.js.map