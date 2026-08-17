let inNavigationGuard = false

export const setInNavigationGuard = (value: boolean) => {
  inNavigationGuard = value
}

export const isInNavigationGuard = () => inNavigationGuard
