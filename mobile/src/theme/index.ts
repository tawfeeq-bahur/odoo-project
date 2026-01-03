export const colors = {
    light: {
        primary: '#10b981',
        primaryDark: '#059669',
        background: '#ffffff',
        card: '#f9fafb',
        text: '#1f2937',
        textSecondary: '#6b7280',
        border: '#e5e7eb',
        error: '#ef4444',
        success: '#10b981',
        warning: '#f59e0b',
        info: '#3b82f6',
    },
    dark: {
        primary: '#10b981',
        primaryDark: '#059669',
        background: '#111827',
        card: '#1f2937',
        text: '#f9fafb',
        textSecondary: '#9ca3af',
        border: '#374151',
        error: '#ef4444',
        success: '#10b981',
        warning: '#f59e0b',
        info: '#3b82f6',
    },
};

export const spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
};

export const borderRadius = {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
};

export const typography = {
    sizes: {
        xs: 12,
        sm: 14,
        md: 16,
        lg: 18,
        xl: 20,
        xxl: 24,
        xxxl: 32,
    },
    weights: {
        regular: '400' as const,
        medium: '500' as const,
        semibold: '600' as const,
        bold: '700' as const,
    },
};
