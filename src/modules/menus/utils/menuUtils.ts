import appModules from '../../app-modules/modules.json'

export function filterMenusByTenant(menus: any[], tenantModules: string[]) {
    return menus.filter(menuItem => {
        // Find if this menu item belongs to a module
        const moduleMapping = appModules.find(m => m.menuParent === menuItem.category);
        
        // If it doesn't belong to any specific module in modules.json, it's a core menu (always show)
        if (!moduleMapping) return true;
        
        // If it belongs to a module, only show if the tenant has that module
        return tenantModules.includes(moduleMapping.key);
    });
}
