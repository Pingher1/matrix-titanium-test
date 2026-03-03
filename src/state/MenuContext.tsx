import React, { createContext, useContext, useEffect, useState } from "react";

export type MenuItem = {
    id: string;
    title: string;
    route: string;
    component: string;
};

export type MenuSuite = {
    id: string;
    title: string;
    icon: string;
    defaultRoute: string;
    items: MenuItem[];
};

export type MenuConfig = {
    suites: MenuSuite[];
};

const MenuContext = createContext<MenuConfig | null>(null);

export const MenuLoader: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [menuConfig, setMenuConfig] = useState<MenuConfig | null>(null);

    useEffect(() => {
        fetch("/app-menus/menu-v1.json")
            .then((res) => res.json())
            .then((data) => setMenuConfig(data))
            .catch((err) => console.error("Failed to load menu JSON", err));
    }, []);

    if (!menuConfig) return <div className="min-h-screen bg-[#282a36] flex items-center justify-center text-white">Loading App Suites...</div>;

    return <MenuContext.Provider value={menuConfig}>{children}</MenuContext.Provider>;
};

export const useMenu = () => {
    const ctx = useContext(MenuContext);
    if (!ctx) throw new Error("useMenu must be used inside MenuLoader");
    return ctx;
};
