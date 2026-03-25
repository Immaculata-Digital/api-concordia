export function filterMenusByTenant(menus: any[], tenantModules: string[]) {
    return menus.filter(menuItem => {
        // If it doesn't have a module defined, it's a core menu (always show)
        if (!menuItem.module) return true;
        
        // If it belongs to a module, only show if the tenant has that module
        return tenantModules.includes(menuItem.module);
    });
}
