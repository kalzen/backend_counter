declare global {
    interface Window {
        Ziggy: {
            namedRoutes: Record<string, {
                uri: string;
                methods: string[];
            }>;
            defaultParameters: Record<string, any>;
            url: string;
            port?: number;
            defaults?: Record<string, any>;
        };
    }

    function route(
        name?: string,
        params?: Record<string, any> | any[],
        absolute?: boolean
    ): string;
}

export {};
