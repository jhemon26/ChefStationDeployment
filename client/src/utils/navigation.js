export const navigationByRole = {
  super_admin: [
    {
      label: 'Platform',
      links: [
        ['Platform Overview', '/super', 'shield'],
        ['Restaurants', '/super/restaurants', 'storefront'],
        ['All Users', '/super/users', 'manage_accounts'],
        ['Profile', '/profile', 'person'],
      ],
    },
  ],
  owner: [
    {
      label: 'Kitchen',
      links: [
        ['Dashboard', '/dashboard', 'dashboard'],
        ['Food List', '/food-prep', 'restaurant_menu'],
        ['Menu Counter', '/menu-counter', 'counter_1'],
        ['Prep Sheet', '/prep-sheet', 'checklist'],
        ["Tomorrow's To-Do", '/todos', 'task_alt'],
        ['Stock Tracker', '/stock', 'inventory_2'],
        ['Recipe Book', '/recipes', 'menu_book'],
      ],
    },
    {
      label: 'Management',
      links: [
        ['Team', '/owner/team', 'groups'],
        ['Invite Codes', '/owner/codes', 'key'],
        ['Settings', '/owner/settings', 'tune'],
        ['Profile', '/profile', 'person'],
      ],
    },
  ],
  staff: [
    {
      label: 'Kitchen',
      links: [
        ['Dashboard', '/dashboard', 'dashboard'],
        ['Food List', '/food-prep', 'restaurant_menu'],
        ['Menu Counter', '/menu-counter', 'counter_1'],
        ['Prep Sheet', '/prep-sheet', 'checklist'],
        ["Tomorrow's To-Do", '/todos', 'task_alt'],
        ['Stock Tracker', '/stock', 'inventory_2'],
        ['Recipe Book', '/recipes', 'menu_book'],
        ['Profile', '/profile', 'person'],
      ],
    },
  ],
};

export const mobilePrimaryByRole = {
  super_admin: [
    ['Overview', '/super', 'dashboard'],
    ['Stores', '/super/restaurants', 'storefront'],
    ['Users', '/super/users', 'manage_accounts'],
  ],
  owner: [
    ['Home', '/dashboard', 'dashboard'],
    ['Food', '/food-prep', 'restaurant_menu'],
    ['Menu', '/menu-counter', 'counter_1'],
    ['Stock', '/stock', 'inventory_2'],
  ],
  staff: [
    ['Home', '/dashboard', 'dashboard'],
    ['Food', '/food-prep', 'restaurant_menu'],
    ['Menu', '/menu-counter', 'counter_1'],
    ['Stock', '/stock', 'inventory_2'],
  ],
};
